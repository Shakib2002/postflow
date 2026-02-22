"use client";

import { motion } from "framer-motion";
import { Cookie, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

export default function CookiesPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <Cookie className="w-3 h-3" /> Transparency
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">Cookie <span className="gradient-text">Policy</span></h1>
                    <p className="text-muted-foreground">PostFlow uses cookies to improve your experience and keep our platform secure.</p>
                </motion.div>

                <div className="space-y-8">
                    <motion.section {...fv(0.1)} className="glass border-white/5 p-8 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="w-5 h-5 text-violet-400" />
                            <h2 className="text-xl font-bold">What are cookies?</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and remember your preferences and settings.
                        </p>
                    </motion.section>

                    <motion.section {...fv(0.2)} className="glass border-white/5 p-8 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-5 h-5 text-blue-400" />
                            <h2 className="text-xl font-bold">Types of cookies we use</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Necessary</h3>
                                <p className="text-sm text-muted-foreground">Essential for the platform to function. They handle authentication, security, and billing.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Analytical</h3>
                                <p className="text-sm text-muted-foreground">Help us understand how you use PostFlow through PostHog and Sentry so we can improve features.</p>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section {...fv(0.3)} className="glass border-white/5 p-8 rounded-[2rem]">
                        <h2 className="text-xl font-bold mb-4">Managing your preferences</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Most browsers allow you to control cookies through their settings. Please note that disabling necessary cookies may prevent the dashboard from functioning correctly.
                        </p>
                    </motion.section>

                    <motion.div {...fv(0.4)} className="text-center pt-8">
                        <p className="text-sm text-muted-foreground">Last updated: February 23, 2026.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
