"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Zap, Calendar, MessageSquare, Users, BarChart3,
    CheckCircle, ArrowRight, Star, Linkedin, Facebook, Twitter,
    Instagram, Shield, TrendingUp, FileText,
    ChevronDown, X, Sparkles, Globe, Layers, Clock,
    MousePointer2, Send, GitBranch, Building2, User, Briefcase,
    Menu, Rocket, Bot, ChevronRight
} from "lucide-react";

/* ─── Data ─── */

const faqs = [
    { q: "How does the 14-day free trial work?", a: "Start immediately — no credit card required. You get full access to all Pro features for 14 days. After the trial, choose a plan or your account downgrades to read-only." },
    { q: "Which social platforms does PostFlow support?", a: "LinkedIn, Twitter/X, Facebook Pages, and Instagram Business. We're adding TikTok and YouTube Shorts in Q2 2026." },
    { q: "Can I invite my team or clients?", a: "Yes. Pro plans include 3 team seats with role-based access (Owner, Admin, Member, Viewer). Agency plans include unlimited seats and 5 separate workspaces." },
    { q: "How does the approval workflow work?", a: "Toggle 'Requires Approval' on any post. Your approver gets a one-click Approve/Reject email — no login required. Approved posts publish automatically at the scheduled time." },
    { q: "Is my data secure?", a: "All data is encrypted at rest and in transit. We use Supabase (PostgreSQL) with row-level security. We never store your social passwords — only OAuth tokens." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel from your billing portal with one click. You keep access until the end of your billing period. No cancellation fees." },
];

const features = [
    { title: "AI-Powered Scheduling", desc: "Schedule weeks of content in minutes with AI caption generation, trend-aware hashtags, and optimal timing suggestions powered by Gemini.", icon: Zap, badge: "Smart", color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
    { title: "Per-Platform Customization", desc: "Tailor your message for each platform's unique audience — one workflow, four perfectly crafted posts.", icon: Layers, badge: "New", color: "from-pink-500 to-rose-600", glow: "shadow-pink-500/20" },
    { title: "Approval Workflows", desc: "Seamless client review. One-click approval via email — no login required. Posts publish only when cleared.", icon: CheckCircle, badge: "Enterprise", color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
    { title: "Lead Generation", desc: "Turn social comments into customers. Auto-reply to trigger keywords and capture leads into your CRM in real-time.", icon: Users, badge: "Growth", color: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/20" },
    { title: "Advanced Analytics", desc: "Unified performance dashboard across all channels. Track engagement, reach, clicks, and lead conversion.", icon: BarChart3, badge: "Insight", color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
    { title: "Unified Media Library", desc: "All your brand assets in one place. Drag-and-drop uploads, instant CDN delivery, direct compose integration.", icon: Globe, badge: "Secure", color: "from-indigo-500 to-blue-600", glow: "shadow-indigo-500/20" },
];

const testimonials = [
    { quote: "Cut our agency's content delivery time by 70%. The approval workflow alone is worth the price.", name: "Sarah K.", role: "Founder, GrowthLab Agency", avatar: "SK", color: "from-violet-600 to-purple-700" },
    { quote: "Finally a tool that actually sounds like us. The AI picks up our brand voice in seconds.", name: "Priya M.", role: "Content Strategist, Bloom Media", avatar: "PM", color: "from-pink-600 to-rose-700" },
    { quote: "Managing 12 client accounts used to take my whole week. Now it takes a morning.", name: "Marcus D.", role: "Social Media Director, TechVentures", avatar: "MD", color: "from-blue-600 to-cyan-700" },
];

const steps = [
    { step: "01", title: "Connect your accounts", desc: "Link LinkedIn, Twitter, Facebook, and Instagram in seconds via secure OAuth. No passwords stored.", icon: GitBranch, color: "text-violet-400", bg: "from-violet-500/20 to-violet-600/5", border: "border-violet-500/30" },
    { step: "02", title: "Create once, customize everywhere", desc: "Write your core message, then tailor the tone, hashtags, and format for each platform automatically.", icon: MousePointer2, color: "text-pink-400", bg: "from-pink-500/20 to-pink-600/5", border: "border-pink-500/30" },
    { step: "03", title: "Schedule, approve & publish", desc: "Pick your time slots, send for approval with one click, and let PostFlow handle the rest — automatically.", icon: Send, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/30" },
];

const pricingPlans = [
    { name: "Starter", monthlyPrice: 12, annualPrice: 9, popular: false, color: "border-white/10", ctaClass: "bg-white/10 hover:bg-white/20 text-white", features: ["3 Social Accounts", "Unlimited Scheduled Posts", "Basic AI Assistance", "Media Library", "Email Support"], missing: ["Team Collaboration", "Approval Workflows"], cta: "Get Started" },
    { name: "Professional", monthlyPrice: 29, annualPrice: 22, popular: true, color: "border-violet-500/50", ctaClass: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30", features: ["25 Social Accounts", "Advanced AI Captions", "Approval Workflows", "3 Team Seats", "Comment Auto-Replies", "Analytics Dashboard"], missing: [], cta: "Start 14-Day Free Trial" },
    { name: "Agency", monthlyPrice: 99, annualPrice: 75, popular: false, color: "border-white/10", ctaClass: "bg-white/10 hover:bg-white/20 text-white", features: ["Unlimited Accounts", "Unlimited Team Seats", "5 Client Workspaces", "White-label Reporting", "Lead Generation CRM", "Dedicated Manager"], missing: [], cta: "Contact Sales" },
];

const stats = [
    { value: 2000, suffix: "+", label: "Teams worldwide" },
    { value: 10, suffix: "M+", label: "Posts scheduled" },
    { value: 70, suffix: "%", label: "Time saved on average" },
    { value: 4.9, suffix: "★", label: "Average rating" },
];

const navLinks = ["Features", "How It Works", "Pricing", "FAQ"];

/* ─── Helpers ─── */
const fv = (delay = 0) => ({ initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true as const }, transition: { duration: 0.6, delay, ease: "easeOut" as const } });
const fs = (delay = 0) => ({ initial: { opacity: 0, scale: 0.92 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true as const }, transition: { duration: 0.55, delay, ease: "easeOut" as const } });

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const steps = 60;
        let current = 0;
        const increment = target / steps;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); return; }
            setCount(parseFloat(current.toFixed(1)));
        }, 1800 / steps);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{Number.isInteger(target) ? count.toLocaleString() : count.toFixed(1)}{suffix}</span>;
}

/* ─── FAQ ─── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }} className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${open ? "border-violet-500/30 bg-violet-500/5" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"}`} onClick={() => setOpen(!open)}>
            <div className="flex items-center justify-between gap-4 p-6">
                <h3 className="text-base md:text-lg font-semibold text-white/85 group-hover:text-white">{q}</h3>
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${open ? "border-violet-400/50 bg-violet-500/20" : "border-white/10 bg-white/5"}`}>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <p className="px-6 pb-6 text-white/50 leading-relaxed font-light">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
            animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
        />
    );
}

/* ─── Particle Grid ─── */
function ParticleGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-violet-400 rounded-full"
                    style={{ left: `${(i * 7 + 5) % 100}%`, top: `${(i * 13 + 10) % 100}%` }}
                    animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
                    transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}



/* ─── Dashboard Mock ─── */
function DashboardMock() {
    const [tick, setTick] = useState(0);
    useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 2000); return () => clearInterval(t); }, []);
    const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100];
    return (
        <div className="bg-[#080810] rounded-[1.5rem] overflow-hidden border border-white/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-md bg-white/5 flex items-center px-3">
                    <span className="text-xs text-white/30">app.postflow.io/dashboard</span>
                </div>
                <div className="w-20 h-5 rounded bg-white/5" />
            </div>
            {/* Content */}
            <div className="p-5 flex gap-4" style={{ minHeight: 340 }}>
                {/* Sidebar */}
                <div className="w-40 shrink-0 flex flex-col gap-1">
                    {["Overview", "Compose", "Posts", "Calendar", "Analytics", "Team", "Settings"].map((item, i) => (
                        <motion.div key={item} animate={{ opacity: i === (tick % 7) ? 1 : 0.3 }} transition={{ duration: 0.4 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${i === (tick % 7) ? "bg-violet-500/20 text-violet-300" : "text-white/30"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${i === (tick % 7) ? "bg-violet-400" : "bg-white/20"}`} />
                            {item}
                        </motion.div>
                    ))}
                </div>
                {/* Main */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "Scheduled", val: "2,847", color: "text-violet-400", delta: "+12%" },
                            { label: "Engagement", val: "8.3%", color: "text-emerald-400", delta: "+5.2%" },
                            { label: "Leads", val: "189", color: "text-pink-400", delta: "+23%" },
                            { label: "On Track", val: "96%", color: "text-blue-400", delta: "▲" },
                        ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
                                <div className="text-[9px] text-white/30 mt-0.5">{s.label}</div>
                                <div className="text-[9px] text-emerald-400 mt-1">{s.delta}</div>
                            </div>
                        ))}
                    </div>
                    {/* Chart */}
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-end gap-1.5">
                        {bars.map((h, i) => (
                            <motion.div key={i} className="flex-1 bg-gradient-to-t from-violet-600/70 to-violet-400/30 rounded-t-sm min-h-[4px]"
                                initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: 0.05 * i, ease: "easeOut" }}
                                style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    {/* Post queue */}
                    <div className="flex gap-2">
                        {[
                            { platform: "LinkedIn", color: "bg-blue-600", time: "9:00 AM" },
                            { platform: "Twitter", color: "bg-sky-500", time: "10:30 AM" },
                            { platform: "Instagram", color: "bg-pink-600", time: "2:00 PM" },
                        ].map((p, i) => (
                            <motion.div key={p.platform} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
                                className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-2.5 py-2">
                                <div className={`w-2 h-2 rounded-full ${p.color}`} />
                                <span className="text-[9px] text-white/50 font-medium">{p.platform}</span>
                                <span className="text-[9px] text-white/25 ml-auto">{p.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function MarketingClient() {
    const [annual, setAnnual] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(heroScroll, [0, 1], [0, 100]);
    const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

    useEffect(() => {
        const t = setInterval(() => setActiveTestimonial(v => (v + 1) % testimonials.length), 4500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="bg-[#06060f] text-white overflow-x-hidden selection:bg-violet-500/30">



            {/* ── HERO ── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Backgrounds */}
                <ParticleGrid />
                <FloatingOrb className="w-[700px] h-[700px] bg-violet-600/25 top-[-100px] left-1/2 -translate-x-1/2" delay={0} />
                <FloatingOrb className="w-[400px] h-[400px] bg-pink-600/15 top-1/4 right-[-100px]" delay={2} />
                <FloatingOrb className="w-[350px] h-[350px] bg-blue-600/15 top-1/3 left-[-80px]" delay={4} />
                <FloatingOrb className="w-[250px] h-[250px] bg-emerald-600/10 bottom-1/4 right-1/4" delay={6} />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Pill badge */}
                    <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex justify-center mb-8">
                        <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(139,92,246,0)", "0 0 0 8px rgba(139,92,246,0.1)", "0 0 0 0 rgba(139,92,246,0)"] }} transition={{ duration: 2.5, repeat: Infinity }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-violet-500/30 bg-violet-500/10 text-violet-300 backdrop-blur-sm">
                            <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                                <Sparkles className="w-4 h-4 text-violet-400" />
                            </motion.div>
                            Gemini AI · Ranked #1 · 2,000+ teams worldwide
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </motion.div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
                        Schedule & manage your<br />
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
                                social media
                            </span>
                            <motion.div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 rounded-full"
                                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />
                        </span>
                        {" "}— on autopilot.
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 mb-10 font-light leading-relaxed">
                        One platform. 4 networks. <span className="text-violet-300 font-medium">Gemini AI-powered</span>. Zero manual effort.
                        <br />Write once — customize, schedule, and publish everywhere automatically.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Link href="/signup">
                            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }}
                                className="relative h-14 px-10 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-lg font-bold shadow-xl shadow-violet-500/30 overflow-hidden group">
                                <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-white/20 to-violet-400/0"
                                    animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                                <span className="relative flex items-center gap-2">
                                    🚀 Start Free — No Card Needed
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </motion.button>
                        </Link>
                        <Link href="#how-it-works">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="h-14 px-8 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-white/80 text-lg font-medium hover:bg-white/10 hover:border-white/25 transition-all flex items-center gap-2">
                                ▶ Watch 2-min Demo
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Trust row */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/40 mb-16">
                        {["14-day free trial", "Cancel anytime", "No setup fees", "SOC 2 compliant"].map((item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />{item}
                            </span>
                        ))}
                    </motion.div>

                    {/* Platform logos row */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-4 mb-12 flex-wrap">
                        <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Works seamlessly with</span>
                        {[{ Icon: Linkedin, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" }, { Icon: Twitter, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" }, { Icon: Facebook, color: "text-blue-500", bg: "bg-blue-600/10 border-blue-600/20" }, { Icon: Instagram, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" }].map(({ Icon, color, bg }) => (
                            <motion.div key={color} whileHover={{ scale: 1.15, y: -3 }} className={`w-11 h-11 rounded-xl border ${bg} flex items-center justify-center transition-all`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="relative max-w-5xl mx-auto">
                        <div className="absolute -inset-6 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-pink-600/20 blur-3xl rounded-[3rem] opacity-60" />
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative">
                            <DashboardMock />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── STATS ── */}
            <section className="relative py-20 border-y border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-pink-600/5" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                        {stats.map((s, i) => (
                            <motion.div key={s.label} {...fv(i * 0.1)} className="text-center group">
                                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                                </div>
                                <p className="text-white/40 text-sm font-medium">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="relative py-28 overflow-hidden">
                <FloatingOrb className="w-[500px] h-[500px] bg-violet-600/10 bottom-0 right-[-150px]" delay={1} />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div {...fv()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-5">
                            <Zap className="w-3.5 h-3.5" /> Simple 3-step workflow
                        </motion.div>
                        <motion.h2 {...fv(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                            From idea to published<br />
                            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">in minutes</span>
                        </motion.h2>
                        <motion.p {...fv(0.2)} className="text-white/40 text-lg max-w-xl mx-auto">No complex setup. No steep learning curve. Just powerful automation that works out of the box.</motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
                        {/* Connecting dashes */}
                        <div className="hidden md:flex absolute top-16 left-[33%] right-[33%] items-center justify-center pointer-events-none">
                            <div className="w-full border-t-2 border-dashed border-white/8" />
                        </div>

                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <motion.div key={s.step} {...fv(i * 0.15)}
                                    className={`relative p-8 rounded-3xl border ${s.border} bg-gradient-to-br ${s.bg} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300`}>
                                    <motion.div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.bg} border ${s.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                                        whileHover={{ rotate: 10 }}>
                                        <Icon className={`w-7 h-7 ${s.color}`} />
                                    </motion.div>
                                    <div className="text-5xl font-black text-white/5 absolute top-6 right-7 select-none">{s.step}</div>
                                    <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                                    <p className="text-white/50 leading-relaxed font-light">{s.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="relative py-28 overflow-hidden">
                <FloatingOrb className="w-[600px] h-[600px] bg-pink-600/10 top-0 left-[-150px]" delay={2} />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div {...fv()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-300 text-sm font-medium mb-5">
                            <Sparkles className="w-3.5 h-3.5" /> Everything you need
                        </motion.div>
                        <motion.h2 {...fv(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                            Built to make you<br />
                            <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">unstoppable</span>
                        </motion.h2>
                        <motion.p {...fv(0.2)} className="text-white/40 text-lg max-w-xl mx-auto">Every feature designed to save you hours, grow your audience, and scale your social presence.</motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <motion.div key={f.title} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6, scale: 1.01 }}
                                    className={`relative p-7 rounded-3xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 hover:shadow-2xl ${f.glow} transition-all duration-300 group overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <motion.div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}
                                        whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white">{f.title}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/8 text-white/40">{f.badge}</span>
                                    </div>
                                    <p className="text-white/45 leading-relaxed text-sm font-light">{f.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="relative py-24 overflow-hidden border-y border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-pink-600/5" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2 {...fv()} className="text-4xl md:text-5xl font-black mb-3">
                            Loved by teams that <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">grow fastest</span>
                        </motion.h2>
                        <motion.div {...fv(0.1)} className="flex items-center justify-center gap-1">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                            <span className="ml-2 text-white/50 text-sm">4.9/5 from 400+ reviews</span>
                        </motion.div>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                            {testimonials.map((t, i) => i === activeTestimonial && (
                                <motion.div key={t.name} initial={{ opacity: 0, x: 40, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -40, scale: 0.97 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] text-center">
                                    <div className="text-5xl text-violet-400/30 font-serif leading-none mb-4">&ldquo;</div>
                                    <p className="text-xl md:text-2xl font-light text-white/80 leading-relaxed mb-8">{t.quote}</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white`}>{t.avatar}</div>
                                        <div className="text-left">
                                            <p className="font-bold text-white">{t.name}</p>
                                            <p className="text-sm text-white/40">{t.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, i) => (
                                <button key={i} onClick={() => setActiveTestimonial(i)}
                                    className={`transition-all duration-300 rounded-full ${i === activeTestimonial ? "w-8 h-2 bg-violet-400" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="relative py-28 overflow-hidden">
                <FloatingOrb className="w-[500px] h-[500px] bg-violet-600/10 top-0 right-[-100px]" delay={3} />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <motion.div {...fv()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-5">
                            <TrendingUp className="w-3.5 h-3.5" /> Simple transparent pricing
                        </motion.div>
                        <motion.h2 {...fv(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                            Start free. Scale <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">as you grow.</span>
                        </motion.h2>
                        {/* Toggle */}
                        <motion.div {...fv(0.2)} className="flex items-center justify-center gap-3 mt-6">
                            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/40"}`}>Monthly</span>
                            <button onClick={() => setAnnual(v => !v)} className={`relative w-14 h-7 rounded-full transition-all duration-300 ${annual ? "bg-violet-600" : "bg-white/10"}`}>
                                <motion.div animate={{ x: annual ? 28 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                            </button>
                            <span className={`text-sm font-medium ${annual ? "text-white" : "text-white/40"}`}>
                                Annual <span className="text-emerald-400 font-semibold">save 25%</span>
                            </span>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, i) => (
                            <motion.div key={plan.name} {...fv(i * 0.12)} whileHover={{ y: -8, scale: 1.01 }}
                                className={`relative p-8 rounded-3xl border ${plan.color} ${plan.popular ? "bg-gradient-to-b from-violet-500/10 to-purple-600/5" : "bg-white/[0.02]"} transition-all duration-300`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-violet-500/30">
                                        ⭐ Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-5xl font-black text-white">${annual ? plan.annualPrice : plan.monthlyPrice}</span>
                                    <span className="text-white/40 mb-2 font-medium">/mo</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                                        </li>
                                    ))}
                                    {plan.missing.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-sm text-white/20 line-through">
                                            <X className="w-4 h-4 shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={plan.name === "Agency" ? "/contact" : "/signup"} className="block">
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`w-full py-3 rounded-2xl font-semibold transition-all text-sm ${plan.ctaClass}`}>
                                        {plan.cta}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="relative py-28 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="text-center mb-14">
                        <motion.h2 {...fv()} className="text-4xl md:text-5xl font-black mb-3">
                            Frequently asked <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">questions</span>
                        </motion.h2>
                        <motion.p {...fv(0.1)} className="text-white/40">Everything you need to know about PostFlow.</motion.p>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((f, i) => <FaqItem key={f.q} {...f} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="relative py-32 overflow-hidden">
                <FloatingOrb className="w-[800px] h-[800px] bg-violet-600/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={0} />
                <ParticleGrid />
                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div {...fv()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
                        <Rocket className="w-3.5 h-3.5" /> Ready to launch?
                    </motion.div>
                    <motion.h2 {...fv(0.1)} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        Ready to put your<br />
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">social on autopilot?</span>
                    </motion.h2>
                    <motion.p {...fv(0.2)} className="text-white/40 text-lg max-w-xl mx-auto mb-10">
                        Join 2,000+ teams already saving 10+ hours a week. Start your free trial today — no credit card required.
                    </motion.p>
                    <motion.div {...fv(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <motion.button whileHover={{ scale: 1.06, boxShadow: "0 25px 80px rgba(139,92,246,0.45)" }} whileTap={{ scale: 0.97 }}
                                className="relative h-16 px-12 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-xl font-black shadow-2xl shadow-violet-500/30 overflow-hidden group">
                                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }} />
                                <span className="relative flex items-center gap-3">
                                    🚀 Start Free Trial
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </motion.button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost" size="lg" className="h-16 px-8 text-lg text-white/50 hover:text-white hover:bg-white/5 rounded-full">
                                Sign in to your account <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>


        </div>
    );
}
