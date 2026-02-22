import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/team/me — get the current user's workspace role
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ role: null }, { status: 401 });

    const { data: member } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("user_id", user.id)
        .single();

    return NextResponse.json({
        role: member?.role ?? null,
        email: user.email,
        name: user.user_metadata?.full_name ?? null,
    });
}
