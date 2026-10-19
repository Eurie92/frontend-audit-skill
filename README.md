# 🗺️ Frontend Audit Skill (`frontend-audit`)

> **Universal Frontend Architecture, Design System & UI Island Audit Engine**  
> Auto-discovers Next.js, Vite & React projects, maps routes to components, catalogs buttons, modals, and cards, audits design tokens, detects orphaned code, and eliminates UI islands into persistent Markdown documents (`docs/frontend-atlas/`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: v1.3.1](https://img.shields.io/badge/Release-v1.3.1-emerald.svg)](https://github.com/Eurie92/frontend-audit-skill/releases)
[![Frameworks: Next.js | Vite | React](https://img.shields.io/badge/Frameworks-Next.js%20%7C%20Vite%20%7C%20React-black.svg)](https://react.dev/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Eurie92/frontend-audit-skill/pulls)

---

## 🎯 The Problem It Solves

In growing web applications—especially multi-tenant architectures featuring Public Storefronts, Admin Panels, Reseller/Customer Portals, and Dashboards—three common pitfalls routinely emerge:

1. **"UI Islands" (Fragmented Design Systems)**:
   - Some pages use a standardized `<Button>` component, while half the codebase uses raw `<button className="...">` tags with arbitrary border-radii, rogue paddings, and inconsistent hover states.
2. **Invisible Color & Theme Drift**:
   - When rebranding or updating a dark/light mode palette, developers and AI agents inevitably leave behind rogue panels because dozens of hardcoded hex codes (`#1e293b`, `#27272a`) and un-tokenized Tailwind grays (`zinc`, `neutral`, `stone`) remain scattered across hundreds of files.
3. **Lost AI Coding Assistants in Massive Repos**:
   - Asking an AI assistant to *"Fix the hero section"* or *"Update the button in this screenshot"* often causes it to read hundreds of files or waste thousands of tokens scanning directories.

**`frontend-audit`** resolves all three issues in **under 3 seconds** with **zero manual configuration**.

---

## 📦 Installation & Updating

To install or update `frontend-audit` to the latest version in any project, run this 1-line command in your project root:

**Windows (PowerShell)**:
```powershell
irm https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.ps1 | iex
```

**macOS / Linux**:
```bash
curl -fsSL https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.sh | bash
```

> **✨ Zero-Config Auto Setup**: The install script automatically downloads the skill into `.agent/skills/frontend-audit/` AND configures your project's `AGENTS.md` (or `GEMINI.md` / `CLAUDE.md`) with the `Frontend Architecture & Component Lookup Rule` so your AI assistant follows it immediately with 100% compliance!
>
> *(Or simply tell your AI assistant in chat: "Please update the frontend-audit skill to the latest version from GitHub.")*

---

## ⚡ How to Run It

### 💬 Option A: Inside AI Chat (Recommended)
You **do not need to open a terminal**. When chatting with Antigravity, AGY, or Claude Code, simply type:
```text
/frontend-audit
```
Or query specific sections directly in the chat:
```text
/frontend-audit --find "button"
/frontend-audit --dead
/frontend-audit --fix-buttons
```
Your AI assistant will automatically execute the audit in the background and report the summary right in your chat!

---

### 💻 Option B: From the Terminal (Manual CLI)
If you prefer running from the command line or CI/CD pipelines:
```bash
# Direct run via npx:
npx frontend-audit

# Continuous auto-sync on file save:
npx tsx .agent/skills/frontend-audit/scripts/audit.ts --watch

# Instant sub-second search:
npx tsx .agent/skills/frontend-audit/scripts/audit.ts --find "hero"

# Scan orphaned components:
npx tsx .agent/skills/frontend-audit/scripts/audit.ts --dead

# Auto-migrate raw HTML buttons:
npx tsx .agent/skills/frontend-audit/scripts/audit.ts --fix-buttons
```

---

## 📸 Screenshot-to-Code: How to Target Any Element From an Image

When a user provides a UI screenshot and asks: *"Please fix this button"*:

1. **Context Clues**: The AI identifies the **Page or Route context** from the screenshot (e.g. Reseller Wallet, Storefront Hero, Admin Orders).
2. **Instant Atlas Lookup**: Instead of scanning 200+ files or running slow search commands, the AI reads `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` directly in 0ms to inspect every component mounted by that route.
3. **Exact Line Pinpointing**: The component inventory (`docs/frontend-atlas/02_COMPONENT_INVENTORY.md`) gives the exact file, line number, and accessibility attributes:
   ```text
   Line 45: components/reseller/p2p-topup-modal.tsx -> <button className="btn-primary">
   ```
4. **Collaborative Polish**: Specialized skills like `emil-design-eng` (physics) or `ui-ux-pro-max` (styling) immediately apply edits directly to that file with zero delay.

---

## 🧭 What the Engine Produces (`docs/frontend-atlas/`)

Running the audit automatically creates or refreshes 6 clean Markdown files in `docs/frontend-atlas/`:

```
your-project/
└── docs/
    └── frontend-atlas/
        ├── 01_ROUTES_AND_PANELS_MAP.md     # 🗺️ Every route mapped to page files & components
        ├── 02_COMPONENT_INVENTORY.md       # 🔘 Buttons (with a11y fast-check), Modals & Surfaces
        ├── 03_DESIGN_TOKENS_AND_COLORS.md  # 🎨 Official tokens vs rogue hex drift & grays
        ├── 04_UI_ISLANDS_AND_DRIFT.md      # 🏝️ UI drift & priority unification checklist
        ├── 05_DEAD_ORPHANED_COMPONENTS.md  # 👻 Unused component punch-list & safe removal guide
        └── README.md                       # 📊 High-level statistics and navigation dashboard
```

### ♿ Accessibility (a11y) Fast-Check
Inside `02_COMPONENT_INVENTORY.md`, every button is audited for:
- ⚠️ **Missing Accessible Name / `aria-label`**: Detects icon buttons or buttons without screen-reader text.
- ℹ️ **Missing Explicit `type="button"`**: Flags buttons in forms that can trigger accidental submits.

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
## 🗺️ Frontend Architecture & Component Lookup Rule
For all UI, component, route, or color theme tasks (including screenshots and visual bug reports):
1. **Instant Atlas Lookup**: ALWAYS read `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` (or relevant atlas file in `docs/frontend-atlas/`) FIRST via file reading. It indexes all routes, page files, and imported components with 0ms runtime overhead.
2. **No Blind Full-Codebase Grepping**: Do NOT run full-codebase grep searches across hundreds of files when the route and component hierarchy is already indexed in the Frontend Atlas.
3. **Continuous Sync**: At the completion of every frontend modification, execute `npm run audit:frontend` to keep the atlas 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/frontend-audit` or `npm run audit:frontend`: Regenerates the entire Frontend Atlas.
- `npx tsx scripts/audit-frontend.ts --watch`: Live file watcher for continuous background sync.
- `npx tsx scripts/audit-frontend.ts --dead`: Scans for potential orphaned components.
```

### Why this works:
- **0ms Lookup Overhead**: The agent reads the pre-compiled Markdown files directly instead of booting up heavy CLI compilers or guessing keywords.
- **Accurate Route Scoping**: Even when searching for visual concepts (like *"rotating icons"* or *"checkout modal"*), the agent instantly sees the exact component imported by that route.
- **Zero Hallucination / Zero Dead Code**: The agent only modifies active, imported components and ignores abandoned legacy files.

---

## 🛡️ CI/CD & Safe Versioning (GitHub Actions)

This repository includes a production-ready automated release and verification pipeline:
1. **Automated CI Workflow (`.github/workflows/ci.yml`)**: Runs on every Pull Request and Push to verify TypeScript compilation and execute the CLI smoke test.
2. **Automated GitHub Releases (`.github/workflows/release.yml`)**: Generates GitHub Releases and release notes upon pushing tags (`v1.2.0`, `v1.3.0`) to `main`.
3. **Pull Request Template (`.github/pull_request_template.md`)**: Enforces pre-merge verification across Next.js and Vite to prevent regressions.

---

## 📄 License

MIT License © 2026 EURIE
