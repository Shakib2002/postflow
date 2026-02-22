import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/social/platforms
 * Returns the list of connected social accounts for the current user's workspace.
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get workspace
        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ platforms: [] });
        }

        const { data: accounts, error } = await supabase
            .from("social_accounts")
            .select("*")
            .eq("workspace_id", member.workspace_id)
            .eq("is_active", true);

        if (error) {
            console.error("Fetch platforms error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            platforms: accounts.map(a => ({
                id: a.id,
                platform: a.platform,
                name: a.account_name,
                handle: a.account_name, // fallback for mock
                connected: true,
            }))
        });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
