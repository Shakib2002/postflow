import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/invite-login — sign in and accept invite
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify invite
    const { data: invite, error: inviteError } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("token", token)
        .eq("email", email)
        .eq("status", "pending")
        .single();

    if (inviteError || !invite) {
        return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        await supabase.from("workspace_invites").update({ status: "expired" }).eq("id", invite.id);
        return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    // Sign in
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !authData.user) {
        return NextResponse.json({ error: loginError?.message ?? "Invalid credentials" }, { status: 401 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", invite.workspace_id)
        .eq("user_id", authData.user.id)
        .maybeSingle();

    if (!existingMember) {
        await supabase.from("workspace_members").insert({
            workspace_id: invite.workspace_id,
            user_id: authData.user.id,
            role: invite.role,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name,
        });
    }

    // Mark invite accepted
    await supabase.from("workspace_invites").update({ status: "accepted" }).eq("id", invite.id);

    return NextResponse.json({ success: true });
}
