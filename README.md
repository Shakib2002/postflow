<div align="center">

# PostFlow

**AI-powered social media automation platform**

Schedule posts · Capture leads · Publish everywhere · Grow faster

[![CI](https://github.com/your-org/postflow/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/postflow/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-RLS-green)](https://supabase.com)

</div>

---

## Features

| Category | Feature |
|---|---|
| ✍️ **Compose** | Rich editor with per-platform content tailoring, character counters, scheduling, first-comment, internal notes, checklists |
| 🤖 **AI** | GPT-4o Mini — generate, rephrase, improve, add hashtags/emojis, generate 3 tonal variants |
| 📅 **Scheduling** | Draft / Schedule / Publish / Send for Approval flows |
| 📦 **Bulk Upload** | CSV drag-drop scheduler — upload hundreds of posts at once |
| 🔁 **Content Recycler** | Re-share any post directly into the compose editor |
| 🪝 **Hook Library** | 50 viral hook templates across 7 categories |
| 🏷️ **Labels & Hashtags** | Reusable post labels and saved hashtag groups |
| 👥 **Team & Approvals** | Invite members, role-based access, email approval workflow |
| 📊 **Analytics** | Engagement charts, platform performance, leads funnel |
| 🪙 **Lead Capture** | Embeddable form, UTM tracking, lead scoring, file delivery email |
| 💳 **Billing** | Stripe subscriptions — Starter / Pro / Agency plans |
| 📱 **PWA** | Installable on mobile and desktop |
| 🌍 **Multi-Platform** | LinkedIn, Facebook, Twitter/X, Instagram |
| 🔗 **Referral** | Unique referral links with reward tracking |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5 |
| Database | Supabase (Postgres + RLS + Auth) |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| AI | OpenAI GPT-4o Mini |
| Payments | Stripe |
| Rate Limiting | @upstash/ratelimit (Redis or in-process Map fallback) |
| Analytics | PostHog |
| Error Monitoring | Sentry |
| Email | Resend |
| Testing | Playwright (E2E) |
| CI/CD | GitHub Actions |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/postflow
cd postflow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase, OpenAI, and Stripe credentials
```

See [`.env.example`](.env.example) for the full list of variables.

### 3. Apply database migrations

```bash
# Using Supabase CLI
supabase db push

# Or apply manually via the Supabase dashboard SQL editor:
# supabase/migrations/001_core_schema.sql
# supabase/migrations/002_labels_hashtags.sql
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
postflow/
├── src/
│   ├── app/
│   │   ├── (dashboard)/           # Authenticated pages
│   │   │   ├── compose/           # Post composer
│   │   │   ├── posts/             # Post management
│   │   │   ├── bulk-schedule/     # CSV bulk uploader
│   │   │   ├── leads/             # Lead CRM
│   │   │   ├── analytics/         # Charts & stats
│   │   │   ├── calendar/          # Content calendar
│   │   │   ├── media/             # Media library
│   │   │   ├── comments/          # Comment monitor
│   │   │   ├── team/              # Team management
│   │   │   ├── billing/           # Subscription management
│   │   │   └── settings/          # Account settings
│   │   └── api/                   # API routes
│   │       ├── ai/generate/       # OpenAI integration (rate-limited: 10/min)
│   │       ├── posts/             # Post CRUD (rate-limited: 30/min)
│   │       ├── posts/bulk/        # Bulk create (rate-limited: 5/min)
│   │       ├── leads/             # Lead capture (rate-limited: 60/min)
│   │       ├── billing/           # Stripe webhooks
│   │       └── publish/           # Post publishing pipeline
│   ├── components/
│   │   ├── compose/               # Composer sub-components
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── providers/             # PostHog, Sentry error boundary
│   │   └── ui/                    # shadcn/ui primitives
│   └── lib/
│       ├── supabase/              # Server & client Supabase helpers
│       ├── stripe.ts              # Stripe client + price map
│       ├── rate-limit.ts          # @upstash/ratelimit with Map fallback
│       └── posthog.ts             # Server-side PostHog client
├── supabase/migrations/           # SQL schema migrations
├── e2e/                           # Playwright E2E tests
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icons/                     # App icons (192 + 512px)
├── playwright.config.ts
└── .github/workflows/ci.yml       # Build + E2E CI
```

---

## API Rate Limits

| Route | Limit |
|---|---|
| `POST /api/ai/generate` | 10 req / min |
| `POST /api/posts` | 30 req / min |
| `POST /api/posts/bulk` | 5 req / min |
| `POST /api/leads` | 60 req / min |
| All other routes | 120 req / min |

Rate limiting uses **Upstash Redis** in production (set `UPSTASH_REDIS_REST_URL`) and falls back to an in-process `Map` for local development — no Redis required to run locally.

---

## Running Tests

```bash
# Install Playwright browsers (first time)
npx playwright install chromium

# Run all E2E tests (auto-starts next dev)
npx playwright test

# View HTML report
npx playwright show-report
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Set the Stripe webhook endpoint to `https://your-domain.com/api/billing/webhook`

### CI/CD

GitHub Actions runs on every push to `main` and every PR:
- **Build job** — TypeScript + Next.js build (no secrets required)
- **E2E job** — Playwright tests against the dev server

---

## Security

- **Row Level Security** — all 14 Supabase tables have RLS policies enforcing workspace isolation
- **Stripe webhook** — signature verified via `stripe.webhooks.constructEvent`
- **API rate limiting** — per-IP sliding window on all sensitive routes
- **Sentry error boundary** — all unhandled render errors captured and reported

---

## License

MIT
