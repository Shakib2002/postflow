"use client";

import { useState } from "react";
import { Tag, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_LABELS = [
    { id: "campaign", name: "Campaign", color: "#8b5cf6" },
    { id: "product", name: "Product", color: "#3b82f6" },
    { id: "educational", name: "Educational", color: "#10b981" },
    { id: "promotional", name: "Promotional", color: "#f59e0b" },
    { id: "engagement", name: "Engagement", color: "#ec4899" },
    { id: "announcement", name: "Announcement", color: "#ef4444" },
    { id: "thought-leadership", name: "Thought Leadership", color: "#06b6d4" },
    { id: "behind-scenes", name: "Behind the Scenes", color: "#84cc16" },
];

interface PostLabelsProps {
    selected: string[];
    onChange: (labels: string[]) => void;
}

export function PostLabels({ selected, onChange }: PostLabelsProps) {
    const [open, setOpen] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [customLabels, setCustomLabels] = useState<typeof PRESET_LABELS>([]);

    const allLabels = [...PRESET_LABELS, ...customLabels];

    const toggle = (id: string) => {
        onChange(selected.includes(id) ? selected.filter((l) => l !== id) : [...selected, id]);
    };

    const addCustom = () => {
        if (!newLabel.trim()) return;
        const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
        const color = colors[customLabels.length % colors.length];
        setCustomLabels((prev) => [...prev, { id: newLabel.toLowerCase().replace(/\s+/g, "-"), name: newLabel.trim(), color }]);
        setNewLabel("");
    };

    const selectedLabels = allLabels.filter((l) => selected.includes(l.id));

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Labels</span>
                    {selectedLabels.length > 0 && (
                        <div className="flex gap-1">
                            {selectedLabels.map((l) => (
                                <span
                                    key={l.id}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                    style={{ backgroundColor: l.color + "30", color: l.color }}
                                >
                                    {l.name}
                                </span>
                            ))}
                        </div>
                    )}
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
                        <div className="p-3">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {allLabels.map((label) => {
                                    const isSelected = selected.includes(label.id);
                                    return (
                                        <button
                                            key={label.id}
                                            onClick={() => toggle(label.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
                                            style={isSelected
                                                ? { backgroundColor: label.color + "25", color: label.color, borderColor: label.color + "60" }
                                                : { backgroundColor: "transparent", color: "#888", borderColor: "#ffffff20" }
                                            }
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: isSelected ? label.color : "#888" }}
                                            />
                                            {label.name}
                                            {isSelected && <X className="w-3 h-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Create custom label..."
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                                    className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500/50"
                                />
                                <button
                                    onClick={addCustom}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
