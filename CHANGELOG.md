# 📜 Changelog

All notable changes to the **Fullstack Audit Skill** (`fullstack-audit`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2026-10-22

### 🗄️ Added
* **Raw SQL Migrations & Supabase DDL Parser**:
  * Statically analyzes `.sql` migration files across `migrations/`, `db/migrations/`, and `supabase/migrations/` when Prisma or Drizzle are absent or used alongside them.
  * Robust AST/paren-aware tokenizer catalogs `CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`, column types (`UUID`, `SERIAL`, `TEXT`, `NUMERIC`, `JSONB`, `TIMESTAMPTZ`), primary keys, nullability, and foreign key relationships (`REFERENCES`).
  * Tested on production SaaS `xnight` (`C:\Users\EURIE\Dev\SaaS\xnight`), successfully detecting **79 database models** and resolving 179 cross-reference triggers.
* **Ghost & Redirect Alias Route Resolver**:
  * Statically analyzes single-line redirect shims (e.g. `import { redirect } from "next/navigation"; redirect("/admin/...")` or `NextResponse.redirect(...)`).
  * In `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md`, marks the boundary clearly as `🔀 Redirect ➔ /destination`, preventing AI assistants from editing dummy redirect shims.
* **Smart Multi-Target `tsconfig` & Script-Aware Verification Gate**:
  * Upgrades `npx fullstack-audit --verify` to automatically honor `package.json` `"typecheck"` scripts and auto-select multi-target configs (`tsconfig.check.json`, `tsconfig.app.json`, `tsconfig.web.json`) before falling back to `tsconfig.json`.
  * Solves multi-target projects (e.g. Telegram bot worker vs Next.js web application).
* **Answer.AI `llms.txt` Standard & `llms-full.txt` Generator (`--llms`)**:
  * Implemented `npx fullstack-audit --llms` and automatic generation during fullstack audits.
  * Outputs standardized root `llms.txt` (following the official Answer.AI specification) with project overview, key routes, design tokens, and API endpoints.
  * Generates `llms-full.txt` combining high-density summaries of all frontend and backend atlas documents into a single consolidated file for external LLMs and agent harnesses.
* **Deterministic LLM Prompt-Cache Stability**:
  * Preserves verification receipt timestamps across runs when metrics have not changed, eliminating unnecessary git diffs and ensuring 100% LLM KV prompt-cache prefix hit rates.
* **Next.js Root `app/` Discovery**:
  * Fixed framework auto-discovery in projects with both a `src/` directory (for backend services or bot workers) and a root `app/` directory (for Next.js App Router).

---

## [2.3.0] - 2026-10-21

### ⚡ Added
* **Universal Dual-Speed Loop Protocol**:
  * **Inner-Loop Fast Mode (1–2s responses)**: Separates active UI/styling/copy iterations from heavy compile/browser tasks. AI agents perform direct surgical file edits (`edit_file`) and let local dev server Hot Module Reload (HMR at `localhost:3000`) refresh in 50ms.
  * **Deferred Verification Gates**: Full TypeScript compilation (`tsc --noEmit`) and verification gates (`--verify --gate-clean`) are deferred to task checkpoints, pre-commits, or when explicitly requested by the developer.
  * **Zero Heavy Browser MCP Overhead**: Deprecates mandatory headless browser MCP commands (Chrome DevTools MCP / Puppeteer) for routine styling edits, eliminating background hook timeouts and lag.
  * **Harness-Agnostic AI Workspace Guidelines**: Updated `AGENTS.md` and `SKILL.md` to ensure identical fast-loop behavior across **Antigravity, Cursor, Claude Code, Windsurf, Codex, and VS Code**.
* **Modular In-Repository Documentation Deep-Dives**:
  * Added [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md): Complete architectural breakdown of the Single-Pass AST parser, Next.js Component Boundary Radar, Tailwind JIT Color Matrix, CRLF-agnostic codemod engine, and Stanford/Princeton research token economics.
  * Added [`docs/MULTI_AGENT_RECIPES.md`](docs/MULTI_AGENT_RECIPES.md): Concrete multi-agent orchestration recipes covering Zero-Search Handoff Manifests (`--manifest`), 4-Zone Rebrand Swarms (`--multi-agent`), Route Micro-Punchlists, and Closed-Loop Anti-Hallucination Gates.
* **Streamlined Developer README**:
  * Refactored `README.md` for maximum developer ergonomics: 3-second quickstart, concise core value points, updated CLI matrix, and clean documentation navigation bar.

---

## [2.2.0] - 2026-10-21

### 🎨 Added
* **Inline Style Radar**: Evaluates JSX dynamic inline styles (`style={{ background: p.color }}`) and CSS gradients (`radial-gradient(...)`).
* **Root CSS Scanner**: Statically indexes custom CSS variables and surface highlight classes (`.xn-obsidian-surface`) directly from `globals.css`.
* **CRLF-Agnostic AST Codemod Engine**: Natively handles Windows CRLF (`\r\n`) and LF (`\n`) disk transformations in 80ms with 0 LLM output tokens via `npx fullstack-audit --migrate-theme`.
* **Multi-Agent Partition Engine**: Added `--multi-agent` flag to partition large codebases into 4 isolated, non-overlapping architectural zone briefs (`ZONE_STOREFRONT.md`, `ZONE_OVERLAYS.md`, `ZONE_PRIMITIVES.md`, `ZONE_PORTALS.md`) while maintaining `--solo` single-agent mode as the ultra-fast default.

---

## [2.1.0] - 2026-10-21

### 🚀 Added
* **Route-Scoped Micro-Punchlists (`--theme --route <route> --compact`)**: Reduces punchlist output by 99.8% (< 40ms execution) for single-screen workflows.
* **Deterministic Anti-Hallucination Gate (`--verify --gate-clean`)**: Exits with process status code 1 if rogue hardcoded colors remain in the target scope, preventing hallucinations from passing CI.
* **Empirical Benchmarks & Academic Research Grounding**: Head-to-head empirical proof on a 448-file Next.js 15 App Router repository (9,053x faster total benchmark time, 85.7% token reduction) grounded in Princeton SWE-bench localization error research and Stanford "Lost in the Middle" attention degradation principles.

---

## [2.0.0] - 2026-10-21

### 💥 Breaking Changes
* Rebranded package and commands from `frontend-audit-skill` to **`fullstack-audit-skill`** (`fullstack-audit`).

### 🌐 Added
* **Universal Backend Atlas Engine (`docs/backend-atlas/`)**:
  * `01_API_ROUTES_AND_ENDPOINTS.md`: App/Pages API route handlers, HTTP methods, and params.
  * `02_DATABASE_MODELS_AND_SCHEMA.md`: Prisma models and Drizzle ORM schemas, fields, and relations.
  * `03_SERVER_ACTIONS_AND_MUTATIONS.md`: Next.js Server Actions (`"use server"`) and mutations.
  * `04_AUTH_AND_MIDDLEWARE_GUARDS.md`: Route matchers, public vs. protected routes.
  * `05_INTEGRATIONS_AND_WEBHOOKS.md`: Third-party services (Stripe, Resend, Supabase, S3).
  * `06_FULLSTACK_CROSS_REFERENCE_MAP.md`: Bi-directional bridge linking frontend UI triggers directly to backend server actions and database models.
* **Live Pulse Dots & Capsule Pill Inventories**: Added dedicated catalogs for `animate-pulse` status indicators and `rounded-full` pills in `02_COMPONENT_INVENTORY.md`.
* **Universal JIT Color Matrix**: Expands color token extraction across all 22+ Tailwind color families, arbitrary hexes, and dark mode asymmetries.

---

## [1.7.0] - 2026-10-20

### 🧩 Added
* **Universal Multi-Framework Discovery**: Added static discovery for **Nuxt 3**, **SvelteKit**, **Astro**, and **Remix / React Router v7** in addition to Next.js and Vite React SPAs.
* Added automated framework test matrix (`scripts/test-frameworks.ts`).

---

## [1.6.0] - 2026-10-20

### 🔧 Added
* **Dynamic Skill Auto-Discovery**: Automatically indexes 50+ workspace skills across project root and global harnesses.
* **CLI Self-Updater**: Added `npx fullstack-audit --update` to fetch latest GitHub releases.
* **Idempotent UTF-8 Rule Sync**: Safe rule injection into `AGENTS.md`, `GEMINI.md`, and `CLAUDE.md`.

---

## [1.5.0] - 2026-10-20

### ⚡ Added
* **Next.js Component Boundary Radar**: Statically tags components as `[Client ⚡]` or `[Server 🖥️]` to prevent hydration mismatches.
* **Screenshot-to-Code Visual Icon Index**: Cataloged action icons (Lucide, Radix, Tabler, SVGs) in `07_VISUAL_AND_ICON_INDEX.md`.
* **Inter-Skill Dispatch Gateway**: Added `08_DISPATCH_GATEWAY.md` for routing architectural findings to specialized skills.
* **Verification Gate (`--verify`)**: First implementation of closed-loop TypeScript compilation and metric delta tracking.

---

## [1.4.0] - 2026-10-20

### 🔍 Added
* **Screenshot-to-Code Visible Text Index**: Cataloged all visible UI text, headings, and labels in `06_VISIBLE_TEXT_AND_LABELS_MAP.md`.
* **2-Level Component Tree Crawling**: Detailed child component hierarchy in `01_ROUTES_AND_PANELS_MAP.md`.

---

## [1.3.0] - 2026-10-19

### 👻 Added
* **Dead Component Finder**: Added `05_DEAD_ORPHANED_COMPONENTS.md` for safe removal of abandoned UI files.
* **Live File Watcher (`--watch`)**: Continuous background synchronization on file save.

---

## [1.2.0] - 2026-10-19

### ♿ Added
* **Button Accessibility Fast-Check**: Detects missing `aria-label`s on icon buttons and missing explicit `type="button"`.
* **Token-Compact Search (`--find`)**: Instant sub-second component query mode.

---

## [1.0.1] - 2026-10-19

### 🚀 Added
* Initial open-source release supporting Next.js (App & Pages Router) and Vite React SPAs.
* Generation of `docs/frontend-atlas/` with route maps and Tailwind color catalogs.
