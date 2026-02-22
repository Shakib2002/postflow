"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Hook {
    id: string;
    category: string;
    text: string;
}

const HOOKS: Hook[] = [
    // Curiosity Hooks
    { id: "c1", category: "Curiosity", text: "Most people get this wrong about [topic]..." },
    { id: "c2", category: "Curiosity", text: "I spent 3 years making one mistake. Here's what I learned:" },
    { id: "c3", category: "Curiosity", text: "Nobody talks about this, but [topic] is changing everything." },
    { id: "c4", category: "Curiosity", text: "The secret to [outcome] isn't what you think." },
    { id: "c5", category: "Curiosity", text: "What if everything you know about [topic] is wrong?" },
    { id: "c6", category: "Curiosity", text: "This one insight changed how I think about [topic] forever." },
    { id: "c7", category: "Curiosity", text: "I almost quit [field]. Then I discovered this:" },
    { id: "c8", category: "Curiosity", text: "The counterintuitive truth about [topic] nobody tells you:" },

    // Contrarian Hooks
    { id: "v1", category: "Contrarian", text: "Unpopular opinion: [controversial take]." },
    { id: "v2", category: "Contrarian", text: "Stop chasing [common goal]. Here's why it's holding you back:" },
    { id: "v3", category: "Contrarian", text: "[Popular advice] is mostly wrong. Here's what actually works:" },
    { id: "v4", category: "Contrarian", text: "I disagree with every expert who says [common belief]." },
    { id: "v5", category: "Contrarian", text: "Hot take: [your field] is broken because of [reason]." },
    { id: "v6", category: "Contrarian", text: "The productivity advice that's making you LESS productive:" },
    { id: "v7", category: "Contrarian", text: "Everyone is optimizing the wrong thing." },

    // Story Hooks
    { id: "s1", category: "Story", text: "6 months ago I had [problem]. Here's exactly what changed:" },
    { id: "s2", category: "Story", text: "A client came to me with [problem]. In 30 days, we got [result]:" },
    { id: "s3", category: "Story", text: "I got rejected 47 times before landing [achievement]." },
    { id: "s4", category: "Story", text: "2 years ago I was [dire situation]. Today [great outcome]." },
    { id: "s5", category: "Story", text: "My biggest failure taught me more than any success could." },
    { id: "s6", category: "Story", text: "The conversation that changed everything for me:" },

    // List / Value Hooks
    { id: "l1", category: "List", text: "5 things nobody tells you about [topic]:" },
    { id: "l2", category: "List", text: "7 rules I follow for [outcome] (and they work every time):" },
    { id: "l3", category: "List", text: "3 mistakes I made so you don't have to:" },
    { id: "l4", category: "List", text: "10 books that completely rewired the way I think:" },
    { id: "l5", category: "List", text: "The 5-step framework I use to [achieve outcome]:" },
    { id: "l6", category: "List", text: "Quick wins for [goal] you can start today:" },
    { id: "l7", category: "List", text: "4 questions I ask every time I make a major decision:" },

    // Question Hooks
    { id: "q1", category: "Question", text: "What's the one thing most [professionals] will never tell you?" },
    { id: "q2", category: "Question", text: "How do top [performers] achieve [goal] in half the time?" },
    { id: "q3", category: "Question", text: "Are you still doing [outdated practice]? It's costing you [outcome]." },
    { id: "q4", category: "Question", text: "What would you do if you only had 1 year to achieve [goal]?" },
    { id: "q5", category: "Question", text: "Why do 90% of [people] fail at [goal]?" },
    { id: "q6", category: "Question", text: "Have you ever wondered why [common question]?" },

    // Achievement Hooks
    { id: "a1", category: "Achievement", text: "We grew from 0 to [number] [metric] in [timeframe]. Here's how:" },
    { id: "a2", category: "Achievement", text: "This one framework helped us generate [result] in [timeframe]:" },
    { id: "a3", category: "Achievement", text: "After [timeframe] of testing, this is what actually works:" },
    { id: "a4", category: "Achievement", text: "How we hit [milestone] faster than any [competitor] in the space:" },
    { id: "a5", category: "Achievement", text: "[Result] using only [simple method]. No paid ads." },

    // Empathy Hooks
    { id: "e1", category: "Empathy", text: "If you're feeling overwhelmed by [topic], read this." },
    { id: "e2", category: "Empathy", text: "Nobody prepared me for [challenge]. So I'm preparing you." },
    { id: "e3", category: "Empathy", text: "You're not bad at [skill]. You just haven't learned this yet:" },
    { id: "e4", category: "Empathy", text: "It's okay if [common struggle]. Here's how to fix it:" },
    { id: "e5", category: "Empathy", text: "The moment I stopped [bad habit] was the day everything changed." },
];

const CATEGORIES = ["All", "Curiosity", "Contrarian", "Story", "List", "Question", "Achievement", "Empathy"];

const CATEGORY_COLORS: Record<string, string> = {
    Curiosity: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    Contrarian: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    Story: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    List: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Question: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    Achievement: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    Empathy: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export function HookLibrary({ onInsert }: { onInsert: (text: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const filtered = useMemo(() => {
        return HOOKS.filter((h) => {
            const matchCat = category === "All" || h.category === category;
            const matchSearch = h.text.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [category, search]);

    return (
        <div className="border-t border-white/10">
            {/* Toggle Header */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">Viral Hook Library</span>
                    <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 py-0">
                        {HOOKS.length} hooks
                    </Badge>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search hooks..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-8 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Category filter pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${category === cat
                                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            : "border-white/10 text-muted-foreground hover:border-white/20"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Hook list */}
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                {filtered.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hooks found.</p>
                                ) : (
                                    filtered.map((hook) => (
                                        <motion.button
                                            key={hook.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => {
                                                onInsert(hook.text);
                                                setOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 rounded-lg border border-white/5 bg-white/3 hover:bg-white/8 hover:border-amber-500/20 transition-all group"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[hook.category] ?? ""} mt-0.5`}>
                                                    {hook.category}
                                                </span>
                                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                                    {hook.text}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Click a hook to insert it into your post. Replace <span className="text-foreground/60">[brackets]</span> with your own details.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
