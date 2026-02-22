"use client";

import { motion } from "framer-motion";
import { Users, Target, Rocket, Heart } from "lucide-react";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

export default function AboutPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
                <motion.div {...fv()} className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <Users className="w-3 h-3" /> Our Story
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-8">Built for the <br /><span className="gradient-text">Future of Social.</span></h1>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                        We started PostFlow in 2024 with a simple mission: to give creators and teams their time back through intelligent, unified social media automation.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 mb-24">
                    <motion.div {...fv(0.1)} className="glass border-white/5 p-8 rounded-[2rem] space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To democratize high-level social media management by providing enterprise-grade tools to teams of all sizes. We believe automation should feel human, not robotic.
                        </p>
                    </motion.div>
                    <motion.div {...fv(0.2)} className="glass border-white/5 p-8 rounded-[2rem] space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Our Vision</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A world where social media doesn't feel like a chore. Where brands can connect with their audience across every platform seamlessly and authentically.
                        </p>
                    </motion.div>
                </div>

                <motion.div {...fv(0.3)} className="text-center bg-white/[0.02] border border-white/5 p-12 rounded-[3rem]">
                    <Heart className="w-12 h-12 text-pink-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Remote-First, Global-Impact</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        Our team is spread across 5 countries, working together to build the next generation of social tools. We're proud to be independent and self-funded.
                    </p>
                    <div className="flex justify-center flex-wrap gap-8 text-white/40 font-bold uppercase tracking-[0.2em] text-sm">
                        <span>San Francisco</span>
                        <span>London</span>
                        <span>Berlin</span>
                        <span>Tokyo</span>
                        <span>New York</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
