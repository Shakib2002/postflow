"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

export default function PrivacyPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
                <motion.div {...fv()} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <Shield className="w-3 h-3" /> Security First
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">Privacy <span className="gradient-text">Policy</span></h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Last updated: February 23, 2026. We value your privacy and are committed to protecting your personal data.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    <motion.section {...fv(0.1)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-violet-400" />
                            </div>
                            <h2 className="text-xl font-bold">1. Information We Collect</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                When you use PostFlow, we collect information that you provide directly to us, such as when you create an account, connect social media profiles, or contact our support team.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account Data:</strong> Name, email address, and billing information.</li>
                                <li><strong>Social Graphics:</strong> Access tokens for platforms like LinkedIn, Twitter, Facebook, and Instagram.</li>
                                <li><strong>Analytics:</strong> Usage data, IP address, and browser information through PostHog and Sentry.</li>
                            </ul>
                        </div>
                    </motion.section>

                    <motion.section {...fv(0.2)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold">2. How We Use Information</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We use the collected information to provide, maintain, and improve our services, including:
                        </p>
                        <ul className="mt-4 list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Scheduling and publishing your social media posts.</li>
                            <li>Processing payments and managing subscriptions via Stripe.</li>
                            <li>Sending technical notices, updates, and security alerts.</li>
                            <li>Personalizing your experience with AI-powered content generation.</li>
                        </ul>
                    </motion.section>

                    <motion.section {...fv(0.3)} className="glass border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold">3. Data Security</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement a variety of security measures to maintain the safety of your personal information. Your tokens are encrypted at rest using industry-standard AES-256 encryption. We never store your social media passwords.
                        </p>
                    </motion.section>

                    <motion.div {...fv(0.4)} className="text-center pt-8">
                        <p className="text-sm text-muted-foreground">
                            Questions about our policy? Contact us at <a href="mailto:privacy@postflow.io" className="text-violet-400 hover:underline">privacy@postflow.io</a>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
