"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCheck, X, Clock, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    type: string;
    title: string;
    body?: string;
    link?: string;
    read: boolean;
    created_at: string;
}

const notifIcon: Record<string, React.ElementType> = {
    approval_request: Clock,
    approval_decision: CheckCircle2,
    post_published: Zap,
    post_failed: AlertCircle,
    team_invite: CheckCircle2,
    comment_reply: CheckCircle2,
};

const notifColor: Record<string, string> = {
    approval_request: "text-amber-400",
    approval_decision: "text-green-400",
    post_published: "text-violet-400",
    post_failed: "text-red-400",
    team_invite: "text-blue-400",
    comment_reply: "text-cyan-400",
};

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);
        setNotifications(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel("notifications")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "notifications",
            }, (payload) => {
                setNotifications((prev) => [payload.new as Notification, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchNotifications]);

    const markAllRead = async () => {
        const supabase = createClient();
        const ids = notifications.filter((n) => !n.read).map((n) => n.id);
        if (!ids.length) return;
        await supabase.from("notifications").update({ read: true }).in("id", ids);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markRead = async (id: string) => {
        const supabase = createClient();
        await supabase.from("notifications").update({ read: true }).eq("id", id);
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 w-80 z-50 rounded-2xl border border-white/15 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-semibold">Notifications</span>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs px-1.5">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-3 animate-pulse">
                                                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-white/10 rounded w-3/4" />
                                                    <div className="h-3 bg-white/10 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">We'll notify you when something happens</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {notifications.map((n) => {
                                            const Icon = notifIcon[n.type] || Bell;
                                            const color = notifColor[n.type] || "text-muted-foreground";
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`flex gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${!n.read ? "bg-violet-500/5" : ""}`}
                                                    onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                                                >
                                                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium leading-tight ${!n.read ? "text-foreground" : "text-foreground/70"}`}>
                                                            {n.title}
                                                        </p>
                                                        {n.body && (
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                                                    </div>
                                                    {!n.read && (
                                                        <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
