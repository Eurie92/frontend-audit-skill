# 🗺️ Fullstack Audit Skill (`fullstack-audit`)

> **Universal Multi-Framework Fullstack Architecture, Design System & Backend Engine Audit Skill**  
> Auto-discovers Next.js, Vite React, Nuxt 3, SvelteKit, Astro, Remix & React Router v7. Catalogs frontend routes, components, live pulse dots, capsule pills, modals, and design tokens into `docs/frontend-atlas/`, and audits backend API routes, Prisma/Drizzle schemas, server actions, auth middleware, and webhooks into `docs/backend-atlas/`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: v2.0.0](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![Frameworks: Multi-Framework](https://img.shields.io/badge/Frameworks-Next.js%20%7C%20Nuxt%20%7C%20SvelteKit%20%7C%20Astro%20%7C%20Remix-black.svg)](https://github.com/Eurie92/fullstack-audit-skill)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Eurie92/fullstack-audit-skill/pulls)

---

## 🎯 The Problem It Solves

In modern web applications, developers and AI coding agents routinely waste significant time and token context on recursive grep loops (`Get-ChildItem -Recurse | Select-String`):

1. **Blind Spots in Whole-Website Theme & Color Rebrands**:
   - Asking an AI assistant to *"Change the whole website's color palette and dark mode"* frequently misses purchase modals, search bars, live status dots (`animate-pulse`), and capsule tags (`rounded-full`) because standard tools only index gray utilities.
2. **"UI Islands" & Component Drift**:
   - Some pages use a standardized `<Button>`, while other pages use raw `<button>` tags with arbitrary styles.
3. **Hidden Backend Surface Area**:
   - Finding where an API route is declared, which Prisma/Drizzle model backs an action, or whether a route is protected by `middleware.ts` forces agents to perform expensive full-codebase searches.
4. **Bi-Directional Fullstack Disconnect**:
   - Tracing which frontend modal triggers which backend Server Action or API route requires searching across layers.

**`fullstack-audit`** resolves all of these issues in **under 350 milliseconds** with **zero manual configuration** and **zero token waste**.

---

## 📦 Installation & Updating

To install or update `fullstack-audit` to the latest version in any project, run this 1-line command in your project root:

**CLI Self-Update**:
```bash
npm run update
# or
npx fullstack-audit --update
```

**Windows (PowerShell)**:
```powershell
irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1 | iex
```

**macOS / Linux**:
```bash
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```

> **✨ Zero-Config Auto Setup**: The install script automatically downloads the skill into `.agent/skills/fullstack-audit/` AND configures your project's `AGENTS.md` (or `GEMINI.md` / `CLAUDE.md`) with the `Fullstack Architecture & Component Lookup Rule` so your AI assistant follows it immediately with 100% compliance!

---

## ⚡ How to Run It

### 💬 Option A: Inside AI Chat (Recommended)
You **do not need to open a terminal**. When chatting with Antigravity, AGY, Claude Code, or Cursor, simply type:
```text
/fullstack-audit
```
Or run targeted commands directly in chat:
```text
/fullstack-audit --theme
/fullstack-audit --backend
/fullstack-audit --frontend
/fullstack-audit --find "checkout"
/fullstack-audit --manifest "components/checkout/GuestCheckoutModal.tsx:42"
/fullstack-audit --verify
```

---

### 💻 Option B: From the Terminal (Manual CLI)
```bash
# Fullstack run (generates both docs/frontend-atlas/ and docs/backend-atlas/):
npx fullstack-audit

# Theme migration checklist (--theme generates actionable - [ ] punchlist):
npx fullstack-audit --theme

# Backend audit only:
npx fullstack-audit --backend

# Frontend audit only:
npx fullstack-audit --frontend

# Closed-loop verification gate (TypeScript compile + metric deltas):
npx fullstack-audit --verify

# Zero-search agent handoff manifest:
npx fullstack-audit --manifest "components/checkout/GuestCheckoutModal.tsx:42"

# Continuous auto-sync on file save:
npx fullstack-audit --watch
```

---

## 🧭 What the Engine Produces

The engine generates two distinct, zero-search directories:

```
your-project/
└── docs/
    ├── frontend-atlas/
    │   ├── 01_ROUTES_AND_PANELS_MAP.md       # 🗺️ Route-to-page map, boundary radar, component tree
    │   ├── 02_COMPONENT_INVENTORY.md         # 🔘 Buttons, Live Dots, Capsule Pills, Disclosed Modals
    │   ├── 03_DESIGN_TOKENS_AND_COLORS.md    # 🎨 Universal Tailwind Palette Matrix & Dark Mode Asymmetry
    │   ├── 04_UI_ISLANDS_AND_DRIFT.md        # 🏝️ UI drift & priority unification checklist
    │   ├── 05_DEAD_ORPHANED_COMPONENTS.md    # 👻 Unused component punch-list & safe removal guide
    │   ├── 06_VISIBLE_TEXT_AND_LABELS_MAP.md # 🏷️ Screenshot-to-Code index of all UI text & labels
    │   ├── 07_VISUAL_AND_ICON_INDEX.md       # 🖼️ Screenshot-to-Code index of all action icons & symbols
    │   ├── 08_DISPATCH_GATEWAY.md            # 🎫 Inter-skill triage matrix & agent handoff router
    │   ├── THEME_MIGRATION_PUNCHLIST.md      # 📋 Actionable checklist for theme & color rebrands
    │   └── README.md                         # 📖 Frontend summary statistics dashboard
    └── backend-atlas/
        ├── 01_API_ROUTES_AND_ENDPOINTS.md    # 🌐 Next.js App/Pages API, Express, Hono route handlers
        ├── 02_DATABASE_MODELS_AND_SCHEMA.md  # 🗄️ Prisma & Drizzle tables, fields, relations
        ├── 03_SERVER_ACTIONS_AND_MUTATIONS.md# ⚡ "use server" actions, signatures, mutations
        ├── 04_AUTH_AND_MIDDLEWARE_GUARDS.md  # 🛡️ Middleware matchers, public vs protected routes
        ├── 05_INTEGRATIONS_AND_WEBHOOKS.md   # 🔌 Stripe, Resend, Supabase, S3 & webhook handlers
        ├── 06_FULLSTACK_CROSS_REFERENCE_MAP.md# 🌉 Bi-directional UI Trigger ➔ Backend API ➔ DB Model
        └── README.md                         # 📖 Backend summary statistics dashboard
```

### ⚡ Next.js Component Boundary Radar
In `01_ROUTES_AND_PANELS_MAP.md`, every route and component is statically scanned for `'use client'`:
- `Client ⚡`: Interactive client component safely capable of hooks, browser APIs, and animations.
- `Server 🖥️`: React Server Component (RSC). Downstream skills are warned to avoid injecting hooks or event handlers without client conversion.

### ♿ Accessibility (a11y) Fast-Check
Inside `02_COMPONENT_INVENTORY.md`, every button is audited for:
- ⚠️ **Missing Accessible Name / `aria-label`**: Detects icon buttons or buttons without screen-reader text.
- ℹ️ **Missing Explicit `type="button"`**: Flags buttons in forms that can trigger accidental submits.

### 🛡️ Closed-Loop Verification Gate (`--verify`)
Ensures architectural modifications improved the codebase:
- Runs TypeScript compilation check (`tsc --noEmit`).
- Computes before-and-after delta against `.last_receipt.json` for raw buttons, rogue colors, and a11y flags.

---

## 🌐 Universal Compatibility

Runs seamlessly on modern web frameworks:
* ✅ **Next.js App Router** (`app/**/page.tsx`)
* ✅ **Next.js Pages Router** (`pages/**/*.tsx`)
* ✅ **Vite + React SPAs** (`src/App.jsx`, `src/main.jsx`)
* ✅ **Tailwind CSS** (Auto-extracts custom palette tokens from `tailwind.config.*`)
* ✅ **TypeScript & JavaScript** (`.tsx`, `.jsx`, `.ts`, `.js`)

---

## 🤖 Making It 100% Always Active in Your AI Agent

> [!TIP]
> **Automatic Setup**: Running the 1-line installer scripts (`install.ps1` or `install.sh`) **automatically injects this rule** into your project's `AGENTS.md`, `GEMINI.md`, or `CLAUDE.md`. You do NOT need to configure this manually unless you are setting up custom workflows.

To ensure your AI assistant (**Antigravity**, **Claude Code**, **Cursor**, or **Codex**) **automatically checks the atlas on every task** without you having to remind it or run manual commands, verify that this rule is present in your project's `AGENTS.md`, `GEMINI.md`, or `CLAUDE.md`:

```markdown
<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->
## 🗺️ Fullstack Architecture & Component Lookup Rule
For all UI, component, route, color theme, API, database, server action, or backend tasks:

1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:
   - **Frontend Atlas (`docs/frontend-atlas/`)**:
     - `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, or Server/Client boundary)
     - `02_COMPONENT_INVENTORY.md` (by Modals, Drawers, Live Dots `animate-pulse`, Capsule Pills `rounded-full`, Buttons)
     - `03_DESIGN_TOKENS_AND_COLORS.md` (for all 22+ Tailwind color families, dark mode asymmetries, hexes)
     - `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot)
     - `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)
     - `THEME_MIGRATION_PUNCHLIST.md` (actionable checklist for whole-website color and dark mode rebrands)
   - **Backend Atlas (`docs/backend-atlas/`)**:
     - `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method: GET/POST/PUT/DELETE, or auth guard)
     - `02_DATABASE_MODELS_AND_SCHEMA.md` (by database table, Prisma model, or Drizzle schema)
     - `03_SERVER_ACTIONS_AND_MUTATIONS.md` (by Next.js Server Action `"use server"`)
     - `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (by route matcher or public vs protected route)
     - `05_INTEGRATIONS_AND_WEBHOOKS.md` (by third-party service: Stripe, Resend, Supabase, S3)
     - `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (to trace UI button/modal directly to backend action & database model)

2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (`Get-ChildItem -Recurse | Select-String`) and do NOT spawn CLI scripts for simple lookups. Both atlases are already indexed on disk as Markdown—read the files directly.

3. **Continuous Sync**: At the completion of any frontend or backend modification, execute `npm run audit` (or `npx fullstack-audit`) to keep the atlases 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas (both `docs/frontend-atlas/` and `docs/backend-atlas/`).
- `npm run audit:frontend`: Regenerates only the Frontend Atlas (`docs/frontend-atlas/`).
- `npm run audit:backend`: Regenerates only the Backend Atlas (`docs/backend-atlas/`).
- `npm run audit:theme` or `npx fullstack-audit --theme`: Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands.
- `npx fullstack-audit --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).
- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx fullstack-audit --find <query>`: Instant sub-second search across components, text labels, and icons.
- `npx fullstack-audit --update`: Checks and updates fullstack-audit-skill to latest GitHub release.
- `npx fullstack-audit --watch`: Live file watcher for continuous background sync.
- `npx fullstack-audit --dead`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->
```

### Why this works:
- **0ms Lookup Overhead**: The agent reads the pre-compiled Markdown files directly instead of booting up heavy CLI compilers or guessing keywords.
- **Accurate Route Scoping**: Even when searching for visual concepts (like *"rotating icons"* or *"checkout modal"*), the agent instantly sees the exact component imported by that route.
- **Zero Hallucination / Zero Dead Code**: The agent only modifies active, imported components and ignores abandoned legacy files.

---

## 🛡️ CI/CD & Safe Versioning (GitHub Actions)

This repository includes a production-ready automated release and verification pipeline:
1. **Automated CI Workflow (`.github/workflows/ci.yml`)**: Runs on every Pull Request and Push to verify TypeScript compilation and execute the CLI smoke test.
2. **Automated GitHub Releases (`.github/workflows/release.yml`)**: Generates GitHub Releases and release notes upon pushing tags (`v1.4.0`, `v1.5.0`, `v1.6.0`, `v1.7.0`) to `main`.
3. **Pull Request Template (`.github/pull_request_template.md`)**: Enforces pre-merge verification across Next.js and Vite to prevent regressions.

---

## 📄 License

MIT License © 2026 EURIE
