"use client";

import { motion } from "framer-motion";
import { Scale, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

export default function TermsPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
                <motion.div {...fv()} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <Scale className="w-3 h-3" /> Legal Agreement
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">Terms of <span className="gradient-text">Service</span></h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        By using PostFlow, you agree to these terms. Please read them carefully to understand your rights and obligations.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    <motion.section {...fv(0.1)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                            </div>
                            <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                        </p>
                    </motion.section>

                    <motion.section {...fv(0.2)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold">2. Subscriptions and Billing</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Free Trial:</strong> We offer a 14-day free trial. No credit card is required to start.</li>
                                <li><strong>Cancellation:</strong> You can cancel your subscription at any time through your billing portal.</li>
                                <li><strong>Refunds:</strong> Refunds are handled on a case-by-case basis at our discretion.</li>
                            </ul>
                        </div>
                    </motion.section>

                    <motion.section {...fv(0.3)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>
                            <h2 className="text-xl font-bold">3. Prohibited Content</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for all content published through your account. You may not use PostFlow to distribute spam, malware, or content that violates the terms of the social platforms you connect to.
                        </p>
                    </motion.section>

                    <motion.section {...fv(0.4)} className="glass border-white/5 p-8 rounded-3xl">
                        <h2 className="text-xl font-bold mb-4">4. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            PostFlow is provided "as is". We are not liable for any downtime, lost engagement, or platform-side bans resulting from your use of the service.
                        </p>
                    </motion.section>

                    <motion.div {...fv(0.5)} className="text-center pt-8">
                        <p className="text-sm text-muted-foreground">
                            Last updated: February 23, 2026.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
