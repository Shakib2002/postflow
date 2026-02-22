import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Capture 10% of transactions for performance monitoring (increase in prod as needed)
    tracesSampleRate: 0.1,

    // Capture 10% of sessions for session replay
    replaysSessionSampleRate: 0.1,

    // Always capture replays on errors
    replaysOnErrorSampleRate: 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    integrations: [
        Sentry.replayIntegration({
            // Mask all text and block all media by default for privacy
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    // Filter out noisy errors
    beforeSend(event) {
        // Ignore network errors from ad blockers / browser extensions
        if (event.exception?.values?.[0]?.value?.includes("ResizeObserver loop")) {
            return null;
        }
        return event;
    },
});
