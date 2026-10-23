# fullstack-audit-skill - One-line installer and updater (Windows / PowerShell)
#
# Usage:
#   # Recommended: Full Synergy Triad (Audit + Ponytail + Caveman + Superpowers)
#   iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)
#
#   # Standalone Mode (Zero external dependencies):
#   & { $(irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1) } -Standalone

param(
    [ValidateSet("triad", "standalone", "custom")]
    [string]$Profile = "triad",
    [switch]$Standalone,
    [switch]$WithPonytail,
    [switch]$WithCaveman,
    [switch]$WithSuperpowers,
    [switch]$NoPonytail,
    [switch]$NoCaveman,
    [switch]$NoSuperpowers
)

$ErrorActionPreference = "Stop"

# Ensure console and environment handle UTF-8 cleanly
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# Unicode symbols safely generated at runtime without non-ASCII source characters
$emojiMap     = "$([char]::ConvertFromUtf32(0x1F5FA))$([char]0xFE0F)"
$emojiTool    = "$([char]::ConvertFromUtf32(0x1F6E0))$([char]0xFE0F)"
$emojiInbox   = "$([char]::ConvertFromUtf32(0x1F4E5))"
$emojiRefresh = "$([char]::ConvertFromUtf32(0x1F504))"
$emojiLink    = "$([char]::ConvertFromUtf32(0x1F517))"
$emojiDoc     = "$([char]::ConvertFromUtf32(0x1F4C4))"
$emojiCheck   = "$([char]::ConvertFromUtf32(0x2705))"
$emojiTip     = "$([char]::ConvertFromUtf32(0x1F4A1))"
$emDash       = [char]0x2014

if ($Standalone) { $Profile = "standalone" }

$enablePonytail = ($Profile -eq "triad" -or $WithPonytail) -and (-not $NoPonytail)
$enableCaveman  = ($Profile -eq "triad" -or $WithCaveman)  -and (-not $NoCaveman)
$enableSuper    = ($Profile -eq "triad" -or $WithSuperpowers) -and (-not $NoSuperpowers)

if ($Profile -eq "standalone") {
    $enablePonytail = $false
    $enableCaveman  = $false
    $enableSuper    = $false
}

$isTriad = ($Profile -eq "triad") -and $enablePonytail -and $enableCaveman -and $enableSuper
$isStandalone = ($Profile -eq "standalone") -or ((-not $enablePonytail) -and (-not $enableCaveman) -and (-not $enableSuper))

$TargetDir = Join-Path (Get-Location) ".agent\skills\fullstack-audit"
$ScriptsDir = Join-Path $TargetDir "scripts"

if (-not (Test-Path $ScriptsDir)) {
    New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
}

$BaseUrl = "https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main"

Write-Host "$emojiInbox Installing / Updating fullstack-audit-skill (Profile: $($Profile.ToUpper()))..." -ForegroundColor Cyan

Invoke-WebRequest -Uri "$BaseUrl/SKILL.md" -OutFile (Join-Path $TargetDir "SKILL.md")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit.ts" -OutFile (Join-Path $ScriptsDir "audit.ts")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit-backend.ts" -OutFile (Join-Path $ScriptsDir "audit-backend.ts")
Invoke-WebRequest -Uri "$BaseUrl/scripts/constants.ts" -OutFile (Join-Path $ScriptsDir "constants.ts")

# Dynamically construct rule lines based on profile
$RuleLines = [System.Collections.Generic.List[string]]::new()
$RuleLines.Add("<!-- START_FULLSTACK_AUDIT_RULE -->")
$RuleLines.Add("<!-- START_FRONTEND_AUDIT_RULE -->")

if ($isTriad) {
    $RuleLines.Add("# ⚡ Fullstack 4-Phase Synergy Engine (0ms Atlas • Ponytail KISS • Caveman Terse • Dual-Speed Verify)")
    $RuleLines.Add("Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).")
    $RuleLines.Add("")
    $RuleLines.Add("## 🔄 The 4-Phase Operational Pipeline")
    $RuleLines.Add("")
    $RuleLines.Add("### Phase 1: GPS / Locate (`fullstack-audit`)")
} elseif ($isStandalone) {
    $RuleLines.Add("# 🗺️ Fullstack Atlas Engine (0ms Zero-Grep • Dual-Speed Verify)")
    $RuleLines.Add("Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).")
    $RuleLines.Add("")
    $RuleLines.Add("## 🔄 The Operational Protocol")
    $RuleLines.Add("")
    $RuleLines.Add("### 1. GPS / Locate (`fullstack-audit`)")
} else {
    $activePillars = [System.Collections.Generic.List[string]]::new()
    $activePillars.Add("0ms Atlas")
    if ($enablePonytail) { $activePillars.Add("Ponytail KISS") }
    if ($enableCaveman) { $activePillars.Add("Caveman Terse") }
    if ($enableSuper) { $activePillars.Add("Dual-Speed Verify") }
    $RuleLines.Add("# ⚡ Fullstack Modular Synergy Engine ($($activePillars -join ' • '))")
    $RuleLines.Add("Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).")
    $RuleLines.Add("")
    $RuleLines.Add("## 🔄 The Operational Pipeline")
    $RuleLines.Add("")
    $RuleLines.Add("### Phase 1: GPS / Locate (`fullstack-audit`)")
}

# Phase 1 / GPS Content
$RuleLines.Add("- **Zero-Grep Mandate**: The FIRST tool call MUST be `view_file` on the pre-computed atlases:")
$RuleLines.Add("  - **Frontend (`docs/frontend-atlas/`)**: `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, Server/Client boundary), `02_COMPONENT_INVENTORY.md` (modals, drawers, live dots `animate-pulse`, capsule pills `rounded-full`, buttons), `03_DESIGN_TOKENS_AND_COLORS.md` (all 22+ Tailwind color families, dark mode asymmetries, hexes), `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot), `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot), `09_QUERY_AND_CACHE_MAP.md` (by React Query key, useQuery/useMutation, cache invalidation), `10_GOD_FILES_SURGICAL_MAP.md` (slice bounds for files >500 lines to save 90%+ tokens), `11_ROUTE_COMPLEXITY_AND_BLAST_RADIUS.md` (route risk score & blast radius), `12_TEST_SUITES_AND_COVERAGE_MAP.md` (failing assertions & test titles), `THEME_MIGRATION_PUNCHLIST.md` (whole-website color & dark mode rebrands).")
$RuleLines.Add("  - **Backend (`docs/backend-atlas/`)**: `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method, auth guard), `02_DATABASE_MODELS_AND_SCHEMA.md` (by raw table name, Prisma model, Drizzle schema), `03_SERVER_ACTIONS_AND_MUTATIONS.md` (Next.js Server Action `"use server`"), `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (route matcher, public vs protected), `05_INTEGRATIONS_AND_WEBHOOKS.md` (Stripe, Resend, Supabase, S3), `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (trace UI button/modal directly to backend action & database model), `07_ENV_AND_SECRETS_MAP.md` (client secret leak radar).")
$RuleLines.Add("  - **Fast Find**: Or run `npx fullstack-audit --find `"<query>`" --compact` (sub-3ms).")
$RuleLines.Add("  - **Fuzzy File Resolve**: Run `npx fullstack-audit --resolve `"<component-or-file>`"` to resolve casing (e.g. `connect-modal` ➔ `ConnectModal.tsx`) in 0ms.")
$RuleLines.Add("  - **Method Line Bounds**: Run `npx fullstack-audit --symbol `"<method>`"` to get exact start/end lines in God-files before calling `read_file`.")
$RuleLines.Add("- **HARD FORBIDDEN (PowerShell `-Exclude` Trap)**: Do NOT run recursive codebase greps (`Get-ChildItem -Recurse | Select-String`, `grep -r`). In Windows PowerShell, `-Exclude` does NOT prune recursion—it scans all 50,000+ files in `node_modules` and `.next`, causing a 15–30s freeze with Defender filter drivers. The repository is already indexed.")
$RuleLines.Add("- **PowerShell Quoting Armor**: Always wrap PowerShell arguments in single-quotes `'...'`. The `&` operator is reserved (e.g. `'Help & support'`), and `$` triggers variable expansion. Use `npx fullstack-audit --patch` to edit files safely without scratch scripts.")
$RuleLines.Add("- **Immediate Relinquishment**: Once `file:line` is located, `fullstack-audit` IMMEDIATELY relinquishes control to implementation. `fullstack-audit` is a GPS locator, NOT an implementation or animation tool.")
$RuleLines.Add("")

$currPhase = 2

# Phase 2: Ponytail / Native KISS
if ($enablePonytail) {
    $RuleLines.Add("### Phase $currPhase`: Design & Anti-Overengineering Firewall (`ponytail`)")
    $RuleLines.Add("- **YAGNI Invariant**: The best code is the code never written. Solve the whole problem with the least new code.")
    $RuleLines.Add("- **The Ponytail Hierarchy**:")
    $RuleLines.Add("  1. *Does it need to exist?* Skip unasked features, options, and speculative abstractions. A vague request gets the smallest working version.")
    $RuleLines.Add("  2. *Already in codebase?* Reuse existing helpers, components, and patterns.")
    $RuleLines.Add("  3. *Platform feature?* Use standard web/DOM/Tailwind primitives over custom JavaScript trigonometry, 36-point polygon waves, or complex SVG math.")
    $RuleLines.Add("  4. *Installed dependency?* Never install a new package for a few lines of logic.")
    $RuleLines.Add("  5. *Can it be one line?* Make it one line a reader grasps at a glance.")
    $RuleLines.Add("  6. *Shortest working diff wins.* Deletion beats addition. Keep surrounding layers and conventions intact.")
    $RuleLines.Add("- **Preserve Always**: Trust boundary validation, auth guards, data-loss error handling, accessibility.")
    $RuleLines.Add("- **Shortcuts**: Document deliberate limits as `// shortcut: <limit>, <when to upgrade>`.")
    $RuleLines.Add("")
    $currPhase++
} elseif ($isStandalone) {
    $RuleLines.Add("### $currPhase`. Implementation & Minimalist Discipline")
    $RuleLines.Add("- Solve the user request with the least code necessary. Reuse existing project helpers and primitives before adding new abstractions or dependencies.")
    $RuleLines.Add("- Surgical edits: keep modifications contained to the exact target files located via the atlas. Do not refactor untouched files.")
    $RuleLines.Add("")
    $currPhase++
}

# Phase 3: Caveman / Natural
if ($enableCaveman) {
    $RuleLines.Add("### Phase $currPhase`: Communication & Zero-Fluff Receipts (`caveman`)")
    $RuleLines.Add("- **Answer First**: Dense result first, technical facts exact.")
    $RuleLines.Add("- **Kill Ceremony**: No conversational filler (`"Sure, I can help with that!`", `"I apologize for the confusion`"), no preamble, no postamble.")
    $RuleLines.Add("- **Tool Status**: Zero conversational commentary between routine tool calls.")
    $RuleLines.Add("- **Compact Diff Receipt**: Conclude replies with a tight diff receipt:")
    $RuleLines.Add("  - `Target`: `<file:line>`")
    $RuleLines.Add("  - `Diff`: `<old>` ➔ `<new>`")
    $RuleLines.Add("  - `Status`: `<HMR applied | Test pass count | Exit code>`")
    $RuleLines.Add("")
    $currPhase++
}

# Phase 4: Superpowers or Dual-Speed Gate
if ($enableSuper) {
    $RuleLines.Add("### Phase $currPhase`: Right-Sized Verification (`superpowers` Dual-Speed Harmonization)")
    $RuleLines.Add("- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses — Mandatory for UI/CSS/Layout/Copy edits ≤ 2 files, < 30 lines)**:")
    $RuleLines.Add("  - Perform direct surgical file edits (`npx fullstack-audit --patch` or `edit_file`). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.")
    $RuleLines.Add("  - **HARD FORBIDDEN**: Do NOT run full TypeScript compilation (`tsc --noEmit`, `npm run typecheck`).")
    $RuleLines.Add("  - **HARD FORBIDDEN**: Do NOT run `npm run audit` or `npx fullstack-audit` on micro-edits.")
    $RuleLines.Add("  - **HARD FORBIDDEN**: Do NOT invoke Superpowers process skills (`brainstorming`, `writing-plans`, `test-driven-development`).")
    $RuleLines.Add("  - **HARD FORBIDDEN**: Do NOT invoke multiple design skills in parallel.")
    $RuleLines.Add("  - **HARD FORBIDDEN**: Do NOT invoke heavy browser automation (Chrome DevTools MCP / Puppeteer) or curl localhost.")
    $RuleLines.Add("  - **Response Time**: Return immediately to the user in 1–2 seconds.")
    $RuleLines.Add("- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:")
    $RuleLines.Add("  - Superpowers Iron Law applies: *No completion claims without fresh verification evidence.*")
    $RuleLines.Add("  - Run `npx fullstack-audit --verify --gate-clean` or test suites (`npm test`, `npm run typecheck`).")
    $RuleLines.Add("  - Claim completion ONLY with fresh exit code 0 evidence.")
    $RuleLines.Add("  - **Zero Polling Invariant**: Do NOT loop on `manage_task status`. The harness features Reactive Wakeup and automatically resumes execution when tasks complete.")
    $RuleLines.Add("  - Run `npm run audit` upon milestone completion to synchronize atlases.")
} else {
    $phaseLabel = if ($isStandalone) { "$currPhase. Dual-Speed Verification Loop" } else { "Phase $currPhase`: Dual-Speed Verification Loop" }
    $RuleLines.Add("### $phaseLabel")
    $RuleLines.Add("- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses for edits ≤ 2 files, < 30 lines)**:")
    $RuleLines.Add("  - Perform direct surgical file edits (`npx fullstack-audit --patch` or `edit_file`). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.")
    $RuleLines.Add("  - Do NOT run full TypeScript compilation (`tsc --noEmit`) or heavy browser MCPs on micro-edits.")
    $RuleLines.Add("- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:")
    $RuleLines.Add("  - Run verification gates (`npm test`, `npm run typecheck`, or `npx fullstack-audit --verify --gate-clean`) before milestone commits.")
    $RuleLines.Add("  - **Zero Polling Invariant**: Do NOT loop on `manage_task status`. The harness features Reactive Wakeup and automatically resumes execution when tasks complete.")
    $RuleLines.Add("  - Run `npm run audit` upon milestone completion to synchronize atlases.")
}
$RuleLines.Add("")

$RuleLines.Add("## 🛠️ Available Commands (v2.10.0 Multi-Harness Engine)")
$RuleLines.Add("- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas and root `llms.txt` / `llms-full.txt`.")
$RuleLines.Add("- `npx fullstack-audit --find <query> --compact`: Ultra-fast, sub-3ms token-compact query mode for AI agents.")
$RuleLines.Add("- `npx fullstack-audit --resolve <name>`: Fuzzy case-insensitive component & file resolver.")
$RuleLines.Add("- `npx fullstack-audit --symbol <method>`: Line-bound surgical slicer for functions/methods in God-files.")
$RuleLines.Add("- `npx fullstack-audit --patch <file> --target `"<old>`" --replace `"<new>`"`: CRLF-agnostic surgical patcher (immune to PowerShell `&` syntax crashes).")
$RuleLines.Add("- `npx fullstack-audit --setup-all [--standalone | --profile <profile>]`: Configures Cursor (.mdc), Claude Code, Hermes Agent, and OpenCode.")
$RuleLines.Add("- `npx fullstack-audit --theme --route <route> --compact`: Generates a route-scoped micro-punchlist (saves 99.8% tokens).")
$RuleLines.Add("- `npx fullstack-audit --verify --gate-clean [--route <route>]`: Smart multi-target verification gate.")
$RuleLines.Add("- `npx fullstack-audit --solo`: Enforces strictly Single-Agent execution (no subagents).")
$RuleLines.Add("- `npx fullstack-audit --multi-agent`: Partitions codebase into 4 parallel zone briefs for rapid Map-Reduce sweeps.")
$RuleLines.Add("- `npx fullstack-audit --llms`: Generates root `llms.txt` and `llms-full.txt` (Answer.AI specification).")
$RuleLines.Add("- `npx fullstack-audit --diff`: Architecture delta report comparing current scan against `.last_receipt.json`.")
$RuleLines.Add("- `npx fullstack-audit --migrate-theme --from `"#hex1,#hex2`" --to `"dark:bg-slate-900`"`: CRLF-agnostic AST codemod in 80ms (0 LLM output tokens).")
$RuleLines.Add("- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.")
$RuleLines.Add("- `npx fullstack-audit --watch`: Live background file watcher for continuous background sync.")
$RuleLines.Add("- `npx fullstack-audit --dead`: Scans for potential orphaned components.")
$RuleLines.Add("<!-- END_FRONTEND_AUDIT_RULE -->")
$RuleLines.Add("<!-- END_FULLSTACK_AUDIT_RULE -->")

$RuleBlock = $RuleLines -join "`n"

# Target files to update: AGENTS.md, GEMINI.md, and CLAUDE.md
$TargetsToUpdate = [System.Collections.Generic.List[string]]::new()
if (Test-Path "AGENTS.md") { $TargetsToUpdate.Add("AGENTS.md") }
if (Test-Path "GEMINI.md") { $TargetsToUpdate.Add("GEMINI.md") }
if (Test-Path "CLAUDE.md") { $TargetsToUpdate.Add("CLAUDE.md") }

if ($TargetsToUpdate.Count -eq 0) {
    $TargetsToUpdate.Add("AGENTS.md")
}

$markerPattern = "(?s)(?:<!-- START_FULLSTACK_AUDIT_RULE -->.*?<!-- END_FULLSTACK_AUDIT_RULE -->|<!-- START_FRONTEND_AUDIT_RULE -->.*?<!-- END_FRONTEND_AUDIT_RULE -->)"
$legacyPattern = "(?s)##[ \t]*[^\r\n#]*?(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*.*?(?=(?:\r?\n---|\r?\n##\s+(?!Available Commands)[^\r\n]+)|\z)"

foreach ($target in $TargetsToUpdate) {
    if (Test-Path $target) {
        $fullPath = (Resolve-Path $target).Path
        $existing = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

        if ($existing -match $markerPattern) {
            $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $markerPattern, [System.Text.RegularExpressions.MatchEvaluator]{ return $RuleBlock })
            [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
            Write-Host "$emojiRefresh Cleanly updated Fullstack Architecture Rule in $target" -ForegroundColor Cyan
        } elseif ($existing -match $legacyPattern) {
            $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $legacyPattern, [System.Text.RegularExpressions.MatchEvaluator]{ return $RuleBlock })
            [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
            Write-Host "$emojiRefresh Upgraded legacy Architecture Rule in-place in $target" -ForegroundColor Cyan
        } else {
            $separator = if ($existing.EndsWith("`n")) { "`n" } else { "`n`n" }
            $updated = $existing + $separator + $RuleBlock + "`n"
            [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
            Write-Host "$emojiLink Injected Fullstack Architecture Rule into $target" -ForegroundColor Cyan
        }
    } else {
        $initialContent = "# $target $emDash Workspace Guidelines for AI Assistants`n`n$RuleBlock`n"
        [System.IO.File]::WriteAllText((Join-Path (Get-Location) $target), $initialContent, $utf8NoBom)
        Write-Host "$emojiDoc Created $target with 100% Always-Active Fullstack Atlas rule!" -ForegroundColor Cyan
    }
}

# Mirror to .agent\skills\frontend-audit for 100% backward compatibility
$LegacyDir = Join-Path (Get-Location) ".agent\skills\frontend-audit"
$LegacyScriptsDir = Join-Path $LegacyDir "scripts"
if (Test-Path $LegacyDir) {
    Copy-Item (Join-Path $TargetDir "SKILL.md") (Join-Path $LegacyDir "SKILL.md") -Force
    if (-not (Test-Path $LegacyScriptsDir)) { New-Item -ItemType Directory -Force -Path $LegacyScriptsDir | Out-Null }
    Copy-Item (Join-Path $ScriptsDir "audit.ts") (Join-Path $LegacyScriptsDir "audit.ts") -Force
    Copy-Item (Join-Path $ScriptsDir "audit-backend.ts") (Join-Path $LegacyScriptsDir "audit-backend.ts") -Force
    Copy-Item (Join-Path $ScriptsDir "constants.ts") (Join-Path $LegacyScriptsDir "constants.ts") -Force
}

Write-Host "$emojiCheck fullstack-audit-skill successfully installed / updated in .agent\skills\fullstack-audit!" -ForegroundColor Green
Write-Host "$emojiTip You can now type '/fullstack-audit' (or '/frontend-audit') directly in your AI chat." -ForegroundColor Yellow
