import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { captureEvent } from "@/lib/posthog";

export async function POST(req: NextRequest) {
    // Rate limit: 5 req / 60 s per IP
    const limited = await checkRateLimit(req, "bulk");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { posts, workspaceId }: {
        posts: Array<{ content: string; platform: string; scheduled_at: string }>;
        workspaceId: string;
    } = body;

    if (!posts?.length || !workspaceId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validPlatforms = ["linkedin", "facebook", "twitter", "instagram"];
    const errors: string[] = [];
    const created: string[] = [];

    for (const post of posts) {
        if (!post.content?.trim()) { errors.push("Missing content"); continue; }
        if (!validPlatforms.includes(post.platform)) { errors.push(`Invalid platform: ${post.platform}`); continue; }
        const scheduledDate = new Date(post.scheduled_at);
        if (isNaN(scheduledDate.getTime())) { errors.push(`Invalid date: ${post.scheduled_at}`); continue; }

        // Insert post
        const { data: newPost, error: postErr } = await supabase
            .from("posts")
            .insert({
                workspace_id: workspaceId,
                content: post.content.trim(),
                status: "scheduled",
                scheduled_at: scheduledDate.toISOString(),
                created_by: user.id,
            })
            .select("id")
            .single();

        if (postErr || !newPost) { errors.push(postErr?.message ?? "Insert failed"); continue; }

        // Insert platform
        await supabase.from("post_platforms").insert({
            post_id: newPost.id,
            platform: post.platform,
        });

        created.push(newPost.id);
    }

    if (created.length > 0) {
        captureEvent(user.id, "bulk_upload", {
            posts_created: created.length,
            posts_failed: errors.length,
            workspace_id: workspaceId,
        });
    }

    return NextResponse.json({ created, errors }, { status: errors.length === posts.length ? 400 : 200 });
}
