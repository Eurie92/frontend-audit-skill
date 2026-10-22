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
# ⚡ Fullstack 4-Phase Synergy Engine (0ms Atlas • Ponytail KISS • Caveman Terse • Dual-Speed Verify)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

## 🔄 The 4-Phase Operational Pipeline

### Phase 1: GPS / Locate (`fullstack-audit`)
- **Zero-Grep Mandate**: The FIRST tool call MUST be `view_file` on the pre-computed atlases:
  - **Frontend (`docs/frontend-atlas/`)**: `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, Server/Client boundary), `02_COMPONENT_INVENTORY.md` (modals, drawers, live dots `animate-pulse`, capsule pills `rounded-full`, buttons), `03_DESIGN_TOKENS_AND_COLORS.md` (all 22+ Tailwind color families, dark mode asymmetries, hexes), `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot), `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot), `09_QUERY_AND_CACHE_MAP.md` (by React Query key, useQuery/useMutation, cache invalidation), `10_GOD_FILES_SURGICAL_MAP.md` (slice bounds for files >500 lines to save 90%+ tokens), `11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md` (route risk score & blast radius), `THEME_MIGRATION_PUNCHLIST.md` (whole-website color & dark mode rebrands).
  - **Backend (`docs/backend-atlas/`)**: `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method, auth guard), `02_DATABASE_MODELS_AND_SCHEMA.md` (by table, Prisma model, Drizzle schema), `03_SERVER_ACTIONS_AND_MUTATIONS.md` (Next.js Server Action "use server"), `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (route matcher, public vs protected), `05_INTEGRATIONS_AND_WEBHOOKS.md` (Stripe, Resend, Supabase, S3), `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (trace UI button/modal directly to backend action & database model), `07_ENV_AND_SECRETS_MAP.md` (client secret leak radar).
  - **Fast Find**: Or run `npx fullstack-audit --find "<query>" --compact` (sub-3ms).
- **HARD FORBIDDEN**: Do NOT run recursive codebase greps (`Get-ChildItem -Recurse | Select-String`, `grep -r`). The repository is already indexed.
- **Immediate Relinquishment**: Once `file:line` is located, `fullstack-audit` IMMEDIATELY relinquishes control to Phase 2. `fullstack-audit` is a GPS locator, NOT an implementation or animation tool.

### Phase 2: Design & Anti-Overengineering Firewall (`ponytail`)
- **YAGNI Invariant**: The best code is the code never written. Solve the whole problem with the least new code.
- **The Ponytail Hierarchy**:
  1. *Does it need to exist?* Skip unasked features, options, and speculative abstractions. A vague request gets the smallest working version.
  2. *Already in codebase?* Reuse existing helpers, components, and patterns.
  3. *Platform feature?* Use standard web/DOM/Tailwind primitives over custom JavaScript trigonometry, 36-point polygon waves, or complex SVG math.
  4. *Installed dependency?* Never install a new package for a few lines of logic.
  5. *Can it be one line?* Make it one line a reader grasps at a glance.
  6. *Shortest working diff wins.* Deletion beats addition. Keep surrounding layers and conventions intact.
- **Preserve Always**: Trust boundary validation, auth guards, data-loss error handling, accessibility.
- **Shortcuts**: Document deliberate limits as `// shortcut: <limit>, <when to upgrade>`.

### Phase 3: Communication & Zero-Fluff Receipts (`caveman`)
- **Answer First**: Dense result first, technical facts exact.
- **Kill Ceremony**: No conversational filler ("Sure, I can help with that!", "I apologize for the confusion"), no preamble, no postamble.
- **Tool Status**: Zero conversational commentary between routine tool calls.
- **Compact Diff Receipt**: Conclude replies with a tight diff receipt:
  - `Target`: `<file:line>`
  - `Diff`: `<old>` ➔ `<new>`
  - `Ponytail`: `<what was skipped or kept minimal>`
  - `Status`: `<HMR applied | Test pass count | Exit code>`

### Phase 4: Right-Sized Verification (`superpowers` Dual-Speed Harmonization)
- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses — Mandatory for UI/CSS/Layout/Copy edits ≤ 2 files, < 30 lines)**:
  - Perform direct surgical file edits (`edit_file` / native patch). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.
  - **HARD FORBIDDEN**: Do NOT run full TypeScript compilation (`tsc --noEmit`, `npm run typecheck`).
  - **HARD FORBIDDEN**: Do NOT run `npm run audit` or `npx fullstack-audit` on micro-edits.
  - **HARD FORBIDDEN**: Do NOT invoke Superpowers process skills (`brainstorming`, `writing-plans`, `test-driven-development`).
  - **HARD FORBIDDEN**: Do NOT invoke multiple design skills in parallel.
  - **HARD FORBIDDEN**: Do NOT invoke heavy browser automation (Chrome DevTools MCP / Puppeteer) or curl localhost.
  - **Response Time**: Return immediately to the user in 1–2 seconds.
- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:
  - Superpowers Iron Law applies: *No completion claims without fresh verification evidence.*
  - Run `npx fullstack-audit --verify --gate-clean` or test suites (`npm test`, `npm run typecheck`).
  - Claim completion ONLY with fresh exit code 0 evidence.
  - Run `npm run audit` upon milestone completion to synchronize atlases.

## 🛠️ Available Commands (v2.8.0 Multi-Harness & Inverted Index Engine)
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas and root `llms.txt` / `llms-full.txt`.
- `npx fullstack-audit --find <query> --compact`: Ultra-fast, sub-3ms token-compact query mode for AI agents.
- `npx fullstack-audit --setup-all`: Configures Cursor (.mdc), Claude Code, Hermes Agent, and OpenCode.
- `npx fullstack-audit --theme --route <route> --compact`: Generates a route-scoped micro-punchlist (saves 99.8% tokens).
- `npx fullstack-audit --verify --gate-clean [--route <route>]`: Smart multi-target verification gate.
- `npx fullstack-audit --solo`: Enforces strictly Single-Agent execution (no subagents).
- `npx fullstack-audit --multi-agent`: Partitions codebase into 4 parallel zone briefs for rapid Map-Reduce sweeps.
- `npx fullstack-audit --llms`: Generates root `llms.txt` and `llms-full.txt` (Answer.AI specification).
- `npx fullstack-audit --diff`: Architecture delta report comparing current scan against `.last_receipt.json`.
- `npx fullstack-audit --migrate-theme --from "#hex1,#hex2" --to "dark:bg-slate-900"`: CRLF-agnostic AST codemod in 80ms (0 LLM output tokens).
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
