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

echo "✅ frontend-audit-skill successfully installed / updated in $TARGET_DIR!"
echo "💡 You can now type '/frontend-audit' directly in your AI chat."
