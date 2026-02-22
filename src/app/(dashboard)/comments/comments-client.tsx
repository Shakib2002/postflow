"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MessageSquare, Search, Heart, TrendingUp, AlertCircle,
    CheckCircle2, Linkedin, Facebook, Twitter, Instagram,
    ExternalLink, Users, Share2, Eye,
} from "lucide-react";

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram,
};
const platformColors: Record<string, string> = {
    linkedin: "#0A66C2", facebook: "#1877F2", twitter: "#6B7280", instagram: "#E4405F",
};

interface Post {
    id: string;
    content: string;
    platforms: string[];
    status: string;
    published_at?: string;
    created_at: string;
}

interface AnalyticsEvent {
    id: string;
    post_id?: string;
    platform?: string;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    recorded_at?: string;
}

interface CommentLead {
    id: string;
    name?: string;
    email?: string;
    source?: string;
    created_at: string;
}

interface CommentsClientProps {
    posts: Post[];
    events: AnalyticsEvent[];
    commentLeads: CommentLead[];
    stats: {
        totalComments: number;
        totalLikes: number;
        totalShares: number;
        totalLeads: number;
    };
}

export function CommentsClient({ posts, events, commentLeads, stats }: CommentsClientProps) {
    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState("all");

    // Build per-post engagement from events
    const postEngagement = useMemo(() => {
        const map: Record<string, { likes: number; comments: number; shares: number; impressions: number; platform: string }> = {};
        events.forEach((e) => {
            if (!e.post_id) return;
            if (!map[e.post_id]) map[e.post_id] = { likes: 0, comments: 0, shares: 0, impressions: 0, platform: e.platform || "" };
            map[e.post_id].likes += e.likes || 0;
            map[e.post_id].comments += e.comments || 0;
            map[e.post_id].shares += e.shares || 0;
            map[e.post_id].impressions += e.impressions || 0;
        });
        return map;
    }, [events]);

    // Build enriched post list
    const enrichedPosts = useMemo(() => {
        return posts.map((p) => {
            const eng = postEngagement[p.id] || { likes: 0, comments: 0, shares: 0, impressions: 0, platform: "" };
            return { ...p, ...eng };
        });
    }, [posts, postEngagement]);

    // Filter
    const filtered = useMemo(() => {
        return enrichedPosts.filter((p) => {
            const matchSearch = !search || p.content?.toLowerCase().includes(search.toLowerCase());
            const matchPlatform = platformFilter === "all" || p.platforms?.includes(platformFilter);
            return matchSearch && matchPlatform;
        });
    }, [enrichedPosts, search, platformFilter]);

    const isEmpty = posts.length === 0;

    const statCards = [
        { label: "Total Comments", value: stats.totalComments, icon: MessageSquare, color: "from-violet-500 to-purple-600" },
        { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "from-pink-500 to-rose-600" },
        { label: "Total Shares", value: stats.totalShares, icon: Share2, color: "from-blue-500 to-cyan-600" },
        { label: "Comment Leads", value: stats.totalLeads, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div {...fu(0)}>
                <h1 className="text-2xl font-bold">Comments</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Monitor engagement and comment activity across all your published posts
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div {...fu(0.05)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="glass border-white/10">
                        <CardContent className="p-4">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div {...fu(0.1)} className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["all", "linkedin", "twitter", "facebook", "instagram"].map((p) => {
                        const Icon = p !== "all" ? platformIcons[p] : null;
                        return (
                            <Button
                                key={p}
                                size="sm"
                                variant={platformFilter === p ? "default" : "outline"}
                                onClick={() => setPlatformFilter(p)}
                                className={`gap-1.5 ${platformFilter === p ? "bg-violet-600 hover:bg-violet-700" : "border-white/10 bg-white/5"}`}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5" style={{ color: platformFilter === p ? "white" : platformColors[p] }} />}
                                {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
                            </Button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Empty state */}
            {isEmpty && (
                <motion.div {...fu(0.15)}>
                    <Card className="glass border-white/10">
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                            <h3 className="text-lg font-semibold mb-2">No published posts yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Publish posts to start tracking comments and engagement.
                            </p>
                            <Button asChild className="bg-violet-600 hover:bg-violet-700">
                                <a href="/compose">Create a Post</a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Post engagement list */}
            {!isEmpty && (
                <motion.div {...fu(0.15)} className="space-y-3">
                    {filtered.length === 0 ? (
                        <Card className="glass border-white/10">
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No posts match your filters.
                            </CardContent>
                        </Card>
                    ) : (
                        filtered.map((post, i) => {
                            const date = post.published_at || post.created_at;
                            return (
                                <motion.div key={post.id} {...fu(0.05 * i)}>
                                    <Card className="glass border-white/10 hover:border-white/20 transition-all">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Platform icons */}
                                                <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                                                    {(post.platforms || []).slice(0, 3).map((pl) => {
                                                        const Icon = platformIcons[pl] || MessageSquare;
                                                        return (
                                                            <div key={pl} className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10">
                                                                <Icon className="w-3.5 h-3.5" style={{ color: platformColors[pl] }} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm line-clamp-2 mb-2">{post.content || "(no content)"}</p>
                                                    <p className="text-xs text-muted-foreground mb-3">
                                                        {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>

                                                    {/* Engagement metrics */}
                                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            {(post.impressions || 0).toLocaleString()} impressions
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Heart className="w-3.5 h-3.5 text-pink-400" />
                                                            {post.likes || 0} likes
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                                                            {post.comments || 0} comments
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Share2 className="w-3.5 h-3.5 text-blue-400" />
                                                            {post.shares || 0} shares
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Engagement badge */}
                                                <div className="shrink-0 text-right">
                                                    {(post.comments || 0) > 0 ? (
                                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            {post.comments} comments
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            No comments
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>
            )}

            {/* Comment Leads section */}
            {commentLeads.length > 0 && (
                <motion.div {...fu(0.25)}>
                    <Card className="glass border-white/10">
                        <CardContent className="p-5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-400" />
                                Leads from Comments ({commentLeads.length})
                            </h3>
                            <div className="space-y-2">
                                {commentLeads.slice(0, 10).map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div>
                                            <p className="text-sm font-medium">{lead.name || "Anonymous"}</p>
                                            <p className="text-xs text-muted-foreground">{lead.email || "—"}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
