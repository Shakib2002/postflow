"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    BarChart3, Users, TrendingUp, Calendar, CheckCircle,
    Clock, XCircle, Linkedin, Facebook, Twitter, Instagram,
    ArrowUpRight, PlusCircle, Eye, Heart, MessageSquare, FileText,
} from "lucide-react";
import { ReferralCard } from "@/components/dashboard/referral-card";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar,
} from "recharts";

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram,
};
const platformColors: Record<string, string> = {
    linkedin: "#0A66C2", facebook: "#1877F2", twitter: "#6b7280", instagram: "#E4405F",
};
const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    published: { label: "Published", icon: CheckCircle, className: "text-green-400 bg-green-400/10" },
    pending: { label: "Pending", icon: Clock, className: "text-yellow-400 bg-yellow-400/10" },
    scheduled: { label: "Scheduled", icon: Calendar, className: "text-blue-400 bg-blue-400/10" },
    failed: { label: "Failed", icon: XCircle, className: "text-red-400 bg-red-400/10" },
    draft: { label: "Draft", icon: FileText, className: "text-gray-400 bg-gray-400/10" },
};

interface Props {
    stats: { totalPosts: number; publishedPosts: number; scheduledPosts: number; totalLeads: number };
    recentPosts: Array<{
        id: string;
        content: string;
        status: string;
        scheduled_at: string | null;
        post_platforms: Array<{ platform: string }> | null;
    }>;
    leadsChart: Array<{ month: string; leads: number }>;
    engagementChart: Array<{ day: string; posts: number; likes: number; reach: number }>;
    workspaceName: string;
    firstName: string;
    hasData: boolean;
    userId: string;
}

export default function DashboardClient({ stats, recentPosts, leadsChart, engagementChart, firstName, hasData, userId }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const statCards = [
        {
            label: "Total Posts",
            value: stats.totalPosts.toString(),
            sub: `${stats.publishedPosts} published`,
            icon: Calendar,
            color: "from-violet-500 to-purple-600",
            glow: "shadow-violet-500/20",
        },
        {
            label: "Scheduled",
            value: stats.scheduledPosts.toString(),
            sub: "upcoming posts",
            icon: Clock,
            color: "from-blue-500 to-cyan-600",
            glow: "shadow-blue-500/20",
        },
        {
            label: "Leads Captured",
            value: stats.totalLeads.toString(),
            sub: "total leads",
            icon: Users,
            color: "from-green-500 to-emerald-600",
            glow: "shadow-green-500/20",
        },
        {
            label: "Engagement",
            value: stats.totalPosts > 0 ? `${((stats.publishedPosts / Math.max(stats.totalPosts, 1)) * 100).toFixed(0)}%` : "—",
            sub: "publish rate",
            icon: TrendingUp,
            color: "from-orange-500 to-amber-600",
            glow: "shadow-orange-500/20",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{greeting}, {firstName} 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {hasData
                            ? "Here's what's happening with your social media today."
                            : "Welcome! Create your first post to get started."}
                    </p>
                </div>
                <Button asChild className="self-start sm:self-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 gap-2">
                    <Link href="/compose">
                        <PlusCircle className="w-4 h-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Empty state for new users */}
            {!hasData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-10 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Ready to grow your audience?</h2>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                        Create your first post, connect your social accounts, and start tracking your growth. Your dashboard will come alive with real data.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2">
                            <Link href="/compose"><PlusCircle className="w-4 h-4" /> Create First Post</Link>
                        </Button>
                        <Button asChild variant="outline" className="border-white/20 gap-2">
                            <Link href="/settings">Connect Accounts</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                    >
                        <Card className="glass border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.glow}`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    {hasData && (
                                        <Badge className="bg-green-500/10 text-green-400 border-0 text-xs">
                                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                            Live
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                <div className="text-[11px] text-muted-foreground/60 mt-0.5">{stat.sub}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Referral Card + Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Charts - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Engagement Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.32 }}
                        className="lg:col-span-2"
                    >
                        <Card className="glass border-white/10">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Posts This Week</CardTitle>
                                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">Last 7 days</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={engagementChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#fff" }} />
                                        <Area type="monotone" dataKey="posts" stroke="#8b5cf6" strokeWidth={2} fill="url(#postsGrad)" name="Posts" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Leads Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                        <Card className="glass border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Leads Captured</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={leadsChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                                        <Bar dataKey="leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Leads" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Referral Card -- right column */}
                <div className="space-y-4">
                    <ReferralCard userId={userId} />
                </div>
            </div>

            {/* Recent Posts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.48 }}>
                <Card className="glass border-white/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 text-xs">
                                <Link href="/posts">View all →</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentPosts.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                <p className="text-muted-foreground text-sm mb-4">No posts yet. Create your first post!</p>
                                <Button asChild size="sm" className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30">
                                    <Link href="/compose"><PlusCircle className="w-3.5 h-3.5 mr-1.5" />Create Post</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPosts.map((post) => {
                                    const status = statusConfig[post.status] ?? statusConfig.draft;
                                    const platforms = Array.isArray(post.post_platforms) ? post.post_platforms : [];
                                    return (
                                        <div key={post.id} className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.content}</p>
                                                <Badge className={`${status.className} border-0 text-xs shrink-0 flex items-center gap-1`}>
                                                    <status.icon className="w-3 h-3" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {platforms.map((pp) => {
                                                        const Icon = platformIcons[pp.platform] ?? Eye;
                                                        return (
                                                            <div key={pp.platform} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                                <Icon className="w-3 h-3" style={{ color: platformColors[pp.platform] }} />
                                                            </div>
                                                        );
                                                    })}
                                                    {post.scheduled_at && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> —</span>
                                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> —</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Platform Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.56 }}>
                <Card className="glass border-white/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Platform Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { platform: "LinkedIn", icon: Linkedin, color: "#0A66C2", pct: 78 },
                                { platform: "Facebook", icon: Facebook, color: "#1877F2", pct: 52 },
                                { platform: "Twitter/X", icon: Twitter, color: "#6b7280", pct: 26 },
                            ].map((p) => (
                                <div key={p.platform} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <p.icon className="w-4 h-4" style={{ color: p.color }} />
                                            <span className="font-medium">{p.platform}</span>
                                        </div>
                                        <span className="text-muted-foreground text-xs">Connect →</span>
                                    </div>
                                    <Progress value={hasData ? p.pct : 0} className="h-1.5" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
