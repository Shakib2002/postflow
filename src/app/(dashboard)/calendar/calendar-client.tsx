"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft, ChevronRight, Plus, Linkedin, Facebook,
    Twitter, Instagram, Clock, CheckCircle2, AlertCircle,
    Edit3, Eye, CalendarDays, LayoutGrid, List, Calendar,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const platformColors: Record<string, string> = {
    linkedin: "#0A66C2",
    facebook: "#1877F2",
    twitter: "#000000",
    instagram: "#E4405F",
};

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
};

type PostStatus = "scheduled" | "published" | "pending_approval" | "failed" | "draft";
type ViewMode = "month" | "week" | "list";

interface Post {
    id: string;
    content: string;
    title?: string;
    platform: string;
    status: PostStatus;
    scheduled_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    scheduled: { label: "Scheduled", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Clock },
    published: { label: "Published", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
    pending_approval: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: AlertCircle },
    failed: { label: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertCircle },
    draft: { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: Edit3 },
};

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

function PostPill({ post, onClick }: { post: Post; onClick?: () => void }) {
    const Icon = platformIcons[post.platform] ?? CalendarDays;
    const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-1 rounded px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: `${platformColors[post.platform] ?? "#888"}20` }}
        >
            <Icon className="w-2.5 h-2.5 shrink-0" style={{ color: platformColors[post.platform] ?? "#888" }} />
            <span className="truncate text-[10px] text-muted-foreground">{time}</span>
        </div>
    );
}

function PostCard({ post, router }: { post: Post; router: ReturnType<typeof useRouter> }) {
    const Icon = platformIcons[post.platform] ?? CalendarDays;
    const cfg = statusConfig[post.status] ?? statusConfig.draft;
    const StatusIcon = cfg.icon;
    const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 group">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${platformColors[post.platform] ?? "#888"}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: platformColors[post.platform] ?? "#888" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                <Badge className={`text-[10px] border ${cfg.color}`}>
                    <StatusIcon className="w-2.5 h-2.5 mr-1" />
                    {cfg.label}
                </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => router.push(`/posts`)} className="p-1 rounded hover:bg-white/10 transition-colors" title="View post">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                </button>
                <button onClick={() => router.push(`/compose?edit=${post.id}`)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Edit post">
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
}

// ─── Month View ────────────────────────────────────────────────────────────────
function MonthView({ posts, currentMonth, currentYear, now }: { posts: Post[]; currentMonth: number; currentYear: number; now: Date }) {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState<number | null>(
        now.getMonth() === currentMonth && now.getFullYear() === currentYear ? now.getDate() : null
    );

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const postsForDay = (day: number) =>
        posts.filter((p) => {
            const d = new Date(p.scheduled_at);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
        });

    const selectedDayPosts = selectedDay ? postsForDay(selectedDay) : [];
    const isToday = (day: number) => now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;

    const monthPosts = posts.filter((p) => {
        const d = new Date(p.scheduled_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthStats = [
        { label: "Total Posts", value: monthPosts.length, color: "text-violet-400" },
        { label: "Published", value: monthPosts.filter((p) => p.status === "published").length, color: "text-green-400" },
        { label: "Scheduled", value: monthPosts.filter((p) => p.status === "scheduled").length, color: "text-blue-400" },
        { label: "Pending", value: monthPosts.filter((p) => p.status === "pending_approval").length, color: "text-yellow-400" },
    ];

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <motion.div {...fu(0.1)} className="lg:col-span-2">
                <Card className="glass border-white/10">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS.map((d) => (
                                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-20" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayPosts = postsForDay(day);
                                const today = isToday(day);
                                const isSelected = day === selectedDay;
                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`h-20 rounded-lg p-1.5 cursor-pointer transition-all border ${isSelected
                                            ? "border-violet-500/50 bg-violet-500/10"
                                            : today
                                                ? "border-white/20 bg-white/5"
                                                : "border-transparent hover:border-white/10 hover:bg-white/5"
                                            }`}
                                    >
                                        <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${today ? "bg-violet-500 text-white" : "text-muted-foreground"}`}>
                                            {day}
                                        </div>
                                        <div className="space-y-0.5">
                                            {dayPosts.slice(0, 2).map((post) => (
                                                <PostPill key={post.id} post={post} />
                                            ))}
                                            {dayPosts.length > 2 && (
                                                <div className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 2} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div {...fu(0.2)} className="space-y-4">
                <Card className="glass border-white/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            {selectedDay ? `${MONTHS[currentMonth]} ${selectedDay}` : "Select a day"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {selectedDayPosts.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                <p className="text-sm text-muted-foreground">No posts scheduled</p>
                                <Button size="sm" onClick={() => router.push("/compose")} className="mt-3 bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30">
                                    <Plus className="w-3.5 h-3.5 mr-1" />Add Post
                                </Button>
                            </div>
                        ) : (
                            selectedDayPosts.map((post) => <PostCard key={post.id} post={post} router={router} />)
                        )}
                    </CardContent>
                </Card>
                <Card className="glass border-white/10">
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">{MONTHS[currentMonth]} Overview</p>
                        {monthStats.map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{s.label}</span>
                                <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// ─── Week View ─────────────────────────────────────────────────────────────────
function WeekView({ posts, currentWeekStart }: { posts: Post[]; currentWeekStart: Date }) {
    const router = useRouter();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const postsForDay = (date: Date) =>
        posts.filter((p) => {
            const d = new Date(p.scheduled_at);
            return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
        }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const now = new Date();
    const isToday = (date: Date) => date.toDateString() === now.toDateString();

    return (
        <motion.div {...fu(0.1)}>
            <Card className="glass border-white/10">
                <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, i) => {
                            const dayPosts = postsForDay(day);
                            const today = isToday(day);
                            return (
                                <div key={i} className={`min-h-[200px] rounded-xl p-2 border transition-all ${today ? "border-violet-500/40 bg-violet-500/5" : "border-white/5 bg-white/2"}`}>
                                    <div className="text-center mb-3">
                                        <div className="text-xs text-muted-foreground">{DAYS[day.getDay()]}</div>
                                        <div className={`text-sm font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${today ? "bg-violet-500 text-white" : "text-foreground"}`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        {dayPosts.map((post) => {
                                            const Icon = platformIcons[post.platform] ?? CalendarDays;
                                            const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                                            const cfg = statusConfig[post.status] ?? statusConfig.draft;
                                            return (
                                                <div
                                                    key={post.id}
                                                    onClick={() => router.push(`/compose?edit=${post.id}`)}
                                                    className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/10"
                                                    style={{ backgroundColor: `${platformColors[post.platform] ?? "#888"}15` }}
                                                >
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <Icon className="w-2.5 h-2.5" style={{ color: platformColors[post.platform] ?? "#888" }} />
                                                        <span className="text-[10px] text-muted-foreground">{time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-foreground/80 line-clamp-2 leading-tight">{post.content}</p>
                                                    <div className={`mt-1 text-[9px] px-1 py-0.5 rounded-full inline-block ${cfg.color}`}>{cfg.label}</div>
                                                </div>
                                            );
                                        })}
                                        {dayPosts.length === 0 && (
                                            <button
                                                onClick={() => router.push("/compose")}
                                                className="w-full text-center py-3 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors border border-dashed border-white/5 rounded-lg hover:border-white/15"
                                            >
                                                + Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ─── List View ─────────────────────────────────────────────────────────────────
function ListView({ posts }: { posts: Post[] }) {
    const router = useRouter();
    const sorted = [...posts].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    // Group by date
    const groups: Record<string, Post[]> = {};
    for (const post of sorted) {
        const d = new Date(post.scheduled_at);
        const key = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        if (!groups[key]) groups[key] = [];
        groups[key].push(post);
    }

    if (sorted.length === 0) {
        return (
            <motion.div {...fu(0.1)} className="text-center py-16">
                <List className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No posts scheduled</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first post to see it here</p>
                <Button onClick={() => router.push("/compose")} className="bg-gradient-to-r from-violet-600 to-purple-600 gap-2">
                    <Plus className="w-4 h-4" />New Post
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div {...fu(0.1)} className="space-y-6">
            {Object.entries(groups).map(([dateLabel, dayPosts]) => (
                <div key={dateLabel}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs font-medium text-muted-foreground px-2">{dateLabel}</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="space-y-2">
                        {dayPosts.map((post) => {
                            const Icon = platformIcons[post.platform] ?? CalendarDays;
                            const cfg = statusConfig[post.status] ?? statusConfig.draft;
                            const StatusIcon = cfg.icon;
                            const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                            return (
                                <Card key={post.id} className="glass border-white/10 hover:border-white/20 transition-all cursor-pointer group" onClick={() => router.push(`/compose?edit=${post.id}`)}>
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${platformColors[post.platform] ?? "#888"}20` }}>
                                            <Icon className="w-4 h-4" style={{ color: platformColors[post.platform] ?? "#888" }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-muted-foreground">{time}</span>
                                                <Badge className={`text-[10px] border ${cfg.color}`}>
                                                    <StatusIcon className="w-2.5 h-2.5 mr-1" />{cfg.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground capitalize">{post.platform}</span>
                                            </div>
                                            <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); router.push(`/posts`); }} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); router.push(`/compose?edit=${post.id}`); }} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function CalendarClient({ initialPosts }: { initialPosts: Post[] }) {
    const router = useRouter();
    const now = new Date();
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    // Week navigation: start of current week
    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
    };
    const [weekStart, setWeekStart] = useState(() => getWeekStart(now));

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
        else setCurrentMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
        else setCurrentMonth((m) => m + 1);
    };
    const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
    const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const navLabel = viewMode === "month"
        ? `${MONTHS[currentMonth]} ${currentYear}`
        : viewMode === "week"
            ? `${SHORT_MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${SHORT_MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
            : "All Posts";

    const viewButtons: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
        { mode: "month", icon: LayoutGrid, label: "Month" },
        { mode: "week", icon: Calendar, label: "Week" },
        { mode: "list", icon: List, label: "List" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div {...fu(0)} className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Content Calendar</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Plan and schedule your content</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                        {viewButtons.map(({ mode, icon: Icon, label }) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === mode
                                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={() => router.push("/compose")}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-lg shadow-violet-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        New Post
                    </Button>
                </div>
            </motion.div>

            {/* Navigation bar (month/week only) */}
            {viewMode !== "list" && (
                <motion.div {...fu(0.05)} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={viewMode === "month" ? prevMonth : prevWeek}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium min-w-[180px] text-center">{navLabel}</span>
                        <button
                            onClick={viewMode === "month" ? nextMonth : nextWeek}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentMonth(now.getMonth());
                            setCurrentYear(now.getFullYear());
                            setWeekStart(getWeekStart(now));
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground"
                    >
                        Today
                    </button>
                </motion.div>
            )}

            {/* View content */}
            <AnimatePresence mode="wait">
                {viewMode === "month" && (
                    <MonthView
                        key="month"
                        posts={initialPosts}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        now={now}
                    />
                )}
                {viewMode === "week" && (
                    <WeekView
                        key="week"
                        posts={initialPosts}
                        currentWeekStart={weekStart}
                    />
                )}
                {viewMode === "list" && (
                    <ListView
                        key="list"
                        posts={initialPosts}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
