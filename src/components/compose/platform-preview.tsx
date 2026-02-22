"use client";

import { Linkedin, Facebook, Twitter, Instagram, Heart, MessageCircle, Repeat2, Bookmark, ThumbsUp, Share2, Globe } from "lucide-react";

interface PlatformPreviewProps {
    platform: string;
    content: string;
    authorName?: string;
    authorHandle?: string;
    mediaUrl?: string;
}

const platformConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    linkedin: { color: "#0A66C2", bg: "#f3f6f8", icon: Linkedin, label: "LinkedIn" },
    facebook: { color: "#1877F2", bg: "#f0f2f5", icon: Facebook, label: "Facebook" },
    twitter: { color: "#000000", bg: "#ffffff", icon: Twitter, label: "X (Twitter)" },
    instagram: { color: "#E4405F", bg: "#fafafa", icon: Instagram, label: "Instagram" },
};

function LinkedInPreview({ content, authorName, authorHandle }: { content: string; authorName: string; authorHandle: string }) {
    return (
        <div className="rounded-xl border border-[#e0e0e0] bg-white text-[#191919] overflow-hidden font-sans shadow-sm">
            {/* Header */}
            <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {authorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#191919]">{authorName}</p>
                    <p className="text-xs text-[#666666]">{authorHandle}</p>
                    <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5">
                        Just now · <Globe className="w-3 h-3" />
                    </p>
                </div>
            </div>
            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-sm text-[#191919] whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-[#999]">Your post preview will appear here...</span>}
                </p>
            </div>
            {/* Reactions */}
            {content && (
                <div className="border-t border-[#e0e0e0] px-4 py-2 flex items-center gap-1">
                    <span className="text-xs text-[#666666]">👍 ❤️ 💡</span>
                    <span className="text-xs text-[#666666] ml-1">24 reactions · 3 comments</span>
                </div>
            )}
            {content && (
                <div className="border-t border-[#e0e0e0] px-2 py-1 flex items-center justify-around">
                    {[
                        { icon: ThumbsUp, label: "Like" },
                        { icon: MessageCircle, label: "Comment" },
                        { icon: Repeat2, label: "Repost" },
                        { icon: Share2, label: "Send" },
                    ].map(({ icon: Icon, label }) => (
                        <button key={label} className="flex items-center gap-1.5 px-3 py-2 rounded hover:bg-[#f3f6f8] transition-colors">
                            <Icon className="w-4 h-4 text-[#666666]" />
                            <span className="text-xs text-[#666666] font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function TwitterPreview({ content, authorName, authorHandle }: { content: string; authorName: string; authorHandle: string }) {
    const charCount = content.length;
    const isOver = charCount > 280;
    return (
        <div className="rounded-xl border border-[#2f3336] bg-[#000000] text-white overflow-hidden font-sans">
            <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {authorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <p className="font-bold text-sm">{authorName}</p>
                        <p className="text-sm text-[#71767b]">@{authorHandle} · now</p>
                    </div>
                    <p className={`text-sm mt-1 whitespace-pre-wrap leading-relaxed ${isOver ? "text-red-400" : ""}`}>
                        {content || <span className="text-[#71767b]">Your tweet preview will appear here...</span>}
                    </p>
                    {isOver && (
                        <p className="text-xs text-red-400 mt-1">Over 280 character limit ({charCount}/280)</p>
                    )}
                    {content && (
                        <div className="flex items-center gap-6 mt-3">
                            {[
                                { icon: MessageCircle, count: "3" },
                                { icon: Repeat2, count: "12" },
                                { icon: Heart, count: "47" },
                                { icon: Bookmark, count: "" },
                            ].map(({ icon: Icon, count }, i) => (
                                <button key={i} className="flex items-center gap-1.5 text-[#71767b] hover:text-blue-400 transition-colors">
                                    <Icon className="w-4 h-4" />
                                    {count && <span className="text-xs">{count}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FacebookPreview({ content, authorName }: { content: string; authorName: string }) {
    return (
        <div className="rounded-xl border border-[#dddfe2] bg-white text-[#1c1e21] overflow-hidden font-sans shadow-sm">
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {authorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-sm">{authorName}</p>
                    <p className="text-xs text-[#65676b] flex items-center gap-1">Just now · <Globe className="w-3 h-3" /></p>
                </div>
            </div>
            <div className="px-4 pb-4">
                <p className="text-sm text-[#1c1e21] whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-[#999]">Your post preview will appear here...</span>}
                </p>
            </div>
            {content && (
                <>
                    <div className="border-t border-[#dddfe2] px-4 py-2 flex items-center justify-between">
                        <span className="text-xs text-[#65676b]">👍 ❤️ 😮  18</span>
                        <span className="text-xs text-[#65676b]">4 comments · 2 shares</span>
                    </div>
                    <div className="border-t border-[#dddfe2] px-2 py-1 flex items-center justify-around">
                        {[
                            { icon: ThumbsUp, label: "Like" },
                            { icon: MessageCircle, label: "Comment" },
                            { icon: Share2, label: "Share" },
                        ].map(({ icon: Icon, label }) => (
                            <button key={label} className="flex items-center gap-1.5 px-4 py-2 rounded hover:bg-[#f0f2f5] transition-colors">
                                <Icon className="w-4 h-4 text-[#65676b]" />
                                <span className="text-sm text-[#65676b] font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function InstagramPreview({ content, authorName, authorHandle }: { content: string; authorName: string; authorHandle: string }) {
    return (
        <div className="rounded-xl border border-[#dbdbdb] bg-white text-[#262626] overflow-hidden font-sans">
            <div className="p-3 flex items-center gap-3 border-b border-[#dbdbdb]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {authorName.slice(0, 2).toUpperCase()}
                    </div>
                </div>
                <p className="font-semibold text-sm">{authorHandle}</p>
            </div>
            <div className="bg-[#f5f5f5] h-48 flex items-center justify-center">
                <Instagram className="w-12 h-12 text-[#dbdbdb]" />
            </div>
            <div className="p-3">
                <div className="flex items-center gap-4 mb-2">
                    <Heart className="w-6 h-6" />
                    <MessageCircle className="w-6 h-6" />
                    <Share2 className="w-6 h-6" />
                    <Bookmark className="w-6 h-6 ml-auto" />
                </div>
                <p className="text-sm font-semibold mb-1">47 likes</p>
                <p className="text-sm">
                    <span className="font-semibold">{authorHandle}</span>{" "}
                    {content ? (
                        <span className="whitespace-pre-wrap">{content.slice(0, 125)}{content.length > 125 ? "... more" : ""}</span>
                    ) : (
                        <span className="text-[#999]">Your caption will appear here...</span>
                    )}
                </p>
            </div>
        </div>
    );
}

export function PlatformPreview({ platform, content, authorName = "PostFlow User", authorHandle = "postflow_user" }: PlatformPreviewProps) {
    switch (platform) {
        case "linkedin":
            return <LinkedInPreview content={content} authorName={authorName} authorHandle={authorHandle} />;
        case "twitter":
            return <TwitterPreview content={content} authorName={authorName} authorHandle={authorHandle} />;
        case "facebook":
            return <FacebookPreview content={content} authorName={authorName} />;
        case "instagram":
            return <InstagramPreview content={content} authorName={authorName} authorHandle={authorHandle} />;
        default:
            return <LinkedInPreview content={content} authorName={authorName} authorHandle={authorHandle} />;
    }
}
