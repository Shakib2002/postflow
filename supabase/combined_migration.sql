-- ============================================================
-- PostFlow — CONSOLIDATED MIGRATION (Schema + Policies + Features)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CORE SCHEMA (Tables)
-- ============================================================

CREATE TABLE IF NOT EXISTS workspaces (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  logo_url      TEXT,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'manager', 'editor', 'viewer')),
  invited_by    UUID REFERENCES auth.users(id),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube')),
  account_name    TEXT NOT NULL,
  account_handle  TEXT,
  account_id      TEXT NOT NULL,
  page_id         TEXT,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, platform, account_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  title           TEXT,
  content         TEXT NOT NULL,
  media_urls      TEXT[] DEFAULT '{}',
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_deadline TIMESTAMPTZ,
  tags            TEXT[] DEFAULT '{}',
  ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_platforms (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL,
  custom_content    TEXT,
  external_post_id  TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'publishing', 'published', 'failed', 'skipped')),
  published_at      TIMESTAMPTZ,
  error_message     TEXT,
  retry_count       INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requested_by  UUID NOT NULL REFERENCES auth.users(id),
  approved_by   UUID REFERENCES auth.users(id),
  token         TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  feedback      TEXT,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_platform_id  UUID NOT NULL REFERENCES post_platforms(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL,
  external_comment_id TEXT NOT NULL,
  author_name       TEXT,
  author_id         TEXT,
  text              TEXT NOT NULL,
  sentiment         TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keyword_matched   TEXT,
  replied_at        TIMESTAMPTZ,
  reply_text        TEXT,
  is_hidden         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, external_comment_id)
);

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT,
  phone           TEXT,
  company         TEXT,
  source_post_id  UUID REFERENCES posts(id),
  source_comment_id UUID REFERENCES comments(id),
  platform        TEXT,
  score           INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  notes           TEXT,
  file_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

CREATE TABLE IF NOT EXISTS lead_files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  post_id       UUID REFERENCES posts(id) ON DELETE SET NULL,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     BIGINT,
  mime_type     TEXT,
  download_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_platform_id  UUID NOT NULL REFERENCES post_platforms(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL,
  likes             INT NOT NULL DEFAULT 0,
  comments          INT NOT NULL DEFAULT 0,
  shares            INT NOT NULL DEFAULT 0,
  saves             INT NOT NULL DEFAULT 0,
  reach             INT NOT NULL DEFAULT 0,
  impressions       INT NOT NULL DEFAULT 0,
  clicks            INT NOT NULL DEFAULT 0,
  engagement_rate   NUMERIC(5,2),
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan                  TEXT NOT NULL DEFAULT 'starter',
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. LABELS, HASHTAGS & MORE (Feature Expansion)
-- ============================================================

CREATE TABLE IF NOT EXISTS post_labels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#8b5cf6',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hashtag_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  hashtags      TEXT NOT NULL,
  is_private    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add feature columns to posts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='label_ids') THEN
    ALTER TABLE posts ADD COLUMN label_ids UUID[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='first_comment') THEN
    ALTER TABLE posts ADD COLUMN first_comment TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='checklist') THEN
    ALTER TABLE posts ADD COLUMN checklist JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='alt_text') THEN
    ALTER TABLE posts ADD COLUMN alt_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='internal_note') THEN
    ALTER TABLE posts ADD COLUMN internal_note TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS workspace_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('manager', 'editor', 'viewer')),
  invited_by    UUID NOT NULL REFERENCES auth.users(id),
  token         TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('approval_request', 'approval_decision', 'post_published', 'post_failed', 'team_invite', 'comment_reply')),
  title         TEXT NOT NULL,
  body          TEXT,
  link          TEXT,
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cron_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name      TEXT        NOT NULL,
    triggered_count INTEGER   NOT NULL DEFAULT 0,
    results       JSONB       DEFAULT '[]'::jsonb,
    ran_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TRIGGERS & FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON workspaces;
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_approvals_updated_at ON approvals;
CREATE TRIGGER trg_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER trg_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 4. SECURITY (RLS Policies)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check membership
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION workspace_role(ws_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing policies for clean apply
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Core Policies
CREATE POLICY "workspace_select" ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "workspace_insert" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspace_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspace_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "members_select" ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "members_insert" ON workspace_members FOR INSERT WITH CHECK (workspace_role(workspace_id) IN ('owner', 'manager'));
CREATE POLICY "members_delete" ON workspace_members FOR DELETE USING (workspace_role(workspace_id) = 'owner' OR user_id = auth.uid());

CREATE POLICY "social_accounts_select" ON social_accounts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "social_accounts_insert" ON social_accounts FOR INSERT WITH CHECK (workspace_role(workspace_id) IN ('owner', 'manager'));
CREATE POLICY "social_accounts_update" ON social_accounts FOR UPDATE USING (workspace_role(workspace_id) IN ('owner', 'manager'));
CREATE POLICY "social_accounts_delete" ON social_accounts FOR DELETE USING (workspace_role(workspace_id) IN ('owner', 'manager'));

CREATE POLICY "posts_select" ON posts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (is_workspace_member(workspace_id) AND workspace_role(workspace_id) IN ('owner', 'manager', 'editor'));
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (is_workspace_member(workspace_id) AND workspace_role(workspace_id) IN ('owner', 'manager', 'editor'));
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (workspace_role(workspace_id) IN ('owner', 'manager'));

CREATE POLICY "post_platforms_select" ON post_platforms FOR SELECT USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND is_workspace_member(p.workspace_id)));
CREATE POLICY "post_platforms_insert" ON post_platforms FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND is_workspace_member(p.workspace_id)));

CREATE POLICY "approvals_select_by_token" ON approvals FOR SELECT USING (TRUE);
CREATE POLICY "approvals_insert" ON approvals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND is_workspace_member(p.workspace_id)));
CREATE POLICY "approvals_update" ON approvals FOR UPDATE USING (TRUE);

CREATE POLICY "comments_select" ON comments FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "leads_select" ON leads FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "leads_insert_public" ON leads FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "leads_update" ON leads FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "leads_delete" ON leads FOR DELETE USING (workspace_role(workspace_id) IN ('owner', 'manager'));

CREATE POLICY "lead_files_select" ON lead_files FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "lead_files_insert" ON lead_files FOR INSERT WITH CHECK (workspace_role(workspace_id) IN ('owner', 'manager', 'editor'));

CREATE POLICY "analytics_select" ON analytics FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "analytics_insert" ON analytics FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (workspace_role(workspace_id) IN ('owner', 'manager'));

-- Expansion Policies
CREATE POLICY "labels_select" ON post_labels FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "labels_all" ON post_labels FOR ALL USING (workspace_role(workspace_id) IN ('owner', 'manager', 'editor'));

CREATE POLICY "hashtags_select" ON hashtag_templates FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "hashtags_all" ON hashtag_templates FOR ALL USING (workspace_role(workspace_id) IN ('owner', 'manager', 'editor'));

CREATE POLICY "invites_select" ON workspace_invites FOR SELECT USING (TRUE); -- token-based
CREATE POLICY "invites_admin" ON workspace_invites FOR ALL USING (workspace_role(workspace_id) IN ('owner', 'manager'));

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "deny_cron_logs" ON cron_logs FOR ALL TO anon, authenticated USING (false);

-- ============================================================
-- 5. INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_workspace_status ON posts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_post_platforms_status ON post_platforms(status);
CREATE INDEX IF NOT EXISTS idx_comments_workspace ON comments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_workspace_status ON leads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_workspace ON analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_workspace ON social_accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_post_labels_workspace ON post_labels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_templates_workspace ON hashtag_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON workspace_invites(token);
CREATE INDEX IF NOT EXISTS idx_cron_logs_ran_at ON cron_logs (ran_at DESC);
