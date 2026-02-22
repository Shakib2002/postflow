"use client";

import { motion } from "framer-motion";
import { Briefcase, ArrowRight, Zap, Globe, Clock, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

const jobs = [
    { title: "Senior Fullstack Engineer", type: "Full-time", location: "Remote", team: "Product" },
    { title: "Product Designer", type: "Full-time", location: "Remote", team: "Design" },
    { title: "Growth Marketing Manager", type: "Full-time", location: "Remote", team: "Marketing" },
    { title: "Customer Success Lead", type: "Full-time", location: "Remote", team: "Success" },
];

export default function CareersPage() {
    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
                <motion.div {...fv()} className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <Briefcase className="w-3 h-3" /> Join Our Team
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-8">Build the <br /><span className="gradient-text">Future of Work.</span></h1>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to automate social media for every team. We're looking for ambitious, creative people to help us build what's next.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 mb-24">
                    {[
                        { icon: Globe, title: "100% Remote", desc: "Work from anywhere in the world. We value output over seat time." },
                        { icon: Zap, title: "Fast-Paced", desc: "We ship daily. Your work will have a real impact on users immediately." },
                        { icon: Coffee, title: "Flexible Hours", desc: "Manage your own time. We trust you to get the job done." },
                    ].map((item, i) => (
                        <motion.div key={item.title} {...fv(0.1 + i * 0.1)} className="glass border-white/5 p-8 rounded-3xl text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <item.icon className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-4">
                    <motion.h2 {...fv(0.4)} className="text-3xl font-bold mb-8">Open Roles</motion.h2>
                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <motion.div key={job.title} {...fv(0.5 + i * 0.1)} className="group glass border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-violet-500/30 transition-all cursor-pointer">
                                <div>
                                    <h3 className="font-black text-xl group-hover:text-violet-400 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {job.location}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/40">{job.team}</span>
                                    </div>
                                </div>
                                <Button className="rounded-xl group-hover:bg-violet-600 transition-all">
                                    Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
