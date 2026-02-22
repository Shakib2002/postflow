"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Linkedin, Facebook, Twitter, CheckCircle2,
    ArrowRight, Sparkles, Users, BarChart3, Zap,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const steps = [
    {
        id: 1,
        title: "Welcome to PostFlow! 🎉",
        description: "You're 3 steps away from automating your social media. Let's get you set up.",
        icon: Sparkles,
        color: "from-violet-500 to-purple-600",
    },
    {
        id: 2,
        title: "Connect Your Accounts",
        description: "Link your social media profiles to start publishing directly from PostFlow.",
        icon: Users,
        color: "from-blue-500 to-cyan-600",
    },
    {
        id: 3,
        title: "Create Your First Post",
        description: "Use AI to generate engaging content and schedule it across all platforms.",
        icon: BarChart3,
        color: "from-green-500 to-emerald-600",
    },
];

const platforms = [
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
    { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
    { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#6b7280" },
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [connected, setConnected] = useState<string[]>([]);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [isConnectingAll, setIsConnectingAll] = useState(false);
    const router = useRouter();

    const handleConnect = async (pId: string) => {
        setIsConnecting(pId);
        try {
            const res = await fetch("/api/social/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platforms: [pId] }),
            });
            if (res.ok) {
                setConnected((prev) => prev.includes(pId) ? prev : [...prev, pId]);
                toast.success(`${pId.charAt(0).toUpperCase() + pId.slice(1)} connected!`);
            } else {
                toast.error("Failed to connect account");
            }
        } catch (err) {
            toast.error("Account connection failed");
        } finally {
            setIsConnecting(null);
        }
    };

    const handleConnectAll = async () => {
        setIsConnectingAll(true);
        const pIds = platforms.map(p => p.id);
        try {
            const res = await fetch("/api/social/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platforms: pIds }),
            });
            if (res.ok) {
                setConnected(pIds);
                toast.success("All accounts connected successfully!");
            } else {
                toast.error("Failed to connect all accounts");
            }
        } catch (err) {
            toast.error("Bulk connection failed");
        } finally {
            setIsConnectingAll(false);
        }
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            onComplete();
            router.push("/compose");
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Progress */}
                <div className="flex items-center gap-2 mb-6 justify-center">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.id
                                ? "bg-green-500 text-white"
                                : step === s.id
                                    ? "bg-violet-500 text-white"
                                    : "bg-white/10 text-muted-foreground"
                                }`}>
                                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                            </div>
                            {s.id < steps.length && (
                                <div className={`w-12 h-0.5 transition-all ${step > s.id ? "bg-green-500" : "bg-white/10"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Step icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[step - 1].color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                {(() => { const Icon = steps[step - 1].icon; return <Icon className="w-8 h-8 text-white" />; })()}
                            </div>

                            <h2 className="text-2xl font-bold text-center mb-2">{steps[step - 1].title}</h2>
                            <p className="text-muted-foreground text-center text-sm mb-8">{steps[step - 1].description}</p>

                            {/* Step 1: Welcome */}
                            {step === 1 && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { icon: Zap, label: "AI Content", desc: "Generate posts in seconds" },
                                        { icon: Users, label: "Multi-Platform", desc: "Post everywhere at once" },
                                        { icon: BarChart3, label: "Analytics", desc: "Track your growth" },
                                    ].map((f) => (
                                        <div key={f.label} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                            <f.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                                            <p className="text-xs font-semibold">{f.label}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Connect accounts */}
                            {step === 2 && (
                                <div className="space-y-3 mb-6">
                                    <Button
                                        variant="outline"
                                        className="w-full border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 gap-2 mb-2 font-bold h-12"
                                        onClick={handleConnectAll}
                                        disabled={isConnectingAll || connected.length === platforms.length}
                                    >
                                        {isConnectingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        One-Click Connect All
                                    </Button>

                                    <div className="flex items-center gap-3 my-4">
                                        <div className="h-px bg-white/10 flex-1" />
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">or connect individually</span>
                                        <div className="h-px bg-white/10 flex-1" />
                                    </div>

                                    {platforms.map((p) => {
                                        const isConnected = connected.includes(p.id);
                                        const connecting = isConnecting === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                disabled={isConnected || connecting || isConnectingAll}
                                                onClick={() => handleConnect(p.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isConnected
                                                    ? "border-green-500/30 bg-green-500/10 cursor-default"
                                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                                                        <p.icon className="w-5 h-5" style={{ color: p.color }} />
                                                    </div>
                                                    <span className="font-medium text-sm">{p.label}</span>
                                                </div>
                                                {isConnected ? (
                                                    <div className="flex items-center gap-1.5 text-green-400 text-sm">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Connected
                                                    </div>
                                                ) : connecting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Connect</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 3: Create first post */}
                            {step === 3 && (
                                <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold mb-1">AI-Powered Content Ready</p>
                                            <p className="text-xs text-muted-foreground">
                                                {connected.length > 0
                                                    ? `Great! You've connected ${connected.length} accounts. Now let's use AI to generate your first post and push it to all of them at once.`
                                                    : "Your accounts are ready. Just describe your topic and our AI will generate engaging posts optimized for each platform."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip setup
                        </button>
                        <Button
                            onClick={handleNext}
                            disabled={step === 2 && connected.length === 0}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-lg shadow-violet-500/30"
                        >
                            {step === 3 ? "Launch Dashboard" : "Continue"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
