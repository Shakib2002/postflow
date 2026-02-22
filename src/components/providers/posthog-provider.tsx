"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const host =
            process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

        if (!key || initialized.current) return;
        initialized.current = true;

        posthog.init(key, {
            api_host: host,
            // Privacy-friendly defaults
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: false,          // Only track explicit events
            persistence: "localStorage", // No cookies → GDPR-friendly
            disable_session_recording: true,
        });
    }, []);

    // If PostHog key not configured, render children without provider
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return <>{children}</>;
    }

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
