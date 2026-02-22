"use client";

import { Search, Sun, Moon, LogOut, User, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { NotificationBell } from "@/components/dashboard/notification-bell";

interface DashboardTopbarProps {
    onMenuClick?: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-16 border-b border-white/10 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3">
            {/* Mobile hamburger */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search — hidden on mobile */}
            <div className="relative w-72 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search posts, leads..."
                    className="pl-9 bg-white/5 border-white/10 h-9 text-sm focus:border-violet-500"
                />
            </div>

            {/* Spacer on mobile */}
            <div className="flex-1 sm:hidden" />

            {/* Theme toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <NotificationBell />

            {/* User menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-2 rounded-xl hover:bg-white/5 transition-colors">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                                PF
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium leading-none">My Account</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Pro Plan</p>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-white/10">
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                        <Link href="/settings">
                            <User className="w-4 h-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                        <Link href="/settings">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                        <form action={signOut}>
                            <button type="submit" className="flex items-center gap-2 w-full">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
