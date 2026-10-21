---
name: fullstack-audit
description: Runs the automated universal fullstack atlas and design system catalog engine into docs/frontend-atlas/ and docs/backend-atlas/. Supports Next.js (App & Pages Router), Vite React SPAs, Nuxt 3, SvelteKit, Astro, Remix, and React Router v7. Catalogs frontend routes, buttons, live pulse dots, capsule pills, modals, and design tokens, and audits backend API routes, Prisma/Drizzle schemas, server actions, auth guards, and webhooks.
version: 2.1.0
allowed-tools:
  - run_command
  - Bash(npx tsx .agent/skills/fullstack-audit/scripts/audit.ts)
  - Bash(npm run audit)
  - Bash(npm run audit:frontend)
  - Bash(npm run audit:backend)
  - Bash(npm run audit:theme)
---

# 🗺️ Universal Fullstack Atlas & Design System Audit Skill

> **Trigger**: `/fullstack-audit`, `/frontend-audit`, or when locating UI components, routes, database models, APIs, and color themes.
> Run this skill when the user invokes `/fullstack-audit`, asks to locate UI components or backend actions, or asks to generate, update, or inspect the project's **Frontend Atlas** in `docs/frontend-atlas/` or **Backend Atlas** in `docs/backend-atlas/`.

---

## 🚫 Routing & Trigger Boundaries

* **USE THIS SKILL FOR**:
  1. Locating exact component files and route owners directly from `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md`, `06_VISIBLE_TEXT_AND_LABELS_MAP.md`, or `07_VISUAL_AND_ICON_INDEX.md`.
  2. Finding live status indicators (`animate-pulse`), capsule pills (`rounded-full`), and disclosed modals in `docs/frontend-atlas/02_COMPONENT_INVENTORY.md`.
  3. Auditing color palettes across all 22+ Tailwind families and generating rebrand checklists via `--theme` in `docs/frontend-atlas/THEME_MIGRATION_PUNCHLIST.md`.
  4. Locating API endpoints, database models (Prisma/Drizzle), server actions, and auth guards in `docs/backend-atlas/`.
  5. Generating zero-search agent handoff manifests via `--manifest <file:line>`.
  6. Running closed-loop verification gates via `--verify` to track metric improvements and TypeScript compilation.
  7. Explicit slash command: `/fullstack-audit` or `/frontend-audit`.
* **DO NOT USE THIS SKILL FOR**:
  - UI visual design, styling ideas, or color advice ➡️ Use **`ui-ux-pro-max`** or **`design-taste-frontend`**.
  - Interaction physics, spring animations, micro-polish ➡️ Use **`emil-design-eng`**.
  - Accessibility audit or UX critique of a component ➡️ Use **`a11y-debugging`** or **`impeccable`**.

---

## 🚀 How to Locate Components & Endpoints (Sub-Second 0ms Lookup)

### Frontend Lookup (Screenshots, Components, Themes):
1. **DO NOT run grep or search scripts.** Both atlases are already compiled on disk as Markdown.
2. **If looking up by Visible Text in a Screenshot**:
   - Open `docs/frontend-atlas/06_VISIBLE_TEXT_AND_LABELS_MAP.md` directly via `view_file`.
   - Search for the visible label (e.g. `"Purchases"`, `"Checkout"`, `"Live"`) to get the exact file and line number in 1 read!
3. **If looking up Live Status Dots or Capsule Pills**:
   - Open `docs/frontend-atlas/02_COMPONENT_INVENTORY.md` directly via `view_file`.
   - Inspect Section 2 (Live Status Dots) or Section 3 (Capsule Pills) to locate the exact file and line.
4. **If looking up by Icon / Symbol in a Textless Screenshot**:
   - Open `docs/frontend-atlas/07_VISUAL_AND_ICON_INDEX.md` directly via `view_file`.
   - Search for the icon name (e.g. `Sun`, `Moon`, `ShoppingCart`, `ChevronDown`, `Trash`) to get the exact file, line, and interactive context.
5. **If looking up by Screen / Route**:
   - Open `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` directly via `view_file`.
   - Check the Next.js boundary (`Client ⚡` vs `Server 🖥️`) and inspect the 2-level deep component tree.
6. **If doing a Theme or Color Palette Rebrand**:
   - Open `docs/frontend-atlas/THEME_MIGRATION_PUNCHLIST.md` directly via `view_file` to get the line-by-line checklist of every color token to update.

### Backend Lookup (APIs, Database, Auth, Server Actions):
1. **If looking up an API Route**:
   - Open `docs/backend-atlas/01_API_ROUTES_AND_ENDPOINTS.md` directly via `view_file` to find the handler file, HTTP method, and auth requirements.
2. **If looking up a Database Table or Model**:
   - Open `docs/backend-atlas/02_DATABASE_MODELS_AND_SCHEMA.md` to see Prisma/Drizzle models, field definitions, and foreign keys.
3. **If looking up a Server Action or Mutation**:
   - Open `docs/backend-atlas/03_SERVER_ACTIONS_AND_MUTATIONS.md` to see exported action functions and database operations.
4. **If tracing a UI button to its backend database call**:
   - Open `docs/backend-atlas/06_FULLSTACK_CROSS_REFERENCE_MAP.md` to see the bi-directional bridge.

---

## 🔄 When to Run the Audit Script
Run the audit script (`npm run audit` or `/fullstack-audit`) **ONLY**:
1. When the user explicitly types `/fullstack-audit` or `/frontend-audit`.
2. After finishing modifications to frontend or backend code, to keep the atlases in sync.
3. Point the user to the updated documents in `docs/frontend-atlas/` and `docs/backend-atlas/`.

---

## 🧭 The Atlas Documents Guide

### `docs/frontend-atlas/` (Frontend & UI)
1. **`01_ROUTES_AND_PANELS_MAP.md`**: Route-to-page link, Next.js boundary (`Client ⚡` vs `Server 🖥️`), layout, and 2-level deep component tree.
2. **`02_COMPONENT_INVENTORY.md`**: Buttons, Live Dots (`animate-pulse`), Capsule Pills (`rounded-full`), and Disclosed Modals with reverse route mapping.
3. **`03_DESIGN_TOKENS_AND_COLORS.md`**: Universal Tailwind Color Matrix (all 22+ colors) and Dark Mode Asymmetry scanner.
4. **`04_UI_ISLANDS_AND_DRIFT.md`**: Raw HTML elements, inline style tags, and custom modal redundancies.
5. **`05_DEAD_ORPHANED_COMPONENTS.md`**: Dedicated punch-list for unused and orphaned components.
6. **`06_VISIBLE_TEXT_AND_LABELS_MAP.md`**: Buttons, headings, badges, and visible UI labels for instant Screenshot-to-Code targeting.
7. **`07_VISUAL_AND_ICON_INDEX.md`**: Lucide, Radix, Tabler, and SVG visual action icons for textless screenshot targeting.
8. **`08_DISPATCH_GATEWAY.md`**: Inter-skill handoff matrix routing UI findings to specialized peer skills.
9. **`THEME_MIGRATION_PUNCHLIST.md`**: Actionable `- [ ]` checklist for whole-website color and dark mode migrations.

## 🛠️ Available Commands (v2.1.0 Token-Efficient Engine)
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas.
- `npx fullstack-audit --theme --route <route> --compact`: Emits route-scoped micro-punchlist (saves 99% tokens vs reading 6,400 lines).
- `npx fullstack-audit --migrate-theme --from "#hex1,#hex2" --to "dark:bg-slate-900"`: Automated AST codemod in 80ms with 0 LLM output tokens.
- `npx fullstack-audit --verify --gate-clean [--route <route>]`: Deterministic anti-hallucination gate (fails with exit code 1 if rogue hexes remain).
- `npx fullstack-audit --find <query> --compact`: Ultra-fast, single-line token-compact query mode for AI agents.
- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx fullstack-audit --watch`: Live background file watcher for continuous auto-sync.

### `docs/backend-atlas/` (Backend & Fullstack)
1. **`01_API_ROUTES_AND_ENDPOINTS.md`**: HTTP API endpoints, methods (`GET`, `POST`, `PUT`, `DELETE`), params, and auth guards.
2. **`02_DATABASE_MODELS_AND_SCHEMA.md`**: Prisma and Drizzle models, fields, types, and relations.
3. **`03_SERVER_ACTIONS_AND_MUTATIONS.md`**: Next.js Server Actions (`"use server"`), parameters, and DB mutations.
4. **`04_AUTH_AND_MIDDLEWARE_GUARDS.md`**: Middleware matchers, protected routes, and authentication providers.
5. **`05_INTEGRATIONS_AND_WEBHOOKS.md`**: Third-party SDK clients (Stripe, Resend, Supabase, S3) and webhooks.
6. **`06_FULLSTACK_CROSS_REFERENCE_MAP.md`**: Bi-directional bridge linking frontend UI triggers to backend actions and database models.
