import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BulkScheduleClient from "./bulk-schedule-client";

export const metadata = { title: "Bulk Schedule | PostFlow" };

export default async function BulkSchedulePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .single();

    return <BulkScheduleClient workspaceId={member?.workspace_id ?? ""} />;
}
