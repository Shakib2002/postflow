"use client";

import { useState } from "react";
import { Hash, Plus, X, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface HashtagTemplate {
    id: string;
    name: string;
    hashtags: string;
}

// Default templates (shown before user creates their own)
const defaultTemplates: HashtagTemplate[] = [
    { id: "1", name: "Marketing", hashtags: "#marketing #digitalmarketing #growthhacking #socialmedia #contentmarketing" },
    { id: "2", name: "LinkedIn Growth", hashtags: "#linkedin #networking #b2b #thoughtleadership #entrepreneurship" },
    { id: "3", name: "Startup", hashtags: "#startup #founder #entrepreneurship #innovation #tech #saas" },
    { id: "4", name: "Productivity", hashtags: "#productivity #mindset #success #motivation #worksmarter" },
];

interface HashtagTemplatesProps {
    onInsert: (hashtags: string) => void;
}

export function HashtagTemplates({ onInsert }: HashtagTemplatesProps) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<HashtagTemplate[]>(defaultTemplates);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newHashtags, setNewHashtags] = useState("");

    const handleCreate = () => {
        if (!newName.trim() || !newHashtags.trim()) return;
        const template: HashtagTemplate = {
            id: Date.now().toString(),
            name: newName.trim(),
            hashtags: newHashtags.trim(),
        };
        setTemplates((prev) => [...prev, template]);
        setNewName("");
        setNewHashtags("");
        setShowCreate(false);
    };

    const handleDelete = (id: string) => {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium">Hashtag Templates</span>
                    <span className="text-xs text-muted-foreground">({templates.length} saved)</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/10"
                    >
                        <div className="p-3 space-y-2">
                            {templates.map((t) => (
                                <div
                                    key={t.id}
                                    className="group flex items-start gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => onInsert("\n\n" + t.hashtags)}
                                >
                                    <Hash className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground">{t.name}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{t.hashtags}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-400"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}

                            {showCreate ? (
                                <div className="p-3 rounded-lg border border-violet-500/30 bg-violet-500/5 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Template name (e.g. Marketing)"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/50"
                                    />
                                    <textarea
                                        placeholder="#hashtag1 #hashtag2 #hashtag3..."
                                        value={newHashtags}
                                        onChange={(e) => setNewHashtags(e.target.value)}
                                        rows={2}
                                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/50 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleCreate} className="bg-violet-600 hover:bg-violet-500 text-xs h-7">Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)} className="text-xs h-7">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-xs text-muted-foreground hover:border-violet-500/40 hover:text-violet-400 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Create new template
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
