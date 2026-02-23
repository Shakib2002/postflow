import Link from "next/link";
import { Zap, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/5 py-16 bg-[#06060f]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-6 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-white">PostFlow</span>
                        </Link>
                        <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-6 font-light">
                            The most powerful AI-first social media automation platform.
                            Schedule, publish, and grow your audience on autopilot.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: Twitter, href: "#", color: "hover:text-sky-400" },
                                { Icon: Linkedin, href: "#", color: "hover:text-blue-400" },
                                { Icon: Facebook, href: "#", color: "hover:text-blue-600" },
                                { Icon: Instagram, href: "#", color: "hover:text-pink-400" },
                            ].map((s, i) => (
                                <a key={i} href={s.href} className={`w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/30 transition-all ${s.color} hover:bg-white/5`}>
                                    <s.Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Product</h4>
                        <ul className="space-y-4">
                            {["Features", "Pricing", "Tutorials", "Changelog"].map(l => (
                                <li key={l}><Link href={`#${l.toLowerCase()}`} className="text-white/40 hover:text-white transition-colors text-sm font-light">{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Company</h4>
                        <ul className="space-y-4">
                            {["About", "Blog", "Careers", "Contact"].map(l => (
                                <li key={l}><Link href={`/${l.toLowerCase()}`} className="text-white/40 hover:text-white transition-colors text-sm font-light">{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-4">
                            {["Privacy", "Terms", "Security", "Cookies"].map(l => (
                                <li key={l}><Link href={`/${l.toLowerCase()}`} className="text-white/40 hover:text-white transition-colors text-sm font-light">{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/20">© 2026 PostFlow. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-emerald-400/60 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            All Systems Operational
                        </span>
                        <p className="text-sm text-white/20">Built with ❤️ for teams everywhere.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

