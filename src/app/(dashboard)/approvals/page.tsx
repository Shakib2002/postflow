"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle2, XCircle, Clock, MessageSquare,
    Linkedin, Facebook, Twitter, Instagram,
    RefreshCw, Eye, ChevronDown, ChevronUp, AlertCircle,
    Filter, Search,
} from "lucide-react";

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

interface ApprovalPost {
    id: string;
    content: string;
    platforms: string[];
    status: string;
    created_at: string;
    scheduled_at?: string;
    approvals?: Array<{
        id: string;
        status: string;
        feedback?: string;
        requested_by: string;
        reviewed_at?: string;
    }>;
}

function PostCard({ post, onDecision }: { post: ApprovalPost; onDecision: (postId: string, decision: "approved" | "rejected", feedback: string) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [deciding, setDeciding] = useState<"approved" | "rejected" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const approval = post.approvals?.[0];

    const handleDecision = async (decision: "approved" | "rejected") => {
        setIsSubmitting(true);
        await onDecision(post.id, decision, feedback);
        setIsSubmitting(false);
        setDeciding(null);
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            layout
        >
            <Card className="glass border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Status indicator */}
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${post.status === "pending_approval" ? "bg-amber-400 animate-pulse" :
                            post.status === "approved" ? "bg-green-400" :
                                post.status === "rejected" ? "bg-red-400" : "bg-gray-400"
                            }`} />

                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {post.platforms.map((p) => {
                                        const Icon = platformIcons[p] || Linkedin;
                                        return (
                                            <span key={p} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                <Icon className="w-3 h-3" style={{ color: platformColors[p] }} />
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </span>
                                        );
                                    })}
                                    <Badge className={
                                        post.status === "pending_approval" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                            post.status === "approved" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                post.status === "rejected" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                    }>
                                        {post.status === "pending_approval" ? "Pending Review" :
                                            post.status === "approved" ? "Approved" :
                                                post.status === "rejected" ? "Rejected" : post.status}
                                    </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(post.created_at)}</span>
                            </div>

                            {/* Content preview */}
                            <p className={`text-sm text-foreground/90 leading-relaxed ${!expanded ? "line-clamp-3" : "whitespace-pre-wrap"}`}>
                                {post.content}
                            </p>
                            {post.content.length > 200 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
                                >
                                    {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
                                </button>
                            )}

                            {/* Approval feedback */}
                            {approval?.feedback && (
                                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">Reviewer feedback</span>
                                    </div>
                                    <p className="text-sm text-foreground/80">{approval.feedback}</p>
                                </div>
                            )}

                            {/* Action buttons for pending */}
                            {post.status === "pending_approval" && (
                                <div className="mt-4 space-y-3">
                                    {deciding ? (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                                            <Textarea
                                                placeholder={deciding === "rejected" ? "Explain why this post needs changes..." : "Optional feedback for the author..."}
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="min-h-[80px] bg-white/5 border-white/10 resize-none text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className={deciding === "approved"
                                                        ? "bg-green-600 hover:bg-green-500 gap-2"
                                                        : "bg-red-600 hover:bg-red-500 gap-2"
                                                    }
                                                    onClick={() => handleDecision(deciding)}
                                                    disabled={isSubmitting || (deciding === "rejected" && !feedback.trim())}
                                                >
                                                    {isSubmitting
                                                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        : deciding === "approved"
                                                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                                                            : <XCircle className="w-3.5 h-3.5" />
                                                    }
                                                    {deciding === "approved" ? "Confirm Approval" : "Confirm Rejection"}
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setDeciding(null); setFeedback(""); }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-500 gap-2"
                                                onClick={() => setDeciding("approved")}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                                                onClick={() => setDeciding("rejected")}
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Request Changes
                                            </Button>
                                            <Button size="sm" variant="ghost" className="gap-2 ml-auto">
                                                <Eye className="w-3.5 h-3.5" />
                                                Preview
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ApprovalsPage() {
    const [posts, setPosts] = useState<ApprovalPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending_approval" | "approved" | "rejected">("pending_approval");
    const [search, setSearch] = useState("");

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: filter, limit: "50" });
            if (search) params.set("search", search);
            const res = await fetch(`/api/posts?${params}`);
            const data = await res.json();
            setPosts(data.posts || []);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleDecision = async (postId: string, decision: "approved" | "rejected", feedback: string) => {
        try {
            await fetch(`/api/approvals/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, feedback }),
            });
            fetchPosts();
        } catch {
            console.error("Failed to update approval");
        }
    };

    const pendingCount = posts.filter((p) => p.status === "pending_approval").length;
    const filteredPosts = posts.filter((p) =>
        !search || p.content.toLowerCase().includes(search.toLowerCase())
    );

    const filterOptions = [
        { value: "pending_approval", label: "Pending", count: pendingCount },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "all", label: "All" },
    ] as const;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Approvals</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Review and approve posts before publishing</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">{pendingCount} awaiting review</span>
                    </div>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
                <Card className="glass border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex gap-1">
                            {filterOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === opt.value
                                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        }`}
                                >
                                    {opt.value === "pending_approval" && <Clock className="w-3.5 h-3.5" />}
                                    {opt.value === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {opt.value === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                                    {opt.value === "all" && <Filter className="w-3.5 h-3.5" />}
                                    {opt.label}
                                    {"count" in opt && opt.count > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                            {opt.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 max-w-xs ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Posts list */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="glass border-white/10">
                            <CardContent className="p-5">
                                <div className="animate-pulse space-y-3">
                                    <div className="flex gap-2">
                                        <div className="h-5 w-24 bg-white/10 rounded-full" />
                                        <div className="h-5 w-16 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="h-4 bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                    <div className="h-4 bg-white/10 rounded w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                        {filter === "pending_approval" ? "No pending approvals" : `No ${filter} posts`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {filter === "pending_approval"
                            ? "All posts have been reviewed. Great work! 🎉"
                            : "Posts will appear here once they match this filter."}
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} onDecision={handleDecision} />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
