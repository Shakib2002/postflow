"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import {
    Linkedin, Facebook, Twitter, Instagram, Plus, CheckCircle2,
    AlertCircle, RefreshCw, Trash2, User, Bell, Shield,
    CreditCard, Globe, ExternalLink, Building2, Save, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

const oauthRoutes: Record<string, string> = {
    linkedin: "/api/auth/linkedin",
    facebook: "/api/auth/facebook",
    twitter: "/api/auth/twitter",
    instagram: "/api/auth/facebook",
};

const platformConfig: Record<string, { name: string; icon: React.ElementType; color: string; bg: string }> = {
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "#0A66C2", bg: "from-blue-600 to-blue-700" },
    facebook: { name: "Facebook Page", icon: Facebook, color: "#1877F2", bg: "from-blue-500 to-blue-600" },
    twitter: { name: "Twitter / X", icon: Twitter, color: "#000000", bg: "from-gray-800 to-gray-900" },
    instagram: { name: "Instagram", icon: Instagram, color: "#E4405F", bg: "from-pink-500 to-rose-600" },
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`w-10 h-5 rounded-full relative transition-all ${enabled ? "bg-violet-500" : "bg-white/20"}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow ${enabled ? "right-0.5" : "left-0.5"}`} />
        </button>
    );
}

interface SettingsClientProps {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        company: string;
        avatarUrl: string;
    };
    workspace: {
        id: string;
        name: string;
        timezone: string;
    };
}

export function SettingsClient({ user, workspace }: SettingsClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isPending, startTransition] = useTransition();

    // Accounts state
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    // Profile state
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [company, setCompany] = useState(user.company);
    const [profileSaved, setProfileSaved] = useState(false);

    // Workspace state
    const [workspaceName, setWorkspaceName] = useState(workspace.name);
    const [timezone, setTimezone] = useState(workspace.timezone);
    const [workspaceSaved, setWorkspaceSaved] = useState(false);

    // Notification state
    const [notifications, setNotifications] = useState({
        postPublished: true,
        postFailed: true,
        newLead: true,
        approvalRequired: true,
        commentAlert: true,
        weeklyReport: false,
    });
    const [notifSaved, setNotifSaved] = useState(false);
    const [notifSaving, setNotifSaving] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoadingAccounts(true);
        try {
            const res = await fetch("/api/social/platforms");
            const data = await res.json();
            if (data.platforms) {
                setAccounts(data.platforms);
            }
        } catch (err) {
            console.error("Failed to fetch accounts");
        } finally {
            setLoadingAccounts(false);
        }
    };

    const handleConnect = async (pId: string) => {
        setIsConnecting(pId);
        try {
            const res = await fetch("/api/social/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platforms: [pId] }),
            });
            if (res.ok) {
                toast.success(`${pId} connected!`);
                fetchAccounts();
            } else {
                toast.error("Failed to connect");
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setIsConnecting(null);
        }
    };

    const toggleNotif = (key: keyof typeof notifications) =>
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

    // Save profile to Supabase auth metadata
    const saveProfile = () => {
        startTransition(async () => {
            await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    company,
                },
            });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
            router.refresh();
        });
    };

    // Save workspace name to Supabase
    const saveWorkspace = () => {
        startTransition(async () => {
            if (workspace.id) {
                await supabase
                    .from("workspaces")
                    .update({ name: workspaceName, timezone })
                    .eq("id", workspace.id);
            }
            setWorkspaceSaved(true);
            setTimeout(() => setWorkspaceSaved(false), 3000);
            router.refresh();
        });
    };

    // Save notification preferences to Supabase user metadata
    const saveNotifications = async () => {
        setNotifSaving(true);
        await supabase.auth.updateUser({
            data: { notification_preferences: notifications },
        });
        setNotifSaving(false);
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 3000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div {...fu(0)}>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
            </motion.div>

            <motion.div {...fu(0.1)}>
                <Tabs defaultValue="accounts">
                    <TabsList className="bg-white/5 border border-white/10 mb-6 flex-wrap h-auto gap-1 p-1 w-full overflow-x-auto">
                        <TabsTrigger value="accounts" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                            <Globe className="w-4 h-4" /> Social Accounts
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                            <User className="w-4 h-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                            <Bell className="w-4 h-4" /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                            <CreditCard className="w-4 h-4" /> Billing
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                            <Shield className="w-4 h-4" /> Security
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Social Accounts ── */}
                    <TabsContent value="accounts" className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Connect your social media accounts to start publishing</p>
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2">
                                <Plus className="w-3.5 h-3.5" /> Add Account
                            </Button>
                        </div>

                        {loadingAccounts ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            Object.entries(platformConfig).map(([id, cfg], i) => {
                                const account = accounts.find(a => a.platform === id);
                                const isConnected = !!account;
                                const connecting = isConnecting === id;
                                const Icon = cfg.icon;
                                return (
                                    <motion.div key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                                        <Card className="glass border-white/10">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center shadow-lg shrink-0`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-sm">{cfg.name}</p>
                                                            {isConnected ? (
                                                                <Badge className="text-[10px] text-green-400 bg-green-500/10 border-green-500/20">
                                                                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Connected
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="text-[10px] text-muted-foreground bg-white/5 border-white/10">
                                                                    Not connected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{isConnected ? (account.handle || cfg.name) : "Not connected"}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {isConnected ? (
                                                            <>
                                                                <Button size="sm" variant="outline" className="border-white/20 gap-1.5 h-8 text-xs">
                                                                    <RefreshCw className="w-3 h-3" /> Refresh
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5 h-8 text-xs">
                                                                    <Trash2 className="w-3 h-3" /> Disconnect
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                disabled={connecting}
                                                                className={`bg-gradient-to-r ${cfg.bg} text-white gap-1.5 h-8 text-xs shadow-md`}
                                                                onClick={() => handleConnect(id)}
                                                            >
                                                                {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                                                                Connect
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}

                        <Card className="glass border-white/10 border-dashed">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">TikTok, YouTube, Pinterest, and Threads coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Profile ── */}
                    <TabsContent value="profile" className="space-y-4">
                        <Card className="glass border-white/10">
                            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                        {(firstName[0] || user.email[0] || "U").toUpperCase()}
                                    </div>
                                    <div>
                                        <Button size="sm" variant="outline" className="border-white/20">Change Photo</Button>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">First Name</label>
                                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-white/5 border-white/10 focus:border-violet-500/50" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-white/5 border-white/10 focus:border-violet-500/50" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                                    <Input value={user.email} disabled className="bg-white/5 border-white/10 opacity-60 cursor-not-allowed" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Company</label>
                                    <Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-white/5 border-white/10 focus:border-violet-500/50" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={saveProfile}
                                        disabled={isPending}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </Button>
                                    {profileSaved && (
                                        <span className="text-sm text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Saved!
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/10">
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" />Workspace</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
                                    <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="bg-white/5 border-white/10 focus:border-violet-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-white/5 border-white/10 focus:border-violet-500/50" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={saveWorkspace}
                                        disabled={isPending}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </Button>
                                    {workspaceSaved && (
                                        <span className="text-sm text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Saved!
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Notifications ── */}
                    <TabsContent value="notifications" className="space-y-4">
                        <Card className="glass border-white/10">
                            <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: "postPublished" as const, label: "Post Published", desc: "When a post is successfully published" },
                                    { key: "postFailed" as const, label: "Post Failed", desc: "When a post fails to publish" },
                                    { key: "newLead" as const, label: "New Lead Captured", desc: "When someone submits the lead form" },
                                    { key: "approvalRequired" as const, label: "Approval Required", desc: "When a post needs your approval" },
                                    { key: "commentAlert" as const, label: "Comment Alert", desc: "When a keyword is detected in comments" },
                                    { key: "weeklyReport" as const, label: "Weekly Report", desc: "Summary of your weekly performance" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <Toggle enabled={notifications[item.key]} onToggle={() => toggleNotif(item.key)} />
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        onClick={saveNotifications}
                                        disabled={notifSaving}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
                                    >
                                        {notifSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Preferences
                                    </Button>
                                    {notifSaved && (
                                        <span className="text-sm text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Saved!
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Billing ── */}
                    <TabsContent value="billing" className="space-y-4">
                        <Card className="glass border-white/10 border-violet-500/30 bg-violet-500/5">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 mb-3">Pro Plan</Badge>
                                        <h3 className="text-lg font-semibold">$29 / month</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Unlimited posts · 5 social accounts · AI writing</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-white/20 gap-2"
                                        onClick={() => router.push("/billing")}
                                    >
                                        <CreditCard className="w-4 h-4" /> Manage Billing
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/10">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm text-muted-foreground mb-3">View invoices, update payment method, or cancel your subscription</p>
                                <Button
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
                                    onClick={() => router.push("/billing")}
                                >
                                    <ExternalLink className="w-4 h-4" /> Go to Billing Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Security ── */}
                    <TabsContent value="security" className="space-y-4">
                        <Card className="glass border-white/10">
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" />Security</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                    <div>
                                        <p className="text-sm font-medium">Password</p>
                                        <p className="text-xs text-muted-foreground">Last changed: never</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-white/20">Change Password</Button>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                    <div>
                                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-white/20">Enable 2FA</Button>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-red-400">Delete Account</p>
                                        <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}
