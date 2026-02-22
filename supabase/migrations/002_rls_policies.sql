-- ============================================================
-- PostFlow — Supabase Migration 002: Row Level Security
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
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

-- ============================================================
-- Helper: check if current user is a member of a workspace
-- ============================================================
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

-- ============================================================
-- WORKSPACES policies
-- ============================================================
CREATE POLICY "workspace_select" ON workspaces
  FOR SELECT USING (is_workspace_member(id));

CREATE POLICY "workspace_insert" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspace_update" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspace_delete" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- WORKSPACE_MEMBERS policies
-- ============================================================
CREATE POLICY "members_select" ON workspace_members
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "members_insert" ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

CREATE POLICY "members_delete" ON workspace_members
  FOR DELETE USING (
    workspace_role(workspace_id) = 'owner' OR user_id = auth.uid()
  );

-- ============================================================
-- SOCIAL_ACCOUNTS policies
-- ============================================================
CREATE POLICY "social_accounts_select" ON social_accounts
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "social_accounts_insert" ON social_accounts
  FOR INSERT WITH CHECK (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

CREATE POLICY "social_accounts_update" ON social_accounts
  FOR UPDATE USING (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

CREATE POLICY "social_accounts_delete" ON social_accounts
  FOR DELETE USING (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

-- ============================================================
-- POSTS policies
-- ============================================================
CREATE POLICY "posts_select" ON posts
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "posts_insert" ON posts
  FOR INSERT WITH CHECK (
    is_workspace_member(workspace_id) AND
    workspace_role(workspace_id) IN ('owner', 'manager', 'editor')
  );

CREATE POLICY "posts_update" ON posts
  FOR UPDATE USING (
    is_workspace_member(workspace_id) AND
    workspace_role(workspace_id) IN ('owner', 'manager', 'editor')
  );

CREATE POLICY "posts_delete" ON posts
  FOR DELETE USING (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

-- ============================================================
-- POST_PLATFORMS policies (inherit from posts)
-- ============================================================
CREATE POLICY "post_platforms_select" ON post_platforms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_id AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "post_platforms_insert" ON post_platforms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_id AND is_workspace_member(p.workspace_id)
    )
  );

-- ============================================================
-- APPROVALS policies
-- ============================================================
-- Public read by token (for email approval links — no auth required)
CREATE POLICY "approvals_select_by_token" ON approvals
  FOR SELECT USING (TRUE); -- filtered at query level by token

CREATE POLICY "approvals_insert" ON approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_id AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "approvals_update" ON approvals
  FOR UPDATE USING (TRUE); -- token-based, validated at API level

-- ============================================================
-- COMMENTS policies
-- ============================================================
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "comments_update" ON comments
  FOR UPDATE USING (is_workspace_member(workspace_id));

-- ============================================================
-- LEADS policies
-- ============================================================
CREATE POLICY "leads_select" ON leads
  FOR SELECT USING (is_workspace_member(workspace_id));

-- Public insert for lead capture form (no auth)
CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "leads_update" ON leads
  FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "leads_delete" ON leads
  FOR DELETE USING (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );

-- ============================================================
-- LEAD_FILES policies
-- ============================================================
CREATE POLICY "lead_files_select" ON lead_files
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "lead_files_insert" ON lead_files
  FOR INSERT WITH CHECK (
    workspace_role(workspace_id) IN ('owner', 'manager', 'editor')
  );

-- ============================================================
-- ANALYTICS policies
-- ============================================================
CREATE POLICY "analytics_select" ON analytics
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "analytics_insert" ON analytics
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

-- ============================================================
-- SUBSCRIPTIONS policies
-- ============================================================
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (
    workspace_role(workspace_id) IN ('owner', 'manager')
  );
