import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/invite-signup — create account and accept invite
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { token, email, password, name } = await req.json();

    if (!token || !email || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify invite is still valid
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

    // Create the user account
    const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name },
        },
    });

    if (signupError || !authData.user) {
        return NextResponse.json({ error: signupError?.message ?? "Signup failed" }, { status: 400 });
    }

    // Add to workspace
    await supabase.from("workspace_members").insert({
        workspace_id: invite.workspace_id,
        user_id: authData.user.id,
        role: invite.role,
        email: authData.user.email,
        full_name: name,
    });

    // Mark invite as accepted
    await supabase.from("workspace_invites").update({ status: "accepted" }).eq("id", invite.id);

    return NextResponse.json({ success: true });
}
