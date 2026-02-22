"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    FileText, Send, Clock, FileEdit, Users, Eye, Heart, TrendingUp,
    Linkedin, Facebook, Twitter, Instagram,
} from "lucide-react";

interface AnalyticsStats {
    totalPosts: number;
    publishedPosts: number;
    scheduledPosts: number;
    draftPosts: number;
    totalLeads: number;
    totalImpressions: number;
    totalEngagements: number;
    engagementRate: string;
}

interface ChartDataPoint {
    date: string;
    posts: number;
}

interface PlatformBreakdown {
    platform: string;
    count: number;
    percentage: number;
}

interface RecentPost {
    id: string;
    status: string;
    platforms: string[];
    created_at: string;
    published_at?: string;
}

interface BestPost {
    id: string;
    content: string;
    platforms: string[];
    published_at: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    totalEngagement: number;
}

interface AnalyticsClientProps {
    stats: AnalyticsStats;
    chartData: ChartDataPoint[];
    platformBreakdown: PlatformBreakdown[];
    recentPosts: RecentPost[];
    bestPosts: BestPost[];
}

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
};

const platformColors: Record<string, string> = {
    linkedin: "#0A66C2",
    facebook: "#1877F2",
    twitter: "#000000",
    instagram: "#E4405F",
};

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
});

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    return (
        <Card className="glass border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                </div>
                <p className="text-3xl font-bold">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    );
}

function statusBadge(status: string) {
    const map: Record<string, string> = {
        published: "bg-green-500/20 text-green-400 border-green-500/30",
        scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        pending_approval: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return map[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function AnalyticsClient({ stats, chartData, platformBreakdown, recentPosts, bestPosts }: AnalyticsClientProps) {
    const isEmpty = stats.totalPosts === 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div {...fu(0)} className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track your content performance</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 shrink-0">Last 30 days</Badge>
            </motion.div>

            {/* Stats grid */}
            <motion.div {...fu(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Posts" value={stats.totalPosts} sub={`${stats.publishedPosts} published`} color="#8b5cf6" />
                <StatCard icon={Send} label="Published" value={stats.publishedPosts} sub="Successfully sent" color="#10b981" />
                <StatCard icon={Clock} label="Scheduled" value={stats.scheduledPosts} sub="Upcoming posts" color="#3b82f6" />
                <StatCard icon={Users} label="Leads" value={stats.totalLeads} sub="Captured" color="#f59e0b" />
            </motion.div>

            {/* Engagement stats */}
            <motion.div {...fu(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard icon={Eye} label="Impressions" value={stats.totalImpressions.toLocaleString()} sub="Total reach" color="#06b6d4" />
                <StatCard icon={Heart} label="Engagements" value={stats.totalEngagements.toLocaleString()} sub="Likes + comments + shares" color="#ec4899" />
                <StatCard icon={TrendingUp} label="Engagement Rate" value={`${stats.engagementRate}%`} sub="Engagements / impressions" color="#8b5cf6" />
            </motion.div>

            {isEmpty ? (
                <motion.div {...fu(0.15)}>
                    <Card className="glass border-white/10">
                        <CardContent className="py-20 text-center">
                            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No data yet</h3>
                            <p className="text-sm text-muted-foreground">Create and publish posts to see your analytics here.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <>
                    {/* Posts over time chart */}
                    <motion.div {...fu(0.15)}>
                        <Card className="glass border-white/10">
                            <CardContent className="p-5">
                                <h3 className="text-sm font-semibold mb-5">Posts Over Time (Last 30 Days)</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: "#888" }}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={4}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                                            cursor={{ fill: "rgba(139,92,246,0.1)" }}
                                        />
                                        <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-5">
                        {/* Platform breakdown */}
                        <motion.div {...fu(0.2)}>
                            <Card className="glass border-white/10 h-full">
                                <CardContent className="p-5">
                                    <h3 className="text-sm font-semibold mb-5">Platform Breakdown</h3>
                                    {platformBreakdown.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <PieChart>
                                                    <Pie
                                                        data={platformBreakdown}
                                                        dataKey="count"
                                                        nameKey="platform"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={3}
                                                    >
                                                        {platformBreakdown.map((_, i) => (
                                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                                                    />
                                                    <Legend formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-2 mt-2">
                                                {platformBreakdown.map((p, i) => {
                                                    const Icon = platformIcons[p.platform] || FileText;
                                                    return (
                                                        <div key={p.platform} className="flex items-center gap-3">
                                                            <Icon className="w-4 h-4 shrink-0" style={{ color: platformColors[p.platform] || PIE_COLORS[i] }} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs capitalize">{p.platform}</span>
                                                                    <span className="text-xs text-muted-foreground">{p.count} posts ({p.percentage}%)</span>
                                                                </div>
                                                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all"
                                                                        style={{ width: `${p.percentage}%`, backgroundColor: platformColors[p.platform] || PIE_COLORS[i] }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                            No platform data yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent posts */}
                        <motion.div {...fu(0.25)}>
                            <Card className="glass border-white/10 h-full">
                                <CardContent className="p-5">
                                    <h3 className="text-sm font-semibold mb-4">Recent Posts</h3>
                                    <div className="space-y-3">
                                        {recentPosts.slice(0, 6).map((post) => (
                                            <div key={post.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                                                <div className="flex gap-1">
                                                    {post.platforms.slice(0, 2).map((p) => {
                                                        const Icon = platformIcons[p] || FileText;
                                                        return <Icon key={p} className="w-3.5 h-3.5" style={{ color: platformColors[p] }} />;
                                                    })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>
                                                </div>
                                                <Badge className={`text-xs ${statusBadge(post.status)}`}>
                                                    {post.status === "pending_approval" ? "Pending" : post.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        {recentPosts.length === 0 && (
                                            <div className="text-center py-8 text-sm text-muted-foreground">No posts yet</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}

            {/* Best Performing Posts */}
            {bestPosts.length > 0 && (
                <motion.div {...fu(0.28)}>
                    <Card className="glass border-white/10">
                        <CardContent className="p-5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-violet-400" />
                                Best Performing Posts
                            </h3>
                            <div className="space-y-3">
                                {bestPosts.map((post, i) => (
                                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                        <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm line-clamp-2 mb-2">{post.content || "(no content)"}</p>
                                            <div className="flex items-center gap-1 mb-2">
                                                {post.platforms.slice(0, 3).map((p) => {
                                                    const Icon = platformIcons[p] || FileText;
                                                    return <Icon key={p} className="w-3 h-3" style={{ color: platformColors[p] }} />;
                                                })}
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.impressions.toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{post.comments}</span>
                                                <span className="flex items-center gap-1"><Send className="w-3 h-3" />{post.shares}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 shrink-0 text-xs">
                                            {post.totalEngagement} eng
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Post status breakdown */}
            <motion.div {...fu(0.3)}>
                <Card className="glass border-white/10">
                    <CardContent className="p-5">
                        <h3 className="text-sm font-semibold mb-4">Post Status Overview</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Published", value: stats.publishedPosts, icon: Send, color: "#10b981" },
                                { label: "Scheduled", value: stats.scheduledPosts, icon: Clock, color: "#3b82f6" },
                                { label: "Drafts", value: stats.draftPosts, icon: FileEdit, color: "#888" },
                                { label: "Total", value: stats.totalPosts, icon: FileText, color: "#8b5cf6" },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                    <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
