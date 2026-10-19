---
name: frontend-audit
description: Runs the automated frontend atlas and design system catalog engine into docs/frontend-atlas/. Used to inspect or refresh routes, components, and design tokens, and to locate exact UI component files from screenshots or page names. DO NOT use for visual design critique, micro-animations, or CSS styling ideas (use impeccable, emil-design-eng, or ui-ux-pro-max instead).
version: 1.3.2
allowed-tools:
  - run_command
  - Bash(npx tsx .agent/skills/frontend-audit/scripts/audit.ts)
  - Bash(npm run audit:frontend)
---

# 🗺️ Universal Frontend Atlas & Design System Audit Skill

> **Trigger**: `/frontend-audit` or when locating UI components and routes.
> Run this skill when the user invokes `/frontend-audit`, asks to locate UI components, or asks to generate, update, or inspect the project's **Frontend Atlas** in `docs/frontend-atlas/`.

---

## 🚫 Routing & Trigger Boundaries

* **USE THIS SKILL FOR**:
  1. Locating exact component files and route owners directly from `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md`.
  2. Running the static audit engine to refresh `docs/frontend-atlas/`.
  3. Checking button standardization, a11y flags, design tokens, and dead components.
  4. Explicit slash command: `/frontend-audit`
* **DO NOT USE THIS SKILL FOR**:
  - UI visual design, styling ideas, or color advice ➡️ Use **`ui-ux-pro-max`** or **`design-taste-frontend`**.
  - Interaction physics, spring animations, micro-polish ➡️ Use **`emil-design-eng`**.
  - Accessibility audit or UX critique of a component ➡️ Use **`impeccable`**.

---

## 🚀 How to Locate Components (Sub-Second 0ms Lookup)

When locating a UI component, button, or route (especially from screenshots):
1. **DO NOT run a script.** The atlas is already compiled in `docs/frontend-atlas/`.
2. Open `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` directly via file viewing (`view_file`).
3. Find the Route corresponding to the screen (e.g. `/` for landing, `/admin/*`, `/portal/*`).
4. In the `Key Imported Components` column, locate the exact component (e.g. `public-navbar`, `storefront-hero`).
5. Open the target component file directly. Done in 0ms without running any commands!

## 🔄 When to Run the Audit Script
Run the audit script (`npm run audit:frontend` or `/frontend-audit`) **ONLY**:
1. When the user explicitly types `/frontend-audit`.
2. After finishing modifications to frontend code, to keep the atlas in sync.
2. Report the summary statistics:
   - Framework architecture detected (e.g. Next.js App Router, Vite React SPA)
   - Total frontend files and active routes
   - Button count: Standard `<Button>` vs raw `<button>`
   - Orphaned / Dead components count
   - Top hardcoded hexes and rogue color classes
3. Point the user to the updated documents in `docs/frontend-atlas/`.

---

## 🧭 The 5 Atlas Documents in `docs/frontend-atlas/`

1. **`01_ROUTES_AND_PANELS_MAP.md`**: Instant lookup linking every route directly to its page file, layout, and imported components.
2. **`02_COMPONENT_INVENTORY.md`**: Catalog of active buttons, modals, drawers, cards, and a11y fast-check flags.
3. **`03_DESIGN_TOKENS_AND_COLORS.md`**: Project design tokens vs rogue hexes and gray utilities with exact file and line numbers.
4. **`04_UI_ISLANDS_AND_DRIFT.md`**: Actionable list of raw HTML elements, inline style tags, and custom modal redundancies.
5. **`05_DEAD_ORPHANED_COMPONENTS.md`**: Dedicated punch-list and safety checklist for unused and orphaned components with safe deletion commands.
