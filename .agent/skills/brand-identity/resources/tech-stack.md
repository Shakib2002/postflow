# PostFlow Tech Stack & Implementation Rules

When generating code or UI components for PostFlow, you **MUST** strictly adhere to the following technology choices.

## Core Stack
* **Framework:** Next.js 15 (App Router)
* **Styling Engine:** Tailwind CSS 4 (Mandatory)
* **Component Library:** shadcn/ui
* **Icons:** Lucide React
* **AI:** Google Gemini (via `@google/generative-ai`)

## Implementation Guidelines

### 1. Tailwind Usage
* Use utility classes directly in JSX.
* Utilize the color tokens defined in `design-tokens.json`.
* **Dark Mode:** PostFlow is dark-first. Use `dark:` variants if needed, but the primary theme is dark.

### 2. Component Patterns
* **Buttons:** Primary actions must use `#8b5cf6` (bg-primary).
* **Layout:** Use Flexbox and CSS Grid via Tailwind utilities.

### 3. Forbidden Patterns
* Do NOT use plain CSS files.
* Do NOT use Bootstrap or other UI libraries.
