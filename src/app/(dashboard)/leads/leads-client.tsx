"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Search, Download, Filter, Mail, Linkedin, Facebook,
    Twitter, Instagram, Star, TrendingUp, Users, FileText,
    Eye, Send, Trash2, RefreshCw,
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface Lead {
    id: string;
    name: string;
    email: string;
    platform: string;
    post_content?: string;
    keyword?: string;
    score?: number;
    status: LeadStatus;
    created_at: string;
    file_sent?: string;
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
    new: { label: "New", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    contacted: { label: "Contacted", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    qualified: { label: "Qualified", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    converted: { label: "Converted", color: "text-green-400 bg-green-500/10 border-green-500/20" },
    lost: { label: "Lost", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const platformIcons: Record<string, React.ElementType> = {
    linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram,
};
const platformColors: Record<string, string> = {
    linkedin: "#0A66C2", facebook: "#1877F2", twitter: "#000000", instagram: "#E4405F",
};

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-xs font-bold ${color}`}>{score}</span>
        </div>
    );
}

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
    const [isPending, startTransition] = useTransition();

    const filtered = leads.filter((l) => {
        const matchSearch =
            l.name?.toLowerCase().includes(search.toLowerCase()) ||
            l.email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = [
        { label: "Total Leads", value: leads.length, icon: Users, color: "from-violet-500 to-purple-600" },
        { label: "Converted", value: leads.filter((l) => l.status === "converted").length, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
        {
            label: "Avg Score",
            value: leads.length > 0 ? Math.round(leads.reduce((a, l) => a + (l.score ?? 0), 0) / leads.length) : 0,
            icon: Star,
            color: "from-yellow-500 to-orange-600",
        },
        { label: "Files Sent", value: leads.filter((l) => l.file_sent).length, icon: FileText, color: "from-blue-500 to-cyan-600" },
    ];

    const updateStatus = async (id: string, status: LeadStatus) => {
        startTransition(async () => {
            await fetch(`/api/leads/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
        });
    };

    const deleteLead = async (id: string) => {
        startTransition(async () => {
            await fetch(`/api/leads/${id}`, { method: "DELETE" });
            setLeads((prev) => prev.filter((l) => l.id !== id));
        });
    };

    const exportCSV = () => {
        const headers = ["Name", "Email", "Platform", "Keyword", "Score", "Status", "File Sent", "Date"];
        const rows = leads.map((l) => [
            l.name, l.email, l.platform, l.keyword ?? "", l.score ?? "", l.status, l.file_sent ?? "", formatDate(l.created_at),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div {...fu(0)} className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your comment-generated leads</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" className="border-white/20 gap-2" onClick={exportCSV} disabled={leads.length === 0}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-lg shadow-violet-500/30">
                        <Send className="w-4 h-4" />
                        Email Campaign
                    </Button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={s.label} {...fu(i * 0.08)}>
                        <Card className="glass border-white/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg shrink-0`}>
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div {...fu(0.2)} className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 focus:border-violet-500/50"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["all", "new", "contacted", "qualified", "converted", "lost"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${statusFilter === s
                                ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                                : "border-white/10 text-muted-foreground hover:border-white/20"
                                }`}
                        >
                            {s === "all" ? "All" : statusConfig[s].label}
                        </button>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="border-white/20 gap-2 ml-auto">
                    <Filter className="w-3.5 h-3.5" />
                    More Filters
                </Button>
            </motion.div>

            {/* Table */}
            <motion.div {...fu(0.3)}>
                <Card className="glass border-white/10">
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <div className="py-16">
                                <EmptyState
                                    icon={Users}
                                    title={search || statusFilter !== "all" ? "No leads match your filters" : "No leads yet"}
                                    description={search || statusFilter !== "all"
                                        ? "Try adjusting your search or filter."
                                        : "Leads are captured automatically when someone comments on your posts with trigger keywords."}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                {["Lead", "Platform", "Trigger", "Score", "File Sent", "Status", "Date", ""].map((h) => (
                                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-6 last:pr-6">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((lead, i) => {
                                                const Icon = platformIcons[lead.platform] ?? Mail;
                                                const status = statusConfig[lead.status] ?? statusConfig.new;
                                                return (
                                                    <motion.tr
                                                        key={lead.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                                    >
                                                        <td className="px-4 py-3 pl-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                    {(lead.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">{lead.name}</p>
                                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Mail className="w-3 h-3" />
                                                                        {lead.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon className="w-4 h-4" style={{ color: platformColors[lead.platform] ?? "#888" }} />
                                                                <span className="text-xs text-muted-foreground capitalize">{lead.platform}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                {lead.keyword && (
                                                                    <Badge className="text-xs bg-white/5 border-white/10 text-muted-foreground mb-1">{lead.keyword}</Badge>
                                                                )}
                                                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{lead.post_content ?? "—"}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {lead.score != null ? <ScoreBadge score={lead.score} /> : <span className="text-xs text-muted-foreground">—</span>}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {lead.file_sent ? (
                                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                                                    {lead.file_sent}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {/* Clickable status badge cycles through statuses */}
                                                            <select
                                                                value={lead.status}
                                                                onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                                                                className={`text-xs border rounded-full px-2 py-0.5 bg-transparent cursor-pointer focus:outline-none ${status.color}`}
                                                                disabled={isPending}
                                                            >
                                                                {(["new", "contacted", "qualified", "converted", "lost"] as LeadStatus[]).map((s) => (
                                                                    <option key={s} value={s} className="bg-background text-foreground">
                                                                        {statusConfig[s].label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</span>
                                                        </td>
                                                        <td className="px-4 py-3 pr-6">
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                                    title="Send email"
                                                                >
                                                                    <Send className="w-3.5 h-3.5 text-muted-foreground" />
                                                                </button>
                                                                <button
                                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                                    title="Delete lead"
                                                                    onClick={() => deleteLead(lead.id)}
                                                                    disabled={isPending}
                                                                >
                                                                    {isPending
                                                                        ? <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                                                                        : <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                                    }
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
                                    <p className="text-xs text-muted-foreground">Showing {filtered.length} of {leads.length} leads</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
