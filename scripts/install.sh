#!/usr/bin/env bash
# fullstack-audit-skill — One-line installer & updater (Linux / macOS)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash

set -e

TARGET_DIR=".agent/skills/fullstack-audit"
mkdir -p "$TARGET_DIR/scripts"

BASE_URL="https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main"

echo "📥 Installing / Updating fullstack-audit-skill..."
curl -fsSL "$BASE_URL/SKILL.md" -o "$TARGET_DIR/SKILL.md"
curl -fsSL "$BASE_URL/scripts/audit.ts" -o "$TARGET_DIR/scripts/audit.ts"
curl -fsSL "$BASE_URL/scripts/audit-backend.ts" -o "$TARGET_DIR/scripts/audit-backend.ts"
curl -fsSL "$BASE_URL/scripts/constants.ts" -o "$TARGET_DIR/scripts/constants.ts"

RULE_BLOCK='<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->
## 🗺️ Fullstack Architecture & Component Lookup Rule
Universal rule for all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, VS Code**). For all UI, component, route, color theme, API, database, server action, or backend tasks:

1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:
   - **Frontend Atlas (`docs/frontend-atlas/`)**:
     - `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, or Server/Client boundary)
     - `02_COMPONENT_INVENTORY.md` (by Modals, Drawers, Live Dots `animate-pulse`, Capsule Pills `rounded-full`, Buttons)
     - `03_DESIGN_TOKENS_AND_COLORS.md` (for all 22+ Tailwind color families, dark mode asymmetries, hexes)
     - `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot)
     - `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)
     - `09_QUERY_AND_CACHE_MAP.md` (by React Query key, useQuery/useMutation, or cache invalidation event)
     - `10_GOD_FILES_SURGICAL_MAP.md` (for files >500 lines to read exact slice bounds and save 90%+ tokens)
     - `11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md` (to check route risk score and blast radius before modifying)
     - `THEME_MIGRATION_PUNCHLIST.md` (actionable checklist for whole-website color and dark mode rebrands)
   - **Backend Atlas (`docs/backend-atlas/`)**:
     - `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method: GET/POST/PUT/DELETE, or auth guard)
     - `02_DATABASE_MODELS_AND_SCHEMA.md` (by database table, Prisma model, or Drizzle schema)
     - `03_SERVER_ACTIONS_AND_MUTATIONS.md` (by Next.js Server Action "use server")
     - `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (by route matcher or public vs protected route)
     - `05_INTEGRATIONS_AND_WEBHOOKS.md` (by third-party service: Stripe, Resend, Supabase, S3)
     - `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (to trace UI button/modal directly to backend action & database model)
     - `07_ENV_AND_SECRETS_MAP.md` (to verify client env access and prevent secret leaks)

2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (`Get-ChildItem -Recurse | Select-String` or `grep -r`) and do NOT spawn CLI scripts for simple lookups. Both atlases are already indexed on disk as Markdown—read the files directly.

3. **Dual-Speed Execution (Inner-Loop Fast Mode vs. Outer-Loop Verification)**:
   - **⚡ Inner-Loop (Fast Iteration — 1 to 2s responses)**:
     - For UI tweaks, styling adjustments, copy changes, or component fixes: perform direct surgical file edits (`edit_file` / native patch). Let the local dev server (Next.js/Vite/Nuxt HMR) refresh the developer'\''s screen in 50ms.
     - **No Heavy Browser MCPs**: Do NOT invoke headless browser MCP tools for basic edits. If the developer pastes or attaches a screenshot, map visual cues directly to `06_VISIBLE_TEXT_AND_LABELS_MAP.md` or `07_VISUAL_AND_ICON_INDEX.md`.
     - **No Per-Edit Compile Trap**: Do NOT run full TypeScript compilation (`tsc --noEmit` or `--verify`) after every intermediate micro-edit.
   - **🛡️ Outer-Loop (Checkpoint Verification & Sync)**:
     - Execute `npx fullstack-audit --verify --gate-clean` or `npm run audit` ONLY at logical task checkpoints: when the entire multi-step task is complete, when explicitly requested by the developer, or before finalizing git commits.

## 🛠️ Available Commands (v2.8.0 Multi-Harness & Inverted Index Engine)
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas and root `llms.txt` / `llms-full.txt`.
- `npx fullstack-audit --version` or `-v`: Instant (<5ms) version banner and engine output.
- `npx fullstack-audit --check-update`: Compares project Atlas against installed skill version and detects version drift.
- `npx fullstack-audit --setup-all`: Configures Cursor (.mdc), Claude Code, Hermes Agent, and OpenCode.
- `npx fullstack-audit --find <query> --compact`: Ultra-fast, sub-3ms token-compact query mode for AI agents.
- `npx fullstack-audit --solo`: Enforces strictly Single-Agent execution (no subagents).
- `npx fullstack-audit --multi-agent`: Partitions codebase into 4 parallel zone briefs for rapid Map-Reduce sweeps.
- `npx fullstack-audit --llms`: Generates root `llms.txt` and `llms-full.txt` (Answer.AI specification).
- `npx fullstack-audit --diff`: Architecture delta report comparing current scan against `.last_receipt.json`.
- `npx fullstack-audit --theme --route <route> --compact`: Generates a route-scoped micro-punchlist (saves 99.8% tokens).
- `npx fullstack-audit --migrate-theme --from "#hex1,#hex2" --to "dark:bg-slate-900"`: CRLF-agnostic AST codemod in 80ms (0 LLM output tokens).
- `npx fullstack-audit --verify --gate-clean [--route <route>]`: Smart multi-target verification gate.
- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx fullstack-audit --watch`: Live background file watcher for continuous background sync.
- `npx fullstack-audit --dead`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->'

TARGET_FILE=""
CANDIDATES=("AGENTS.md" "GEMINI.md" "CLAUDE.md")

# 1. If any candidate file ALREADY has the rule or markers, target ONLY that file to prevent duplicate injections
for f in "${CANDIDATES[@]}"; do
    if [ -f "$f" ]; then
        if grep -q "<!-- START_FULLSTACK_AUDIT_RULE -->" "$f" || grep -q "<!-- START_FRONTEND_AUDIT_RULE -->" "$f" || grep -qE "(Fullstack|Frontend) Architecture\s*&((amp;)?\s*)?Component Lookup" "$f"; then
            TARGET_FILE="$f"
            break
        fi
    fi
done

# 2. If no candidate currently contains the rule, pick the highest-priority existing file (AGENTS.md > GEMINI.md > CLAUDE.md)
if [ -z "$TARGET_FILE" ]; then
    for f in "${CANDIDATES[@]}"; do
        if [ -f "$f" ]; then
            TARGET_FILE="$f"
            break
        fi
    done
fi

# 3. If none exist at all, default to creating AGENTS.md
if [ -z "$TARGET_FILE" ]; then
    TARGET_FILE="AGENTS.md"
fi

if [ -f "$TARGET_FILE" ]; then
    if command -v node >/dev/null 2>&1; then
        export RULE_BLOCK
        node -e '
const fs = require("fs");
const target = process.argv[1];
const newRule = process.env.RULE_BLOCK;
let content = fs.readFileSync(target, "utf8");

const markerPattern = /(?:<!-- START_FULLSTACK_AUDIT_RULE -->[\s\S]*?<!-- END_FULLSTACK_AUDIT_RULE -->|<!-- START_FRONTEND_AUDIT_RULE -->[\s\S]*?<!-- END_FRONTEND_AUDIT_RULE -->)/;
const legacyPattern = /##[ \t]*[^\r\n#]*?(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*[\s\S]*?(?=(?:\r?\n---|\r?\n##\s+(?![🛠️\?]|Available Commands)[^\r\n]+)|$)/;

if (markerPattern.test(content)) {
    content = content.replace(markerPattern, newRule);
    console.log(`🔄 Cleanly updated Fullstack Architecture Rule in ${target}`);
} else if (legacyPattern.test(content)) {
    content = content.replace(legacyPattern, newRule);
    console.log(`🔄 Upgraded legacy Architecture Rule in-place in ${target}`);
} else {
    content = content.trimEnd() + "\n\n" + newRule + "\n";
    console.log(`🔗 Injected Fullstack Architecture Rule into ${target}`);
}
fs.writeFileSync(target, content, "utf8");
' "$TARGET_FILE"
    else
        if grep -q "<!-- START_FULLSTACK_AUDIT_RULE -->" "$TARGET_FILE" || grep -q "<!-- START_FRONTEND_AUDIT_RULE -->" "$TARGET_FILE"; then
            echo "ℹ️ Rule already present in $TARGET_FILE"
        else
            echo -e "\n$RULE_BLOCK" >> "$TARGET_FILE"
            echo "🔗 Injected Fullstack Architecture Rule into $TARGET_FILE"
        fi
    fi
else
    echo -e "# AGENTS.md — Workspace Guidelines for AI Assistants\n\n$RULE_BLOCK\n" > "AGENTS.md"
    echo "📄 Created AGENTS.md with 100% Always-Active Fullstack Atlas rule!"
fi

# Mirror to .agent/skills/frontend-audit for 100% backward compatibility
LEGACY_DIR=".agent/skills/frontend-audit"
if [ -d "$LEGACY_DIR" ]; then
    mkdir -p "$LEGACY_DIR/scripts"
    cp -f "$TARGET_DIR/SKILL.md" "$LEGACY_DIR/SKILL.md"
    cp -f "$TARGET_DIR/scripts/audit.ts" "$LEGACY_DIR/scripts/audit.ts"
    cp -f "$TARGET_DIR/scripts/audit-backend.ts" "$LEGACY_DIR/scripts/audit-backend.ts"
    cp -f "$TARGET_DIR/scripts/constants.ts" "$LEGACY_DIR/scripts/constants.ts"
fi

echo "✅ fullstack-audit-skill successfully installed / updated in $TARGET_DIR!"
echo "💡 You can now type '/fullstack-audit' (or '/frontend-audit') directly in your AI chat."
