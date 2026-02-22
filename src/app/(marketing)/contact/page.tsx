"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setStatus("success");
    };

    return (
        <div className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        <motion.div {...fv()}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                                <MessageSquare className="w-3 h-3" /> Get in touch
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Have a question?<br />
                                <span className="gradient-text">We're here to help.</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md">
                                Whether you're an agency looking for a demo or a creator with a feature request, we'd love to hear from you.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-6">
                            <motion.div {...fv(0.1)} className="flex items-start gap-4 p-4 rounded-2xl glass border-white/5 group hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Email Us</h3>
                                    <p className="text-muted-foreground text-sm mb-1">Our support team usually replies within 4 hours.</p>
                                    <a href="mailto:hello@postflow.io" className="text-violet-400 font-semibold hover:underline">hello@postflow.io</a>
                                </div>
                            </motion.div>

                            <motion.div {...fv(0.2)} className="flex items-start gap-4 p-4 rounded-2xl glass border-white/5 group hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Headquarters</h3>
                                    <p className="text-muted-foreground text-sm">San Francisco, CA</p>
                                    <p className="text-white/40 text-xs mt-1">Remote-first team, global impact.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <motion.div {...fv(0.3)} className="glass border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-violet-500/5 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {status === "success" ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-10"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                                    <p className="text-muted-foreground mb-8">
                                        Thanks for reaching out. We'll get back to you shortly.
                                    </p>
                                    <Button onClick={() => setStatus("idle")} variant="outline" className="rounded-full px-8">
                                        Send Another
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Name</label>
                                        <Input
                                            placeholder="Your name"
                                            required
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-violet-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="you@company.com"
                                            required
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-violet-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Subject</label>
                                        <select className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-violet-500/50 transition-all">
                                            <option className="bg-[#0a0a0c]">General Inquiry</option>
                                            <option className="bg-[#0a0a0c]">Agency Demo</option>
                                            <option className="bg-[#0a0a0c]">Support</option>
                                            <option className="bg-[#0a0a0c]">Partnership</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Message</label>
                                        <Textarea
                                            placeholder="How can we help you?"
                                            required
                                            className="min-h-[140px] bg-white/5 border-white/10 rounded-xl focus:border-violet-500/50 transition-all resize-none"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-violet-500/20"
                                    >
                                        {status === "loading" ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Send Message <Send className="w-5 h-5" />
                                            </span>
                                        )}
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
