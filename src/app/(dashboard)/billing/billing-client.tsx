"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle, Zap, Crown, ArrowRight, ExternalLink,
    CreditCard, Calendar, AlertTriangle, TrendingUp, Users, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { PLANS, PlanKey } from "@/lib/stripe";

interface Subscription {
    plan: string;
    status: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    stripe_customer_id?: string;
}

interface Usage {
    postsThisMonth: number;
    teamMemberCount: number;
    socialAccountCount: number;
}

interface Props {
    subscription: Subscription | null;
    currentPlan: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    planConfig: any;
    usage: Usage;
}

const planOrder: PlanKey[] = ["starter", "pro", "agency"];

const planColors = {
    starter: { gradient: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/20", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    pro: { gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    agency: { gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    past_due: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function UsageMeter({ label, used, limit, icon: Icon }: { label: string; used: number; limit: number; icon: React.ElementType }) {
    const isUnlimited = limit === -1;
    const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const isWarning = !isUnlimited && pct >= 80;
    const isOver = !isUnlimited && pct >= 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    {label}
                </div>
                <span className={isOver ? "text-red-400 font-medium" : isWarning ? "text-amber-400 font-medium" : ""}>
                    {used} / {isUnlimited ? "∞" : limit}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-violet-500"}`}
                    />
                </div>
            )}
        </div>
    );
}

export function BillingClient({ subscription, currentPlan, planConfig, usage }: Props) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);

    const handleUpgrade = async (plan: PlanKey) => {
        setLoadingPlan(plan);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create checkout");
            if (data.url) window.location.href = data.url;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to start checkout");
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleManageBilling = async () => {
        setLoadingPortal(true);
        try {
            const res = await fetch("/api/billing/portal", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to open portal");
            if (data.url) window.open(data.url, "_blank");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    };

    const isActivePlan = (plan: string) => currentPlan === plan && subscription?.status === "active";
    const isTrial = subscription?.status === "trialing";
    const isPastDue = subscription?.status === "past_due";
    const periodEnd = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    const currentLimits = planConfig?.limits ?? { socialAccounts: 0, postsPerMonth: 0, teamMembers: 0 };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-1">Billing</h1>
                <p className="text-muted-foreground">Manage your subscription and usage</p>
            </motion.div>

            {/* Alerts */}
            {isPastDue && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-medium">Payment failed</p>
                        <p className="text-sm opacity-80">Please update your payment method to avoid service interruption.</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleManageBilling}
                        className="ml-auto bg-red-500 hover:bg-red-400 text-white"
                    >
                        Fix Now
                    </Button>
                </motion.div>
            )}

            {/* Current Plan Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="w-5 h-5 text-violet-400" />
                            Current Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planColors[currentPlan as keyof typeof planColors]?.gradient ?? "from-gray-500 to-gray-600"} flex items-center justify-center shadow-lg`}>
                                    {currentPlan === "agency" ? <Crown className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold capitalize">{currentPlan === "free" ? "Free" : planConfig?.name ?? currentPlan}</h3>
                                        {subscription?.status && (
                                            <Badge className={`text-xs ${statusColors[subscription.status] ?? ""}`}>
                                                {isTrial ? "Trial" : subscription.status}
                                            </Badge>
                                        )}
                                    </div>
                                    {currentPlan !== "free" && planConfig && (
                                        <p className="text-muted-foreground text-sm">${planConfig.price}/month</p>
                                    )}
                                    {periodEnd && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {subscription?.cancel_at_period_end
                                                ? `Cancels on ${periodEnd}`
                                                : isTrial
                                                    ? `Trial ends ${periodEnd}`
                                                    : `Renews ${periodEnd}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {subscription?.stripe_customer_id && (
                                <Button
                                    variant="outline"
                                    className="border-white/20 gap-2"
                                    onClick={handleManageBilling}
                                    disabled={loadingPortal}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {loadingPortal ? "Opening..." : "Manage Billing"}
                                </Button>
                            )}
                        </div>

                        {/* Usage meters */}
                        {currentPlan !== "free" && planConfig && (
                            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                                <h4 className="text-sm font-medium text-muted-foreground">Usage this month</h4>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <UsageMeter
                                        label="Posts"
                                        used={usage.postsThisMonth}
                                        limit={currentLimits.postsPerMonth}
                                        icon={TrendingUp}
                                    />
                                    <UsageMeter
                                        label="Team Members"
                                        used={usage.teamMemberCount}
                                        limit={currentLimits.teamMembers}
                                        icon={Users}
                                    />
                                    <UsageMeter
                                        label="Social Accounts"
                                        used={usage.socialAccountCount}
                                        limit={currentLimits.socialAccounts}
                                        icon={Globe}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Plan Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xl font-bold mb-4">Available Plans</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {planOrder.map((planKey, i) => {
                        const plan = PLANS[planKey];
                        const colors = planColors[planKey];
                        const isCurrent = isActivePlan(planKey);
                        const isPopular = planKey === "pro";
                        const isDowngrade = planOrder.indexOf(planKey) < planOrder.indexOf(currentPlan as PlanKey);

                        return (
                            <motion.div
                                key={planKey}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.08 }}
                            >
                                <Card className={`relative h-full transition-all duration-300 ${isCurrent
                                    ? `border-2 border-violet-500/50 shadow-xl ${colors.glow}`
                                    : "glass border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl"
                                    }`}>
                                    {isPopular && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
                                                Current Plan
                                            </Badge>
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                            {planKey === "agency" ? <Crown className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground text-sm">/mo</span>
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                                    <span className="text-muted-foreground">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className={`w-full gap-2 ${isCurrent
                                                ? "bg-white/5 border border-white/10 text-muted-foreground cursor-default"
                                                : `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg`
                                                }`}
                                            disabled={isCurrent || loadingPlan === planKey}
                                            onClick={() => !isCurrent && handleUpgrade(planKey)}
                                        >
                                            {isCurrent ? (
                                                "Current Plan"
                                            ) : loadingPlan === planKey ? (
                                                "Loading..."
                                            ) : isDowngrade ? (
                                                "Downgrade"
                                            ) : (
                                                <>
                                                    {currentPlan === "free" ? "Start Free Trial" : "Upgrade"}
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    All plans include a 14-day free trial · No credit card required · Cancel anytime
                </p>
            </motion.div>

            {/* FAQ */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass border-white/10">
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                        <div className="grid sm:grid-cols-2 gap-6 text-sm">
                            {[
                                { q: "Can I change plans anytime?", a: "Yes, upgrade or downgrade at any time. Changes take effect immediately." },
                                { q: "What happens when I hit my limit?", a: "We'll notify you at 80% usage. You can upgrade or wait for the next billing cycle." },
                                { q: "Is there a free trial?", a: "All paid plans include a 14-day free trial. No credit card required to start." },
                                { q: "How do I cancel?", a: "Cancel anytime from the billing portal. You'll keep access until the end of your billing period." },
                            ].map((item) => (
                                <div key={item.q}>
                                    <p className="font-medium mb-1">{item.q}</p>
                                    <p className="text-muted-foreground text-xs leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
