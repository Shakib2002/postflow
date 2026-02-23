# 🔍 Findings: PostFlow

## ⚡ Tech Stack Discoveries

- **Next.js Version:** Running `next@16.1.6`, which implies internal bleeding-edge or custom build for Antigravity compatibility.
- **AI Integration:** Currently uses `@google/generative-ai` with `gemini-2.0-flash`. Demo mode is available when API keys are missing.
- **Database:** Supabase with 14+ tables and strict RLS policies. Function `is_workspace_member` is the core security helper.
- **Styling:** Uses Tailwind CSS 4 with `@tailwindcss/postcss`.

## 🚧 Constraints

- **Rate Limiting:** Upstash Redis is used for production; local dev falls back to an in-process Map.
- **Testing:** Playwright is configured but requires chromium installation.
- **Platform Limits:** LinkedIn/Twitter/Facebook/Instagram are the primary targets.
