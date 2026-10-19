# 🗺️ Frontend Audit Skill (`frontend-audit`)

> **Universal Frontend Architecture, Design System & UI Island Audit Engine**  
> Auto-discovers Next.js, Vite & React projects, maps routes to components, catalogs buttons, modals, and cards, audits design tokens, and detects UI islands into persistent Markdown documents (`docs/frontend-atlas/`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
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
3. **Lost AI Coding Assistants**:
   - Asking an AI assistant to *"Fix the hero section"* or *"Update the checkout modal"* often causes it to waste thousands of tokens scanning directories or editing outdated duplicate components.

**`frontend-audit`** resolves all three issues in **under 3 seconds** with **zero manual configuration**.

---

## ⚡ Quickstart

### 1. Using Slash Command in Your AI Assistant:
Simply type in your chat:
```text
/frontend-audit
```
Your assistant will immediately execute the audit engine, update the atlas, and report high-level metrics without triggering unrelated design skills.

### 2. Using Terminal / CLI:
```bash
npx tsx .agent/skills/frontend-audit/scripts/audit.ts
```
*(On Windows PowerShell: `npx.cmd tsx .agent/skills/frontend-audit/scripts/audit.ts`)*

### 3. Adding to `package.json`:
```json
{
  "scripts": {
    "audit:frontend": "tsx .agent/skills/frontend-audit/scripts/audit.ts"
  }
}
```
Then run:
```bash
npm run audit:frontend
```

---

## 🧭 What the Engine Produces (`docs/frontend-atlas/`)

Running the audit automatically creates or refreshes 5 clean Markdown files in `docs/frontend-atlas/`:

```
your-project/
└── docs/
    └── frontend-atlas/
        ├── 01_ROUTES_AND_PANELS_MAP.md     # 🗺️ Every route mapped to page files & components
        ├── 02_COMPONENT_INVENTORY.md       # 🔘 Catalog of all buttons, modals, and surfaces
        ├── 03_DESIGN_TOKENS_AND_COLORS.md  # 🎨 Official tokens vs rogue hex drift & grays
        ├── 04_UI_ISLANDS_AND_DRIFT.md      # 🏝️ Priority checklist of custom styling deviations
        └── README.md                       # 📊 High-level statistics and navigation dashboard
```

### 1. `01_ROUTES_AND_PANELS_MAP.md` (Instant GPS)
* Maps every route (e.g. `/`, `/admin/orders`, `/portal/wallet`) to its corresponding page file (`page.tsx`, `App.jsx`), layout, and imported components.
* **Benefit**: When asked to *"Fix the Hero section"*, the AI immediately knows the exact file without guessing.

### 2. `02_COMPONENT_INVENTORY.md` (Button & Element Catalog)
* Audits every button across the platform: compares official `<Button>` component usages against raw `<button>` HTML elements.
* Provides direct clickable file links with line numbers (e.g. `src/App.jsx:503`) to accelerate standardization.

### 3. `03_DESIGN_TOKENS_AND_COLORS.md` (Zero-Missed-Colors Ledger)
* Ranks hardcoded hex codes by frequency and identifies affected files.
* Lists all rogue utility classes (`zinc`, `neutral`, `stone`) bypassing the project's Tailwind configuration.

### 4. `04_UI_ISLANDS_AND_DRIFT.md` (Actionable Fixes)
* Highlights custom modal structures, inline `style={{...}}` usages, and fragmented button implementations for swift refactoring.

---

## 🌐 Universal Compatibility

Runs seamlessly on modern web frameworks:
* ✅ **Next.js App Router** (`app/**/page.tsx`)
* ✅ **Next.js Pages Router** (`pages/**/*.tsx`)
* ✅ **Vite + React SPAs** (`src/App.jsx`, `src/main.jsx`)
* ✅ **Tailwind CSS** (Auto-extracts custom palette tokens from `tailwind.config.*`)
* ✅ **TypeScript & JavaScript** (`.tsx`, `.jsx`, `.ts`, `.js`)

---

## 🤖 Skill Synergy (How It Powers Other Agent Skills)

`frontend-audit` serves as the foundational spatial index for other specialized frontend skills:

| Skill | How They Collaborate |
| :--- | :--- |
| **`frontend-audit`** | **The GPS & Inventory**: Identifies *where* every button, route, and color token lives in the codebase. |
| **`ui-ux-pro-max`** | Uses the color audit list to enforce proper design tokens, typography scales, and contrast hierarchies. |
| **`emil-design-eng`** | Uses the button inventory to attach spring physics and micro-interactions across every interactive element. |
| **`impeccable`** | Uses the UI islands report to harden accessibility (a11y), focus traps, and modal lifecycles. |

---

## 🛡️ CI/CD & Safe Versioning (GitHub Actions)

This repository includes a production-ready automated release and verification pipeline:
1. **Automated CI Workflow (`.github/workflows/ci.yml`)**: Runs on every Pull Request and Push to verify TypeScript compilation and execute the CLI smoke test.
2. **Automated GitHub Releases (`.github/workflows/release.yml`)**: Generates GitHub Releases and release notes upon pushing tags (`v1.0.1`, `v1.1.0`) to `main`.
3. **Pull Request Template (`.github/pull_request_template.md`)**: Enforces pre-merge verification across Next.js and Vite to prevent regressions.

---

## 📄 License

MIT License © 2026 EURIE
