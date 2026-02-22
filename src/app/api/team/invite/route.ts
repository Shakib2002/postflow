import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

// POST /api/team/invite — send a workspace invite
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role = "member" } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    if (!["admin", "member", "viewer"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get inviter's workspace
    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .single();

    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    if (member.role !== "admin" && member.role !== "owner") {
        return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", member.workspace_id)
        .eq("email", email)
        .maybeSingle();

    if (existingMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabase
        .from("workspace_invites")
        .select("id")
        .eq("workspace_id", member.workspace_id)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

    if (existingInvite) {
        return NextResponse.json({ error: "Invite already sent to this email" }, { status: 409 });
    }

    // Create invite token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { error: inviteError } = await supabase.from("workspace_invites").insert({
        workspace_id: member.workspace_id,
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt,
        status: "pending",
    });

    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });

    // Send invite email via our email API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite/${token}`;

    try {
        await fetch(`${appUrl}/api/email/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: email,
                inviteUrl,
                role,
                inviterEmail: user.email,
            }),
        });
    } catch {
        // Email failure is non-fatal — invite is still created
        console.warn("[Team] Failed to send invite email");
    }

    return NextResponse.json({ success: true, inviteUrl });
}

// GET /api/team/invite — list pending invites for workspace
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    if (!member) return NextResponse.json({ invites: [] });

    const { data: invites } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("workspace_id", member.workspace_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    return NextResponse.json({ invites: invites || [] });
}

// DELETE /api/team/invite — revoke an invite
export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invite_id } = await req.json();
    if (!invite_id) return NextResponse.json({ error: "invite_id required" }, { status: 400 });

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .single();

    if (!member || (member.role !== "admin" && member.role !== "owner")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await supabase
        .from("workspace_invites")
        .update({ status: "revoked" })
        .eq("id", invite_id)
        .eq("workspace_id", member.workspace_id);

    return NextResponse.json({ success: true });
}
