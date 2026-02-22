-- Migration: 003_cron_logs
-- Tracks every cron job run for debugging and auditing.
-- Kept intentionally lightweight — rows older than 30 days are auto-deleted.

CREATE TABLE IF NOT EXISTS cron_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name      TEXT        NOT NULL,                -- e.g. 'publish-scheduled' | 'retry-failed'
    triggered_count INTEGER   NOT NULL DEFAULT 0,      -- how many posts were processed
    results       JSONB       DEFAULT '[]'::jsonb,     -- per-post outcomes
    ran_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-delete rows older than 30 days (keeps the table tiny)
CREATE OR REPLACE FUNCTION delete_old_cron_logs()
RETURNS void LANGUAGE sql AS $$
    DELETE FROM cron_logs WHERE ran_at < now() - INTERVAL '30 days';
$$;

-- RLS: only service-role can read/write cron_logs (no user-facing access)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default, so no explicit policy needed.
-- Just deny all authenticated/anon reads:
CREATE POLICY "deny_all" ON cron_logs
    FOR ALL TO anon, authenticated
    USING (false);

-- Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_cron_logs_ran_at ON cron_logs (ran_at DESC);
