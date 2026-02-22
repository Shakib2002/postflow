"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Calendar, Users, BarChart3, Settings,
    Zap, MessageSquare, ChevronLeft, PlusCircle, FileText,
    CheckCircle2, UserCog, CreditCard, X, Image, Shield, Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

type Role = "owner" | "admin" | "member" | "viewer" | null;

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
    exact?: boolean;
    highlight?: boolean;
    badge?: string;
    /** Minimum role required to see this item. null = everyone. */
    minRole?: "member" | "admin" | "owner";
}

const ROLE_WEIGHT: Record<string, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
};

function canAccess(userRole: Role, minRole?: NavItem["minRole"]) {
    if (!minRole) return true;
    if (!userRole) return false;
    return (ROLE_WEIGHT[userRole] ?? 0) >= (ROLE_WEIGHT[minRole] ?? 0);
}

const navItems: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
    { href: "/compose", icon: PlusCircle, label: "New Post", highlight: true, minRole: "member" },
    { href: "/posts", icon: FileText, label: "Posts" },
    { href: "/bulk-schedule", icon: Upload, label: "Bulk Schedule", badge: "New", minRole: "member" },
    { href: "/approvals", icon: CheckCircle2, label: "Approvals" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/media", icon: Image, label: "Media" },
    { href: "/leads", icon: Users, label: "Leads" },
    { href: "/comments", icon: MessageSquare, label: "Comments" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/team", icon: UserCog, label: "Team", minRole: "admin" },
    { href: "/billing", icon: CreditCard, label: "Billing", minRole: "owner" },
    { href: "/settings", icon: Settings, label: "Settings", minRole: "member" },
];

const ROLE_BADGES: Record<string, { label: string; cls: string }> = {
    owner: { label: "Owner", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    admin: { label: "Admin", cls: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
    member: { label: "Member", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    viewer: { label: "Viewer", cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

interface DashboardSidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState<Role>(null);
    const [userInitials, setUserInitials] = useState("PF");
    const [userName, setUserName] = useState("My Workspace");

    // Close mobile drawer on route change
    useEffect(() => {
        onMobileClose?.();
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch user's role
    useEffect(() => {
        fetch("/api/team/me")
            .then((r) => r.json())
            .then((d) => {
                setRole(d.role);
                const name: string = d.name || d.email || "";
                if (name) {
                    const parts = name.split(/[\s@]+/);
                    setUserInitials(
                        parts.length >= 2
                            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                            : name.slice(0, 2).toUpperCase()
                    );
                    setUserName(d.name || d.email?.split("@")[0] || "My Workspace");
                }
            })
            .catch(() => { });
    }, []);

    const visibleNav = navItems.filter((item) => canAccess(role, item.minRole));
    const roleInfo = role ? ROLE_BADGES[role] : null;

    const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                {(!collapsed || isMobile) && (
                    <span className="text-lg font-bold gradient-text">PostFlow</span>
                )}
                {isMobile && (
                    <button
                        onClick={onMobileClose}
                        className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Role badge (when expanded) */}
            {roleInfo && (!collapsed || isMobile) && (
                <div className="px-4 pt-3">
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", roleInfo.cls)}>
                        <Shield className="w-3 h-3" />
                        {roleInfo.label}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleNav.map((item) => {
                    const active = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    active
                                        ? "bg-violet-500/15 text-violet-400 shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                    item.highlight && !active && "text-violet-400 hover:text-violet-300"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0", active && "text-violet-400")} />
                                {(!collapsed || isMobile) && (
                                    <div className="flex items-center justify-between flex-1">
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <Badge className="bg-violet-500/20 text-violet-400 border-0 text-xs px-1.5">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom — user */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all", collapsed && !isMobile && "justify-center")}>
                    <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    {(!collapsed || isMobile) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {roleInfo ? roleInfo.label : "Loading..."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative hidden md:flex flex-col h-screen bg-card border-r border-white/10 overflow-hidden shrink-0"
            >
                <NavContent />

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-card border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                >
                    <ChevronLeft className={cn("w-3 h-3 transition-transform", collapsed && "rotate-180")} />
                </button>
            </motion.aside>

            {/* ── Mobile drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onMobileClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed left-0 top-0 h-full w-64 flex flex-col bg-card border-r border-white/10 z-50 md:hidden"
                        >
                            <NavContent isMobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
