-- ============================================================
-- PostFlow — Migration 002: Labels, Hashtag Templates, First Comment
-- ============================================================

-- Post Labels (campaign/topic tags)
CREATE TABLE IF NOT EXISTS post_labels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#8b5cf6',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hashtag Templates (saved hashtag groups)
CREATE TABLE IF NOT EXISTS hashtag_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  hashtags      TEXT NOT NULL,
  is_private    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS label_ids    UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_comment TEXT,
  ADD COLUMN IF NOT EXISTS checklist    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS alt_text     TEXT,
  ADD COLUMN IF NOT EXISTS internal_note TEXT;

-- Workspace invites
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

-- Notifications
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_labels_workspace ON post_labels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_templates_workspace ON hashtag_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON workspace_invites(token);
