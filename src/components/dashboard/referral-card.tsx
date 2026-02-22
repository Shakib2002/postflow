"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, CheckCircle2, Users, ExternalLink } from "lucide-react";

interface ReferralCardProps {
    userId: string;
    referralCount?: number;
}

export function ReferralCard({ userId, referralCount = 0 }: ReferralCardProps) {
    const [copied, setCopied] = useState(false);

    // Derive short ref code from userId
    const refCode = `PF-${userId.slice(0, 8).toUpperCase()}`;
    const refUrl = `${typeof window !== "undefined" ? window.location.origin : "https://postflow.io"}/signup?ref=${refCode}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(refUrl);
        } catch {
            // Fallback for non-HTTPS environments
            const el = document.createElement("textarea");
            el.value = refUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopied(true);
        posthog.capture("referral_link_copied", { ref_code: refCode, user_id: userId });
        setTimeout(() => setCopied(false), 2500);
    };

    const REWARD_PER_REFERRAL = 1; // month free per referral
    const monthsEarned = referralCount * REWARD_PER_REFERRAL;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="glass border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden relative">
                {/* Decorative glow */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Gift className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Refer & Earn</p>
                                <p className="text-xs text-muted-foreground">1 month free per referral</p>
                            </div>
                        </div>
                        {referralCount > 0 && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                {monthsEarned} mo earned
                            </Badge>
                        )}
                    </div>

                    {/* Stats row */}
                    {referralCount > 0 && (
                        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{referralCount} user{referralCount !== 1 ? "s" : ""} joined with your link</span>
                        </div>
                    )}

                    {/* Ref link */}
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                            {refUrl}
                        </div>
                        <Button
                            size="sm"
                            onClick={copyLink}
                            className={`shrink-0 gap-1.5 h-9 transition-all ${copied
                                ? "bg-green-600 hover:bg-green-500"
                                : "bg-amber-600 hover:bg-amber-500"
                                } text-white`}
                        >
                            {copied ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                            ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copy</>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2.5">
                        Share your link. When someone signs up and subscribes, you both get{" "}
                        <span className="text-amber-400 font-medium">1 month free</span>.
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
