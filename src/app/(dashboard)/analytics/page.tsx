import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get workspace
    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    const workspaceId = member?.workspace_id;

    // Fetch analytics data in parallel
    const [postsResult, analyticsResult, leadsResult] = await Promise.all([
        supabase
            .from("posts")
            .select("id, content, status, platforms, created_at, published_at")
            .eq("workspace_id", workspaceId || "")
            .order("created_at", { ascending: false })
            .limit(100),
        supabase
            .from("analytics_events")
            .select("*")
            .eq("workspace_id", workspaceId || "")
            .order("recorded_at", { ascending: false })
            .limit(500),
        supabase
            .from("leads")
            .select("id, created_at, source")
            .eq("workspace_id", workspaceId || "")
            .order("created_at", { ascending: false })
            .limit(100),
    ]);

    const posts = postsResult.data || [];
    const events = analyticsResult.data || [];
    const leads = leadsResult.data || [];

    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p) => p.status === "published").length;
    const scheduledPosts = posts.filter((p) => p.status === "scheduled").length;
    const draftPosts = posts.filter((p) => p.status === "draft").length;

    const platformCounts: Record<string, number> = {};
    posts.forEach((p) => {
        (p.platforms || []).forEach((platform: string) => {
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const postsPerDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo.getTime() + i * 86400000);
        postsPerDay[d.toISOString().split("T")[0]] = 0;
    }
    posts.forEach((p) => {
        const day = p.created_at.split("T")[0];
        if (postsPerDay[day] !== undefined) postsPerDay[day]++;
    });

    const chartData = Object.entries(postsPerDay).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        posts: count,
    }));

    const totalImpressions = events.reduce((sum, e) => sum + (e.impressions || 0), 0);
    const totalEngagements = events.reduce((sum, e) => sum + (e.likes || 0) + (e.comments || 0) + (e.shares || 0), 0);
    const engagementRate = totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(1) : "0.0";

    // Build per-post engagement map
    const postEngagement: Record<string, { impressions: number; likes: number; comments: number; shares: number }> = {};
    events.forEach((e) => {
        if (!e.post_id) return;
        if (!postEngagement[e.post_id]) postEngagement[e.post_id] = { impressions: 0, likes: 0, comments: 0, shares: 0 };
        postEngagement[e.post_id].impressions += e.impressions || 0;
        postEngagement[e.post_id].likes += e.likes || 0;
        postEngagement[e.post_id].comments += e.comments || 0;
        postEngagement[e.post_id].shares += e.shares || 0;
    });

    // Best performing posts — published, ranked by total engagement
    const bestPosts = posts
        .filter((p) => p.status === "published")
        .map((p) => {
            const eng = postEngagement[p.id] || { impressions: 0, likes: 0, comments: 0, shares: 0 };
            return {
                id: p.id,
                content: p.content || "",
                platforms: p.platforms || [],
                published_at: p.published_at || p.created_at,
                impressions: eng.impressions,
                likes: eng.likes,
                comments: eng.comments,
                shares: eng.shares,
                totalEngagement: eng.likes + eng.comments + eng.shares,
            };
        })
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 5);

    return (
        <AnalyticsClient
            stats={{
                totalPosts,
                publishedPosts,
                scheduledPosts,
                draftPosts,
                totalLeads: leads.length,
                totalImpressions,
                totalEngagements,
                engagementRate,
            }}
            chartData={chartData}
            platformBreakdown={Object.entries(platformCounts).map(([platform, count]) => ({
                platform,
                count,
                percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0,
            }))}
            recentPosts={posts.slice(0, 10).map((p) => ({
                id: p.id,
                status: p.status,
                platforms: p.platforms || [],
                created_at: p.created_at,
                published_at: p.published_at,
            }))}
            bestPosts={bestPosts}
        />
    );
}
