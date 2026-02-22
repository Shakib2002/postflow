import { createClient } from "@/lib/supabase/server";
import { CommentsClient } from "./comments-client";

export default async function CommentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    const workspaceId = member?.workspace_id;

    // Fetch posts with their comment counts from analytics_events
    const { data: posts } = await supabase
        .from("posts")
        .select("id, content, platforms, status, published_at, created_at")
        .eq("workspace_id", workspaceId || "")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

    // Fetch comment events
    const { data: commentEvents } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("workspace_id", workspaceId || "")
        .order("recorded_at", { ascending: false })
        .limit(200);

    // Fetch leads that came from comments (source = 'comment')
    const { data: commentLeads } = await supabase
        .from("leads")
        .select("id, name, email, source, created_at")
        .eq("workspace_id", workspaceId || "")
        .eq("source", "comment")
        .order("created_at", { ascending: false })
        .limit(50);

    const postsData = posts || [];
    const events = commentEvents || [];
    const leads = commentLeads || [];

    // Aggregate stats from events
    const totalComments = events.reduce((sum, e) => sum + (e.comments || 0), 0);
    const totalLikes = events.reduce((sum, e) => sum + (e.likes || 0), 0);
    const totalShares = events.reduce((sum, e) => sum + (e.shares || 0), 0);

    return (
        <CommentsClient
            posts={postsData}
            events={events}
            commentLeads={leads}
            stats={{
                totalComments,
                totalLikes,
                totalShares,
                totalLeads: leads.length,
            }}
        />
    );
}
