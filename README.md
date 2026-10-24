# Fullstack Audit

> **Global Architecture Plugin & Native MCP Synergy Engine for AI Coding Assistants**  
> Sub-3ms deterministic codebase navigation for **Antigravity, Cursor, Claude Code, Windsurf, OpenCode, Codex, and Hermes**.  
> Automatically indexes Next.js, React, Nuxt, SvelteKit, Astro, Remix, and backend APIs into zero-grep in-memory atlases.

[![Version](https://img.shields.io/badge/version-2.13.1-blue.svg)](https://github.com/Eurie92/fullstack-audit-skill/releases)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Benchmark](https://img.shields.io/badge/benchmark-200%2F200%20passed%20(0.18ms)-brightgreen.svg)](docs/BENCHMARK_100_REPORT.md)
[![MCP Protocol](https://img.shields.io/badge/protocol-Model%20Context%20Protocol%20(MCP)-purple.svg)](https://modelcontextprotocol.io/)
[![Zero Config](https://img.shields.io/badge/config-zero%20config-blue.svg)]()

[Master Usage Guide](docs/MASTER_USAGE_GUIDE.md) | [How It Works](docs/HOW_IT_WORKS.md) | [Multi-Agent Recipes](docs/MULTI_AGENT_RECIPES.md) | [Empirical Benchmarks](docs/HOW_IT_WORKS.md#empirical-benchmarks) | [Changelog](CHANGELOG.md)

---

## ⚡ Why Fullstack Audit? (The 1-Second Answer)

When AI assistants (Cursor, Antigravity, Claude Code) try to find components or backend models using recursive grep (`grep -r` or `Get-ChildItem -Recurse`), they waste **100,000+ tokens**, trigger **15–30s Windows Defender freezes**, and hallucinate paths.

**Fullstack Audit fixes this completely:**
* 🚀 **0ms to 3ms Lookups**: Runs as a persistent background MCP daemon in ~20MB RAM.
* 🛡️ **Zero Project Clutter**: No files are dumped into your project root. Documentation stays organized in `docs/frontend-atlas/` and `docs/backend-atlas/`.
* 🤖 **100% Automatic**: You prompt normally in chat (*"Where is the checkout button?"*). The AI automatically invokes native tools to find exact `file:line` bounds in milliseconds.

---

## 🚀 10-Second Setup (Universal Across All Harnesses)

### 1. Google Antigravity (Global Plugin)
Already installed in `~/.gemini/config/plugins/fullstack-audit/`! Works automatically across all your projects.

### 2. Cursor (MCP Integration)
Go to **Cursor Settings** ➔ **Features** ➔ **MCP** ➔ **Add New MCP Server**:
* **Name**: `fullstack-audit`
* **Type**: `command`
* **Command**: `node C:/Users/EURIE/.gemini/config/plugins/fullstack-audit/bin/mcp-server.js`

### 3. Claude Code
Run once in your terminal:
```bash
claude mcp add fullstack-audit -- node C:/Users/EURIE/.gemini/config/plugins/fullstack-audit/bin/mcp-server.js
```

### 4. OpenCode / Codex / Hermes
Add to your harness configuration (`opencode.json` or `mcp_config.json`):
```json
{
  "mcpServers": {
    "fullstack-audit": {
      "command": "node",
      "args": ["C:/Users/EURIE/.gemini/config/plugins/fullstack-audit/bin/mcp-server.js"]
    }
  }
}
```

---

## 🎮 Cheat Sheet: The 7 Native MCP Superpowers

Your AI coding assistant automatically uses these 7 tools. You don't even need to type them manually!

| Native Tool | What It Does | Example Use Case | Speed |
| :--- | :--- | :--- | :---: |
| **`fullstack_find`** | Instant inverted index search across all symbols, routes, components, and queries. | *"Find the checkout modal"* or *"Where is user query defined?"* | **< 3ms** |
| **`fullstack_locate_visual`** | 0ms visual element locator for live status dots, capsule pills, action icons, and badges. | *"Where is the green pulse dot?"* or *"Locate the shopping cart icon"* | **0ms** |
| **`fullstack_resolve`** | Prefix-agnostic fuzzy file resolver (`connect-modal` ➔ `ConnectModal.tsx`). | Finding files without knowing if they live in `components/`, `src/`, or `app/` | **0ms** |
| **`fullstack_path`** | Causal execution path tracer (`UI Component ➔ API Route ➔ DB Model`). | *"Trace what happens when clicking Place Order"* | **< 5ms** |
| **`fullstack_symbol`** | Retrieves exact start & end line numbers for functions inside 1,000+ line God-files. | Reading just lines 140–185 instead of burning tokens on the whole file | **< 1ms** |
| **`fullstack_patch`** | Surgical CRLF-safe string replacer immune to PowerShell quoting & `&` crashes. | Replacing code blocks cleanly without touching surrounding lines | **< 2ms** |
| **`fullstack_audit`** | Refreshes and updates the entire architecture atlas in `docs/`. | Updating maps after adding new routes or database tables | **~300ms** |

---

## 📖 How It Works in Practice

```text
User: "Fix the red arrow button in the storefront hero"
                  │
                  ▼
AI Agent: Calls fullstack_find("Explore 12 Dispensers")   <── 1ms in-memory
                  │
                  ▼
Result: components/public/storefront-hero.tsx:76 [ACTION LINK]
                  │
                  ▼
AI Agent: Reads lines 70–85 and delivers the fix in 2 seconds!
```

---

## 📁 Generated Architecture Atlases (`docs/`)

When you run an audit, Fullstack Audit documents your architecture neatly inside `docs/` (zero clutter in project root):

```text
docs/
├── frontend-atlas/
│   ├── 01_ROUTES_AND_PANELS_MAP.md         # Route tree, layouts, RSC [Server]/[Client] boundaries
│   ├── 02_COMPONENT_INVENTORY.md           # Triggers, modals, live pulse dots, capsule pills
│   ├── 03_DESIGN_TOKENS_AND_COLORS.md      # 22+ Tailwind color matrix & dark mode asymmetries
│   ├── 04_UI_ISLANDS_AND_DRIFT.md          # UI drift analysis & styling consolidation targets
│   ├── 05_DEAD_ORPHANED_COMPONENTS.md      # Unused component audit & safe removal guide
│   ├── 06_VISIBLE_TEXT_AND_LABELS_MAP.md   # Screenshot-to-code text index (buttons, CTAs, headings)
│   ├── 07_VISUAL_AND_ICON_INDEX.md         # Action icon index with interactive context
│   ├── 08_DISPATCH_GATEWAY.md              # Agent triage matrix & tool routing table
│   ├── 09_QUERY_AND_CACHE_MAP.md           # TanStack React Query cache keys & invalidations
│   ├── 10_GOD_FILES_SURGICAL_MAP.md        # AST line slices for monolithic files (>500 lines)
│   ├── 11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md # Risk scoring (0-100) & blast radius tiers
│   └── 12_TEST_SUITES_AND_COVERAGE_MAP.md  # Test suite index & assertion map
└── backend-atlas/
    ├── 01_API_ROUTES_AND_ENDPOINTS.md      # HTTP API routes, methods, auth guards
    ├── 02_DATABASE_MODELS_AND_SCHEMA.md    # Prisma, Drizzle, and Raw SQL table models
    ├── 03_SERVER_ACTIONS_AND_MUTATIONS.md  # Server Actions ("use server") and DB mutations
    ├── 04_AUTH_AND_MIDDLEWARE_GUARDS.md    # Middleware matchers & route protection rules
    ├── 05_INTEGRATIONS_AND_WEBHOOKS.md     # Stripe, Resend, Supabase, S3 integrations
    ├── 06_FULLSTACK_CROSS_REFERENCE_MAP.md # Deep bi-directional bridge (UI -> API -> DB)
    └── 07_ENV_AND_SECRETS_MAP.md           # Client secret leak radar & shadow env audit
```

---

<details>
<summary><b>📦 Updating, Maintenance & Troubleshooting Guide (Click to Expand)</b></summary>

### Updating Fullstack Audit
To update the global plugin and engine to the latest release:

```powershell
# Windows PowerShell (Always works in-memory without execution policy issues)
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```

### Windows Troubleshooting: `npx.ps1 cannot be loaded`
If you run `npx` in Windows PowerShell and encounter `UnauthorizedAccess`:
* **Cause**: Windows PowerShell blocks unsigned `.ps1` scripts by default.
* **Fix**: Use native MCP tools (which don't use PowerShell at all), or run `npx.cmd` instead of `npx`.

### Developer Terminal Commands (Optional)
If you prefer running scans from the terminal:
* `npm run audit`: Regenerates all atlases in `docs/`.
* `npm run audit:theme`: Generates a rebrand and dark-mode checklist.
* `npm run audit:backend`: Generates only the backend API and database atlas.

</details>

---

## 📊 Empirical Benchmarks (Tested on Live SaaS Repositories)

| Metric | Vanilla AI Agent (PowerShell Grep) | Fullstack Audit (Native MCP) | Measured Advantage |
| :--- | :---: | :---: | :--- |
| **Median Latency (p50)** | 2,296.81 ms | **0.18 ms** | **12,760x faster** |
| **95th Percentile (p95)** | 3,751.85 ms | **1.67 ms** | **2,246x faster** |
| **Target Accuracy Rate** | 74.0% | **99.5%** | **Zero hallucinations** |
| **Context Token Footprint** | 250,000 tokens | **4,200 tokens** | **98.3% token savings** |

---

## 📄 License

Apache-2.0 © [Eurie Paulino](https://github.com/Eurie92)
