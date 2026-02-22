"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, UserPlus, Mail, Shield, Crown, Eye, Trash2,
    ChevronDown, Check, X, Copy, Send, Clock, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
    id: string;
    user_id: string;
    role: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

interface Invite {
    id: string;
    email: string;
    role: string;
    created_at: string;
    expires_at: string;
}

const roleConfig = {
    owner: { label: "Owner", icon: Crown, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    admin: { label: "Admin", icon: Shield, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    member: { label: "Member", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    viewer: { label: "Viewer", icon: Eye, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = roleConfig[role as keyof typeof roleConfig] ?? roleConfig.member;
    const Icon = cfg.icon;
    return (
        <Badge className={`${cfg.bg} ${cfg.color} border text-xs gap-1`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </Badge>
    );
}

function RoleDropdown({ current, memberId, onUpdate }: { current: string; memberId: string; onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const roles = ["admin", "member", "viewer"] as const;

    const changeRole = async (role: string) => {
        if (role === current) { setOpen(false); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/team/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: memberId, role }),
            });
            if (!res.ok) throw new Error("Failed to update role");
            toast.success("Role updated");
            onUpdate();
        } catch {
            toast.error("Failed to update role");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    if (current === "owner") return <RoleBadge role={current} />;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
                <RoleBadge role={current} />
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 right-0 z-50 glass border border-white/15 rounded-xl overflow-hidden shadow-xl min-w-[140px]"
                    >
                        {roles.map((r) => (
                            <button
                                key={r}
                                onClick={() => changeRole(r)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                            >
                                {current === r && <Check className="w-3 h-3 text-green-400" />}
                                {current !== r && <span className="w-3" />}
                                <RoleBadge role={r} />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MemberAvatar({ member }: { member: Member }) {
    const initials = member.full_name
        ? member.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : member.email.slice(0, 2).toUpperCase();

    if (member.avatar_url) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatar_url} alt={member.full_name ?? member.email} className="w-10 h-10 rounded-full object-cover" />
        );
    }

    const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-green-500 to-emerald-600", "from-orange-500 to-amber-600", "from-pink-500 to-rose-600"];
    const colorIndex = member.email.charCodeAt(0) % colors.length;

    return (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-bold`}>
            {initials}
        </div>
    );
}

export default function TeamPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [membersRes, invitesRes] = await Promise.all([
                fetch("/api/team/members"),
                fetch("/api/team/invite"),
            ]);
            const membersData = await membersRes.json();
            const invitesData = await invitesRes.json();
            setMembers(membersData.members ?? []);
            setInvites(invitesData.invites ?? []);
        } catch {
            toast.error("Failed to load team data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const sendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviting(true);
        setInviteLink("");
        try {
            const res = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send invite");
            toast.success(`Invite sent to ${inviteEmail}`);
            setInviteLink(data.inviteUrl);
            setInviteEmail("");
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send invite");
        } finally {
            setInviting(false);
        }
    };

    const revokeInvite = async (inviteId: string) => {
        try {
            await fetch("/api/team/invite", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invite_id: inviteId }),
            });
            toast.success("Invite revoked");
            fetchData();
        } catch {
            toast.error("Failed to revoke invite");
        }
    };

    const removeMember = async (memberId: string, name: string) => {
        if (!confirm(`Remove ${name} from the workspace?`)) return;
        try {
            const res = await fetch("/api/team/members", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: memberId }),
            });
            if (!res.ok) throw new Error("Failed to remove member");
            toast.success("Member removed");
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to remove member");
        }
    };

    const copyInviteLink = (link: string) => {
        navigator.clipboard.writeText(link);
        toast.success("Invite link copied!");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-1">Team</h1>
                <p className="text-muted-foreground">Manage your workspace members and invitations</p>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                {[
                    { label: "Total Members", value: members.length, icon: Users, color: "text-violet-400" },
                    { label: "Pending Invites", value: invites.length, icon: Clock, color: "text-amber-400" },
                    { label: "Admins", value: members.filter((m) => m.role === "admin" || m.role === "owner").length, icon: Shield, color: "text-blue-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="glass border-white/10">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Invite Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="w-5 h-5 text-violet-400" />
                            Invite Team Member
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    required
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as "admin" | "member" | "viewer")}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500/50 min-w-[110px]"
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <Button
                                type="submit"
                                disabled={inviting}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {inviting ? "Sending..." : "Send Invite"}
                            </Button>
                        </form>

                        {/* Role descriptions */}
                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span><strong className="text-violet-400">Admin</strong> — Full access, can manage team</span>
                            <span><strong className="text-blue-400">Member</strong> — Can create & publish posts</span>
                            <span><strong className="text-gray-400">Viewer</strong> — Read-only access</span>
                        </div>

                        {/* Invite link */}
                        <AnimatePresence>
                            {inviteLink && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                                >
                                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                                    <span className="text-xs text-green-400 flex-1 truncate">{inviteLink}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyInviteLink(inviteLink)}
                                        className="h-7 px-2 text-green-400 hover:text-green-300"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Members List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                            Members ({members.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {members.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No members yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {members.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors"
                                    >
                                        <MemberAvatar member={member} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {member.full_name || member.email}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {member.email}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RoleDropdown
                                                current={member.role}
                                                memberId={member.id}
                                                onUpdate={fetchData}
                                            />
                                            {member.role !== "owner" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeMember(member.id, member.full_name || member.email)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-amber-400" />
                                Pending Invites ({invites.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {invites.map((invite, i) => {
                                    const expiresIn = Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    const isExpiringSoon = expiresIn <= 1;
                                    return (
                                        <motion.div
                                            key={invite.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{invite.email}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>Invited as <strong>{invite.role}</strong></span>
                                                    <span>·</span>
                                                    <span className={isExpiringSoon ? "text-red-400" : ""}>
                                                        {isExpiringSoon && <AlertCircle className="w-3 h-3 inline mr-0.5" />}
                                                        Expires in {expiresIn}d
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RoleBadge role={invite.role} />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => revokeInvite(invite.id)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
