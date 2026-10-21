# 🗺️ Fullstack Audit Skill (`fullstack-audit`)

> **Universal Multi-Framework Architecture, Design System & Backend Engine Audit Skill**  
> Auto-discovers Next.js, Vite React, Nuxt 3, SvelteKit, Astro, Remix & React Router v7. Catalogs frontend routes, components, live pulse dots, capsule pills, modals, and design tokens into `docs/frontend-atlas/`, and audits backend API routes, Prisma/Drizzle schemas, server actions, auth middleware, and webhooks into `docs/backend-atlas/`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: v2.2.0](https://img.shields.io/badge/Release-v2.2.0-emerald.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![Frameworks: Multi-Framework](https://img.shields.io/badge/Frameworks-Next.js%20%7C%20Nuxt%20%7C%20SvelteKit%20%7C%20Astro%20%7C%20Remix-black.svg)](https://github.com/Eurie92/fullstack-audit-skill)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Eurie92/fullstack-audit-skill/pulls)

### 📚 Documentation Quick-Links
[📖 **How It Works (Architecture & AST Engine)**](docs/HOW_IT_WORKS.md) • [🤖 **Multi-Agent Recipes & Swarms**](docs/MULTI_AGENT_RECIPES.md) • [📊 **Empirical Benchmarks (9,053x Faster)**](docs/HOW_IT_WORKS.md#empirical-benchmarks)

---

## ⚡ 3-Second Quickstart

### 1. Install or Update in Any Web Project
```bash
# Windows (PowerShell):
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)

# macOS / Linux:
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```
> *✨ The installer automatically sets up the skill in `.agent/skills/fullstack-audit/` and configures your project's `AGENTS.md` so your AI assistant checks the atlas on every task.*

### 2. How to Run It

* **Inside AI Chat (Antigravity, Claude Code, Cursor)**:
  ```text
  /fullstack-audit
  ```
* **From the Terminal (CLI)**:
  ```bash
  npx fullstack-audit
  ```

---

## 🎯 The Core Problem It Solves

Vanilla AI coding assistants waste significant time and token budget on recursive grep searches (`Get-ChildItem -Recurse | Select-String`):

1. **Eliminates Localization Errors (Princeton SWE-bench)**: Over 64% of agent failures stem from getting trapped in minified `.next/` or `dist/` build files. `fullstack-audit` provides deterministic, AST-verified paths in 2ms.
2. **Next.js Component Boundary Radar**: Statically tags components as `[Client ⚡]` or `[Server 🖥️]` to prevent runtime hydration mismatches.
3. **Catches Whole-Website Color Drift**: Discovers hardcoded hexes (`bg-[#121110]`), inline JSX styles (`style={{ background: ... }}`), and dark mode asymmetries in modals and sliding drawers.
4. **Bi-Directional Fullstack Linker**: Directly links UI buttons ➔ Next.js Server Actions / API endpoints ➔ Prisma/Drizzle database models.
5. **Universal Dual-Speed Loop (1–2s Responses)**: Separates instant inner-loop surgical edits from outer-loop verification gates, eliminating 45-second headless browser and per-edit compile delays across all harnesses.

---

## 🔬 Benchmark Proof: Vanilla Agent vs. `fullstack-audit`

Tested head-to-head on a real production Next.js 15 App Router codebase (**448 files, 50 routes, Tailwind CSS, Prisma**):

| Real-World Task | Vanilla Agent (`Select-String` / grep) | `fullstack-audit` (Atlas Read) | Proven Improvement |
| :--- | :---: | :---: | :--- |
| **Screenshot-to-Code Localization** *(Find UI text)* | 42,961 ms | **3 ms** | **⚡ 14,320x Faster** (Zero build noise) |
| **Rogue Hardcoded Color Detection** *(Find un-themed hex)* | 39,595 ms | **8 ms** | **⚡ 4,949x Faster** (Structured token matrix) |
| **Fullstack Route Hierarchy Trace** *(Server/Client boundary)* | 35,142 ms | **2 ms** | **⚡ 17,571x Faster** (Preserves RSC boundary) |
| **TOTAL BENCHMARK DURATION** | **117,698 ms (~2.0 min)** | **13 ms (0.013s)** | **🚀 9,053.7x FASTER** |

👉 *Read the full empirical benchmark breakdown and academic research grounding in [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md#empirical-benchmarks).*

---

## 🛠️ CLI Command Matrix (v2.2.0)

| Command | Purpose |
| :--- | :--- |
| `npx fullstack-audit` | Regenerates both `docs/frontend-atlas/` and `docs/backend-atlas/` (Default: Solo Mode). |
| `npx fullstack-audit --solo` | Enforces strictly Single-Agent execution (zero subagent overhead). |
| `npx fullstack-audit --multi-agent` | Partitions the codebase into 4 parallel zone briefs for multi-agent swarms. |
| `npx fullstack-audit --theme` | Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands. |
| `npx fullstack-audit --theme --route <path> --compact` | Generates an ultra-fast route-scoped micro-punchlist (saves 99.8% tokens). |
| `npx fullstack-audit --migrate-theme --from "#hex" --to "token"` | CRLF-agnostic AST codemod in 80ms (0 LLM output tokens). |
| `npx fullstack-audit --verify --gate-clean` | Closed-loop verification gate (TypeScript check + rogue hex exit gate). |
| `npx fullstack-audit --manifest <file:line>` | Generates a zero-search agent handoff manifest. |
| `npx fullstack-audit --find <query> --compact` | Instant sub-second search across components, text labels, and icons. |
| `npx fullstack-audit --watch` | Live file watcher for continuous background sync on save. |

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

---

## 🤖 Making It Always Active in Your AI Assistant

To ensure **Antigravity**, **Claude Code**, **Cursor**, or **Codex** automatically uses the atlas on every task, ensure this rule is present in your project's `AGENTS.md` (the installer adds this automatically):

```markdown
<!-- START_FULLSTACK_AUDIT_RULE -->
## 🗺️ Fullstack Architecture & Component Lookup Rule
For all UI, component, route, color theme, API, database, server action, or backend tasks:

1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:
   - Frontend Atlas: `docs/frontend-atlas/` (Routes, Components, Design Tokens, Visible Text)
   - Backend Atlas: `docs/backend-atlas/` (API Routes, Database Schema, Server Actions, Middleware)
2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (`Select-String` / `grep -r`). Both atlases are already indexed on disk as Markdown—read them directly.
3. **Dual-Speed Loop & Deferred Sync**:
   - **Inner-Loop (Fast Mode)**: For UI/styling/copy tweaks, perform direct surgical edits. Do NOT invoke heavy browser MCPs and do NOT trigger full project typechecks on micro-edits. Let the dev server HMR refresh in 50ms.
   - **Outer-Loop (Verification Gate)**: Execute `npx fullstack-audit --verify --gate-clean` or `npm run audit` ONLY at task completion or before git commits.
<!-- END_FULLSTACK_AUDIT_RULE -->
```

---

## 📄 License

MIT License © 2026 EURIE
