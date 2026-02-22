"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, Zap, Rocket, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fv = (delay = 0) => ({
    initial: { opacity: 0, x: -20 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

const updates = [
    {
        version: "v1.2.0",
        date: "Feb 23, 2026",
        title: "The Support Expansion",
        icon: Rocket,
        color: "text-violet-400",
        changes: [
            "Launched 6 new marketing pages (About, Blog, Contact, etc.)",
            "Improved site-wide responsive layout for ultra-mobile devices",
            "Updated SEO metadata and OpenGraph images",
            "Fixed various minor hydration errors across the dashboard"
        ]
    },
    {
        version: "v1.1.0",
        date: "Feb 18, 2026",
        title: "AI Power-Up & Dashboard Polish",
        icon: Sparkles,
        color: "text-amber-400",
        changes: [
            "Introduced 3-variant AI post generation in Compose",
            "Full Dashboard rewrite with real Supabase data integration",
            "New Analytics charts for per-platform engagement metrics",
            "Integrated real-time notifications for team approvals"
        ]
    },
    {
        version: "v1.0.0",
        date: "Jan 15, 2026",
        title: "Official Public Launch",
        icon: Zap,
        color: "text-emerald-400",
        changes: [
            "Initial release with LinkedIn, Facebook, and Twitter support",
            "Stripe-powered billing with 14-day free trial",
            "Multi-member workspace support",
            "Unified Media Library for team asset sharing"
        ]
    }
];

export default function ChangelogPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">Change<span className="gradient-text">log</span></h1>
                    <p className="text-muted-foreground text-xl">The latest updates, improvements, and fixes.</p>
                </motion.div>

                <div className="space-y-12 relative before:absolute before:left-0 md:before:left-[17px] before:top-4 before:bottom-4 before:w-px before:bg-white/10">
                    {updates.map((update, i) => (
                        <div key={update.version} className="relative pl-10 md:pl-16">
                            <div className={`absolute left-0 md:left-0 top-1 w-9 h-9 rounded-full bg-background border border-white/10 flex items-center justify-center z-10 ${update.color}`}>
                                <update.icon className="w-4 h-4" />
                            </div>

                            <motion.div {...fv(i * 0.1)} className="glass border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <Badge variant="outline" className="mb-2 border-white/20 text-white/50">{update.version}</Badge>
                                        <h2 className="text-2xl font-black">{update.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/30 font-medium">
                                        <Calendar className="w-4 h-4" /> {update.date}
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {update.changes.map((change, j) => (
                                        <li key={j} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
