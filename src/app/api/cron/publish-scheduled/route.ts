import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/publish-scheduled
 *
 * Called by Vercel Cron every minute in production.
 * In development: call manually at http://localhost:3000/api/cron/publish-scheduled
 *                 with header  Authorization: Bearer <CRON_SECRET>
 *
 * Finds all posts with status = 'scheduled' AND scheduled_at <= NOW()
 * and triggers the internal publish route for each.
 */
export async function GET(req: NextRequest) {
    // ── Auth: Vercel Cron passes the secret automatically in prod. ─────────
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // ── Find all due scheduled posts ────────────────────────────────────────
    const { data: duePosts, error } = await supabase
        .from("posts")
        .select("id, workspace_id, content, scheduled_at")
        .eq("status", "scheduled")
        .lte("scheduled_at", now);

    if (error) {
        console.error("[cron] Failed to fetch scheduled posts:", error.message);
        return NextResponse.json({ error: "DB error", detail: error.message }, { status: 500 });
    }

    if (!duePosts || duePosts.length === 0) {
        return NextResponse.json({ triggered: 0, message: "No posts due." });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const results: Array<{ post_id: string; status: string; error?: string }> = [];

    // ── Trigger publish for each due post ───────────────────────────────────
    await Promise.all(
        duePosts.map(async (post) => {
            try {
                const res = await fetch(`${baseUrl}/api/publish`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // Forward the cron secret so /api/publish can trust this internal call
                        ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
                    },
                    body: JSON.stringify({ post_id: post.id }),
                });

                const json = await res.json().catch(() => ({}));

                results.push({
                    post_id: post.id,
                    status: res.ok ? "triggered" : "error",
                    error: res.ok ? undefined : json?.error ?? `HTTP ${res.status}`,
                });
            } catch (err) {
                results.push({
                    post_id: post.id,
                    status: "error",
                    error: err instanceof Error ? err.message : "Unknown",
                });
            }
        })
    );

    // ── Write cron run log ──────────────────────────────────────────────────
    await supabase.from("cron_logs").insert({
        job_name: "publish-scheduled",
        triggered_count: duePosts.length,
        results: results,
        ran_at: now,
    }).select().maybeSingle(); // Fire and forget — don't block response on this

    console.log(`[cron] publish-scheduled: triggered ${results.length} posts`, results);

    return NextResponse.json({
        triggered: results.length,
        results,
    });
}
