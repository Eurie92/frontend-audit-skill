#!/usr/bin/env bash
# fullstack-audit-skill — One-line installer & updater (Linux / macOS)
#
# Usage:
#   # Recommended: Full Synergy Triad (Audit + Ponytail + Caveman + Superpowers)
#   curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
#
#   # Standalone Mode (Zero external dependencies):
#   curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash -s -- --standalone

set -e

PROFILE="triad"
WITH_PONYTAIL=""
WITH_CAVEMAN=""
WITH_SUPERPOWERS=""
NO_PONYTAIL=0
NO_CAVEMAN=0
NO_SUPERPOWERS=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --standalone) PROFILE="standalone" ;;
        --profile) PROFILE="$2"; shift ;;
        --with-ponytail) WITH_PONYTAIL=1 ;;
        --with-caveman) WITH_CAVEMAN=1 ;;
        --with-superpowers) WITH_SUPERPOWERS=1 ;;
        --no-ponytail) NO_PONYTAIL=1 ;;
        --no-caveman) NO_CAVEMAN=1 ;;
        --no-superpowers) NO_SUPERPOWERS=1 ;;
        *) echo "Unknown option: $1" ;;
    esac
    shift
done

ENABLE_PONYTAIL=0
ENABLE_CAVEMAN=0
ENABLE_SUPER=0

if [ "$PROFILE" = "triad" ]; then
    ENABLE_PONYTAIL=1
    ENABLE_CAVEMAN=1
    ENABLE_SUPER=1
fi

[ -n "$WITH_PONYTAIL" ] && ENABLE_PONYTAIL=1
[ -n "$WITH_CAVEMAN" ] && ENABLE_CAVEMAN=1
[ -n "$WITH_SUPERPOWERS" ] && ENABLE_SUPER=1
[ "$NO_PONYTAIL" -eq 1 ] && ENABLE_PONYTAIL=0
[ "$NO_CAVEMAN" -eq 1 ] && ENABLE_CAVEMAN=0
[ "$NO_SUPERPOWERS" -eq 1 ] && ENABLE_SUPER=0

if [ "$PROFILE" = "standalone" ]; then
    ENABLE_PONYTAIL=0
    ENABLE_CAVEMAN=0
    ENABLE_SUPER=0
fi

TARGET_DIR=".agent/skills/fullstack-audit"
mkdir -p "$TARGET_DIR/scripts"

BASE_URL="https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main"

echo "📥 Installing / Updating fullstack-audit-skill (Profile: $PROFILE)..."
curl -fsSL "$BASE_URL/SKILL.md" -o "$TARGET_DIR/SKILL.md"
curl -fsSL "$BASE_URL/scripts/audit.ts" -o "$TARGET_DIR/scripts/audit.ts"
curl -fsSL "$BASE_URL/scripts/audit-backend.ts" -o "$TARGET_DIR/scripts/audit-backend.ts"
curl -fsSL "$BASE_URL/scripts/constants.ts" -o "$TARGET_DIR/scripts/constants.ts"

# Construct dynamic rule block
RULE_BLOCK='<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->'

if [ "$ENABLE_PONYTAIL" -eq 1 ] && [ "$ENABLE_CAVEMAN" -eq 1 ] && [ "$ENABLE_SUPER" -eq 1 ]; then
    RULE_BLOCK+='
# ⚡ Fullstack 4-Phase Synergy Engine (0ms Atlas • Ponytail KISS • Caveman Terse • Dual-Speed Verify)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

## 🔄 The 4-Phase Operational Pipeline

### Phase 1: GPS / Locate (`fullstack-audit`)'
elif [ "$ENABLE_PONYTAIL" -eq 0 ] && [ "$ENABLE_CAVEMAN" -eq 0 ] && [ "$ENABLE_SUPER" -eq 0 ]; then
    RULE_BLOCK+='
# 🗺️ Fullstack Atlas Engine (0ms Zero-Grep • Dual-Speed Verify)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

## 🔄 The Operational Protocol

### 1. GPS / Locate (`fullstack-audit`)'
else
    RULE_BLOCK+='
# ⚡ Fullstack Modular Synergy Engine (0ms Atlas • Modular Engine)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

## 🔄 The Operational Pipeline

### Phase 1: GPS / Locate (`fullstack-audit`)'
fi

RULE_BLOCK+='
- **Zero-Grep Mandate**: The FIRST tool call MUST be `view_file` on the pre-computed atlases:
  - **Frontend (`docs/frontend-atlas/`)**: `01_ROUTES_AND_PANELS_MAP.md`, `02_COMPONENT_INVENTORY.md`, `03_DESIGN_TOKENS_AND_COLORS.md`, `06_VISIBLE_TEXT_AND_LABELS_MAP.md`, `07_VISUAL_AND_ICON_INDEX.md`, `09_QUERY_AND_CACHE_MAP.md`, `10_GOD_FILES_SURGICAL_MAP.md`, `11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md`, `12_TEST_SUITES_AND_COVERAGE_MAP.md`, `THEME_MIGRATION_PUNCHLIST.md`.
  - **Backend (`docs/backend-atlas/`)**: `01_API_ROUTES_AND_ENDPOINTS.md`, `02_DATABASE_MODELS_AND_SCHEMA.md`, `03_SERVER_ACTIONS_AND_MUTATIONS.md`, `04_AUTH_AND_MIDDLEWARE_GUARDS.md`, `05_INTEGRATIONS_AND_WEBHOOKS.md`, `06_FULLSTACK_CROSS_REFERENCE_MAP.md`, `07_ENV_AND_SECRETS_MAP.md`.
  - **Fast Find**: Or run `npx fullstack-audit --find "<query>" --compact` (sub-3ms).
  - **Fuzzy File Resolve**: Run `npx fullstack-audit --resolve "<component-or-file>"` to resolve casing (e.g. `connect-modal` ➔ `ConnectModal.tsx`) in 0ms.
  - **Method Line Bounds**: Run `npx fullstack-audit --symbol "<method>"` to get exact start/end lines in God-files before calling `read_file`.
- **HARD FORBIDDEN (PowerShell `-Exclude` Trap)**: Do NOT run recursive codebase greps (`Get-ChildItem -Recurse | Select-String`, `grep -r`). In Windows PowerShell, `-Exclude` does NOT prune recursion—it scans all 50,000+ files in `node_modules` and `.next`, causing a 15–30s freeze with Defender filter drivers. The repository is already indexed.
- **PowerShell Quoting Armor**: Always wrap PowerShell arguments in single-quotes '\''...'\''. The `&` operator is reserved (e.g. '\''Help & support'\''), and `$` triggers variable expansion. Use `npx fullstack-audit --patch` to edit files safely without scratch scripts.
- **Immediate Relinquishment**: Once `file:line` is located, `fullstack-audit` IMMEDIATELY relinquishes control to implementation. `fullstack-audit` is a GPS locator, NOT an implementation or animation tool.
'

CURR_PHASE=2

if [ "$ENABLE_PONYTAIL" -eq 1 ]; then
    RULE_BLOCK+="
### Phase $CURR_PHASE: Design & Anti-Overengineering Firewall (\`ponytail\`)
- **YAGNI Invariant**: The best code is the code never written. Solve the whole problem with the least new code.
- **The Ponytail Hierarchy**:
  1. *Does it need to exist?* Skip unasked features, options, and speculative abstractions. A vague request gets the smallest working version.
  2. *Already in codebase?* Reuse existing helpers, components, and patterns.
  3. *Platform feature?* Use standard web/DOM/Tailwind primitives over custom JavaScript trigonometry, 36-point polygon waves, or complex SVG math.
  4. *Installed dependency?* Never install a new package for a few lines of logic.
  5. *Can it be one line?* Make it one line a reader grasps at a glance.
  6. *Shortest working diff wins.* Deletion beats addition. Keep surrounding layers and conventions intact.
- **Preserve Always**: Trust boundary validation, auth guards, data-loss error handling, accessibility.
- **Shortcuts**: Document deliberate limits as \`// shortcut: <limit>, <when to upgrade>\`.
"
    CURR_PHASE=$((CURR_PHASE + 1))
elif [ "$ENABLE_PONYTAIL" -eq 0 ] && [ "$ENABLE_CAVEMAN" -eq 0 ] && [ "$ENABLE_SUPER" -eq 0 ]; then
    RULE_BLOCK+="
### $CURR_PHASE. Implementation & Minimalist Discipline
- Solve the user request with the least code necessary. Reuse existing project helpers and primitives before adding new abstractions or dependencies.
- Surgical edits: keep modifications contained to the exact target files located via the atlas. Do not refactor untouched files.
"
    CURR_PHASE=$((CURR_PHASE + 1))
fi

if [ "$ENABLE_CAVEMAN" -eq 1 ]; then
    RULE_BLOCK+="
### Phase $CURR_PHASE: Communication & Zero-Fluff Receipts (\`caveman\`)
- **Answer First**: Dense result first, technical facts exact.
- **Kill Ceremony**: No conversational filler (\"Sure, I can help with that!\", \"I apologize for the confusion\"), no preamble, no postamble.
- **Tool Status**: Zero conversational commentary between routine tool calls.
- **Compact Diff Receipt**: Conclude replies with a tight diff receipt:
  - \`Target\`: \`<file:line>\`
  - \`Diff\`: \`<old>\` ➔ \`<new>\`
  - \`Status\`: \`<HMR applied | Test pass count | Exit code>\`
"
    CURR_PHASE=$((CURR_PHASE + 1))
fi

if [ "$ENABLE_SUPER" -eq 1 ]; then
    RULE_BLOCK+="
### Phase $CURR_PHASE: Right-Sized Verification (\`superpowers\` Dual-Speed Harmonization)
- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses — Mandatory for UI/CSS/Layout/Copy edits ≤ 2 files, < 30 lines)**:
  - Perform direct surgical file edits (\`npx fullstack-audit --patch\` or \`edit_file\`). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.
  - **HARD FORBIDDEN**: Do NOT run full TypeScript compilation (\`tsc --noEmit\`, \`npm run typecheck\`).
  - **HARD FORBIDDEN**: Do NOT run \`npm run audit\` or \`npx fullstack-audit\` on micro-edits.
  - **HARD FORBIDDEN**: Do NOT invoke Superpowers process skills (\`brainstorming\`, \`writing-plans\`, \`test-driven-development\`).
  - **HARD FORBIDDEN**: Do NOT invoke multiple design skills in parallel.
  - **HARD FORBIDDEN**: Do NOT invoke heavy browser automation (Chrome DevTools MCP / Puppeteer) or curl localhost.
  - **Response Time**: Return immediately to the user in 1–2 seconds.
- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:
  - Superpowers Iron Law applies: *No completion claims without fresh verification evidence.*
  - Run \`npx fullstack-audit --verify --gate-clean\` or test suites (\`npm test\`, \`npm run typecheck\`).
  - Claim completion ONLY with fresh exit code 0 evidence.
  - **Zero Polling Invariant**: Do NOT loop on \`manage_task status\`. The harness features Reactive Wakeup and automatically resumes execution when tasks complete.
  - Run \`npm run audit\` upon milestone completion to synchronize atlases.
"
else
    if [ "$ENABLE_PONYTAIL" -eq 0 ] && [ "$ENABLE_CAVEMAN" -eq 0 ] && [ "$ENABLE_SUPER" -eq 0 ]; then
        RULE_BLOCK+="
### $CURR_PHASE. Dual-Speed Verification Loop"
    else
        RULE_BLOCK+="
### Phase $CURR_PHASE: Dual-Speed Verification Loop"
    fi
    RULE_BLOCK+="
- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses for edits ≤ 2 files, < 30 lines)**:
  - Perform direct surgical file edits (\`npx fullstack-audit --patch\` or \`edit_file\`). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.
  - Do NOT run full TypeScript compilation (\`tsc --noEmit\`) or heavy browser MCPs on micro-edits.
- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:
  - Run verification gates (\`npm test\`, \`npm run typecheck\`, or \`npx fullstack-audit --verify --gate-clean\`) before milestone commits.
  - **Zero Polling Invariant**: Do NOT loop on \`manage_task status\`. The harness features Reactive Wakeup and automatically resumes execution when tasks complete.
  - Run \`npm run audit\` upon milestone completion to synchronize atlases.
"
fi

RULE_BLOCK+="
## 🛠️ Available Commands (v2.10.0 Multi-Harness Engine)
- \`/fullstack-audit\` or \`npm run audit\`: Regenerates the entire Fullstack Atlas and root \`llms.txt\` / \`llms-full.txt\`.
- \`npx fullstack-audit --find <query> --compact\`: Ultra-fast, sub-3ms token-compact query mode for AI agents.
- \`npx fullstack-audit --resolve <name>\`: Fuzzy case-insensitive component & file resolver.
- \`npx fullstack-audit --symbol <method>\`: Line-bound surgical slicer for functions/methods in God-files.
- \`npx fullstack-audit --patch <file> --target \"<old>\" --replace \"<new>\"\`: CRLF-agnostic surgical patcher (immune to PowerShell \`&\` syntax crashes).
- \`npx fullstack-audit --setup-all [--standalone | --profile <profile>]\`: Configures Cursor (.mdc), Claude Code, Hermes Agent, and OpenCode.
- \`npx fullstack-audit --theme --route <route> --compact\`: Generates a route-scoped micro-punchlist (saves 99.8% tokens).
- \`npx fullstack-audit --verify --gate-clean [--route <route>]\`: Smart multi-target verification gate.
- \`npx fullstack-audit --solo\`: Enforces strictly Single-Agent execution (no subagents).
- \`npx fullstack-audit --multi-agent\`: Partitions codebase into 4 parallel zone briefs for rapid Map-Reduce sweeps.
- \`npx fullstack-audit --llms\`: Generates root \`llms.txt\` and \`llms-full.txt\` (Answer.AI specification).
- \`npx fullstack-audit --diff\`: Architecture delta report comparing current scan against \`.last_receipt.json\`.
- \`npx fullstack-audit --migrate-theme --from \"#hex1,#hex2\" --to \"dark:bg-slate-900\"\`: CRLF-agnostic AST codemod in 80ms (0 LLM output tokens).
- \`npx fullstack-audit --manifest <file:line>\`: Generates zero-search agent handoff manifest.
- \`npx fullstack-audit --watch\`: Live background file watcher for continuous background sync.
- \`npx fullstack-audit --dead\`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->"

TARGET_FILES=()
[ -f "AGENTS.md" ] && TARGET_FILES+=("AGENTS.md")
[ -f "GEMINI.md" ] && TARGET_FILES+=("GEMINI.md")
[ -f "CLAUDE.md" ] && TARGET_FILES+=("CLAUDE.md")

if [ ${#TARGET_FILES[@]} -eq 0 ]; then
    TARGET_FILES+=("AGENTS.md")
fi

for TARGET_FILE in "${TARGET_FILES[@]}"; do
    if [ -f "$TARGET_FILE" ]; then
        if command -v node >/dev/null 2>&1; then
            node -e '
const fs = require("fs");
const target = process.argv[1];
const newRule = process.env.FULLSTACK_RULE_CONTENT;
let content = fs.readFileSync(target, "utf8");
const markerPattern = /(?:<!-- START_FULLSTACK_AUDIT_RULE -->[\s\S]*?<!-- END_FULLSTACK_AUDIT_RULE -->|<!-- START_FRONTEND_AUDIT_RULE -->[\s\S]*?<!-- END_FRONTEND_AUDIT_RULE -->)/;
const legacyPattern = /##[ \t]*[^\r\n#]*?(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*[\s\S]*?(?=(?:\r?\n---|\r?\n##\s+(?!Available Commands)[^\r\n]+)|$)/;

if (markerPattern.test(content)) {
    content = content.replace(markerPattern, () => newRule);
    console.log(`🔄 Cleanly updated Fullstack Architecture Rule in ${target}`);
} else if (legacyPattern.test(content)) {
    content = content.replace(legacyPattern, () => newRule);
    console.log(`🔄 Upgraded legacy Architecture Rule in-place in ${target}`);
} else {
    content = content.trimEnd() + "\n\n" + newRule + "\n";
    console.log(`🔗 Injected Fullstack Architecture Rule into ${target}`);
}
fs.writeFileSync(target, content, "utf8");
' "$TARGET_FILE"
        else
            echo -e "\n$RULE_BLOCK" >> "$TARGET_FILE"
            echo "🔗 Injected Fullstack Architecture Rule into $TARGET_FILE"
        fi
    else
        echo -e "# $TARGET_FILE — Workspace Guidelines for AI Assistants\n\n$RULE_BLOCK\n" > "$TARGET_FILE"
        echo "📄 Created $TARGET_FILE with 100% Always-Active Fullstack Atlas rule!"
    fi
done

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
