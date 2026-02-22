import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/publish — publish a post immediately to all its platforms
// Called by: approval webhook, scheduler worker, or manual "Publish Now"
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { post_id } = body;

    if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

    const supabase = await createClient();

    // Fetch post with all platform targets
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select(`*, post_platforms(*, social_accounts(*))`)
        .eq("id", post_id)
        .single();

    if (postError || !post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Mark post as publishing
    await supabase.from("posts").update({ status: "publishing" }).eq("id", post_id);

    const results: Array<{ platform: string; success: boolean; error?: string; external_post_id?: string }> = [];

    for (const pp of post.post_platforms) {
        const content = pp.custom_content ?? post.content;
        const account = pp.social_accounts;

        try {
            let externalPostId: string | null = null;

            switch (pp.platform) {
                case "linkedin":
                    externalPostId = await publishToLinkedIn(account.access_token, account.account_id, content, post.media_urls);
                    break;
                case "facebook":
                    externalPostId = await publishToFacebook(account.access_token, account.page_id ?? account.account_id, content, post.media_urls);
                    break;
                case "twitter":
                    externalPostId = await publishToTwitter(account.access_token, content);
                    break;
                case "instagram":
                    externalPostId = await publishToInstagram(account.access_token, account.account_id, content, post.media_urls);
                    break;
                default:
                    throw new Error(`Platform ${pp.platform} not yet supported`);
            }

            await supabase.from("post_platforms").update({
                status: "published",
                external_post_id: externalPostId,
                published_at: new Date().toISOString(),
            }).eq("id", pp.id);

            results.push({ platform: pp.platform, success: true, external_post_id: externalPostId ?? undefined });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";

            // Retry logic: increment retry count
            const newRetryCount = (pp.retry_count ?? 0) + 1;
            const finalStatus = newRetryCount >= 3 ? "failed" : "pending";

            await supabase.from("post_platforms").update({
                status: finalStatus,
                error_message: errorMsg,
                retry_count: newRetryCount,
            }).eq("id", pp.id);

            results.push({ platform: pp.platform, success: false, error: errorMsg });
        }
    }

    // Determine overall post status
    const allPublished = results.every((r) => r.success);
    const anyPublished = results.some((r) => r.success);
    const finalStatus = allPublished ? "published" : anyPublished ? "partial" : "failed";

    await supabase.from("posts").update({
        status: finalStatus,
        published_at: anyPublished ? new Date().toISOString() : null,
    }).eq("id", post_id);

    return NextResponse.json({ success: true, results });
}

// ── Platform Publisher Functions ──────────────────────────────

async function publishToLinkedIn(accessToken: string, authorId: string, content: string, mediaUrls: string[]): Promise<string> {
    const body: Record<string, unknown> = {
        author: `urn:li:person:${authorId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: content },
                shareMediaCategory: mediaUrls.length > 0 ? "IMAGE" : "NONE",
                ...(mediaUrls.length > 0 && {
                    media: mediaUrls.map((url) => ({
                        status: "READY",
                        originalUrl: url,
                    })),
                }),
            },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`LinkedIn API error: ${err}`);
    }

    const data = await res.json();
    return data.id;
}

async function publishToFacebook(accessToken: string, pageId: string, content: string, mediaUrls: string[]): Promise<string> {
    const endpoint = mediaUrls.length > 0
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const params = new URLSearchParams({
        access_token: accessToken,
        message: content,
        ...(mediaUrls.length > 0 && { url: mediaUrls[0] }),
    });

    const res = await fetch(`${endpoint}?${params}`, { method: "POST" });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Facebook API error: ${err}`);
    }

    const data = await res.json();
    return data.id;
}

async function publishToTwitter(accessToken: string, content: string): Promise<string> {
    const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content.substring(0, 280) }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Twitter API error: ${err}`);
    }

    const data = await res.json();
    return data.data.id;
}

async function publishToInstagram(accessToken: string, accountId: string, content: string, mediaUrls: string[]): Promise<string> {
    if (mediaUrls.length === 0) throw new Error("Instagram requires at least one image");

    // Step 1: Create media container
    const containerRes = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media?image_url=${encodeURIComponent(mediaUrls[0])}&caption=${encodeURIComponent(content)}&access_token=${accessToken}`,
        { method: "POST" }
    );

    if (!containerRes.ok) throw new Error("Instagram media container creation failed");
    const { id: creationId } = await containerRes.json();

    // Step 2: Publish container
    const publishRes = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
        { method: "POST" }
    );

    if (!publishRes.ok) throw new Error("Instagram publish failed");
    const data = await publishRes.json();
    return data.id;
}
