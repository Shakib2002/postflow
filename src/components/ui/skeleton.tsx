import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-white/8",
                className
            )}
        />
    );
}

// ── Reusable skeleton shapes ──────────────────────────────────

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border border-white/10 p-5 space-y-4", className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonStat({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border border-white/10 p-5 space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 px-5 py-3 border-b border-white/10 bg-white/3">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-3 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} className={cn("h-4 flex-1", j === 0 ? "w-1/3" : "")} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonChart({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border border-white/10 p-5", className)}>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex items-end gap-2 h-40">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonPostCard() {
    return (
        <div className="rounded-xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full ml-auto" />
            </div>
            <SkeletonText lines={3} />
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <SkeletonStat key={i} />)}
            </div>
            {/* Chart */}
            <SkeletonChart />
            {/* Recent posts */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                {[1, 2, 3].map((i) => <SkeletonPostCard key={i} />)}
            </div>
        </div>
    );
}
