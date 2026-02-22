import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/retry-failed
 *
 * Called by Vercel Cron every 15 minutes.
 * Finds post_platforms with status = 'pending' and retry_count < 3
 * and re-triggers /api/publish for their parent post.
 * This handles transient platform API failures gracefully.
 */
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // Find unique parent post IDs that have retryable failed platforms
    const { data: retryable, error } = await supabase
        .from("post_platforms")
        .select("post_id")
        .eq("status", "pending")
        .lt("retry_count", 3);

    if (error) {
        console.error("[cron/retry] DB error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!retryable || retryable.length === 0) {
        return NextResponse.json({ triggered: 0, message: "No retryable failures." });
    }

    // Deduplicate post IDs
    const uniquePostIds = [...new Set(retryable.map((r) => r.post_id))];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const results: Array<{ post_id: string; status: string; error?: string }> = [];

    await Promise.all(
        uniquePostIds.map(async (postId) => {
            try {
                const res = await fetch(`${baseUrl}/api/publish`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
                    },
                    body: JSON.stringify({ post_id: postId }),
                });
                const json = await res.json().catch(() => ({}));
                results.push({
                    post_id: postId,
                    status: res.ok ? "retried" : "error",
                    error: res.ok ? undefined : json?.error ?? `HTTP ${res.status}`,
                });
            } catch (err) {
                results.push({
                    post_id: postId,
                    status: "error",
                    error: err instanceof Error ? err.message : "Unknown",
                });
            }
        })
    );

    await supabase.from("cron_logs").insert({
        job_name: "retry-failed",
        triggered_count: uniquePostIds.length,
        results,
        ran_at: now,
    }).select().maybeSingle();

    console.log(`[cron/retry] Retried ${results.length} posts`, results);

    return NextResponse.json({ triggered: results.length, results });
}
