"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type VariantResult = { tone: string; content: string; regenerating?: boolean };
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlatformPreview } from "@/components/compose/platform-preview";
import { HashtagTemplates } from "@/components/compose/hashtag-templates";
import { HookLibrary } from "@/components/compose/hook-library";
import { PostLabels } from "@/components/compose/post-labels";
import {
    Linkedin, Facebook, Twitter, Instagram,
    Sparkles, Hash, Smile, ImagePlus, Calendar, Eye, Send,
    AlignLeft, Wand2, RefreshCw, CheckCircle2, Clock,
    X, Plus, AlertCircle, MessageSquarePlus, FileText,
    ChevronDown, Zap, Tag, StickyNote, ListChecks,
} from "lucide-react";

const platforms = [
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2", limit: 3000 },
    { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2", limit: 63206 },
    { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#000000", limit: 280 },
    { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F", limit: 2200 },
];

const tones = ["Professional", "Casual", "Inspirational", "Funny", "Salesy", "Educational"];

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
});

type SubmitMode = "draft" | "schedule" | "publish" | "approval";

export default function ComposePage() {
    const [content, setContent] = useState("");
    const [topic, setTopic] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "twitter"]);
    const [selectedTone, setSelectedTone] = useState("Professional");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiAction, setAiAction] = useState<string | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiVariants, setAiVariants] = useState<VariantResult[]>([]);
    const [showVariants, setShowVariants] = useState(false);
    const [previewPlatform, setPreviewPlatform] = useState("linkedin");
    const [requireApproval, setRequireApproval] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [firstComment, setFirstComment] = useState("");
    const [showFirstComment, setShowFirstComment] = useState(false);
    const [internalNote, setInternalNote] = useState("");
    const [showNote, setShowNote] = useState(false);
    const [checklist, setChecklist] = useState<string[]>([]);
    const [newCheckItem, setNewCheckItem] = useState("");
    const [showChecklist, setShowChecklist] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("09:00");
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);
    const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
    // Per-platform tailoring
    const [perPlatformMode, setPerPlatformMode] = useState(false);
    const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
    const [activePlatformTab, setActivePlatformTab] = useState<string>("linkedin");
    // Connected social accounts
    const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, { connected: boolean; name?: string }>>({});

    const searchParams = useSearchParams();

    // Fetch connected social accounts on mount
    useEffect(() => {
        fetch("/api/social/platforms")
            .then((r) => r.json())
            .then((data) => {
                if (data.platforms) {
                    const map: Record<string, { connected: boolean; name?: string }> = {};
                    data.platforms.forEach((p: any) => {
                        map[p.platform] = { connected: true, name: p.name };
                    });
                    setConnectedPlatforms(map);
                }
            })
            .catch(() => { }); // Non-blocking
    }, []);

    // Content Recycler: pre-fill from ?recycle= query param
    useEffect(() => {
        const recycled = searchParams.get("recycle");
        if (recycled) {
            try {
                setContent(decodeURIComponent(recycled));
            } catch {
                setContent(recycled);
            }
        }
    }, [searchParams]);

    const tomorrow = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    }, []);

    const togglePlatform = useCallback((id: string) => {
        setSelectedPlatforms((prev) => {
            const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
            // When adding a platform in per-platform mode, seed its content from main
            if (!prev.includes(id) && perPlatformMode) {
                setPlatformContent((pc) => ({ ...pc, [id]: pc[id] ?? content }));
            }
            return next;
        });
        setPreviewPlatform(id);
        setActivePlatformTab(id);
    }, [perPlatformMode, content]);

    // When toggling per-platform mode ON, seed all selected platforms with current content
    useEffect(() => {
        if (perPlatformMode) {
            setPlatformContent((prev) => {
                const seeded: Record<string, string> = {};
                selectedPlatforms.forEach((pid) => {
                    seeded[pid] = prev[pid] ?? content;
                });
                return seeded;
            });
            if (selectedPlatforms.length > 0) setActivePlatformTab(selectedPlatforms[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perPlatformMode]);

    const callAI = async (action: string) => {
        if (action !== "generate" && action !== "variants" && action !== "tone_test" && !content.trim()) return;
        setIsGenerating(true);
        setAiAction(action);
        setShowSuggestions(false);
        if (action === "variants" || action === "tone_test") setShowVariants(false);
        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    content: content || topic,
                    platform: selectedPlatforms[0] || "linkedin",
                    tone: selectedTone,
                    topic,
                }),
            });
            const data = await res.json();
            if (data.variants) {
                setAiVariants(data.variants);
                setShowVariants(true);
            } else if (data.result) {
                if (action === "generate") {
                    setAiSuggestions([data.result]);
                    setShowSuggestions(true);
                } else if (action === "hashtags") {
                    setContent((prev) => prev + "\n\n" + data.result);
                } else {
                    setContent(data.result);
                }
            }
        } catch {
            // Demo fallback for variants
            if (action === "variants" || action === "tone_test") {
                const subject = topic || content || "your topic";
                setAiVariants([
                    { tone: "Professional", content: `🎯 [Demo] Professional take on "${subject}".\n\nAdd your OPENAI_API_KEY to .env.local to enable real AI.\n\n#PostFlow #SocialMedia` },
                    { tone: "Casual", content: `Hey! [Demo] Casual take on "${subject}". 👋\n\nAdd your OPENAI_API_KEY to .env.local to enable real AI.` },
                    { tone: "Funny", content: `😂 [Demo] Funny take on "${subject}".\n\nAdd your OPENAI_API_KEY to .env.local to enable real AI. (No joke!)` },
                ]);
                setShowVariants(true);
            } else {
                setAiSuggestions(["🚀 Configure your OpenAI API key in .env.local to enable real AI generation. For now, here's a sample post:\n\n🎯 The secret to growing on LinkedIn? Consistency + Value.\n\nMost people post once and expect results. The algorithm rewards those who show up daily.\n\nHere's my 3-step framework:\n1. Share a lesson you learned this week\n2. Ask your audience a question\n3. Engage with every comment in the first hour\n\nTry it for 30 days. The results will surprise you. 👇"]);
                setShowSuggestions(true);
            }
        } finally {
            setIsGenerating(false);
            setAiAction(null);
        }
    };

    const regenerateVariant = async (index: number) => {
        const subject = topic || content;
        if (!subject?.trim()) return;
        setAiVariants((prev) => prev.map((v, i) => i === index ? { ...v, regenerating: true } : v));
        try {
            const tone = aiVariants[index]?.tone ?? "Professional";
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate",
                    content: subject,
                    platform: selectedPlatforms[0] || "linkedin",
                    tone,
                    topic,
                }),
            });
            const data = await res.json();
            if (data.result) {
                setAiVariants((prev) => prev.map((v, i) => i === index ? { tone, content: data.result, regenerating: false } : v));
            }
        } catch {
            setAiVariants((prev) => prev.map((v, i) => i === index ? { ...v, regenerating: false } : v));
        }
    };

    const handleSubmit = async (mode: SubmitMode) => {
        // In per-platform mode, require at least one platform to have content
        const effectiveContent = perPlatformMode
            ? (platformContent[selectedPlatforms[0]] || content)
            : content;
        if (!effectiveContent.trim() || selectedPlatforms.length === 0) return;
        setIsSubmitting(true);
        setSubmitStatus("idle");

        const scheduledAt = mode === "schedule" && scheduleDate
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : mode === "schedule"
                ? new Date(Date.now() + 86400000).toISOString()
                : null;

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: effectiveContent,
                    platforms: selectedPlatforms,
                    requireApproval: mode === "approval" || requireApproval,
                    scheduledAt,
                    status: mode === "draft" ? "draft" : mode === "approval" ? "pending_approval" : scheduledAt ? "scheduled" : "publishing",
                    labels: selectedLabels,
                    firstComment,
                    internalNote,
                    checklist,
                    // Per-platform content map (only sent when mode is active)
                    ...(perPlatformMode ? { platformContent } : {}),
                }),
            });
            if (res.ok) {
                setSubmitStatus("success");
                if (mode !== "draft") {
                    setContent("");
                    setPlatformContent({});
                    setFirstComment("");
                    setSelectedLabels([]);
                }
            } else {
                const d = await res.json();
                setErrorMsg(d.error || "Failed to create post");
                setSubmitStatus("error");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const activePlatform = platforms.find((p) => p.id === previewPlatform);
    const charCount = content.length;
    const charLimit = activePlatform?.limit ?? 3000;
    const charPercent = Math.min((charCount / charLimit) * 100, 100);
    const isOverLimit = charCount > charLimit;

    const addCheckItem = () => {
        if (!newCheckItem.trim()) return;
        setChecklist((prev) => [...prev, newCheckItem.trim()]);
        setNewCheckItem("");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <motion.div {...fu(0)} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Create Post</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Write once, publish everywhere</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="border-white/20 gap-2 h-9"
                        onClick={() => handleSubmit("draft")}
                        disabled={isSubmitting || !content.trim()}
                    >
                        <FileText className="w-4 h-4" />
                        Save Draft
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 gap-2 h-9"
                        onClick={() => { setShowSchedulePicker(!showSchedulePicker); }}
                        disabled={!content.trim()}
                    >
                        <Calendar className="w-4 h-4" />
                        Schedule
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="outline"
                        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-2 h-9"
                        onClick={() => handleSubmit("approval")}
                        disabled={isSubmitting || !content.trim()}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Send for Approval
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-lg shadow-violet-500/30 h-9"
                        onClick={() => handleSubmit("publish")}
                        disabled={isSubmitting || !content.trim() || selectedPlatforms.length === 0 || isOverLimit}
                    >
                        {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isSubmitting ? "Publishing..." : "Publish Now"}
                    </Button>
                </div>
            </motion.div>

            {/* Schedule picker dropdown */}
            <AnimatePresence>
                {showSchedulePicker && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5"
                    >
                        <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                        <div className="flex items-center gap-3 flex-1">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Date</p>
                                <input
                                    type="date"
                                    value={scheduleDate || tomorrow}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Time</p>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                                <p className="text-xs text-violet-300">Tue 9 AM = 3.2× more engagement</p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-500"
                            onClick={() => { handleSubmit("schedule"); setShowSchedulePicker(false); }}
                            disabled={isSubmitting}
                        >
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            Schedule Post
                        </Button>
                        <button onClick={() => setShowSchedulePicker(false)}>
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status banners */}
            <AnimatePresence>
                {submitStatus === "success" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Post created successfully! {requireApproval ? "Approval request sent." : ""}
                        <button onClick={() => setSubmitStatus("idle")} className="ml-auto"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
                {submitStatus === "error" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMsg}
                        <button onClick={() => setSubmitStatus("idle")} className="ml-auto"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-5 gap-5">
                {/* ── Left: Composer ── */}
                <motion.div {...fu(0.1)} className="lg:col-span-3 space-y-4">

                    {/* Platform selector */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-3">
                                {platforms.map((p) => {
                                    const isConnected = !!connectedPlatforms[p.id]?.connected;
                                    const active = selectedPlatforms.includes(p.id);

                                    return (
                                        <div key={p.id} className="relative group">
                                            <button
                                                onClick={() => isConnected && togglePlatform(p.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${active
                                                    ? "border-transparent text-white shadow-lg scale-[1.02]"
                                                    : isConnected
                                                        ? "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                                                        : "border-white/5 text-muted-foreground opacity-50 cursor-not-allowed"
                                                    }`}
                                                style={active ? { backgroundColor: p.color } : {}}
                                            >
                                                <p.icon className={`w-4 h-4 ${active ? "text-white" : ""}`} style={!active && isConnected ? { color: p.color } : {}} />
                                                {p.label}
                                                {active && <CheckCircle2 className="w-4 h-4" />}
                                                {!isConnected && (
                                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded ml-1 font-normal">
                                                        Disconnected
                                                    </span>
                                                )}
                                            </button>

                                            {!isConnected && (
                                                <div className="absolute -bottom-10 left-0 hidden group-hover:block z-50">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 text-[11px] bg-violet-600 hover:bg-violet-500 text-white shadow-xl"
                                                        onClick={() => {
                                                            // Mock connection jump
                                                            fetch("/api/social/connect", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ platforms: [p.id] }),
                                                            }).then(() => {
                                                                const newPlatforms = { ...connectedPlatforms, [p.id]: { connected: true } };
                                                                setConnectedPlatforms(newPlatforms);
                                                                togglePlatform(p.id);
                                                            });
                                                        }}
                                                    >
                                                        One-click Connect
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedPlatforms.length === 0 && (
                                <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Select at least one platform
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Toolbar */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-violet-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Tools</p>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {tones.map((tone) => (
                                        <button
                                            key={tone}
                                            onClick={() => setSelectedTone(tone)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${selectedTone === tone
                                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Topic or idea (e.g. 'productivity tips for founders')..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && callAI("generate")}
                                className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-violet-500/50 placeholder:text-muted-foreground/50"
                            />
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { action: "variants", icon: Wand2, label: "3 Variants", primary: true },
                                    { action: "tone_test", icon: Sparkles, label: "Tone A/B", primary: true },
                                    { action: "hashtags", icon: Hash, label: "Hashtags" },
                                    { action: "emojis", icon: Smile, label: "Emoji" },
                                    { action: "rephrase", icon: AlignLeft, label: "Rewrite" },
                                    { action: "improve", icon: Sparkles, label: "Improve" },
                                ].map(({ action, icon: Icon, label, primary }) => (
                                    <Button
                                        key={action}
                                        size="sm"
                                        variant={primary ? "default" : "outline"}
                                        className={primary
                                            ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-md shadow-violet-500/20"
                                            : "border-white/20 gap-2"
                                        }
                                        onClick={() => callAI(action)}
                                        disabled={isGenerating || (["hashtags", "emojis", "rephrase", "improve"].includes(action) && !content.trim()) || (["variants", "tone_test"].includes(action) && !topic.trim() && !content.trim())}
                                    >
                                        {isGenerating && aiAction === action
                                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            : <Icon className="w-3.5 h-3.5" />
                                        }
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Variants Panel */}
                    <AnimatePresence>
                        {showVariants && aiVariants.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Card className="border-violet-500/30 bg-violet-500/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-violet-400" />
                                                <span className="text-sm font-semibold text-violet-400">AI Variants — Pick your favourite</span>
                                            </div>
                                            <button onClick={() => setShowVariants(false)}>
                                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </div>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            {aiVariants.map((v, i) => (
                                                <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">{v.tone}</Badge>
                                                        <button
                                                            onClick={() => regenerateVariant(i)}
                                                            disabled={v.regenerating}
                                                            className="text-muted-foreground hover:text-violet-400 transition-colors"
                                                            title="Regenerate this variant"
                                                        >
                                                            <RefreshCw className={`w-3.5 h-3.5 ${v.regenerating ? "animate-spin text-violet-400" : ""}`} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 flex-1">{v.content}</p>
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-violet-600/80 hover:bg-violet-500 text-white text-xs h-7 mt-auto"
                                                        onClick={() => { setContent(v.content); setShowVariants(false); }}
                                                    >
                                                        Use this ↵
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* AI Single Suggestions (hashtags/rephrase/improve fallback) */}
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Card className="border-violet-500/30 bg-violet-500/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-violet-400" />
                                                <span className="text-sm font-semibold text-violet-400">AI Suggestion</span>
                                            </div>
                                            <button onClick={() => setShowSuggestions(false)}>
                                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {aiSuggestions.map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 cursor-pointer transition-all group"
                                                    onClick={() => { setContent(s); setShowSuggestions(false); }}
                                                >
                                                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-5 whitespace-pre-wrap">{s}</p>
                                                    <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">Use this ↵</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text Editor */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-4">
                            {/* Per-platform mode toggle */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</span>
                                <button
                                    onClick={() => setPerPlatformMode((v) => !v)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${perPlatformMode
                                        ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                                        : "border-white/10 text-muted-foreground hover:border-white/20"
                                        }`}
                                    title="Customize content per platform"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {perPlatformMode ? "Per-Platform: ON" : "Customize per platform"}
                                </button>
                            </div>

                            {perPlatformMode && selectedPlatforms.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Platform tabs */}
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedPlatforms.map((pid) => {
                                            const p = platforms.find((pl) => pl.id === pid);
                                            if (!p) return null;
                                            const isActive = activePlatformTab === pid;
                                            const pContent = platformContent[pid] ?? "";
                                            const pLimit = p.limit;
                                            const isOver = pContent.length > pLimit;
                                            return (
                                                <button
                                                    key={pid}
                                                    onClick={() => setActivePlatformTab(pid)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isActive
                                                        ? "border-transparent text-white shadow-md"
                                                        : "border-white/10 text-muted-foreground hover:border-white/20"
                                                        }`}
                                                    style={isActive ? { backgroundColor: p.color } : {}}
                                                >
                                                    <p.icon className="w-3 h-3" />
                                                    {p.label}
                                                    {isOver && <span className="text-red-400">!</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Active platform textarea */}
                                    {(() => {
                                        const p = platforms.find((pl) => pl.id === activePlatformTab);
                                        if (!p || !selectedPlatforms.includes(activePlatformTab)) return null;
                                        const pContent = platformContent[activePlatformTab] ?? "";
                                        const pLimit = p.limit;
                                        const isOver = pContent.length > pLimit;
                                        return (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                                                        <span className="text-xs font-medium" style={{ color: p.color }}>{p.label} content</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setPlatformContent((prev) => ({ ...prev, [activePlatformTab]: content }))}
                                                        className="text-xs text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
                                                        title="Sync from main content"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Sync from main
                                                    </button>
                                                </div>
                                                <Textarea
                                                    placeholder={`Write your ${p.label} post here... (${pLimit.toLocaleString()} char limit)`}
                                                    value={pContent}
                                                    onChange={(e) => setPlatformContent((prev) => ({ ...prev, [activePlatformTab]: e.target.value }))}
                                                    className="min-h-[180px] bg-transparent border-0 focus-visible:ring-0 resize-none text-base placeholder:text-muted-foreground/50 p-0"
                                                />
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className={isOver ? "text-red-400" : "text-muted-foreground"}>
                                                        {pContent.length.toLocaleString()} / {pLimit.toLocaleString()}
                                                    </span>
                                                    {isOver && <span className="text-red-400 font-medium">Over limit by {(pContent.length - pLimit).toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <Textarea
                                    placeholder="What's on your mind? Start typing or use AI Generate above..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[220px] bg-transparent border-0 focus-visible:ring-0 resize-none text-base placeholder:text-muted-foreground/50 p-0"
                                />
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3">
                                <div className="flex items-center gap-3">
                                    <button className="text-muted-foreground hover:text-foreground transition-colors" title="Add image">
                                        <ImagePlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="text-muted-foreground hover:text-violet-400 transition-colors"
                                        title="Add first comment"
                                        onClick={() => setShowFirstComment(!showFirstComment)}
                                    >
                                        <MessageSquarePlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="text-muted-foreground hover:text-blue-400 transition-colors"
                                        title="Add labels"
                                        onClick={() => { }}
                                    >
                                        <Tag className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="text-muted-foreground hover:text-yellow-400 transition-colors"
                                        title="Internal note"
                                        onClick={() => setShowNote(!showNote)}
                                    >
                                        <StickyNote className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="text-muted-foreground hover:text-green-400 transition-colors"
                                        title="Pre-publish checklist"
                                        onClick={() => setShowChecklist(!showChecklist)}
                                    >
                                        <ListChecks className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isOverLimit ? "bg-red-500" : charPercent > 80 ? "bg-yellow-500" : "bg-violet-500"}`}
                                                style={{ width: `${charPercent}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs ${isOverLimit ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>
                                            {charCount}/{charLimit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* First Comment */}
                    <AnimatePresence>
                        {showFirstComment && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                <Card className="glass border-violet-500/20 bg-violet-500/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquarePlus className="w-4 h-4 text-violet-400" />
                                            <span className="text-sm font-medium text-violet-400">First Comment</span>
                                            <span className="text-xs text-muted-foreground">— scheduled with your post</span>
                                        </div>
                                        <Textarea
                                            placeholder="Add a first comment (great for links, CTAs, or additional hashtags)..."
                                            value={firstComment}
                                            onChange={(e) => setFirstComment(e.target.value)}
                                            className="min-h-[80px] bg-white/5 border-white/10 resize-none text-sm"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Internal Note */}
                    <AnimatePresence>
                        {showNote && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                <Card className="glass border-yellow-500/20 bg-yellow-500/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <StickyNote className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-medium text-yellow-400">Internal Note</span>
                                            <span className="text-xs text-muted-foreground">— only visible to your team</span>
                                        </div>
                                        <Textarea
                                            placeholder="Leave a note for your team (not published)..."
                                            value={internalNote}
                                            onChange={(e) => setInternalNote(e.target.value)}
                                            className="min-h-[80px] bg-white/5 border-white/10 resize-none text-sm"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pre-publish Checklist */}
                    <AnimatePresence>
                        {showChecklist && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                <Card className="glass border-green-500/20 bg-green-500/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ListChecks className="w-4 h-4 text-green-400" />
                                            <span className="text-sm font-medium text-green-400">Pre-publish Checklist</span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            {checklist.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <input type="checkbox" className="rounded" />
                                                    <span className="text-sm flex-1">{item}</span>
                                                    <button onClick={() => setChecklist((prev) => prev.filter((_, j) => j !== i))}>
                                                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add checklist item..."
                                                value={newCheckItem}
                                                onChange={(e) => setNewCheckItem(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
                                                className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500/50"
                                            />
                                            <Button size="sm" onClick={addCheckItem} className="bg-green-600 hover:bg-green-500 h-8">
                                                <Plus className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>

                {/* ── Right: Preview ── */}
                <motion.div {...fu(0.2)} className="lg:col-span-2 space-y-4">
                    <Card className="glass border-white/10 sticky top-5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-violet-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
                                </div>
                                <div className="flex bg-white/5 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("compose")}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "compose" ? "bg-violet-600 shadow-md text-white" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Mobile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("preview")}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "preview" ? "bg-violet-600 shadow-md text-white" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Desktop
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {selectedPlatforms.length > 0 ? (
                                    selectedPlatforms.map((pid) => {
                                        const p = platforms.find((pl) => pl.id === pid);
                                        if (!p) return null;
                                        return (
                                            <button
                                                key={pid}
                                                onClick={() => setPreviewPlatform(pid)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border shrink-0 ${previewPlatform === pid
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                <p.icon className="w-3 h-3" style={{ color: p.color }} />
                                                {p.label}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">Select a platform to see preview</p>
                                )}
                            </div>

                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0B]">
                                <PlatformPreview
                                    platform={previewPlatform}
                                    content={perPlatformMode ? (platformContent[previewPlatform] || content) : content}
                                />
                            </div>

                            <div className="mt-6 space-y-4">
                                <HashtagTemplates onInsert={(t) => setContent(prev => prev + " " + t)} />
                                <HookLibrary onInsert={(h) => setContent(prev => h + "\n\n" + prev)} />
                                <PostLabels selected={selectedLabels} onChange={setSelectedLabels} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
