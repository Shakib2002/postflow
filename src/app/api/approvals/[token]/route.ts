import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/approvals/[token] — fetch approval by token (no auth required)
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("approvals")
        .select(`*, post:posts(id, content, media_urls, scheduled_at, post_platforms(platform))`)
        .eq("token", token)
        .single();

    if (error || !data) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });

    if (data.status !== "pending") {
        return NextResponse.json({ error: "This approval has already been actioned", status: data.status }, { status: 409 });
    }

    if (new Date(data.expires_at) < new Date()) {
        await supabase.from("approvals").update({ status: "expired" }).eq("id", data.id);
        return NextResponse.json({ error: "This approval link has expired" }, { status: 410 });
    }

    return NextResponse.json({ approval: data });
}

// POST /api/approvals/[token] — approve or reject
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();
    const body = await req.json();
    const { action, feedback } = body; // action: "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
        return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Fetch the approval
    const { data: approval, error: fetchError } = await supabase
        .from("approvals")
        .select("*")
        .eq("token", token)
        .single();

    if (fetchError || !approval) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (approval.status !== "pending") return NextResponse.json({ error: "Already actioned" }, { status: 409 });
    if (new Date(approval.expires_at) < new Date()) return NextResponse.json({ error: "Token expired" }, { status: 410 });

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update approval
    await supabase
        .from("approvals")
        .update({ status: newStatus, feedback: feedback ?? null, updated_at: new Date().toISOString() })
        .eq("id", approval.id);

    // Update post status
    const postStatus = action === "approve" ? "scheduled" : "draft";
    await supabase
        .from("posts")
        .update({ status: postStatus })
        .eq("id", approval.post_id);

    // If approved and has scheduled_at, the scheduler worker will pick it up
    // If approved with no scheduled_at, trigger immediate publish
    if (action === "approve") {
        const { data: post } = await supabase
            .from("posts")
            .select("scheduled_at")
            .eq("id", approval.post_id)
            .single();

        if (!post?.scheduled_at) {
            // Publish immediately
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: approval.post_id }),
            });
        }
    }

    return NextResponse.json({ success: true, status: newStatus });
}
