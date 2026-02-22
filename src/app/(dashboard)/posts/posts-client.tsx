"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    PlusCircle, Search, Filter, CheckCircle, Clock, XCircle,
    FileText, Linkedin, Facebook, Twitter, Instagram, Calendar,
    Edit3, Trash2, Eye, MoreHorizontal, RotateCcw,
} from "lucide-react";

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram,
};
const platformColors: Record<string, string> = {
    linkedin: "#0A66C2", facebook: "#1877F2", twitter: "#6b7280", instagram: "#E4405F",
};
const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    published: { label: "Published", icon: CheckCircle, className: "text-green-400 bg-green-500/10 border-green-500/20" },
    pending: { label: "Pending", icon: Clock, className: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    pending_approval: { label: "Awaiting Approval", icon: Eye, className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    scheduled: { label: "Scheduled", icon: Calendar, className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    failed: { label: "Failed", icon: XCircle, className: "text-red-400 bg-red-500/10 border-red-500/20" },
    draft: { label: "Draft", icon: FileText, className: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
    publishing: { label: "Publishing", icon: Clock, className: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

type FilterType = "all" | "published" | "scheduled" | "pending" | "pending_approval" | "draft" | "failed";

interface Post {
    id: string;
    content: string;
    status: string;
    scheduled_at: string | null;
    created_at: string;
    post_platforms: Array<{ platform: string }> | null;
}

export default function PostsClient({ posts }: { posts: Post[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");

    const recyclePost = (content: string) => {
        // Pre-fill compose page with existing post content via query param
        const params = new URLSearchParams({ recycle: encodeURIComponent(content) });
        router.push(`/compose?${params.toString()}`);
    };

    const filtered = posts.filter((p) => {
        const matchSearch = p.content.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.status === filter;
        return matchSearch && matchFilter;
    });

    const counts = {
        all: posts.length,
        published: posts.filter((p) => p.status === "published").length,
        scheduled: posts.filter((p) => p.status === "scheduled").length,
        pending: posts.filter((p) => p.status === "pending").length,
        pending_approval: posts.filter((p) => p.status === "pending_approval").length,
        draft: posts.filter((p) => p.status === "draft").length,
        failed: posts.filter((p) => p.status === "failed").length,
    };

    const filters: { key: FilterType; label: string }[] = [
        { key: "all", label: "All" },
        { key: "published", label: "Published" },
        { key: "scheduled", label: "Scheduled" },
        { key: "pending_approval", label: "Approval" },
        { key: "pending", label: "Pending" },
        { key: "draft", label: "Drafts" },
        { key: "failed", label: "Failed" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <p className="text-muted-foreground text-sm mt-1">{posts.length} total posts across all platforms</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 gap-2 shrink-0">
                    <Link href="/compose">
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden xs:inline">New Post</span>
                    </Link>
                </Button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 focus:border-violet-500/50"
                    />
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${filter === f.key
                                ? "bg-violet-500/20 text-violet-400"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {f.label}
                            {counts[f.key] > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-violet-500/30" : "bg-white/10"}`}>
                                    {counts[f.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            {filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                >
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">
                        {posts.length === 0 ? "No posts yet" : "No posts match your filter"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        {posts.length === 0
                            ? "Create your first post to start growing your audience."
                            : "Try a different filter or search term."}
                    </p>
                    {posts.length === 0 && (
                        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 gap-2">
                            <Link href="/compose"><PlusCircle className="w-4 h-4" />Create First Post</Link>
                        </Button>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((post, i) => {
                        const status = statusConfig[post.status] ?? statusConfig.draft;
                        const platforms = Array.isArray(post.post_platforms) ? post.post_platforms : [];
                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <Card className="glass border-white/10 hover:border-white/20 transition-all group">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Platform icons */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {platforms.map((pp) => {
                                                    const Icon = platformIcons[pp.platform] ?? Eye;
                                                    return (
                                                        <div key={pp.platform} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-sm" title={pp.platform}>
                                                            <Icon className="w-4 h-4" style={{ color: platformColors[pp.platform] }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground line-clamp-2 mb-2">{post.content}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        {post.scheduled_at
                                                            ? `Scheduled: ${new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                                                            : `Created: ${new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                                    </span>
                                                    {platforms.length > 0 && (
                                                        <span>{platforms.length} platform{platforms.length > 1 ? "s" : ""}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status + Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge className={`${status.className} border text-xs flex items-center gap-1`}>
                                                    <status.icon className="w-3 h-3" />
                                                    {status.label}
                                                </Badge>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="View">
                                                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit">
                                                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                                                        title="Re-share (Content Recycler)"
                                                        onClick={() => recyclePost(post.content)}
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                                                    </button>
                                                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
