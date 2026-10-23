# Fullstack Audit

> High-performance architecture atlas and GPS companion for AI coding assistants.
> Automatically indexes Next.js, React, Nuxt, SvelteKit, Astro, Remix, and backend APIs into deterministic, zero-grep architecture maps.

[![Version](https://img.shields.io/badge/version-2.11.0-blue.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Benchmark](https://img.shields.io/badge/benchmark-100%2F100%20passed%20(0.18ms)-brightgreen.svg)](docs/BENCHMARK_100_REPORT.md)
[![Frameworks](https://img.shields.io/badge/frameworks-Next.js%20%7C%20Nuxt%20%7C%20SvelteKit%20%7C%20Astro%20%7C%20Remix-black.svg)]()
[![Zero Config](https://img.shields.io/badge/config-zero%20config-blue.svg)]()

[Master Usage Guide](docs/MASTER_USAGE_GUIDE.md) | [How It Works](docs/HOW_IT_WORKS.md) | [Multi-Agent Recipes](docs/MULTI_AGENT_RECIPES.md) | [Empirical Benchmarks](docs/HOW_IT_WORKS.md#empirical-benchmarks) | [Changelog](CHANGELOG.md)

---

## Overview

Fullstack Audit is a static analysis and architectural indexing engine designed specifically for AI coding assistants (Antigravity, Cursor, Claude Code, Windsurf, Codex). 

Instead of relying on recursive text grepping (`grep -r` or PowerShell `Select-String`), Fullstack Audit executes a single-pass AST scan in under 350 milliseconds to generate pre-computed architecture atlases. When an AI assistant needs to locate a component, inspect route boundaries, or trace an API call to a database model, it retrieves exact file and line bounds in 0ms without consuming context tokens or triggering file-system latency.

---

## How to Use

### Option 1: Inside AI Chat (Recommended)

Run the audit directly inside your AI coding assistant (Antigravity, Cursor, Claude Code, Windsurf):

```text
/fullstack-audit
```

You can also prompt your assistant directly:
- *"Audit this project and map all routes."*
- *"Find the checkout modal component."*
- *"Trace the /api/orders endpoint to the database schema."*

Your assistant automatically queries the pre-computed atlases on disk to pinpoint exact locations.

---

### Option 2: From the Terminal (CLI)

#### Windows (PowerShell / Command Prompt)
To bypass Windows PowerShell execution restrictions (`PSSecurityException`), run via the `.cmd` wrapper:
```powershell
npx.cmd fullstack-audit
```

*Note: To enable standard `npx` execution across all Node.js CLI tools on Windows, run once:*
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
```

#### macOS / Linux
```bash
npx fullstack-audit
```

#### In-Project Script (package.json)
```bash
npm run audit
# or direct Node.js invocation:
node bin/audit.js
```

---

## When to Use: The Always-On Development Companion

Fullstack Audit is not a one-time scanner or a standalone linter. It supports the entire development lifecycle:

| Phase | Core Function | Impact |
| :--- | :--- | :--- |
| **Before Development** | Project orientation and cold-start mapping | Indexes all routes, Server/Client components, and database models in 350ms. AI agents gain immediate spatial awareness without reading random files. |
| **During Development** | Sub-3ms symbol lookup and surgical slicing | AI agents use `--symbol` to extract exact function bounds from 1,000+ line God-files, saving up to 99.8% input tokens per query. |
| **After Development** | Verification gates and architectural delta tracking | Detects client-side `.env` secret leaks, flags broken React Query invalidations, and verifies route blast radius before commits. |

---

## Division of Labor: Developer vs. AI Assistant

Developers do not need to memorize low-level CLI flags. Fullstack Audit separates developer interactions from autonomous agent primitives:

| Developer Action | Autonomous AI Agent Action (Under the Hood) |
| :--- | :--- |
| Prompts: *"Update the order confirmation button label"* | Queries `06_VISIBLE_TEXT_AND_LABELS_MAP.md` in 3ms to locate exact file and line number |
| Pastes a UI screenshot into chat | Resolves component and icon references from `07_VISUAL_AND_ICON_INDEX.md` |
| Requests changes to a 2,000-line service file | Calls `fullstack-audit --symbol <method>` to read 30 lines instead of 2,000 lines |
| Runs `/fullstack-audit` or approves a pull request | Evaluates `11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md` to prevent unintended regressions |

---

## Core Problems Solved

1. **Elimination of the Windows PowerShell Grep Freeze**: In Windows PowerShell, `-Exclude` does not prune recursion. Running `Get-ChildItem -Recurse` traverses over 50,000 files in `node_modules` and `.next`, causing a 15–30 second freeze with Windows Defender. Fullstack Audit reads pre-computed Markdown tables in 0ms.
2. **Context Window Degradation**: Reading entire 1,500-line monolithic files degrades LLM reasoning (*Lost-in-the-Middle* effect). God-file AST slicing extracts only targeted function bounds, saving 88% to 99.8% of tokens per operation.
3. **Build Artifact Hallucinations**: Over 64% of SWE-bench agent failures stem from reading bundled `.next/static/` or minified `dist/` files. Fullstack Audit provides deterministic, source-verified paths.
4. **Hydration Boundary Radar**: Statically tags components as `[Client]` or `[Server]` to prevent runtime Next.js hydration mismatches.

---

## Empirical Verification: 100-Run Production Benchmark

To eliminate synthetic testing bias, Fullstack Audit is continuously evaluated against real production repositories. The benchmark suite executes 100 consecutive operations against `xnight` (Next.js 16.4.2 App Router, 451 files, 50 routes, 94 God-files, 128 API endpoints, PostgreSQL, Supabase):

| Metric | Vanilla Agent (PowerShell `Select-String`) | Fullstack Audit (Atlas Navigation) | Measured Advantage |
| :--- | :---: | :---: | :--- |
| **Median Latency (p50)** | 2,296.81 ms | **0.18 ms** | **12,760x faster** |
| **95th Percentile (p95)** | 3,751.85 ms | **1.67 ms** | **2,246x faster** |
| **99th Percentile (p99)** | 4,743.75 ms | **2.81 ms** | **1,688x faster** |
| **Target Accuracy Rate** | 74.0% | **99.0%** | **Zero path hallucinations** |
| **Context Token Footprint** | 250,000 tokens | **5,000 tokens** | **98% token reduction** |

### Evaluated Test Categories (25 Runs Each)
1. **Screenshot UI Label Targeting (Runs 1–25)**: Evaluated against button text, headings, badges, and modal headers.
2. **Case-Insensitive Fuzzy Resolution (Runs 26–50)**: Evaluated kebab-case conversational queries against PascalCase source files.
3. **Monolithic God-File Method Slicing (Runs 51–75)**: Slices 94 files (>500 lines) into exact AST bounds, saving up to 99.8% tokens per read.
4. **Fullstack Cross-Reference Tracing (Runs 76–100)**: Evaluates end-to-end traces from UI triggers to API route handlers and database tables.

*For complete query distributions and ground-truth comparisons, see the [100-Run Benchmark Report](docs/BENCHMARK_100_REPORT.md).*

---

## Generated Architecture Atlases

Running Fullstack Audit generates two structured documentation directories in your project root:

```text
docs/
├── frontend-atlas/
│   ├── 01_ROUTES_AND_PANELS_MAP.md       # Route hierarchy, boundaries, component trees
│   ├── 02_COMPONENT_INVENTORY.md         # Buttons, live pulse indicators, capsule pills, modals
│   ├── 03_DESIGN_TOKENS_AND_COLORS.md    # Tailwind palette matrix and dark mode asymmetries
│   ├── 04_UI_ISLANDS_AND_DRIFT.md        # UI drift analysis and consolidation targets
│   ├── 05_DEAD_ORPHANED_COMPONENTS.md    # Unused component audit and safe removal guide
│   ├── 06_VISIBLE_TEXT_AND_LABELS_MAP.md # Screenshot-to-code text index with file:line bounds
│   ├── 07_VISUAL_AND_ICON_INDEX.md       # Action icon index with interactive context
│   ├── 08_DISPATCH_GATEWAY.md            # Agent triage matrix and tool router
│   ├── 09_QUERY_AND_CACHE_MAP.md         # TanStack Query keys, mutations, cache hygiene
│   ├── 10_GOD_FILES_SURGICAL_MAP.md      # AST line slices for monolithic files (>500 lines)
│   ├── 11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md # Composite risk scoring (0-100) and blast radius
│   ├── 12_TEST_SUITES_AND_COVERAGE_MAP.md# Test suite index and assertion map
│   └── THEME_MIGRATION_PUNCHLIST.md      # Rebrand punchlist for color migrations
└── backend-atlas/
    ├── 01_API_ROUTES_AND_ENDPOINTS.md    # Next.js App/Pages API routes, Express, Hono
    ├── 02_DATABASE_MODELS_AND_SCHEMA.md  # Prisma, Drizzle, and Raw SQL table models
    ├── 03_SERVER_ACTIONS_AND_MUTATIONS.md# Server Action exports and mutation signatures
    ├── 04_AUTH_AND_MIDDLEWARE_GUARDS.md  # Middleware matchers, public vs protected routes
    ├── 05_INTEGRATIONS_AND_WEBHOOKS.md   # Stripe, Resend, Supabase, S3 integrations
    ├── 06_FULLSTACK_CROSS_REFERENCE_MAP.md# UI Trigger -> API -> Service -> DB model traces
    └── 07_ENV_AND_SECRETS_MAP.md         # Client secret leak radar and shadow env audit
```

Additionally, root `llms.txt` and `llms-full.txt` are created following the official Answer.AI standard.

---

## CLI Reference

### Developer Commands
| Command | Description |
| :--- | :--- |
| `npx fullstack-audit` | Regenerates both frontend and backend atlases plus root `llms.txt`. |
| `npx fullstack-audit --diff` | Reports architectural changes compared to the previous audit run. |
| `npx fullstack-audit --verify --gate-clean` | Executes typecheck and test validation gates before commit. |
| `npx fullstack-audit --setup-all` | Injects configuration rules into Cursor, Claude Code, and Antigravity. |
| `npx fullstack-audit -v` | Displays current version and engine banner. |

### Autonomous Agent Primitives (Sub-3ms)
| Flag | Description |
| :--- | :--- |
| `--find <query> [--compact]` | Inverted index search across components, queries, and schema models. |
| `--resolve <name>` | Case-insensitive fuzzy component resolver (e.g., `connect-modal` ➔ `ConnectModal.tsx`). |
| `--symbol <name>` | Retrieves exact start and end line bounds for functions inside God-files. |
| `--patch <file> --target <old> --replace <new>` | CRLF-safe string replacement tool immune to PowerShell syntax errors. |

---

## Installation Profiles (Optional)

<details>
<summary><b>View Installation Profiles and Triad Setup</b></summary>

Fullstack Audit runs standalone with zero external dependencies. For environments utilizing multi-agent workflows, three configuration profiles are available:

| Capability | Profile A: Full Synergy Triad | Profile B: Standalone Mode | Profile C: Custom |
| :--- | :---: | :---: | :---: |
| **Fullstack Audit Engine** | ✅ Included | ✅ Included | ✅ Included |
| **Anti-Overengineering (KISS)** | ✅ Included (`ponytail`) | ❌ Standard | Optional |
| **Terse Communication** | ✅ Included (`caveman`) | ❌ Standard | Optional |
| **Verification Gate** | ✅ Included (`superpowers`) | ❌ Standard | Optional |
| **External Dependencies** | 3 plugins | **0 (Zero dependencies)** | Custom |
| **Token Reduction** | **~92%** | **~65%** | 70%–85% |

### Quick Setup

#### Standalone Mode (Zero Dependencies)
```bash
npx fullstack-audit --setup-all --standalone
```

#### Full Synergy Triad Setup
```powershell
# Windows:
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)

# macOS / Linux:
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```
</details>

---

## Deep-Dive Documentation

- [Master Usage Guide](docs/MASTER_USAGE_GUIDE.md): Comprehensive developer workflows and cache debugging.
- [How It Works](docs/HOW_IT_WORKS.md): AST architecture and sub-350ms static parser engine.
- [Empirical Benchmarks](docs/HOW_IT_WORKS.md#empirical-benchmarks): Comparative benchmark runtime data and methodology.
- [Multi-Agent Recipes](docs/MULTI_AGENT_RECIPES.md): Parallel Map-Reduce sweeps across 4 codebase zones.
- [Changelog](CHANGELOG.md): SemVer release notes and upgrade guide.

---

## License

MIT License © 2026 EURIE
