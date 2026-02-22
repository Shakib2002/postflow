import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./billing-client";
import { PLANS } from "@/lib/stripe";

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let subscription = null;
    let workspaceId = null;

    if (user) {
        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (member) {
            workspaceId = member.workspace_id;
            const { data: sub } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("workspace_id", member.workspace_id)
                .maybeSingle();
            subscription = sub;
        }
    }

    // Get usage stats
    let postsThisMonth = 0;
    let teamMemberCount = 0;
    let socialAccountCount = 0;

    if (workspaceId) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [postsRes, membersRes, accountsRes] = await Promise.all([
            supabase
                .from("posts")
                .select("id", { count: "exact", head: true })
                .eq("workspace_id", workspaceId)
                .gte("created_at", startOfMonth.toISOString()),
            supabase
                .from("workspace_members")
                .select("id", { count: "exact", head: true })
                .eq("workspace_id", workspaceId),
            supabase
                .from("social_accounts")
                .select("id", { count: "exact", head: true })
                .eq("workspace_id", workspaceId),
        ]);

        postsThisMonth = postsRes.count ?? 0;
        teamMemberCount = membersRes.count ?? 0;
        socialAccountCount = accountsRes.count ?? 0;
    }

    const currentPlan = (subscription?.plan ?? "free") as keyof typeof PLANS | "free";
    const planConfig = currentPlan !== "free" ? PLANS[currentPlan as keyof typeof PLANS] : null;

    return (
        <BillingClient
            subscription={subscription}
            currentPlan={currentPlan}
            planConfig={planConfig}
            usage={{ postsThisMonth, teamMemberCount, socialAccountCount }}
        />
    );
}
