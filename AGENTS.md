# AGENTS.md — Workspace Guidelines for AI Assistants

<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->
## 🗺️ Fullstack Architecture & Component Lookup Rule
For all UI, component, route, color theme, API, database, server action, or backend tasks:

1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:
   - **Frontend Atlas (`docs/frontend-atlas/`)**:
     - `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, or Server/Client boundary)
     - `02_COMPONENT_INVENTORY.md` (by Modals, Drawers, Live Dots `animate-pulse`, Capsule Pills `rounded-full`, Buttons)
     - `03_DESIGN_TOKENS_AND_COLORS.md` (for all 22+ Tailwind color families, dark mode asymmetries, hexes)
     - `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot)
     - `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)
     - `THEME_MIGRATION_PUNCHLIST.md` (actionable checklist for whole-website color and dark mode rebrands)
   - **Backend Atlas (`docs/backend-atlas/`)**:
     - `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method: GET/POST/PUT/DELETE, or auth guard)
     - `02_DATABASE_MODELS_AND_SCHEMA.md` (by database table, Prisma model, or Drizzle schema)
     - `03_SERVER_ACTIONS_AND_MUTATIONS.md` (by Next.js Server Action "use server")
     - `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (by route matcher or public vs protected route)
     - `05_INTEGRATIONS_AND_WEBHOOKS.md` (by third-party service: Stripe, Resend, Supabase, S3)
     - `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (to trace UI button/modal directly to backend action & database model)

2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (Get-ChildItem -Recurse | Select-String) and do NOT spawn CLI scripts for simple lookups. Both atlases are already indexed on disk as Markdown—ead the files directly.

3. **Continuous Sync**: At the completion of any frontend or backend modification, execute `npm run audit` (or `npx fullstack-audit`) to keep the atlases 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas (both `docs/frontend-atlas/` and `docs/backend-atlas/`).
- `npm run audit:frontend`: Regenerates only the Frontend Atlas (`docs/frontend-atlas/`).
- `npm run audit:backend`: Regenerates only the Backend Atlas (`docs/backend-atlas/`).
- `npm run audit:theme` or `npx fullstack-audit --theme`: Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands.
- `npx fullstack-audit --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).
- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx fullstack-audit --find <query>`: Instant sub-second search across components, text labels, and icons.
- `npx fullstack-audit --update`: Checks and updates fullstack-audit-skill to latest GitHub release.
- `npx fullstack-audit --watch`: Live file watcher for continuous background sync.
- `npx fullstack-audit --dead`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->
