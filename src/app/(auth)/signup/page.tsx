"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { signUp } from "@/app/actions/auth";

const perks = [
    "14-day free trial, no credit card",
    "AI caption generator included",
    "Cancel anytime, no lock-in",
];

function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const info = searchParams.get("info");

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">PostFlow</span>
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">Start your free trial</h1>
                    <p className="text-muted-foreground text-sm">No credit card required · 14 days free</p>
                </div>

                {/* Perks */}
                <div className="flex flex-col gap-2 mb-6">
                    {perks.map((perk) => (
                        <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                            {perk}
                        </div>
                    ))}
                </div>

                {/* Info message (e.g. check your email) */}
                {info && (
                    <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {decodeURIComponent(info)}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {decodeURIComponent(error)}
                    </div>
                )}

                <Card className="glass border-white/10 shadow-2xl">
                    <CardContent className="p-8">
                        <form action={async (formData) => {
                            setLoading(true);
                            await signUp(formData);
                            setLoading(false);
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Smith"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Work email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-violet-500"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 h-11 mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
                            </p>
                        </form>

                        <Separator className="bg-white/10 my-6" />
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <SignupForm />
        </Suspense>
    );
}
