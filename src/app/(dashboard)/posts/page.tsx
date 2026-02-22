import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostsClient from "./posts-client";

export default async function PostsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    const { data: posts } = await supabase
        .from("posts")
        .select("id, content, status, scheduled_at, created_at, post_platforms(platform)")
        .eq("workspace_id", member?.workspace_id ?? "")
        .order("created_at", { ascending: false });

    return <PostsClient posts={posts ?? []} />;
}
