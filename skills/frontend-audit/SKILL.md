---
name: frontend-audit
description: Runs the automated universal fullstack atlas and design system catalog engine into docs/frontend-atlas/ and docs/backend-atlas/. Supports Next.js (App & Pages Router), Vite React SPAs, Nuxt 3, SvelteKit, Astro, Remix, and React Router v7. Catalogs frontend routes, interactive triggers, disclosed modals, live pulse dots, capsule pills, and design tokens, and audits backend API routes, Prisma/Drizzle schemas, server actions, auth guards, and webhooks.
version: 2.0.0
allowed-tools:
  - run_command
  - Bash(npx tsx .agent/skills/fullstack-audit/scripts/audit.ts)
  - Bash(npm run audit)
  - Bash(npm run audit:frontend)
  - Bash(npm run audit:backend)
  - Bash(npm run audit:theme)
---

# 🗺️ Universal Fullstack Atlas & Design System Audit Skill

> **Trigger**: `/fullstack-audit`, `/frontend-audit`, or when locating UI components, routes, database models, APIs, and color themes.
> Run this skill when the user invokes `/fullstack-audit` or `/frontend-audit`, asks to locate UI components or backend actions, or asks to generate, update, or inspect the project's **Frontend Atlas** in `docs/frontend-atlas/` or **Backend Atlas** in `docs/backend-atlas/`.

---

## 🚫 Routing & Trigger Boundaries

* **USE THIS SKILL FOR**:
  1. Locating exact component files and route owners directly from `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md`, `06_VISIBLE_TEXT_AND_LABELS_MAP.md`, or `07_VISUAL_AND_ICON_INDEX.md`.
  2. Running the static audit engine to refresh `docs/frontend-atlas/`.
  3. Generating zero-search agent handoff manifests via `--manifest <file:line>`.
  4. Auto-discovering newly installed skills in `.agent/skills/` and global plugins into `docs/frontend-atlas/08_DISPATCH_GATEWAY.md`.
  5. Running closed-loop verification gates via `--verify` to track metric improvements and TypeScript compilation.
  6. Self-updating the skill engine and agent rules via `--update`.
  7. Checking button standardization, a11y flags, design tokens, and dead components.
  8. Explicit slash command: `/frontend-audit`
* **DO NOT USE THIS SKILL FOR**:
  - UI visual design, styling ideas, or color advice ➡️ Use **`ui-ux-pro-max`** or **`design-taste-frontend`**.
  - Interaction physics, spring animations, micro-polish ➡️ Use **`emil-design-eng`**.
  - Accessibility audit or UX critique of a component ➡️ Use **`a11y-debugging`** or **`impeccable`**.

---

## 🚀 How to Locate Components (Sub-Second 0ms Lookup)

When locating a UI component, button, or route (especially from screenshots):
1. **DO NOT run a script.** The atlas is already compiled in `docs/frontend-atlas/`.
2. **If looking up by Visible Text in a Screenshot**:
   - Open `docs/frontend-atlas/06_VISIBLE_TEXT_AND_LABELS_MAP.md` directly via `view_file`.
   - Search for the visible label (e.g. `"🌸 SAKURA-VEND"`, `"Purchases"`, `"XNIGHT SHOWROOM"`) to get the exact file and line number in 1 read!
3. **If looking up by Icon / Symbol in a Textless Screenshot**:
   - Open `docs/frontend-atlas/07_VISUAL_AND_ICON_INDEX.md` directly via `view_file`.
   - Search for the icon name (e.g. `Sun`, `Moon`, `ShoppingCart`, `ChevronDown`, `Trash`) to get the exact file, line, and interactive context.
4. **If looking up by Screen / Route**:
   - Open `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` directly via `view_file`.
   - Find the Route corresponding to the screen (e.g. `/` for landing, `/admin/*`, `/portal/*`).
   - Check the Next.js boundary (`Client ⚡` vs `Server 🖥️`) and inspect the 2-level deep component tree (`vending-floor-showcase ➔ [Dock, vending-machines]`).
5. Open the target component file directly. Done in 0ms without running any commands!

## 🔄 When to Run the Audit Script
Run the audit script (`npm run audit:frontend` or `/frontend-audit`) **ONLY**:
1. When the user explicitly types `/frontend-audit`.
2. After finishing modifications to frontend code, to keep the atlas in sync.
3. Report the summary statistics:
   - Framework architecture detected (e.g. Next.js App Router, Vite React SPA)
   - Total frontend files and active routes
   - Next.js Client vs Server boundary distribution
   - Button count: Standard `<Button>` vs raw `<button>`
   - Orphaned / Dead components count
   - Top hardcoded hexes and rogue color classes
   - Indexed visual icons count
4. Point the user to the updated documents in `docs/frontend-atlas/`.

---

## 🧭 The 8 Atlas Documents in `docs/frontend-atlas/`

1. **`01_ROUTES_AND_PANELS_MAP.md`**: Instant lookup linking every route directly to its page file, Next.js boundary (`Client ⚡` vs `Server 🖥️`), layout, and 2-level deep component tree (`Parent ➔ [Children]`).
2. **`02_COMPONENT_INVENTORY.md`**: Catalog of active buttons, modals, drawers, cards, and a11y fast-check flags.
3. **`03_DESIGN_TOKENS_AND_COLORS.md`**: Project design tokens vs rogue hexes and gray utilities with exact file and line numbers.
4. **`04_UI_ISLANDS_AND_DRIFT.md`**: Actionable list of raw HTML elements, inline style tags, and custom modal redundancies.
5. **`05_DEAD_ORPHANED_COMPONENTS.md`**: Dedicated punch-list and safety checklist for unused and orphaned components with safe deletion commands.
6. **`06_VISIBLE_TEXT_AND_LABELS_MAP.md`**: Master index of buttons, headings, badges, and visible UI labels for instant Screenshot-to-Code targeting.
7. **`07_VISUAL_AND_ICON_INDEX.md`**: Master index of Lucide, Radix, Tabler, and SVG visual action icons for textless screenshot targeting.
8. **`08_DISPATCH_GATEWAY.md`**: Inter-skill handoff matrix routing diagnosed UI findings directly to peer skills (`emil-design-eng`, `ui-ux-pro-max`, `a11y-debugging`, `impeccable`).
