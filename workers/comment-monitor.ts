/**
 * PostFlow — Comment Monitor Worker
 * 
 * Polls social platform APIs for new comments on published posts.
 * Detects trigger keywords → auto-replies → captures leads.
 * 
 * Run: npx tsx workers/comment-monitor.ts
 * Deploy: Railway worker (runs every 5 minutes via setInterval)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const POLL_INTERVAL_MS = 5 * 60_000; // 5 minutes

// Default trigger keywords — workspace owners can customize these in settings
const DEFAULT_KEYWORDS = ["file", "price", "info", "link", "dm me", "send me", "interested", "how much"];

interface Comment {
    id: string;
    text: string;
    author_name: string;
    author_id: string;
    created_time: string;
}

async function monitorLinkedInComments(postPlatformId: string, externalPostId: string, accessToken: string) {
    try {
        const res = await fetch(
            `https://api.linkedin.com/v2/socialActions/${externalPostId}/comments`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.elements ?? []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            text: (c.message as { text: string })?.text ?? "",
            author_name: "LinkedIn User",
            author_id: (c.actor as string) ?? "",
            created_time: new Date((c.created as { time: number })?.time ?? 0).toISOString(),
        }));
    } catch {
        return [];
    }
}

async function monitorFacebookComments(postPlatformId: string, externalPostId: string, accessToken: string): Promise<Comment[]> {
    try {
        const res = await fetch(
            `https://graph.facebook.com/v18.0/${externalPostId}/comments?fields=id,message,from,created_time&access_token=${accessToken}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data ?? []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            text: (c.message as string) ?? "",
            author_name: ((c.from as Record<string, string>)?.name) ?? "Facebook User",
            author_id: ((c.from as Record<string, string>)?.id) ?? "",
            created_time: c.created_time as string,
        }));
    } catch {
        return [];
    }
}

async function processComment(
    comment: Comment,
    postPlatformId: string,
    workspaceId: string,
    platform: string,
    postId: string,
    keywords: string[]
) {
    const lowerText = comment.text.toLowerCase();
    const matchedKeyword = keywords.find((kw) => lowerText.includes(kw.toLowerCase()));

    // Check if already processed
    const { data: existing } = await supabase
        .from("comments")
        .select("id")
        .eq("platform", platform)
        .eq("external_comment_id", comment.id)
        .single();

    if (existing) return; // already processed

    // Store the comment
    const sentiment = detectSentiment(comment.text);
    await supabase.from("comments").insert({
        post_platform_id: postPlatformId,
        workspace_id: workspaceId,
        platform,
        external_comment_id: comment.id,
        author_name: comment.author_name,
        author_id: comment.author_id,
        text: comment.text,
        sentiment,
        keyword_matched: matchedKeyword ?? null,
    });

    if (matchedKeyword) {
        console.log(`[CommentMonitor] Keyword "${matchedKeyword}" detected on ${platform} post ${postId}`);

        // Get lead capture form URL for this post
        const formUrl = `${APP_URL}/capture?post_id=${postId}&platform=${platform}&workspace_id=${workspaceId}`;

        // Auto-reply with form link
        const replyText = `Thanks for your interest! 🎉 Click here to get the file/info you requested: ${formUrl}`;

        // TODO: Call platform API to post reply
        // For now, mark as replied in DB
        await supabase
            .from("comments")
            .update({ replied_at: new Date().toISOString(), reply_text: replyText })
            .eq("platform", platform)
            .eq("external_comment_id", comment.id);
    }
}

function detectSentiment(text: string): "positive" | "neutral" | "negative" {
    const positive = ["great", "love", "amazing", "awesome", "excellent", "fantastic", "good", "thanks", "thank you", "helpful", "interested"];
    const negative = ["bad", "terrible", "awful", "hate", "worst", "horrible", "spam", "scam", "fake", "useless"];
    const lower = text.toLowerCase();
    if (positive.some((w) => lower.includes(w))) return "positive";
    if (negative.some((w) => lower.includes(w))) return "negative";
    return "neutral";
}

async function monitorAllPosts() {
    // Get all published post_platforms with their social account tokens
    const { data: postPlatforms, error } = await supabase
        .from("post_platforms")
        .select(`
      id, platform, external_post_id, post_id,
      posts(workspace_id),
      social_accounts(access_token, account_id)
    `)
        .eq("status", "published")
        .not("external_post_id", "is", null);

    if (error || !postPlatforms) {
        console.error("[CommentMonitor] Error fetching post platforms:", error?.message);
        return;
    }

    console.log(`[CommentMonitor] Monitoring ${postPlatforms.length} published post(s)`);

    for (const pp of postPlatforms) {
        const account = pp.social_accounts as unknown as { access_token: string; account_id: string };
        const post = pp.posts as unknown as { workspace_id: string };
        if (!account || !post) continue;

        let comments: Comment[] = [];

        if (pp.platform === "linkedin") {
            comments = await monitorLinkedInComments(pp.id, pp.external_post_id!, account.access_token);
        } else if (pp.platform === "facebook") {
            comments = await monitorFacebookComments(pp.id, pp.external_post_id!, account.access_token);
        }

        for (const comment of comments) {
            await processComment(comment, pp.id, post.workspace_id, pp.platform, pp.post_id, DEFAULT_KEYWORDS);
        }
    }
}

async function tick() {
    console.log(`[CommentMonitor] Tick at ${new Date().toISOString()}`);
    await monitorAllPosts();
}

console.log("[CommentMonitor] Starting PostFlow comment monitor worker...");
tick();
setInterval(tick, POLL_INTERVAL_MS);
