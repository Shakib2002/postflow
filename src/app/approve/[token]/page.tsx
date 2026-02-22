"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ApprovalState = "loading" | "pending" | "submitting" | "approved" | "rejected" | "expired" | "error";

interface ApprovalData {
    id: string;
    post: {
        content: string;
        scheduled_at: string | null;
        post_platforms: Array<{ platform: string }>;
    };
    expires_at: string;
}

export default function ApprovePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const token = params.token as string;
    const autoAction = searchParams.get("action"); // "approve" | "reject" from email link

    const [state, setState] = useState<ApprovalState>("loading");
    const [approval, setApproval] = useState<ApprovalData | null>(null);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchApproval() {
            try {
                const res = await fetch(`/api/approvals/${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    if (res.status === 410) setState("expired");
                    else if (res.status === 409) setState(data.status as ApprovalState);
                    else setState("error");
                    setError(data.error ?? "Something went wrong");
                    return;
                }
                const data = await res.json();
                setApproval(data.approval);
                setState("pending");

                // Auto-action from email link
                if (autoAction === "approve" || autoAction === "reject") {
                    await handleAction(autoAction, data.approval);
                }
            } catch {
                setState("error");
                setError("Failed to load approval");
            }
        }
        fetchApproval();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function handleAction(action: "approve" | "reject", approvalData?: ApprovalData) {
        setState("submitting");
        try {
            const res = await fetch(`/api/approvals/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, feedback }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Action failed");
                setState("error");
                return;
            }
            setState(action === "approve" ? "approved" : "rejected");
        } catch {
            setError("Network error");
            setState("error");
        }
    }

    const platforms = approval?.post.post_platforms.map((p) => p.platform) ?? [];

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Logo */}
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">PostFlow</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    {/* Loading */}
                    {(state === "loading" || state === "submitting") && (
                        <div className="text-center py-8">
                            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
                            <p className="text-white/60">{state === "loading" ? "Loading approval..." : "Processing..."}</p>
                        </div>
                    )}

                    {/* Pending — show post + buttons */}
                    {state === "pending" && approval && (
                        <>
                            <h1 className="text-xl font-bold text-white mb-1">Post Approval Request</h1>
                            <p className="text-sm text-white/50 mb-6">Review and approve or reject this post</p>

                            {/* Platforms */}
                            <div className="flex gap-2 mb-4">
                                {platforms.map((p) => (
                                    <span key={p} className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 capitalize">
                                        {p}
                                    </span>
                                ))}
                            </div>

                            {/* Post content */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{approval.post.content}</p>
                            </div>

                            {/* Scheduled time */}
                            {approval.post.scheduled_at && (
                                <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                                    <Clock className="w-4 h-4" />
                                    Scheduled for {new Date(approval.post.scheduled_at).toLocaleString()}
                                </div>
                            )}

                            {/* Feedback */}
                            <Textarea
                                placeholder="Optional feedback or rejection reason..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-4 resize-none"
                                rows={3}
                            />

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleAction("approve")}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => handleAction("reject")}
                                    variant="outline"
                                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </Button>
                            </div>

                            <p className="text-xs text-white/30 text-center mt-4">
                                Expires {new Date(approval.expires_at).toLocaleString()}
                            </p>
                        </>
                    )}

                    {/* Approved */}
                    {state === "approved" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Post Approved! ✅</h2>
                            <p className="text-white/50 text-sm">The post has been approved and will be published as scheduled.</p>
                        </div>
                    )}

                    {/* Rejected */}
                    {state === "rejected" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Post Rejected</h2>
                            <p className="text-white/50 text-sm">The post has been rejected and moved back to drafts.</p>
                        </div>
                    )}

                    {/* Expired */}
                    {state === "expired" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Link Expired</h2>
                            <p className="text-white/50 text-sm">This approval link has expired. Please request a new one from the dashboard.</p>
                        </div>
                    )}

                    {/* Error */}
                    {state === "error" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                            <p className="text-white/50 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
