# Fullstack Audit

> **Universal Architecture Engine & Native MCP Companion for AI Coding Assistants**  
> Sub-3ms deterministic codebase navigation for Antigravity, Cursor, Claude Code, Windsurf, OpenCode, Codex, and Hermes.  
> Automatically indexes Next.js, React, Nuxt, SvelteKit, Astro, Remix, and backend APIs into zero-grep in-memory atlases.

[![Version](https://img.shields.io/badge/version-2.13.2-blue.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Benchmark](https://img.shields.io/badge/benchmark-200%2F200%20passed%20(0.43ms)-brightgreen.svg)](docs/BENCHMARK_200_XNIGHT_REPORT.md)
[![MCP Protocol](https://img.shields.io/badge/protocol-Model%20Context%20Protocol%20(MCP)-purple.svg)](https://modelcontextprotocol.io/)
[![Zero Config](https://img.shields.io/badge/config-zero%20config-blue.svg)]()

[Master Usage Guide](docs/MASTER_USAGE_GUIDE.md) | [How It Works](docs/HOW_IT_WORKS.md) | [200-Run Benchmark Report](docs/BENCHMARK_200_XNIGHT_REPORT.md) | [Changelog](CHANGELOG.md)

---

## Installation

Install Fullstack Audit directly into any project or AI environment:

### Windows (PowerShell)
```powershell
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)
```

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```

### Direct Execution via npx (Zero-Install)
```powershell
# Windows PowerShell / CMD:
npx.cmd fullstack-audit

# macOS / Linux:
npx fullstack-audit
```

### Universal Multi-Harness Auto-Configuration
To automatically configure Cursor (`.cursor/rules/`), Claude Code (`.claude/`), Antigravity, OpenCode, and Hermes across your environment:
```bash
npx fullstack-audit --setup-all
```

---

<details>
<summary><b>Updating Fullstack Audit & Windows Troubleshooting (Click to Expand)</b></summary>

### How to Update
Run the universal update one-liner to get the latest engine improvements, AST rules, and MCP tools:

```powershell
# Windows PowerShell (Evaluates in-memory without script execution policy blocks):
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)

# macOS / Linux:
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash

# Or directly in any installed project:
node .agent/skills/fullstack-audit/bin/audit.js --update
```

### Windows Troubleshooting: `npx.ps1 cannot be loaded`
If you encounter `UnauthorizedAccess` when running `npx` in Windows PowerShell:
* **Cause**: Windows PowerShell restricts unsigned `.ps1` scripts by default under the `Restricted` execution policy.
* **Solution 1 (Recommended)**: Use `npx.cmd fullstack-audit` instead of `npx fullstack-audit`.
* **Solution 2**: Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` once in PowerShell.

</details>

---

## Why Fullstack Audit?

When AI coding assistants (Antigravity, Cursor, Claude Code) attempt to find UI components, route files, or database models using raw grep searches (`grep -r` or `Get-ChildItem -Recurse`), they:
1. Waste **100,000+ context tokens** reading minified files and build directories (`.next/`, `node_modules/`).
2. Trigger **15–30 second Windows Defender AMSI process creation freezes**.
3. Hallucinate component paths and over-investigate parent layouts.

**Fullstack Audit solves this with a pre-computed AST index:**
* **Sub-Millisecond Retrieval**: Queries run against an in-memory index in **0.43ms (median)**.
* **Zero Project Clutter**: Generated documentation is stored exclusively in `docs/frontend-atlas/` and `docs/backend-atlas/`. Zero files are dumped into your project root.
* **Fully Automatic**: You prompt normally in chat (*"Where is the checkout button?"*). The AI invokes native MCP tools to locate exact line bounds in milliseconds.

---

## Cheat Sheet: The 7 Native MCP Tools

Your AI coding assistant automatically uses these 7 tools. You do not need to memorize or run them manually:

| Native Tool | Functionality | Example AI Prompt | Speed |
| :--- | :--- | :--- | :---: |
| **`fullstack_find`** | Instant inverted index search across symbols, components, routes, and queries. | *"Find the checkout modal"* or *"Where is user query defined?"* | **< 3ms** |
| **`fullstack_locate_visual`** | 0ms visual locator for live status dots, capsule pills, action icons, and badges. | *"Where is the green pulse dot?"* or *"Locate the cart icon"* | **0ms** |
| **`fullstack_resolve`** | Prefix-agnostic fuzzy file resolver (`connect-modal` -> `ConnectModal.tsx`). | Resolves exact paths without directory guessing | **0ms** |
| **`fullstack_path`** | Causal execution path tracer (`UI Component -> API Route -> DB Model`). | *"Trace what happens when clicking Place Order"* | **< 5ms** |
| **`fullstack_symbol`** | Retrieves exact start & end line numbers for functions inside God-files (>500 lines). | Slices just lines 140–185 instead of burning tokens on the whole file | **< 1ms** |
| **`fullstack_patch`** | Surgical CRLF-safe string replacer immune to PowerShell escaping & `&` crashes. | Replaces code blocks cleanly without touching surrounding lines | **< 2ms** |
| **`fullstack_audit`** | Refreshes and updates the entire architecture atlas in `docs/`. | Updates architecture maps after adding new routes or schema tables | **~300ms** |

---

## Harness Setup Guide

Fullstack Audit runs over standard Model Context Protocol (MCP) JSON-RPC 2.0 stdio, making it compatible with all modern AI harnesses:

### 1. Antigravity (Google DeepMind)
* **Global Plugin**: Automatically loaded via `~/.gemini/config/plugins/fullstack-audit/`.
* **Workspace Skill**: Works out of the box in any project installed with `scripts/install.ps1`.

### 2. Cursor
Add to **Cursor Settings** -> **Features** -> **MCP** -> **Add New MCP Server**:
* **Name**: `fullstack-audit`
* **Type**: `command`
* **Command**: `node .agent/skills/fullstack-audit/bin/mcp-server.js`

### 3. Claude Code
Register using the Claude Code CLI:
```bash
claude mcp add fullstack-audit -- node .agent/skills/fullstack-audit/bin/mcp-server.js
```

### 4. OpenCode / Codex / Hermes
Add to your harness configuration (`opencode.json` or `mcp_config.json`):
```json
{
  "mcpServers": {
    "fullstack-audit": {
      "command": "node",
      "args": [".agent/skills/fullstack-audit/bin/mcp-server.js"]
    }
  }
}
```

---

## Generated Architecture Atlases (`docs/`)

Running Fullstack Audit documents your codebase architecture neatly inside `docs/`:

```text
docs/
|-- frontend-atlas/
|   |-- 01_ROUTES_AND_PANELS_MAP.md         # Route hierarchy, layouts, RSC [Server]/[Client] boundaries
|   |-- 02_COMPONENT_INVENTORY.md           # Triggers, modals, live pulse dots, capsule pills
|   |-- 03_DESIGN_TOKENS_AND_COLORS.md      # Tailwind color matrix & dark mode asymmetries
|   |-- 04_UI_ISLANDS_AND_DRIFT.md          # UI drift analysis & styling consolidation targets
|   |-- 05_DEAD_ORPHANED_COMPONENTS.md      # Unused component audit & safe removal guide
|   |-- 06_VISIBLE_TEXT_AND_LABELS_MAP.md   # Screenshot-to-code text index (buttons, CTAs, headings)
|   |-- 07_VISUAL_AND_ICON_INDEX.md         # Action icon index with interactive context
|   |-- 08_DISPATCH_GATEWAY.md              # Agent triage matrix & tool routing table
|   |-- 09_QUERY_AND_CACHE_MAP.md           # TanStack React Query cache keys & invalidations
|   |-- 10_GOD_FILES_SURGICAL_MAP.md        # AST line slices for monolithic files (>500 lines)
|   |-- 11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md # Risk scoring (0-100) & blast radius tiers
|   `-- 12_TEST_SUITES_AND_COVERAGE_MAP.md  # Test suite index & assertion map
`-- backend-atlas/
    |-- 01_API_ROUTES_AND_ENDPOINTS.md      # HTTP API routes, methods, auth guards
    |-- 02_DATABASE_MODELS_AND_SCHEMA.md    # Prisma, Drizzle, and Raw SQL table models
    |-- 03_SERVER_ACTIONS_AND_MUTATIONS.md  # Server Actions ("use server") and DB mutations
    |-- 04_AUTH_AND_MIDDLEWARE_GUARDS.md    # Middleware matchers & route protection rules
    |-- 05_INTEGRATIONS_AND_WEBHOOKS.md     # Stripe, Resend, Supabase, S3 integrations
    |-- 06_FULLSTACK_CROSS_REFERENCE_MAP.md # Deep bi-directional bridge (UI -> API -> DB)
    `-- 07_ENV_AND_SECRETS_MAP.md           # Client secret leak radar & shadow env audit
```

---

## Empirical Benchmark (Live SaaS Codebase Evaluation)

Evaluated against 200 real-world queries on production codebases:

| Metric | Vanilla AI Agent (File Grep) | Fullstack Audit (Native MCP) | Advantage |
| :--- | :---: | :---: | :--- |
| **Median Latency (p50)** | 1,289.81 ms | **0.43 ms** | **3,016x faster** |
| **95th Percentile (p95)** | 9,368.69 ms | **10.57 ms** | **887x faster** |
| **99th Percentile (p99)** | 16,886.25 ms | **132.65 ms** | **127x faster** |
| **Average Latency (Mean)** | 2,415.18 ms | **3.03 ms** | **797x faster** |
| **Context Tokens Used** | 17,787,360 tokens | **4,500 tokens** | **99.97% token savings** |
| **Process Spawning** | 100 Child Processes | **0 Processes (In-Memory)** | **Zero Defender Lag** |

*See [`docs/BENCHMARK_200_XNIGHT_REPORT.md`](docs/BENCHMARK_200_XNIGHT_REPORT.md) for full benchmark methodology.*

---

## License

Apache-2.0 (c) [Eurie Paulino](https://github.com/Eurie92)
