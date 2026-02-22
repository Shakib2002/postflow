"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

const fv = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
});

const posts = [
    {
        title: "The Ultimate Guide to Social Media Automation in 2026",
        slug: "social-media-automation-guide-2026",
        category: "Strategy",
        author: "Alex Rivera",
        authorRole: "Head of Strategy",
        date: "Feb 15, 2026",
        readTime: "8 min",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200",
        content: `
            <p>Social media has evolved from a simple networking tool into a complex ecosystem of algorithms, trends, and content types. For creators and businesses alike, keeping up can feel like a full-time job.</p>
            <h2>The Problem with Manual Posting</h2>
            <p>Manual posting is not just time-consuming; it's inefficient. Content creators often find themselves rushing to post at peak times, leading to inconsistent quality and "burnout."</p>
            <h2>Enter Intelligent Automation</h2>
            <p>True automation isn't just about scheduling; it's about context. It's about understanding that a post on Twitter needs a different tone than a deep-dive on LinkedIn.</p>
            <blockquote>"The goal of automation isn't to replace the human voice, but to amplify it."</blockquote>
        `
    },
    {
        title: "How AI is changing the way we write LinkedIn posts",
        slug: "ai-linkedin-post-writing",
        category: "AI",
        author: "Sarah Chen",
        authorRole: "AI Research Lead",
        date: "Feb 12, 2026",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
        content: `
            <p>AI isn't just a buzzword; it's the most powerful tool in a content marketer's arsenal today. But using it correctly is an art form.</p>
            <h2>Prompts that Convert</h2>
            <p>Generic prompts yield generic results. To stand out on LinkedIn, you need to provide the AI with your brand voice, target audience, and specific goals.</p>
            <h2>The "Human in the Loop" Model</h2>
            <p>We believe the best content is 70% AI-generated and 30% human-polished. This ensures speed without sacrificing authenticity.</p>
        `
    },
    {
        title: "PostFlow vs. The World: Why we built a better Buffer",
        slug: "postflow-vs-competitors",
        category: "Product",
        author: "Marcus Thorne",
        authorRole: "Product Lead",
        date: "Feb 10, 2026",
        readTime: "6 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        content: `
            <p>The world didn't need another social media scheduler. It needed a social media <i>workflow</i> engine. That's why we built PostFlow.</p>
            <h2>Beyond the Queue</h2>
            <p>Most tools focus on the queue. We focus on the creation, the approval, and the iteration. Our multi-workspace support and lead-gen funnels are built for teams, not just individuals.</p>
        `
    },
    {
        title: "5 Lead Gen Hacks for Instagram Business",
        slug: "instagram-lead-gen-hacks",
        category: "Growth",
        author: "Emma White",
        authorRole: "Growth Specialist",
        date: "Feb 08, 2026",
        readTime: "4 min",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1200",
        content: `
            <p>Instagram is a goldmine for leads, but only if you're proactive. Most businesses wait for DMs; PostFlow users automate the outreach.</p>
            <h2>Automation Triggers</h2>
            <p>Setting up auto-replies for specific keywords in comments is the fastest way to build a warm lead list while you sleep.</p>
        `
    }
];

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = posts.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
                <motion.div {...fv()}>
                    <Link href="/blog">
                        <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-violet-400 gap-2 font-bold">
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">{post.category}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime} read</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between mb-12 py-6 border-y border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center font-bold text-lg text-violet-400 border border-violet-500/20">
                                {post.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="font-bold text-white leading-tight">{post.author}</p>
                                <p className="text-white/40 text-xs mt-1">{post.authorRole} • {post.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:border-violet-500/50">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div {...fv(0.1)} className="mb-16">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full aspect-video md:aspect-[21/9] object-cover rounded-[2.5rem] shadow-2xl shadow-violet-500/10 border border-white/5"
                    />
                </motion.div>

                <motion.article {...fv(0.2)} className="prose prose-invert prose-violet max-w-none">
                    <div
                        className="text-white/80 text-lg leading-relaxed space-y-6 blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </motion.article>

                <motion.div {...fv(0.3)} className="mt-20 pt-12 border-t border-white/10">
                    <div className="glass border-violet-500/20 bg-violet-500/5 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold mb-2">Want more insights?</h3>
                            <p className="text-muted-foreground">Join our newsletter to stay updated on the latest in AI and social media.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="h-12 flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-violet-500/50"
                            />
                            <Button className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold whitespace-nowrap">
                                Join now
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
