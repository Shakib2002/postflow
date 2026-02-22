"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, ArrowRight, Shield } from "lucide-react";

interface Props {
    token: string;
    email: string;
    role: string;
    workspaceName: string;
}

const roleColors: Record<string, string> = {
    admin: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    member: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function InviteAcceptClient({ token, email, role, workspaceName }: Props) {
    const [mode, setMode] = useState<"choose" | "signup" | "login">("choose");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/invite-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed");
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/invite-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">PostFlow</span>
                </div>

                <div className="glass rounded-2xl border border-white/15 p-8">
                    {/* Invite header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-7 h-7 text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">You&apos;re invited!</h1>
                        <p className="text-muted-foreground text-sm">
                            Join <span className="text-foreground font-semibold">{workspaceName}</span> on PostFlow
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <Badge className={roleColors[role] || roleColors.member}>
                                <Shield className="w-3 h-3 mr-1" />
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">role</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Invited as: {email}</p>
                    </div>

                    {mode === "choose" && (
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30"
                                onClick={() => setMode("signup")}
                            >
                                Create new account
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-white/20"
                                onClick={() => setMode("login")}
                            >
                                Sign in with existing account
                            </Button>
                        </div>
                    )}

                    {mode === "signup" && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                <Input value={email} disabled className="bg-white/5 border-white/10 opacity-60" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    required
                                    minLength={8}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                            >
                                {loading ? "Creating account..." : "Accept & Join"}
                            </Button>
                            <button type="button" onClick={() => setMode("choose")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                                ← Back
                            </button>
                        </form>
                    )}

                    {mode === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                <Input value={email} disabled className="bg-white/5 border-white/10 opacity-60" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    required
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                            >
                                {loading ? "Signing in..." : "Sign In & Join"}
                            </Button>
                            <button type="button" onClick={() => setMode("choose")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                                ← Back
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    By accepting, you agree to PostFlow&apos;s{" "}
                    <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}
