"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LeadCaptureForm() {
    const searchParams = useSearchParams();
    const postId = searchParams.get("post_id");
    const platform = searchParams.get("platform");
    const workspaceId = searchParams.get("workspace_id");

    const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
    const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.email) return;
        setState("submitting");

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workspace_id: workspaceId,
                    email: form.email,
                    name: form.name,
                    phone: form.phone,
                    company: form.company,
                    source_post_id: postId,
                    platform,
                    utm_source: platform,
                    utm_medium: "comment",
                    utm_campaign: "comment_trigger",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Submission failed");
                setState("error");
                return;
            }

            setState("success");
        } catch {
            setError("Network error. Please try again.");
            setState("error");
        }
    }

    if (state === "success") {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-white/50 text-sm">Check your email — we&apos;ve sent you the file you requested.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h1 className="text-xl font-bold text-white mb-1">Get Your Free Resource</h1>
                <p className="text-sm text-white/50">Fill in your details and we&apos;ll send it to your inbox instantly.</p>
            </div>

            <div className="space-y-3">
                <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                    type="email"
                    placeholder="Email address *"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                    placeholder="Company (optional)"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
            </div>

            {state === "error" && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
                type="submit"
                disabled={state === "submitting"}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
            >
                {state === "submitting" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                    "Send Me the File →"
                )}
            </Button>

            <p className="text-xs text-white/30 text-center">
                No spam. Unsubscribe anytime.
            </p>
        </form>
    );
}

export default function CapturePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">PostFlow</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <Suspense fallback={<div className="text-white/50 text-center py-8">Loading...</div>}>
                        <LeadCaptureForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
