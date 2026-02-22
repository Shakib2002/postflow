import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch all scheduled/pending/published posts that have a scheduled_at date
    const { data: posts } = await supabase
        .from("posts")
        .select("id, content, platform, status, scheduled_at, title")
        .eq("user_id", user.id)
        .not("scheduled_at", "is", null)
        .order("scheduled_at", { ascending: true });

    return <CalendarClient initialPosts={posts ?? []} />;
}
