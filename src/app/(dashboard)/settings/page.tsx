import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch workspace membership
    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(name, timezone)")
        .eq("user_id", user.id)
        .single();

    // Fetch notification preferences from user metadata or notifications table
    const { data: notifPrefs } = await supabase
        .from("notifications")
        .select("type, read")
        .eq("user_id", user.id)
        .limit(1);

    const workspace = (member?.workspaces as { name?: string; timezone?: string } | null) || {};
    const meta = user.user_metadata || {};

    return (
        <SettingsClient
            user={{
                id: user.id,
                email: user.email || "",
                firstName: meta.first_name || meta.full_name?.split(" ")[0] || "",
                lastName: meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
                company: meta.company || "",
                avatarUrl: meta.avatar_url || "",
            }}
            workspace={{
                id: member?.workspace_id || "",
                name: workspace.name || "My Workspace",
                timezone: workspace.timezone || "UTC",
            }}
        />
    );
}
