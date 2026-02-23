"use client";

import { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FallbackProps {
    error: Error;
    resetError: () => void;
}

function ErrorFallback({ error, resetError }: FallbackProps) {
    return (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
                <h2 className="text-lg font-semibold mb-1">Something went wrong</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                    An unexpected error occurred. Our team has been notified automatically.
                </p>
                <p className="text-xs text-destructive font-mono mt-2 max-w-md truncate border border-destructive/20 p-2 rounded bg-destructive/5">
                    {error.message}
                </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={resetError}>
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
            </Button>
        </div>
    );
}

interface SentryErrorBoundaryProps {
    children: ReactNode;
}

export function SentryErrorBoundary({ children }: SentryErrorBoundaryProps) {
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => (
                <ErrorFallback error={error as Error} resetError={resetError} />
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
}
