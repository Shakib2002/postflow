# 📜 Project Constitution: PostFlow

**Project Name:** PostFlow  
**Stack:** Next.js 15, TypeScript, Supabase (Postgres + RLS), Tailwind CSS, Framer Motion, OpenAI/Gemini  
**Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)

---

## 🏗️ Core Architecture (A.N.T.)

Separation of concerns for deterministic logic:
1. **Architecture (`architecture/`):** MD-based SOPs and system logic.
2. **Navigation:** Agent-led decision making and routing.
3. **Tools (`src/tools/`):** Pure, testable scripts for specific outcomes.

---

## 📊 Data Schema (Payload Shapes)

### Primary Database (Supabase)

| Table | Description | Key Fields |
|---|---|---|
| `workspaces` | Multi-tenant roots | `id`, `name`, `slug`, `owner_id`, `plan` |
| `social_accounts` | Connected platforms | `platform`, `account_id`, `access_token` |
| `posts` | Content storage | `content`, `scheduled_at`, `status`, `tags` |
| `post_platforms` | Platform-specific status | `post_id`, `platform`, `status`, `error` |
| `approvals` | Workflow tokens | `token`, `status`, `expires_at` |
| `leads` | CRM records | `email`, `source_post_id`, `score`, `status` |
| `analytics` | Performance tracker | `likes`, `shares`, `reach`, `impressions` |
| `post_labels` | Categorization | `name`, `color` |
| `hashtag_templates` | Saved groups | `name`, `hashtags` |

---

## ⚖️ Behavioral Rules

- **RLS First:** Never query tables without verifying RLS policies in `supabase/migrations`.
- **Async Reliability:** All publishing must be handled via the publishing pipeline with background retries.
- **Type Safety:** Maintain strict TypeScript definitions in `src/types`.
- **AI Tones:** Supported tones: Professional, Casual, Inspirational, Funny.
- **Rate Limits:** Strictly follow Upstash rate limits (10/min for AI, 30/min for posts).

---

## 🛠️ Maintenance Log

- **2026-02-23:** Initialized B.L.A.S.T. protocol for "latest version" upgrade.
- **Primary AI:** Switching preferred model to `gemini-2.0-flash`.
