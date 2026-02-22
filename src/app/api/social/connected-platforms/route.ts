import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/social/connected-platforms
 * Returns which platforms this workspace has connected social accounts for.
 * Used by the compose page to show connected/disconnected indicators.
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    if (!member) return NextResponse.json({ connected: [] });

    const { data: accounts } = await supabase
        .from("social_accounts")
        .select("platform, account_name, account_id, is_active")
        .eq("workspace_id", member.workspace_id)
        .eq("is_active", true);

    // Return a map: { linkedin: { connected: true, name: "John Doe" }, ... }
    const connected: Record<string, { connected: boolean; name?: string }> = {};
    for (const acct of (accounts ?? [])) {
        connected[acct.platform] = {
            connected: true,
            name: acct.account_name ?? undefined,
        };
    }

    return NextResponse.json({ connected });
}
