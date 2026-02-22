import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/social/connect
 * Body: { platforms: string[] }
 * Mock connects the specified platforms for the current user's workspace.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { platforms } = await req.json();

        if (!platforms || !Array.isArray(platforms)) {
            return NextResponse.json({ error: "Platforms array required" }, { status: 400 });
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

        // Insert mock social accounts
        // In a real app, this would be the final stage of an OAuth flow.
        const mockAccounts = platforms.map(p => ({
            workspace_id: member.workspace_id,
            platform: p,
            account_id: `mock_${p}_${Date.now()}`,
            account_name: `Demo ${p.charAt(0).toUpperCase() + p.slice(1)} Account`,
            is_active: true,
        }));

        // Use upsert to avoid duplicates if they click connect multiple times
        const { error } = await supabase
            .from("social_accounts")
            .upsert(mockAccounts, { onConflict: 'workspace_id,platform' });

        if (error) {
            console.error("Connect platforms error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, connected: platforms });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
