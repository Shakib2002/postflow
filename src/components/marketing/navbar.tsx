"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X, Rocket } from "lucide-react";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3 bg-black/60 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/50" : "py-5 bg-transparent"}`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                            <Zap className="w-5 h-5 text-white" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            PostFlow
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link key={link.label} href={link.href}
                                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200">
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/25 rounded-full px-5 transition-all hover:scale-105">
                                Get Started Free <Rocket className="ml-1.5 w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                        {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden mt-4 pb-4 border-t border-white/8">
                            <div className="pt-4 flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                                        className="px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition">
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="flex gap-2 pt-3">
                                    <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full border-white/10 text-white/70 bg-transparent">Sign In</Button></Link>
                                    <Link href="/signup" className="flex-1"><Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">Start Free</Button></Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}

