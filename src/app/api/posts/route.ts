import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { captureEvent } from "@/lib/posthog";

export async function POST(req: NextRequest) {
    // Rate limit: 30 req / 60 s per IP
    const limited = await checkRateLimit(req, "posts");
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            content,
            platforms,
            requireApproval,
            scheduledAt,
            status,
            labels,
            firstComment,
            internalNote,
            checklist,
            platformContent,  // Record<string, string> — per-platform custom content
        } = body;

        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }
        if (!platforms?.length) {
            return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
        }

        // Get workspace
        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ error: "No workspace found" }, { status: 404 });
        }

        // Create post
        const { data: post, error } = await supabase
            .from("posts")
            .insert({
                workspace_id: member.workspace_id,
                created_by: user.id,
                content: content.trim(),
                platforms,
                status: status || (requireApproval ? "pending_approval" : scheduledAt ? "scheduled" : "draft"),
                scheduled_at: scheduledAt || null,
                first_comment: firstComment || null,
                internal_note: internalNote || null,
                checklist: checklist || [],
                label_ids: labels || [],
            })
            .select()
            .single();

        if (error) {
            console.error("Post creation error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // ── Create post_platforms rows for each selected platform ──
        // Look up connected social accounts for this workspace
        const { data: accounts } = await supabase
            .from("social_accounts")
            .select("id, platform")
            .eq("workspace_id", member.workspace_id);

        const platformRows = (platforms as string[])
            .map((platform: string) => {
                // Find the connected social account for this platform
                const account = accounts?.find((a: { id: string; platform: string }) => a.platform === platform);
                if (!account) return null; // skip if no account connected

                // Per-platform custom content (if provided from compose page tailoring)
                const customContent = platformContent?.[platform] ?? null;

                return {
                    post_id: post.id,
                    social_account_id: account.id,
                    platform,
                    custom_content: customContent,
                    status: "pending",
                };
            })
            .filter(Boolean);

        if (platformRows.length > 0) {
            const { error: ppError } = await supabase
                .from("post_platforms")
                .insert(platformRows);
            if (ppError) {
                console.error("post_platforms insert error:", ppError);
                // Non-blocking — post was still created
            }
        }

        // If approval required, create approval request
        if (requireApproval || status === "pending_approval") {
            await supabase.from("approvals").insert({
                post_id: post.id,
                workspace_id: member.workspace_id,
                requested_by: user.id,
                status: "pending",
            });
        }

        captureEvent(user.id, "post_created", {
            post_id: post.id,
            platforms,
            status: post.status,
            requires_approval: requireApproval,
            workspace_id: member.workspace_id,
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ posts: [], total: 0 });
        }

        let query = supabase
            .from("posts")
            .select("*, approvals(status, reviewed_by, reviewed_at)", { count: "exact" })
            .eq("workspace_id", member.workspace_id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (status && status !== "all") {
            query = query.eq("status", status);
        }
        if (search) {
            query = query.ilike("content", `%${search}%`);
        }

        const { data: posts, count, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts: posts || [], total: count || 0 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
