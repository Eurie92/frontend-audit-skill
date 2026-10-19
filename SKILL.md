---
name: frontend-audit
description: Runs the automated frontend atlas and design system catalog engine into docs/frontend-atlas/. Trigger ONLY when the user explicitly uses the `/frontend-audit` slash command or explicitly asks to generate/refresh the frontend catalog, route map, or component inventory. DO NOT trigger for design critique, UI styling suggestions, or animations (use impeccable or ui-ux-pro-max instead).
version: 1.1.0
allowed-tools:
  - run_command
  - Bash(npx tsx .agent/skills/frontend-audit/scripts/audit.ts)
  - Bash(npm run audit:frontend)
---

# 🗺️ Universal Frontend Atlas & Design System Audit Skill

> **Trigger**: `/frontend-audit`  
> Run this skill when the user explicitly invokes `/frontend-audit`, or asks to generate, update, or inspect the project's **Frontend Atlas** in `docs/frontend-atlas/`.

---

## 🚫 Routing & Trigger Boundaries (Strict Isolation)

To prevent multiple skills from firing at the same time:
* **USE THIS SKILL ONLY FOR**:
  1. Running the static audit engine to generate or refresh `docs/frontend-atlas/`.
  2. Looking up routes, file locations, button counts, and hardcoded colors from the generated atlas.
  3. Explicit slash command: `/frontend-audit`
* **DO NOT USE THIS SKILL FOR**:
  - UI visual design, styling ideas, or color advice ➡️ Use **`ui-ux-pro-max`** or **`design-taste-frontend`**.
  - Interaction physics, spring animations, micro-polish ➡️ Use **`emil-design-eng`**.
  - Accessibility audit or UX critique of a component ➡️ Use **`impeccable`**.

---

## 🚀 How to Execute the Audit

When `/frontend-audit` is called:
1. Run the audit script immediately:
   ```bash
   # If npm script is present:
   npm run audit:frontend
   
   # Or directly from the skill:
   npx tsx .agent/skills/frontend-audit/scripts/audit.ts
   ```
2. Report the summary statistics:
   - Framework architecture detected (e.g. Next.js App Router, Vite React SPA)
   - Total frontend files and active routes
   - Button count: Standard `<Button>` vs raw `<button>`
   - Top hardcoded hexes and rogue color classes
3. Point the user to the updated documents in `docs/frontend-atlas/`.

---

## 🧭 The 4 Atlas Documents in `docs/frontend-atlas/`

1. **`01_ROUTES_AND_PANELS_MAP.md`**: Instant lookup linking every route directly to its page file, layout, and imported components.
2. **`02_COMPONENT_INVENTORY.md`**: Catalog of all buttons, modals, drawers, and card containers.
3. **`03_DESIGN_TOKENS_AND_COLORS.md`**: Project design tokens vs rogue hexes and gray utilities with exact file and line numbers.
4. **`04_UI_ISLANDS_AND_DRIFT.md`**: Actionable list of raw HTML elements and custom modal redundancies.
