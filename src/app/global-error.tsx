"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-muted-foreground text-sm">
                        An unexpected error occurred at the system level.
                    </p>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-left">
                        <p className="text-[10px] font-bold uppercase text-red-400/60 mb-1">System Error</p>
                        <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={reset}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/20"
                            onClick={() => window.location.href = "/dashboard"}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
