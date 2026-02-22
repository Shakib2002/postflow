"use client";

import { motion } from "framer-motion";
import { ListChecks, Clock, Zap, Globe, MessageSquare, BarChart, ShieldCheck } from "lucide-react";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

const quarters = [
    {
        period: "Q1 2026",
        status: "In Progress",
        color: "text-violet-400",
        items: [
            { icon: Globe, label: "6+ New Marketing Pages", desc: "Complete site build with Blog, Contact, Case Studies." },
            { icon: MessageSquare, label: "AI Tone Control", desc: "Choose from 10+ tones for your generated captions." },
            { icon: ListChecks, label: "Bulk CSV V2", desc: "Enhanced validation and auto-tagging on upload." }
        ]
    },
    {
        period: "Q2 2026",
        status: "Next Up",
        color: "text-blue-400",
        items: [
            { icon: Zap, label: "TikTok Integration", desc: "Schedule and publish short-form video content." },
            { icon: BarChart, label: "Custom Reports", desc: "Build and export white-labeled PDF reports for clients." },
            { icon: ShieldCheck, label: "2FA & SSO", desc: "Enterprise-grade security for teams." }
        ]
    },
    {
        period: "Q3 2026 & Beyond",
        status: "Planned",
        color: "text-muted-foreground",
        items: [
            { icon: Zap, label: "YouTube Shorts", desc: "Full video optimization and scheduling suite." },
            { icon: Clock, label: "AI Post Timing", desc: "Predictive analytics for the best time to reach your audience." }
        ]
    }
];

export default function RoadmapPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-28">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">Product <span className="gradient-text">Roadmap</span></h1>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">See where we're going. We build PostFlow in public, shaped by your feedback.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {quarters.map((q, i) => (
                        <motion.div key={q.period} {...fv(i * 0.1)} className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black text-white">{q.period}</h2>
                                <span className={`text-xs font-bold uppercase tracking-widest ${q.color}`}>{q.status}</span>
                            </div>

                            <div className="space-y-4">
                                {q.items.map((item, j) => (
                                    <div key={item.label} className="glass border-white/5 p-6 rounded-3xl group hover:border-violet-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <item.icon className={`w-5 h-5 ${q.color}`} />
                                        </div>
                                        <h3 className="font-bold text-white mb-1">{item.label}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
