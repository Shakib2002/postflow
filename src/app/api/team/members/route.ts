import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/team/members — list all workspace members
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    if (!member) return NextResponse.json({ members: [] });

    const { data: members } = await supabase
        .from("workspace_members")
        .select("id, user_id, role, created_at, email, full_name, avatar_url")
        .eq("workspace_id", member.workspace_id)
        .order("created_at", { ascending: true });

    return NextResponse.json({ members: members || [] });
}

// PATCH /api/team/members — update a member's role
export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { member_id, role } = await req.json();
    if (!member_id || !role) return NextResponse.json({ error: "member_id and role required" }, { status: 400 });
    if (!["admin", "member", "viewer"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data: currentMember } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .single();

    if (!currentMember || (currentMember.role !== "admin" && currentMember.role !== "owner")) {
        return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 });
    }

    const { error } = await supabase
        .from("workspace_members")
        .update({ role })
        .eq("id", member_id)
        .eq("workspace_id", currentMember.workspace_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// DELETE /api/team/members — remove a member
export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { member_id } = await req.json();
    if (!member_id) return NextResponse.json({ error: "member_id required" }, { status: 400 });

    const { data: currentMember } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .single();

    if (!currentMember || (currentMember.role !== "admin" && currentMember.role !== "owner")) {
        return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    // Prevent removing yourself
    const { data: targetMember } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("id", member_id)
        .single();

    if (targetMember?.user_id === user.id) {
        return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", member_id)
        .eq("workspace_id", currentMember.workspace_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
