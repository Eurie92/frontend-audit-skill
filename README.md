# 🗺️ Fullstack Audit Skill (`fullstack-audit`)

> **Universal Multi-Framework Architecture, Design System & Backend Engine Audit Skill**  
> Auto-discovers Next.js, Vite React, Nuxt 3, SvelteKit, Astro, Remix & React Router v7. Catalogs frontend routes, components, live pulse dots, capsule pills, modals, and design tokens into `docs/frontend-atlas/`, and audits backend API routes, Prisma/Drizzle schemas, server actions, auth middleware, and webhooks into `docs/backend-atlas/`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: v2.10.1](https://img.shields.io/badge/Release-v2.10.1-emerald.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![Frameworks: Multi-Framework](https://img.shields.io/badge/Frameworks-Next.js%20%7C%20Nuxt%20%7C%20SvelteKit%20%7C%20Astro%20%7C%20Remix-black.svg)](https://github.com/Eurie92/fullstack-audit-skill)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Eurie92/fullstack-audit-skill/pulls)

### 📚 Documentation Quick-Links
[🚀 **Master Usage Guide (Full Potential)**](docs/MASTER_USAGE_GUIDE.md) • [📖 **How It Works (Architecture & AST Engine)**](docs/HOW_IT_WORKS.md) • [🤖 **Multi-Agent Recipes & Swarms**](docs/MULTI_AGENT_RECIPES.md) • [📊 **Empirical Benchmarks (9,053x Faster)**](docs/HOW_IT_WORKS.md#empirical-benchmarks) • [📜 **Changelog**](CHANGELOG.md)

---

## 🎛️ Installation Profiles: Choose Your Setup

We respect developer choice. Whether you want a **pure standalone atlas** with zero external dependencies, or the **full token-saving synergy triad**, choose the profile that matches your workflow:

| Feature / Capability | 🚀 Profile A: Full Synergy Triad *(Recommended)* | ⚡ Profile B: Standalone Mode | 🎯 Profile C: Selective / Custom |
| :--- | :---: | :---: | :---: |
| **`fullstack-audit` Engine** (20 Atlases, 0ms GPS) | ✅ Included | ✅ Included | ✅ Included |
| **`ponytail`** (KISS / Anti-Overengineering) | ✅ Included | ❌ *Built-in Native KISS* | 🎛️ Optional (`--with-ponytail`) |
| **`caveman`** (Terse Output / Zero Fluff) | ✅ Included | ❌ *Natural Friendly Tone* | 🎛️ Optional (`--with-caveman`) |
| **`superpowers`** (Dual-Speed Verification) | ✅ Included | ❌ *Built-in Native Gate* | 🎛️ Optional (`--with-superpowers`) |
| **External Skill / Plugin Dependencies** | 3 companion skills | **0 (Zero External Dependencies)** | Custom |
| **Token Cost Reduction** | 🏆 **~92% Total Reduction** | **~65% Reduction** | **70%–85% Reduction** |
| **Response Latency for Micro-Edits** | **1–2 seconds** | Standard HMR | 1–2 seconds |

---

### 🚀 Profile A: Full Synergy Triad (Recommended)
> **Why it's #1:** Combines 0ms Atlas navigation with strict anti-overengineering and terse communication. Your AI assistant stops writing bloated 500-line wrappers, drops conversational filler, and operates at 1–2s response times.

```bash
# Windows (PowerShell):
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)

# macOS / Linux:
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash

# Terminal CLI / Across all harnesses:
npx fullstack-audit --setup-all
```

*Optional Companion Plugins (for slash commands & extended tools)*:
```bash
# Antigravity / Gemini CLI:
gemini plugin add ponytail && gemini plugin add caveman && gemini plugin add superpowers

# Claude Code:
claude plugin install ponytail caveman superpowers
```

---

### ⚡ Profile B: Standalone Mode (Zero External Dependencies)
> **For developers who want ONLY the fullstack atlas:** Zero external plugins, no forced Caveman terseness, and no Superpowers workflows. Your AI assistant maintains its natural, friendly conversational voice while gaining instant zero-grep atlas navigation.

```bash
# Windows (PowerShell):
& { $(irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1) } -Standalone

# macOS / Linux:
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash -s -- --standalone

# Terminal CLI / Across all harnesses:
npx fullstack-audit --setup-all --standalone
```

---

### 🎯 Profile C: Selective / Custom Setup
> Mix and match exactly the companion capabilities you want:

```bash
# Example 1: Triad without Superpowers (Keep Caveman + Ponytail, standard testing)
npx fullstack-audit --setup-all --no-superpowers

# Example 2: Standalone with Ponytail only (Anti-overengineering in natural conversational tone)
npx fullstack-audit --setup-all --standalone --with-ponytail
```

---

## ⚡ 3-Second Quickstart

### How to Run It

* **Inside AI Chat (Antigravity, Claude Code, Cursor)**:
  ```text
  /fullstack-audit
  ```
* **From the Terminal (CLI)**:
  ```bash
  npx fullstack-audit
  ```
* **Instant Lookup & Surgical Patching**:
  ```bash
  # Instant sub-3ms lookup
  npx fullstack-audit --find "UserProfile" --compact

  # Fuzzy file & casing resolver
  npx fullstack-audit --resolve "connect-modal"

  # Line-bound function slices for God-files
  npx fullstack-audit --symbol "mapOrderToDTO"

  # CRLF-safe surgical patch (immune to PowerShell & syntax crashes)
  npx fullstack-audit --patch "src/test.ts" --target "old text" --replace "new text"
  ```

---

## 🎯 The Core Problem It Solves

Vanilla AI coding assistants waste significant time and token budget on recursive grep searches (`Get-ChildItem -Recurse | Select-String`):

1. **Eliminates Localization Errors (Princeton SWE-bench)**: Over 64% of agent failures stem from getting trapped in minified `.next/` or `dist/` build files. `fullstack-audit` provides deterministic, AST-verified paths in 2ms.
2. **Next.js Component Boundary Radar**: Statically tags components as `[Client ⚡]` or `[Server 🖥️]` to prevent runtime hydration mismatches.
3. **Catches Whole-Website Color Drift**: Discovers hardcoded hexes (`bg-[#121110]`), inline JSX styles (`style={{ background: ... }}`), and dark mode asymmetries in modals and sliding drawers.
4. **Bi-Directional Fullstack Linker**: Directly links UI buttons ➔ Next.js Server Actions / API endpoints ➔ Prisma/Drizzle database models.
5. **Universal Dual-Speed Loop (1–2s Responses)**: Separates instant inner-loop surgical edits from outer-loop verification gates, eliminating 45-second headless browser and per-edit compile delays across all harnesses.
6. **Next.js Client Secret Leak & Shadow Env Radar**: Automatically flags sensitive secrets (`STRIPE_SECRET_KEY`, `DATABASE_URL`) imported in client components and surfaces undocumented `.env` variables before CI/CD crashes.
7. **Monolithic God-File Surgical Slicer**: Parses massive 1,000+ line monoliths into discrete functional AST slices, saving **88% to 99.8% of input tokens** per surgical read.
8. **Fullstack Route Complexity & Blast-Radius Radar**: Computes composite risk scores (0–100) and blast-radius tiers (`🚨 Critical`, `⚡ Moderate`, `🟢 Low`) to safeguard high-impact pages during refactoring.

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

## 🛠️ CLI Command Matrix (v2.10.1)

| Command | Purpose |
| :--- | :--- |
| `npx fullstack-audit` | Regenerates both `docs/frontend-atlas/` and `docs/backend-atlas/` plus root `llms.txt`. |
| `npx fullstack-audit -v` / `--version` | Instant (<5ms) version banner output without invoking heavy dependencies. |
| `npx fullstack-audit --check-update` | Compares project Atlas against installed skill version and detects version drift. |
| `npx fullstack-audit --setup-all [--standalone \| --profile <profile>]` | Universal multi-harness installer (Cursor `.mdc`, Claude Code `.claude/commands/`, Hermes, OpenCode, `AGENTS.md` / `GEMINI.md`). |
| `npx fullstack-audit --find <query> [--compact]` | Sub-3ms inverted index search across components, queries, test assertions, and database models. |
| `npx fullstack-audit --resolve <name>` | Fuzzy case-insensitive component & file resolver (e.g. `connect-modal` ➔ `ConnectModal.tsx`). |
| `npx fullstack-audit --symbol <method>` | Function/method AST line bounds slicer for God-files (>500 lines). |
| `npx fullstack-audit --patch <file> --target "<old>" --replace "<new>"` | CRLF-agnostic surgical patcher (immune to PowerShell `&` syntax crashes). |
| `npx fullstack-audit --solo` | Enforces strictly Single-Agent execution (zero subagent overhead). |
| `npx fullstack-audit --multi-agent` | Partitions the codebase into 4 parallel zone briefs for multi-agent swarms. |
| `npx fullstack-audit --llms` | Generates root `llms.txt` & `llms-full.txt` following the official Answer.AI standard. |
| `npx fullstack-audit --theme` | Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands. |
| `npx fullstack-audit --theme --route <path> --compact` | Generates an ultra-fast route-scoped micro-punchlist (saves 99.8% tokens). |
| `npx fullstack-audit --migrate-theme --from "#hex" --to "token"` | CRLF-agnostic AST codemod in 80ms (0 LLM output tokens). |
| `npx fullstack-audit --verify --gate-clean` | Smart multi-target verification gate (auto-selects `tsconfig.check.json` or `npm run typecheck`). |
| `npx fullstack-audit --manifest <file:line>` | Generates a zero-search agent handoff manifest. |
| `npx fullstack-audit --diff` | Architecture delta report comparing current scan against `.last_receipt.json`. |
| `npx fullstack-audit --dead` | Scans and lists potential orphaned/dead components. |
| `npx fullstack-audit --watch` | Live file watcher for continuous background sync on save. |

---

## 🧭 What the Engine Produces

The engine generates two distinct, zero-search directories (20 specialized architecture maps):

```
your-project/
└── docs/
    ├── frontend-atlas/
    │   ├── 01_ROUTES_AND_PANELS_MAP.md       # 🗺️ Route-to-page map, boundary radar, component tree & blast radius badges
    │   ├── 02_COMPONENT_INVENTORY.md         # 🔘 Buttons, Live Dots, Capsule Pills, Disclosed Modals (Centrality ranked)
    │   ├── 03_DESIGN_TOKENS_AND_COLORS.md    # 🎨 Universal Tailwind Palette Matrix & Dark Mode Asymmetry
    │   ├── 04_UI_ISLANDS_AND_DRIFT.md        # 🏝️ UI drift & priority unification checklist
    │   ├── 05_DEAD_ORPHANED_COMPONENTS.md    # 👻 Unused component punch-list & safe removal guide
    │   ├── 06_VISIBLE_TEXT_AND_LABELS_MAP.md # 🏷️ Screenshot-to-Code index of all UI text & labels
    │   ├── 07_VISUAL_AND_ICON_INDEX.md       # 🖼️ Screenshot-to-Code index of all action icons & symbols
    │   ├── 08_DISPATCH_GATEWAY.md            # 🎫 Inter-skill triage matrix & agent handoff router
    │   ├── 09_QUERY_AND_CACHE_MAP.md         # 🔄 TanStack React Query cache keys, mutations & Cache Hygiene Radar
    │   ├── 10_GOD_FILES_SURGICAL_MAP.md      # ✂️ Monolithic files sliced into AST line bounds (88-99.8% token savings)
    │   ├── 11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md # 🚨 Composite risk scoring (0-100) & blast radius impact tiers
    │   ├── 12_TEST_SUITES_AND_COVERAGE_MAP.md# 🧪 Unit & integration test suites registry (zero-grep assertion locator)
    │   ├── THEME_MIGRATION_PUNCHLIST.md      # 📋 Actionable checklist for theme & color rebrands
    │   └── README.md                         # 📖 Frontend summary statistics dashboard
    └── backend-atlas/
        ├── 01_API_ROUTES_AND_ENDPOINTS.md    # 🌐 Next.js App/Pages API, Express, Hono (Traffic Centrality ranked)
        ├── 02_DATABASE_MODELS_AND_SCHEMA.md  # 🗄️ Prisma, Drizzle & Raw SQL / Supabase tables (Entity Centrality ranked)
        ├── 03_SERVER_ACTIONS_AND_MUTATIONS.md# ⚡ "use server" actions, signatures, mutations
        ├── 04_AUTH_AND_MIDDLEWARE_GUARDS.md  # 🛡️ Middleware matchers, public vs protected routes
        ├── 05_INTEGRATIONS_AND_WEBHOOKS.md   # 🔌 Stripe, Resend, Supabase, S3 & webhook handlers
        ├── 06_FULLSTACK_CROSS_REFERENCE_MAP.md# 🌉 Deep UI Trigger ➔ API Route ➔ Domain Service ➔ DB Model
        ├── 07_ENV_AND_SECRETS_MAP.md         # 🔐 Client Secret Leak Radar & Undocumented Shadow Variables
        └── README.md                         # 📖 Backend summary statistics dashboard
```

---

## 🤖 Making It Always Active in Your AI Assistant

To ensure **Antigravity**, **Claude Code**, **Cursor**, or **Codex** automatically uses the atlas on every task, the installer injects tailored rules into `AGENTS.md` and `GEMINI.md` based on your chosen installation profile:

* **Recommended Triad (`install.ps1` / `install.sh`)**: Injects the **4-Phase Synergy Engine** (0ms Atlas ➔ Ponytail YAGNI ➔ Caveman terse receipts ➔ Dual-Speed Verification loop).
* **Standalone Mode (`--standalone`)**: Injects a clean, self-contained rule with zero external skill references in a natural conversational tone.

Example of the rule block managed in your project's `AGENTS.md`:

```markdown
<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->
# ⚡ Fullstack 4-Phase Synergy Engine (0ms Atlas • Ponytail KISS • Caveman Terse • Dual-Speed Verify)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

## 🔄 The 4-Phase Operational Pipeline
### Phase 1: GPS / Locate (`fullstack-audit`)
- Zero-Grep Mandate: First tool call MUST read `docs/frontend-atlas/` or `docs/backend-atlas/` or run `npx fullstack-audit --find "<query>" --compact`.
- Fuzzy Resolver: Run `npx fullstack-audit --resolve "<name>"` for instant 0ms casing matching.
- Method Slicer: Run `npx fullstack-audit --symbol "<method>"` for exact line bounds in God-files before calling `read_file`.
- PowerShell Quoting Armor: Single-quote all arguments; use `npx fullstack-audit --patch` to avoid shell crashes.

### Phase 2: Design & Anti-Overengineering Firewall (`ponytail`)
- YAGNI Invariant: Solve with least new code. Reuse existing project components and standard web/Tailwind primitives.

### Phase 3: Communication & Zero-Fluff Receipts (`caveman`)
- Dense results first. Conclude replies with a tight diff receipt: `Target`, `Diff`, and `Status`.

### Phase 4: Right-Sized Verification (`superpowers` Dual-Speed Harmonization)
- Inner-Loop: Surgical edits ≤ 2 files update in 1–2s via dev server HMR. No full TypeScript runs on micro-edits.
- Outer-Loop: Run `npx fullstack-audit --verify --gate-clean` before milestone commits.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->
```

---

## 📄 License

MIT License © 2026 EURIE
