"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error);
        console.error("Root Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-md w-full">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2 animate-in fade-in zoom-in duration-500">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                        Something went wrong
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We encountered an unexpected error while rendering this page.
                        Our engineering team has been notified.
                    </p>
                </div>

                {/* Debug Info — Only visible when we need to find the cause */}
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left space-y-4 overflow-hidden animate-in slide-in-from-bottom-2 duration-700">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-destructive/60">
                            Detailed Error Message
                        </p>
                        <p className="text-xs font-mono text-destructive break-all leading-normal">
                            {error.message || "No specific error message provided."}
                        </p>
                    </div>

                    <div className="space-y-1 border-t border-destructive/10 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            Environment Health Check
                        </p>
                        <div className="grid grid-cols-1 gap-1 text-[10px] font-mono">
                            <div className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                                <span className="text-muted-foreground">SUPABASE_URL</span>
                                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-400" : "text-red-400"}>
                                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ CONFIGURED" : "❌ MISSING"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                                <span className="text-muted-foreground">SUPABASE_ANON_KEY</span>
                                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-400" : "text-red-400"}>
                                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ CONFIGURED" : "❌ MISSING"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                                <span className="text-muted-foreground">APP_URL</span>
                                <span className={process.env.NEXT_PUBLIC_APP_URL ? "text-green-400" : "text-red-400"}>
                                    {process.env.NEXT_PUBLIC_APP_URL ? "✅ CONFIGURED" : "❌ MISSING"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                                <span className="text-muted-foreground">POSTHOG_KEY</span>
                                <span className={process.env.NEXT_PUBLIC_POSTHOG_KEY ? "text-green-400" : "text-yellow-400"}>
                                    {process.env.NEXT_PUBLIC_POSTHOG_KEY ? "✅ CONFIGURED" : "⚠️ OPTIONAL"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error.digest && (
                        <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        onClick={reset}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/20 gap-2 h-11"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="flex-1 border-white/10 hover:bg-white/5 h-11 gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
