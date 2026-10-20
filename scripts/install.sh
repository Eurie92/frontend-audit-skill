#!/usr/bin/env bash
# frontend-audit-skill — One-line installer & updater (Linux / macOS)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.sh | bash

set -e

TARGET_DIR=".agent/skills/frontend-audit"
mkdir -p "$TARGET_DIR/scripts"

BASE_URL="https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main"

echo "📥 Installing / Updating frontend-audit-skill..."
curl -fsSL "$BASE_URL/SKILL.md" -o "$TARGET_DIR/SKILL.md"
curl -fsSL "$BASE_URL/scripts/audit.ts" -o "$TARGET_DIR/scripts/audit.ts"

RULE_BLOCK='<!-- START_FRONTEND_AUDIT_RULE -->
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
<!-- END_FRONTEND_AUDIT_RULE -->'

TARGET_FILE=""
CANDIDATES=("AGENTS.md" "GEMINI.md" "CLAUDE.md")

# 1. If any candidate file ALREADY has the rule or markers, target ONLY that file to prevent duplicate injections
for f in "${CANDIDATES[@]}"; do
    if [ -f "$f" ]; then
        if grep -q "<!-- START_FRONTEND_AUDIT_RULE -->" "$f" || grep -qE "Frontend Architecture\s*&((amp;)?\s*)?Component Lookup" "$f"; then
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

const markerPattern = /<!-- START_FRONTEND_AUDIT_RULE -->[\s\S]*?<!-- END_FRONTEND_AUDIT_RULE -->/;
const legacyPattern = /##[ \t]*[^\r\n#]*?Frontend Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*[\s\S]*?(?=(?:\r?\n---|\r?\n##\s+(?![🛠️\?]|Available Commands)[^\r\n]+)|$)/;

if (markerPattern.test(content)) {
    content = content.replace(markerPattern, newRule);
    console.log(`🔄 Cleanly updated Frontend Architecture Rule in ${target}`);
} else if (legacyPattern.test(content)) {
    content = content.replace(legacyPattern, newRule);
    console.log(`🔄 Upgraded legacy Frontend Architecture Rule in-place in ${target}`);
} else {
    content = content.trimEnd() + "\n\n" + newRule + "\n";
    console.log(`🔗 Injected Frontend Architecture Rule into ${target}`);
}
fs.writeFileSync(target, content, "utf8");
' "$TARGET_FILE"
    else
        if grep -q "<!-- START_FRONTEND_AUDIT_RULE -->" "$TARGET_FILE"; then
            echo "ℹ️ Rule already present in $TARGET_FILE"
        else
            echo -e "\n$RULE_BLOCK" >> "$TARGET_FILE"
            echo "🔗 Injected Frontend Architecture Rule into $TARGET_FILE"
        fi
    fi
else
    echo -e "# AGENTS.md — Workspace Guidelines for AI Assistants\n\n$RULE_BLOCK\n" > "AGENTS.md"
    echo "📄 Created AGENTS.md with 100% Always-Active Frontend Atlas rule!"
fi

echo "✅ frontend-audit-skill successfully installed / updated in $TARGET_DIR!"
echo "💡 You can now type '/frontend-audit' directly in your AI chat."
