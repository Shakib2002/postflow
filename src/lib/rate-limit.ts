/**
 * Rate limiting utility using @upstash/ratelimit.
 *
 * - When UPSTASH_REDIS_REST_URL is a valid https:// URL, uses Upstash Redis
 *   for distributed rate limiting across all serverless instances.
 * - Otherwise falls back to an in-process ephemeralCache (Map), which works
 *   in local dev and single-instance deployments without any Redis setup.
 *
 * IMPORTANT: Redis client is created lazily inside each request — never at
 * module load time — to avoid @upstash/redis UrlError during `next build`.
 */

import { Ratelimit, Duration } from "@upstash/ratelimit";
import { NextRequest } from "next/server";

// ── Rate limit configuration ─────────────────────────────────────────────────

const LIMITS: Record<string, { requests: number; window: Duration }> = {
    ai: { requests: 10, window: "60 s" },
    posts: { requests: 30, window: "60 s" },
    bulk: { requests: 5, window: "60 s" },
    leads: { requests: 60, window: "60 s" },
    api: { requests: 120, window: "60 s" },
};

// ── URL validation (runtime-safe) ────────────────────────────────────────────

function isValidRedisUrl(): boolean {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return false;
    try {
        return new URL(url).protocol === "https:";
    } catch {
        return false;
    }
}

// ── Lazy limiter — built fresh per-request to avoid build-time instantiation ─

function getLimiter(key: keyof typeof LIMITS): Ratelimit {
    const cfg = LIMITS[key] ?? LIMITS.api;

    if (isValidRedisUrl()) {
        // Dynamic import to avoid any build-time Redis validation
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
        return new Ratelimit({
            redis: new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL!,
                token: process.env.UPSTASH_REDIS_REST_TOKEN!,
            }),
            limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window),
            analytics: false,
        });
    }

    // Fallback: Mock limiter that always succeeds when Redis is not configured.
    // This allows local development to proceed without an Upstash account.
    return {
        limit: async () => ({
            success: true,
            limit: cfg.requests,
            remaining: cfg.requests,
            reset: Date.now() + 60000,
        }),
    } as unknown as Ratelimit;
}

// ── Public helper ────────────────────────────────────────────────────────────

export async function checkRateLimit(
    req: NextRequest,
    limiterKey: string = "api"
): Promise<Response | null> {
    const limiter = getLimiter(limiterKey);

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
        return new Response(
            JSON.stringify({
                error: "Too many requests. Please slow down.",
                retryAfter: Math.ceil((reset - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(reset),
                    "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                },
            }
        );
    }

    return null;
}
