# AGENTS.md — Workspace Guidelines for AI Assistants

<!-- START_FRONTEND_AUDIT_RULE -->
## 🗺️ Frontend Architecture & Component Lookup Rule
For all UI, component, route, or color theme tasks (including screenshots and visual bug reports):
1. **Instant Atlas Lookup**: The FIRST tool call MUST be `view_file` on:
   - `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` (by Route or Screen)
   - `docs/frontend-atlas/06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text in a screenshot)
   - `docs/frontend-atlas/07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)
   It indexes all routes, page files, imported components, labels, and icons with 0ms runtime overhead.
2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches and do NOT spawn CLI scripts (`npx tsx scripts/audit-frontend.ts`) for simple lookups. The atlas is already written on disk as Markdown—read the file directly.
3. **Continuous Sync**: At the completion of every frontend modification, execute `npm run audit:frontend` to keep the atlas 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/frontend-audit` or `npm run audit:frontend`: Regenerates the entire Frontend Atlas (all 8 documents).
- `npx tsx scripts/audit-frontend.ts --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).
- `npx tsx scripts/audit-frontend.ts --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx tsx scripts/audit-frontend.ts --find <query>`: Instant sub-second search across components, text labels, and icons.
- `npx tsx scripts/audit-frontend.ts --update`: Checks and updates frontend-audit-skill to latest GitHub release.
- `npx tsx scripts/audit-frontend.ts --watch`: Live file watcher for continuous background sync.
- `npx tsx scripts/audit-frontend.ts --dead`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
