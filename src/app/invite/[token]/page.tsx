import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InviteAcceptClient } from "./invite-accept-client";

interface Props {
    params: Promise<{ token: string }>;
}

export default async function InviteAcceptPage({ params }: Props) {
    const { token } = await params;
    const supabase = await createClient();

    // Look up the invite
    const { data: invite, error } = await supabase
        .from("workspace_invites")
        .select("*, workspaces(name)")
        .eq("token", token)
        .eq("status", "pending")
        .single();

    if (error || !invite) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Invite</h1>
                    <p className="text-muted-foreground">This invite link is invalid, expired, or has already been used.</p>
                </div>
            </div>
        );
    }

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        await supabase.from("workspace_invites").update({ status: "expired" }).eq("id", invite.id);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⏰</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Invite Expired</h1>
                    <p className="text-muted-foreground">This invite link has expired. Ask your team admin to send a new one.</p>
                </div>
            </div>
        );
    }

    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Auto-accept if logged in
        const { data: existingMember } = await supabase
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", invite.workspace_id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (!existingMember) {
            await supabase.from("workspace_members").insert({
                workspace_id: invite.workspace_id,
                user_id: user.id,
                role: invite.role,
                email: user.email,
                full_name: user.user_metadata?.full_name,
            });
        }

        await supabase.from("workspace_invites").update({ status: "accepted" }).eq("id", invite.id);
        redirect("/dashboard");
    }

    return (
        <InviteAcceptClient
            token={token}
            email={invite.email}
            role={invite.role}
            workspaceName={(invite.workspaces as { name: string })?.name ?? "a workspace"}
        />
    );
}
