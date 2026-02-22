"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

const posts = [
    {
        title: "The Ultimate Guide to Social Media Automation in 2026",
        excerpt: "Learn how to save 10+ hours a week by automating your content strategy without losing your brand voice.",
        category: "Strategy",
        author: "Alex Rivera",
        date: "Feb 15, 2026",
        readTime: "8 min",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
        featured: true,
        slug: "social-media-automation-guide-2026"
    },
    {
        title: "How AI is changing the way we write LinkedIn posts",
        excerpt: "Discover the best prompts for Gemini to generate high-engagement professional content that actually converts.",
        category: "AI",
        author: "Sarah Chen",
        date: "Feb 12, 2026",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        slug: "ai-linkedin-post-writing"
    },
    {
        title: "PostFlow vs. The World: Why we built a better Buffer",
        excerpt: "A deep dive into the features that set us apart from legacy social media management tools in a multi-platform age.",
        category: "Product",
        author: "Marcus Thorne",
        date: "Feb 10, 2026",
        readTime: "6 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        slug: "postflow-vs-competitors"
    },
    {
        title: "5 Lead Gen Hacks for Instagram Business",
        excerpt: "Turn your comments into customers with these proven auto-reply strategies and DM funnel optimizations.",
        category: "Growth",
        author: "Emma White",
        date: "Feb 08, 2026",
        readTime: "4 min",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=800",
        slug: "instagram-lead-gen-hacks"
    }
];

export default function BlogPage() {
    const featured = posts.find(p => p.featured);
    const recent = posts.filter(p => !p.featured);

    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div {...fv()} className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <BookOpen className="w-3 h-3" /> The PostFlow Blog
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">Latest <span className="gradient-text">Insights</span></h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Expert advice on social media growth, AI automation, and building a digital brand.
                    </p>
                </motion.div>

                {/* Featured Post */}
                {featured && (
                    <motion.div {...fv(0.1)} className="group mb-20">
                        <Link href={`/blog/${featured.slug}`}>
                            <div className="grid md:grid-cols-2 gap-8 items-center glass border-white/10 rounded-[2.5rem] overflow-hidden p-4 md:p-8 hover:bg-white/[0.04] transition-all group cursor-pointer">
                                <div className="aspect-[16/10] md:aspect-square rounded-2xl bg-zinc-900 relative overflow-hidden">
                                    <img
                                        src={featured.image}
                                        alt={featured.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">{featured.category}</span>
                                        <span className="text-white/20">•</span>
                                        <span className="text-muted-foreground text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readTime} read</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black group-hover:text-violet-400 transition-colors leading-tight">
                                        {featured.title}
                                    </h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {featured.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center font-bold text-sm border border-violet-500/20">{featured.author.split(' ').map(n => n[0]).join('')}</div>
                                            <div>
                                                <p className="font-bold text-sm">{featured.author}</p>
                                                <p className="text-white/30 text-xs">{featured.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-violet-400 font-bold group-hover:gap-3 transition-all">
                                            Read Article <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Recent Posts Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {recent.map((post, i) => (
                        <motion.div key={post.title} {...fv(0.2 + i * 0.1)} className="group">
                            <Link href={`/blog/${post.slug}`}>
                                <div className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.03] transition-all flex flex-col h-full border hover:border-violet-500/20 group cursor-pointer">
                                    <div className="aspect-[16/10] bg-zinc-900 relative overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    </div>
                                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{post.category}</span>
                                            <span className="text-white/20 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-violet-400 transition-colors leading-snug">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs text-white/30 font-medium">{post.date}</span>
                                            <div className="flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-white transition-colors">
                                                Read More <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter */}
                <motion.div {...fv(0.5)} className="glass border-violet-500/20 bg-violet-500/5 rounded-[2.5rem] p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl shadow-violet-500/10">
                    <h2 className="text-3xl font-black mb-4">Stay ahead of the <span className="gradient-text">curve</span></h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                        Join 5,000+ marketers and get our weekly newsletter on social media automation hacks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="you@company.com"
                            className="h-12 flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-violet-500/50"
                        />
                        <Button className="h-12 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold px-8 shadow-lg shadow-violet-500/20">
                            Subscribe
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
