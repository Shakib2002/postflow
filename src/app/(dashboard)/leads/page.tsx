import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return <LeadsClient initialLeads={leads ?? []} />;
}
