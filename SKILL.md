---
name: frontend-audit
description: Universal frontend architecture and design system audit skill. Auto-discovers Next.js / React project structure, maps routes to components, catalogs buttons, modals, and cards, audits design tokens, and detects UI islands or styling drift into docs/frontend-atlas/.
version: 1.1.0
allowed-tools:
  - run_command
  - Bash(npx tsx .agent/skills/frontend-audit/scripts/audit.ts)
  - Bash(npm run audit:frontend)
---

# 🗺️ Universal Frontend Atlas & Design System Audit Skill

This skill provides an automated audit engine and navigation atlas for any Next.js or React web project.

It runs locally with zero external configuration, auto-detects project routing (App Router, Pages Router, `src/`), parses Tailwind tokens, catalogs UI components, and builds persistent Markdown documentation in `docs/frontend-atlas/`.

---

## 🚀 How to Run the Audit Tool

Whenever an agent or developer needs to inspect, refresh, or verify the frontend catalog:

### Option A: Via NPM Script (If installed in project package.json)
```bash
npm run audit:frontend
```

### Option B: Direct Skill Tool Execution (Universal / Any Project)
```bash
npx tsx .agent/skills/frontend-audit/scripts/audit.ts
```
*(On Windows PowerShell, use `npx.cmd tsx .agent/skills/frontend-audit/scripts/audit.ts`)*

---

## 📦 How This Skill Works Across Different Repositories (Universal Compatibility)

If you copy or clone this skill to another GitHub repository or another project, **it adapts automatically**:

1. **Framework & Router Auto-Discovery**:
   - Detects Next.js App Router (`app/` or `src/app/`).
   - Detects Next.js Pages Router (`pages/` or `src/pages/`).
   - Detects React / Vite / Remix component directories (`components/` or `src/components/`).
2. **Dynamic Business Zone Categorization**:
   - Automatically segments routes by their top-level folders (e.g. `admin/` ➡️ **Admin Panel**, `portal/` ➡️ **Portal**, `(public)/` or `shop/` ➡️ **Storefront**, `auth/` ➡️ **Auth & Onboarding**).
   - Adapts to any folder structure without hardcoded project names.
3. **Dynamic Design Token Extraction**:
   - Automatically reads `tailwind.config.*` to discover whatever custom tokens that specific project defines.
   - Detects custom palette tokens and flags rogue colors (hardcoded hexes and un-tokenized Tailwind classes).
4. **Zero-Config Persistent Markdown Atlas**:
   - Generates clean Markdown files in `docs/frontend-atlas/`:
     - `01_ROUTES_AND_PANELS_MAP.md` (Every URL linked to page and imported components)
     - `02_COMPONENT_INVENTORY.md` (Buttons, Modals, Drawers, Cards)
     - `03_DESIGN_TOKENS_AND_COLORS.md` (Color tokens, Top hardcoded hexes, Rogue utilities)
     - `04_UI_ISLANDS_AND_DRIFT.md` (Native element drift, custom modal redundancies)
     - `README.md` (Platform statistics and navigation guide)

---

## 🧭 Agent Execution Protocols

### Protocol 1: Fast Component & Route Targeting
When asked to fix or locate any page or section (e.g. *"Ayusin ang hero section"*, *"Update checkout modal"*, *"Locate reseller wallet"*):
1. **Never guess paths.** Check `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` first.
2. Locate the route and immediately identify its `Page File`, `Layout File`, and `Key Imported Components`.
3. Open the specific file directly using its clickable link.

### Protocol 2: Standardizing Components & Eliminating UI Islands
When auditing buttons or cards:
1. Open `docs/frontend-atlas/02_COMPONENT_INVENTORY.md`.
2. Check the raw `<button>` list by panel. Replace raw `<button className="...">` with the project's standardized `<Button>` component (`components/ui/button.tsx` or equivalent).
3. Ensure modals use standard primitives (`components/ui/modal.tsx`) instead of custom overlay hacks.

### Protocol 3: Global Color Theme Enforcement (Zero Missed Files)
When asked to update the color theme or dark mode across the entire website:
1. Open `docs/frontend-atlas/03_DESIGN_TOKENS_AND_COLORS.md`.
2. Review the top hardcoded hexes and rogue color utilities.
3. Systematically replace them using the exact file and line numbers provided in the atlas.
4. Because every occurrence is indexed, no screen or panel will be missed.

### Protocol 4: Re-Audit Verification
After making frontend edits:
1. Run `npm run audit:frontend` (or `npx tsx .agent/skills/frontend-audit/scripts/audit.ts`).
2. Verify that the raw button count or rogue hex count in `docs/frontend-atlas/README.md` decreased.
3. Run `npm run typecheck` to confirm zero regression.
