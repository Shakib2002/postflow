"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
    onCtaClick?: () => void;
    secondaryLabel?: string;
    secondaryHref?: string;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    ctaLabel,
    ctaHref,
    onCtaClick,
    secondaryLabel,
    secondaryHref,
    className = "",
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center text-center py-20 px-6 ${className}`}
        >
            {/* Icon glow container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full scale-150" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Icon className="w-9 h-9 text-violet-400" />
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                {ctaLabel && (
                    ctaHref ? (
                        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90">
                            <Link href={ctaHref}>{ctaLabel}</Link>
                        </Button>
                    ) : (
                        <Button
                            onClick={onCtaClick}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
                        >
                            {ctaLabel}
                        </Button>
                    )
                )}
                {secondaryLabel && secondaryHref && (
                    <Button asChild variant="outline" className="border-white/20">
                        <Link href={secondaryHref}>{secondaryLabel}</Link>
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
