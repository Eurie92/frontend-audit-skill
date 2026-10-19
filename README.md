# 🗺️ Frontend Audit Skill (`frontend-audit`)

> **Universal Frontend Architecture, Design System & UI Island Audit Engine**  
> Auto-discovers Next.js / React projects, maps routes to components, catalogs buttons, modals, and cards, audits design tokens, and detects UI islands into persistent Markdown documents (`docs/frontend-atlas/`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js / React](https://img.shields.io/badge/Framework-Next.js%20%7C%20React-black.svg)](https://nextjs.org/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()

---

## 🎯 Why This Skill Exists

In growing Next.js and React codebases (especially multi-tenant apps with Storefronts, Admin Panels, Portals, and Dashboards), three major problems routinely occur:

1. **"UI Islands" & Inconsistency**: Different developers or AI agents write custom `<button className="...">` or custom modals instead of reusing standard UI primitives, resulting in fragmented visual styles.
2. **Color & Theme Drift**: When attempting to change or unify a color theme, dozens of hardcoded hex colors (`#1e293b`, `#27272a`) and rogue Tailwind gray classes (`zinc`, `stone`, `neutral`) remain scattered across hidden components.
3. **Lost Component Locations**: AI agents and developers waste tokens and time searching for where specific sections (e.g. Hero, Catalog, Checkout, Settings) are mounted.

**`frontend-audit`** solves all three problems in **under 5 seconds** with **zero manual configuration**.

---

## ✨ Features

- ⚡ **Lightning Fast**: Scans hundreds of files in 2–4 seconds using static AST and regex parsing.
- 🔍 **Universal Auto-Discovery**:
  - Automatically detects **Next.js App Router** (`app/`), **Pages Router** (`pages/`), or standard React (`src/`).
  - Automatically extracts custom color tokens from `tailwind.config.*`.
  - Automatically identifies UI primitives libraries (`components/ui`).
- 📁 **Dynamic Business Zone Segmentation**: Groups routes and components by their actual folder hierarchy (e.g. `Admin Panel`, `Storefront (Public)`, `Portal`, `Auth & Onboarding`).
- 🔘 **Button & Component Inventory**: Directly identifies all standardized `<Button>` usages vs raw `<button>` HTML tags with exact line numbers.
- 🎨 **Rogue Hex & Color Drift Matrix**: Ranks the top hardcoded hex colors by frequency and affected files so zero files are missed during global theme updates.
- 📑 **Persistent Markdown Atlas**: Writes 5 clean, human- and AI-readable Markdown files in `docs/frontend-atlas/`.

---

## 📑 The Generated Frontend Atlas (`docs/frontend-atlas/`)

Running the audit produces a dedicated atlas directory:

```
docs/frontend-atlas/
├── 01_ROUTES_AND_PANELS_MAP.md     # Route -> Page file -> Layout -> Imported Components
├── 02_COMPONENT_INVENTORY.md       # Buttons, Modals, Drawers, Cards across panels
├── 03_DESIGN_TOKENS_AND_COLORS.md  # Official tokens vs Rogue hexes and gray utilities
├── 04_UI_ISLANDS_AND_DRIFT.md      # Identified UI islands, raw buttons, and drift
└── README.md                       # High-level statistics and navigation guide
```

---

## 🚀 Installation & Usage

### 1. As an AI Agent Skill (Antigravity / Claude Code / Cursor)

Clone or copy this skill folder into your project's `.agent/skills/` or `.agents/skills/`:

```bash
# In your project root:
git clone https://github.com/Eurie92/frontend-audit-skill.git .agent/skills/frontend-audit
```

Once installed, your AI agent can automatically run or consult the skill whenever you prompt:
- *"Audit the entire frontend"*
- *"Where is the hero section located?"*
- *"Update the color theme across the entire website, leave nothing behind"*
- *"Find all button inconsistencies across our admin and portal"*

### 2. Run Directly via CLI (Zero Install)

Run directly from any project root using `npx`:

```bash
npx tsx .agent/skills/frontend-audit/scripts/audit.ts
```

*(On Windows PowerShell: `npx.cmd tsx .agent/skills/frontend-audit/scripts/audit.ts`)*

### 3. Add to `package.json` Scripts

In your project's `package.json`:

```json
{
  "scripts": {
    "audit:frontend": "tsx .agent/skills/frontend-audit/scripts/audit.ts"
  }
}
```

Then simply execute:
```bash
npm run audit:frontend
```

---

## 🛠️ How It Works (Protocol Overview)

```
[Project Source Code] (app/, components/, src/)
       │
       ▼
[Dynamic Discovery] ── Detects Next.js Router, Tailwind Config, UI Primitives
       │
       ▼
[AST & Token Audit] ── Analyzes Buttons, Cards, Modals, Hex Drift, Typography
       │
       ▼
[docs/frontend-atlas/]
  ├── 01_ROUTES_AND_PANELS_MAP.md      (Instant lookup for sections)
  ├── 02_COMPONENT_INVENTORY.md        (Standard vs raw buttons & cards)
  ├── 03_DESIGN_TOKENS_AND_COLORS.md   (Ranked hexes & rogue classes)
  └── 04_UI_ISLANDS_AND_DRIFT.md       (Actionable unification checklist)
```

---

## 📄 License

MIT License © 2026 EURIE
