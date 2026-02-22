"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Upload, Download, FileText, CheckCircle2, AlertCircle,
    Clock, Loader2, Linkedin, Facebook, Twitter, Instagram,
    X, ChevronDown, Info,
} from "lucide-react";

interface CSVRow {
    content: string;
    platform: string;
    scheduled_at: string;
    status?: "pending" | "success" | "error";
    error?: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
    linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram,
};
const PLATFORM_COLORS: Record<string, string> = {
    linkedin: "#0A66C2", facebook: "#1877F2", twitter: "#6b7280", instagram: "#E4405F",
};

const CSV_TEMPLATE = `content,platform,scheduled_at
"Excited to share our latest product update! 🚀 We've just launched a brand new feature that will save you hours every week. Check it out →",linkedin,2025-03-01 09:00
"Big news from our team! We've been working hard behind the scenes... and we're finally ready to share. Stay tuned for more. 🎉",facebook,2025-03-01 10:00
"We just shipped something huge. Here's why it matters for your workflow 🧵👇",twitter,2025-03-01 11:00
"Behind the scenes of our latest product launch ✨ Swipe to see what's new!",instagram,2025-03-02 09:00`;

function parseCsv(csv: string): CSVRow[] {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    // Skip header row; handle quoted fields
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV parser that handles quotes
        const fields: string[] = [];
        let current = "";
        let inQuote = false;
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            if (ch === '"' && !inQuote) { inQuote = true; continue; }
            if (ch === '"' && inQuote) { inQuote = false; continue; }
            if (ch === "," && !inQuote) { fields.push(current); current = ""; continue; }
            current += ch;
        }
        fields.push(current);
        if (fields.length >= 3) {
            rows.push({ content: fields[0], platform: fields[1].toLowerCase().trim(), scheduled_at: fields[2].trim() });
        }
    }
    return rows;
}

export default function BulkScheduleClient({ workspaceId }: { workspaceId: string }) {
    const [rows, setRows] = useState<CSVRow[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (!file.name.endsWith(".csv")) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsed = parseCsv(text);
            setRows(parsed.map((r) => ({ ...r, status: "pending" })));
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "postflow-bulk-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!rows.length) return;
        setIsUploading(true);
        setProgress(0);
        const updated = [...rows];

        for (let i = 0; i < updated.length; i++) {
            try {
                const res = await fetch("/api/posts/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        posts: [{ content: updated[i].content, platform: updated[i].platform, scheduled_at: updated[i].scheduled_at }],
                        workspaceId,
                    }),
                });
                updated[i].status = res.ok ? "success" : "error";
                if (!res.ok) updated[i].error = "Failed to schedule";
            } catch {
                updated[i].status = "error";
                updated[i].error = "Network error";
            }
            setRows([...updated]);
            setProgress(Math.round(((i + 1) / updated.length) * 100));
            // small delay to not overwhelm the API
            if (i < updated.length - 1) await new Promise((r) => setTimeout(r, 200));
        }
        setIsUploading(false);
    };

    const successCount = rows.filter((r) => r.status === "success").length;
    const errorCount = rows.filter((r) => r.status === "error").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Bulk Schedule</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Upload a CSV to schedule dozens of posts at once
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-white/20 gap-2"
                    onClick={downloadTemplate}
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </Button>
            </div>

            {/* Instructions */}
            <Card className="glass border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="font-medium text-blue-400">CSV Format</p>
                            <p>Your CSV must have 3 columns: <code className="bg-white/10 px-1 rounded text-xs">content</code>, <code className="bg-white/10 px-1 rounded text-xs">platform</code>, <code className="bg-white/10 px-1 rounded text-xs">scheduled_at</code></p>
                            <p>Platform must be: <span className="text-foreground/70">linkedin, facebook, twitter, instagram</span></p>
                            <p>Date format: <span className="text-foreground/70">YYYY-MM-DD HH:MM</span> (24h, UTC)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Drop Zone */}
            {rows.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/20 hover:border-violet-500/50 hover:bg-white/5"
                        }`}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Drop your CSV here</p>
                            <p className="text-muted-foreground text-sm mt-1">or click to browse</p>
                        </div>
                        <Badge className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/20">
                            .csv files only
                        </Badge>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                    />
                </motion.div>
            )}

            {/* Preview Table */}
            <AnimatePresence>
                {rows.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* File Info Bar */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{fileName}</span>
                                <Badge className="text-xs bg-white/10 text-foreground/70">
                                    {rows.length} posts
                                </Badge>
                            </div>
                            <button
                                onClick={() => { setRows([]); setFileName(""); setProgress(0); }}
                                className="text-muted-foreground hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        {isUploading && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Scheduling posts...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary (after upload) */}
                        {!isUploading && (successCount + errorCount) > 0 && (
                            <div className="flex gap-3">
                                {successCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm text-green-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {successCount} scheduled
                                    </div>
                                )}
                                {errorCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorCount} failed
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        <Card className="glass border-white/10 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled At</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => {
                                            const PlatIcon = PLATFORM_ICONS[row.platform] ?? FileText;
                                            const color = PLATFORM_COLORS[row.platform] ?? "#6b7280";
                                            return (
                                                <motion.tr
                                                    key={i}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <PlatIcon className="w-4 h-4" style={{ color }} />
                                                            <span className="capitalize">{row.platform}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="max-w-xs truncate text-muted-foreground">{row.content}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.scheduled_at}</td>
                                                    <td className="px-4 py-3">
                                                        {row.status === "pending" && <Clock className="w-4 h-4 text-muted-foreground" />}
                                                        {row.status === "success" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                                        {row.status === "error" && (
                                                            <div className="flex items-center gap-1 text-red-400">
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="text-xs">{row.error}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* CTA */}
                        {!isUploading && successCount === 0 && (
                            <Button
                                onClick={handleUpload}
                                disabled={rows.length === 0}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 gap-2 h-11"
                            >
                                <Upload className="w-4 h-4" />
                                Schedule All {rows.length} Posts
                            </Button>
                        )}
                        {isUploading && (
                            <Button disabled className="w-full h-11 gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Scheduling...
                            </Button>
                        )}
                        {!isUploading && successCount === rows.length && rows.length > 0 && (
                            <div className="flex items-center justify-center gap-2 py-4 text-green-400 font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                All {rows.length} posts scheduled successfully!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
