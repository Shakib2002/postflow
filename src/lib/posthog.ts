/**
 * PostHog server-side client.
 * Gracefully no-ops when NEXT_PUBLIC_POSTHOG_KEY is not set.
 */
import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

    if (!key) return null;

    if (!_client) {
        _client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
    }
    return _client;
}

export function captureEvent(
    distinctId: string,
    event: string,
    properties?: Record<string, unknown>
) {
    const client = getClient();
    if (!client) return; // PostHog not configured — silently skip
    client.capture({ distinctId, event, properties: properties ?? {} });
}

export async function shutdownPostHog() {
    if (_client) await _client.shutdown();
}
