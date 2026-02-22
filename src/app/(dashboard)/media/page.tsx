"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Upload, Search, Grid3X3, List,
    Trash2, Copy, Check, Plus, Filter,
    ImageIcon, Film, File,
} from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
    id: string;
    name: string;
    url: string;
    type: "image" | "video" | "document";
    size: number;
    created_at: string;
    width?: number;
    height?: number;
}

const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const typeIcon: Record<string, React.ElementType> = {
    image: ImageIcon,
    video: Film,
    document: File,
};

const typeColor: Record<string, string> = {
    image: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    video: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    document: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function MediaPage() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "document">("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch files from Supabase Storage on mount ──
    const fetchFiles = useCallback(async () => {
        try {
            const res = await fetch("/api/media");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setItems(data.files ?? []);
        } catch (err) {
            console.error("Fetch media error:", err);
            toast.error("Failed to load media files");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const filtered = items.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || item.type === typeFilter;
        return matchSearch && matchType;
    });

    // ── Upload files to Supabase Storage via API ──
    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("files", file));

            const res = await fetch("/api/media", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            const uploaded = (data.files ?? []).filter((f: { error?: string }) => !f.error);
            const failed = (data.files ?? []).filter((f: { error?: string }) => f.error);

            if (uploaded.length > 0) {
                setItems((prev) => [...uploaded, ...prev]);
                toast.success(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`);
            }
            if (failed.length > 0) {
                toast.error(`${failed.length} file${failed.length > 1 ? "s" : ""} failed to upload`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    }, [handleUpload]);

    const copyUrl = (item: MediaItem) => {
        if (!item.url) { toast.error("No URL available for this file"); return; }
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        toast.success("URL copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    // ── Delete files from Supabase Storage ──
    const deleteFiles = useCallback(async (names: string[]) => {
        try {
            const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileNames: names }),
            });
            if (!res.ok) throw new Error("Delete failed");
            setItems((prev) => prev.filter((item) => !names.includes(item.name)));
            toast.success(`${names.length} item${names.length > 1 ? "s" : ""} deleted`);
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Delete failed");
        }
    }, []);

    const deleteSelected = () => {
        const names = items.filter((item) => selected.has(item.id)).map((item) => item.name);
        deleteFiles(names);
        setSelected(new Set());
    };

    const deleteSingle = (item: MediaItem) => {
        deleteFiles([item.name]);
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const totalSize = items.reduce((sum, i) => sum + (Number(i.size) || 0), 0);
    const imageCount = items.filter((i) => i.type === "image").length;
    const videoCount = items.filter((i) => i.type === "video").length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold">Media Library</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Loading...</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse border border-white/10" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div {...fu(0)} className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Media Library</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {items.length} files · {formatBytes(totalSize)} used
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2 shadow-lg shadow-violet-500/30"
                    >
                        {uploading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
                        ) : (
                            <><Upload className="w-4 h-4" />Upload</>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div {...fu(0.05)} className="grid grid-cols-3 gap-4">
                {[
                    { label: "Images", value: imageCount, icon: ImageIcon, color: "text-violet-400" },
                    { label: "Videos", value: videoCount, icon: Film, color: "text-blue-400" },
                    { label: "Total Size", value: formatBytes(totalSize), icon: File, color: "text-amber-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="glass border-white/10">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-lg font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Drop zone */}
            <motion.div
                {...fu(0.1)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver
                    ? "border-violet-500/60 bg-violet-500/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/2"
                    }`}
            >
                <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${dragOver ? "text-violet-400" : "text-muted-foreground/50"}`} />
                <p className="text-sm font-medium text-muted-foreground">
                    {dragOver ? "Drop files to upload" : "Drag & drop files here, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">Supports images, videos, and documents</p>
            </motion.div>

            {/* Toolbar */}
            <motion.div {...fu(0.15)} className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                    {(["all", "image", "video", "document"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${typeFilter === t
                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground hover:text-foreground"}`}>
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground hover:text-foreground"}`}>
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Bulk delete */}
                {selected.size > 0 && (
                    <Button size="sm" variant="destructive" onClick={deleteSelected} className="gap-2">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete {selected.size}
                    </Button>
                )}
            </motion.div>

            {/* Grid View */}
            {viewMode === "grid" && (
                <motion.div {...fu(0.2)} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence>
                        {filtered.map((item) => {
                            const TypeIcon = typeIcon[item.type] ?? File;
                            const isSelected = selected.has(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${isSelected ? "border-violet-500/60 ring-2 ring-violet-500/30" : "border-white/10 hover:border-white/20"}`}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-square bg-white/5 flex items-center justify-center">
                                        {item.type === "image" && item.url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <TypeIcon className={`w-10 h-10 opacity-40 ${typeColor[item.type]?.split(" ")[0]}`} />
                                        )}
                                    </div>

                                    {/* Selection checkbox */}
                                    <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-violet-500 border-violet-500" : "border-white/40 bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                                            className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                                        >
                                            {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white" />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSingle(item); }}
                                            className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3 text-white" />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="p-2 border-t border-white/10 bg-black/20">
                                        <p className="text-xs font-medium truncate">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{formatBytes(Number(item.size) || 0)}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <motion.div {...fu(0.2)} className="space-y-2">
                    {filtered.map((item) => {
                        const TypeIcon = typeIcon[item.type] ?? File;
                        const isSelected = selected.has(item.id);
                        return (
                            <Card
                                key={item.id}
                                className={`glass border-white/10 hover:border-white/20 transition-all cursor-pointer ${isSelected ? "border-violet-500/40 bg-violet-500/5" : ""}`}
                                onClick={() => toggleSelect(item.id)}
                            >
                                <CardContent className="p-3 flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                        {item.type === "image" && item.url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <TypeIcon className={`w-5 h-5 opacity-60 ${typeColor[item.type]?.split(" ")[0]}`} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge className={`text-[10px] border ${typeColor[item.type]}`}>{item.type}</Badge>
                                            <span className="text-xs text-muted-foreground">{formatBytes(Number(item.size) || 0)}</span>
                                        </div>
                                    </div>

                                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.created_at)}</span>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSingle(item); }}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </motion.div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
                <motion.div {...fu(0.2)} className="text-center py-16">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">No files found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {search ? `No results for "${search}"` : "Upload your first file to get started"}
                    </p>
                    {!search && (
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-violet-600 to-purple-600 gap-2">
                            <Plus className="w-4 h-4" />Upload Files
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
