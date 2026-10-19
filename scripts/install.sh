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

RULE_TEXT='
## 🗺️ Frontend Architecture & Component Lookup Rule
For all UI, component, route, or color theme tasks (including screenshots and visual bug reports):
1. **Instant Atlas Lookup**: The FIRST tool call MUST be `view_file` on `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` (or relevant atlas file in `docs/frontend-atlas/`). It indexes all routes, page files, and imported components with 0ms runtime overhead.
2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches and do NOT spawn CLI scripts (`npx tsx scripts/audit-frontend.ts`) for simple lookups. The atlas is already written on disk as Markdown—read the file directly.
3. **Continuous Sync**: At the completion of every frontend modification, execute `npm run audit:frontend` to keep the atlas 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/frontend-audit` or `npm run audit:frontend`: Regenerates the entire Frontend Atlas.
- `npx tsx scripts/audit-frontend.ts --watch`: Live file watcher for continuous background sync.
- `npx tsx scripts/audit-frontend.ts --dead`: Scans for potential orphaned components.
'

if [ -f "GEMINI.md" ]; then
    RULE_FILE="GEMINI.md"
elif [ -f "CLAUDE.md" ]; then
    RULE_FILE="CLAUDE.md"
else
    RULE_FILE="AGENTS.md"
fi

if [ -f "$RULE_FILE" ]; then
    if ! grep -q "Frontend Architecture & Component Lookup Rule" "$RULE_FILE"; then
        echo -e "\n$RULE_TEXT" >> "$RULE_FILE"
        echo "🔗 Injected Frontend Architecture Rule into $RULE_FILE"
    fi
else
    echo -e "# AGENTS.md — Workspace Guidelines for AI Assistants\n$RULE_TEXT" > "AGENTS.md"
    echo "📄 Created AGENTS.md with 100% Always-Active Frontend Atlas rule!"
fi

echo "✅ frontend-audit-skill successfully installed / updated in $TARGET_DIR!"
echo "💡 You can now type '/frontend-audit' directly in your AI chat."
