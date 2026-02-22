/**
 * PostFlow — Scheduler Worker
 * 
 * This file runs as a standalone Node.js process (or Railway cron job).
 * It polls Supabase every minute for posts that are due to be published.
 * 
 * Run: npx tsx workers/scheduler.ts
 * Deploy: Railway worker service (set START_COMMAND = npx tsx workers/scheduler.ts)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role bypasses RLS
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const POLL_INTERVAL_MS = 60_000; // 1 minute

async function processScheduledPosts() {
    const now = new Date().toISOString();

    // Find all posts that are scheduled and due
    const { data: duePosts, error } = await supabase
        .from("posts")
        .select("id, workspace_id, scheduled_at")
        .eq("status", "scheduled")
        .lte("scheduled_at", now);

    if (error) {
        console.error("[Scheduler] Error fetching due posts:", error.message);
        return;
    }

    if (!duePosts || duePosts.length === 0) {
        console.log(`[Scheduler] No posts due at ${now}`);
        return;
    }

    console.log(`[Scheduler] Found ${duePosts.length} post(s) to publish`);

    for (const post of duePosts) {
        try {
            console.log(`[Scheduler] Publishing post ${post.id}...`);

            const res = await fetch(`${APP_URL}/api/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: post.id }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`[Scheduler] Failed to publish post ${post.id}:`, err);
            } else {
                const result = await res.json();
                console.log(`[Scheduler] Post ${post.id} published:`, result.results);
            }
        } catch (err) {
            console.error(`[Scheduler] Exception publishing post ${post.id}:`, err);
        }
    }
}

async function processExpiredApprovals() {
    const now = new Date().toISOString();

    const { data: expiredApprovals } = await supabase
        .from("approvals")
        .select("id, post_id")
        .eq("status", "pending")
        .lt("expires_at", now);

    if (!expiredApprovals || expiredApprovals.length === 0) return;

    console.log(`[Scheduler] Expiring ${expiredApprovals.length} approval(s)`);

    for (const approval of expiredApprovals) {
        await supabase.from("approvals").update({ status: "expired" }).eq("id", approval.id);
        // Optionally notify the workspace owner
    }
}

async function tick() {
    console.log(`[Scheduler] Tick at ${new Date().toISOString()}`);
    await Promise.allSettled([
        processScheduledPosts(),
        processExpiredApprovals(),
    ]);
}

// Start the scheduler loop
console.log("[Scheduler] Starting PostFlow scheduler worker...");
tick(); // run immediately on start
setInterval(tick, POLL_INTERVAL_MS);
