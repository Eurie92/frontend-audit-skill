# fullstack-audit-skill — One-line installer & updater (Windows / PowerShell)
#
# Usage:
#   irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

# Ensure console and environment handle UTF-8 cleanly
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# Unicode symbols safely represented without source encoding dependencies
$emojiMap  = "$([char]::ConvertFromUtf32(0x1F5FA))$([char]0xFE0F)"
$emojiTool = "$([char]::ConvertFromUtf32(0x1F6E0))$([char]0xFE0F)"
$emDash    = [char]0x2014

$TargetDir = Join-Path (Get-Location) ".agent\skills\fullstack-audit"
$ScriptsDir = Join-Path $TargetDir "scripts"

if (-not (Test-Path $ScriptsDir)) {
    New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
}

$BaseUrl = "https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main"

Write-Host "📥 Installing / Updating fullstack-audit-skill to latest version..." -ForegroundColor Cyan

Invoke-WebRequest -Uri "$BaseUrl/SKILL.md" -OutFile (Join-Path $TargetDir "SKILL.md")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit.ts" -OutFile (Join-Path $ScriptsDir "audit.ts")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit-backend.ts" -OutFile (Join-Path $ScriptsDir "audit-backend.ts")

# Rule block with markers for safe, idempotent, in-place updates (never duplicated or appended to EOF)
$RuleLines = @(
    '<!-- START_FULLSTACK_AUDIT_RULE -->',
    '<!-- START_FRONTEND_AUDIT_RULE -->',
    '## 🗺️ Fullstack Architecture & Component Lookup Rule',
    'For all UI, component, route, color theme, API, database, server action, or backend tasks:',
    '',
    '1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:',
    '   - **Frontend Atlas (`docs/frontend-atlas/`)**:',
    '     - `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, or Server/Client boundary)',
    '     - `02_COMPONENT_INVENTORY.md` (by Modals, Drawers, Live Dots `animate-pulse`, Capsule Pills `rounded-full`, Buttons)',
    '     - `03_DESIGN_TOKENS_AND_COLORS.md` (for all 22+ Tailwind color families, dark mode asymmetries, hexes)',
    '     - `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot)',
    '     - `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)',
    '     - `THEME_MIGRATION_PUNCHLIST.md` (actionable checklist for whole-website color and dark mode rebrands)',
    '   - **Backend Atlas (`docs/backend-atlas/`)**:',
    '     - `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method: GET/POST/PUT/DELETE, or auth guard)',
    '     - `02_DATABASE_MODELS_AND_SCHEMA.md` (by database table, Prisma model, or Drizzle schema)',
    '     - `03_SERVER_ACTIONS_AND_MUTATIONS.md` (by Next.js Server Action "use server")',
    '     - `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (by route matcher or public vs protected route)',
    '     - `05_INTEGRATIONS_AND_WEBHOOKS.md` (by third-party service: Stripe, Resend, Supabase, S3)',
    '     - `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (to trace UI button/modal directly to backend action & database model)',
    '',
    '2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (`Get-ChildItem -Recurse | Select-String`) and do NOT spawn CLI scripts for simple lookups. Both atlases are already indexed on disk as Markdown—read the files directly.',
    '',
    '3. **Continuous Sync**: At the completion of any frontend or backend modification, execute `npm run audit` (or `npx fullstack-audit`) to keep the atlases 100% synchronized for subsequent tasks.',
    '',
    '## 🛠️ Available Commands',
    '- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas (both `docs/frontend-atlas/` and `docs/backend-atlas/`).',
    '- `npm run audit:frontend`: Regenerates only the Frontend Atlas (`docs/frontend-atlas/`).',
    '- `npm run audit:backend`: Regenerates only the Backend Atlas (`docs/backend-atlas/`).',
    '- `npm run audit:theme` or `npx fullstack-audit --theme`: Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands.',
    '- `npx fullstack-audit --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).',
    '- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.',
    '- `npx fullstack-audit --find <query>`: Instant sub-second search across components, text labels, and icons.',
    '- `npx fullstack-audit --update`: Checks and updates fullstack-audit-skill to latest GitHub release.',
    '- `npx fullstack-audit --watch`: Live file watcher for continuous background sync.',
    '- `npx fullstack-audit --dead`: Scans for potential orphaned components.',
    '<!-- END_FRONTEND_AUDIT_RULE -->',
    '<!-- END_FULLSTACK_AUDIT_RULE -->'
)
$RuleBlock = $RuleLines -join "`n"

# Intelligent Target File Resolution:
# Standard priority: AGENTS.md > GEMINI.md > CLAUDE.md
$Candidates = @("AGENTS.md", "GEMINI.md", "CLAUDE.md")
$TargetFile = $null

# 1. If any candidate file ALREADY has the rule or markers, target ONLY that file to prevent duplicate injections
foreach ($file in $Candidates) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText((Resolve-Path $file).Path, [System.Text.Encoding]::UTF8)
        if ($content -match "<!-- START_FULLSTACK_AUDIT_RULE -->" -or $content -match "<!-- START_FRONTEND_AUDIT_RULE -->" -or $content -match "Architecture\s*&(?:amp;)?\s*Component Lookup") {
            $TargetFile = $file
            break
        }
    }
}

# 2. If no candidate currently contains the rule, pick the highest-priority existing file
if (-not $TargetFile) {
    foreach ($file in $Candidates) {
        if (Test-Path $file) {
            $TargetFile = $file
            break
        }
    }
}

# 3. If none exist, create AGENTS.md (the universal standard)
if (-not $TargetFile) {
    $TargetFile = "AGENTS.md"
}

# Perform clean in-place update or injection
if (Test-Path $TargetFile) {
    $fullPath = (Resolve-Path $TargetFile).Path
    $existing = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

    $markerPattern = "(?s)(?:<!-- START_FULLSTACK_AUDIT_RULE -->.*?<!-- END_FULLSTACK_AUDIT_RULE -->|<!-- START_FRONTEND_AUDIT_RULE -->.*?<!-- END_FRONTEND_AUDIT_RULE -->)"
    $legacyPattern = "(?s)##[ \t]*[^\r\n#]*?(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*.*?(?=(?:\r?\n---|\r?\n##\s+(?![🛠️\?]|Available Commands)[^\r\n]+)|\z)"

    if ($existing -match $markerPattern) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $markerPattern, $RuleBlock)
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔄 Cleanly updated Fullstack Architecture Rule in $TargetFile" -ForegroundColor Cyan
    } elseif ($existing -match $legacyPattern) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $legacyPattern, $RuleBlock)
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔄 Upgraded legacy Architecture Rule in-place in $TargetFile" -ForegroundColor Cyan
    } else {
        $separator = if ($existing.EndsWith("`n")) { "`n" } else { "`n`n" }
        $updated = $existing + $separator + $RuleBlock + "`n"
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔗 Injected Fullstack Architecture Rule into $TargetFile" -ForegroundColor Cyan
    }
} else {
    $initialContent = "# AGENTS.md $emDash Workspace Guidelines for AI Assistants`n`n$RuleBlock`n"
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) "AGENTS.md"), $initialContent, $utf8NoBom)
    Write-Host "📄 Created AGENTS.md with 100% Always-Active Fullstack Atlas rule!" -ForegroundColor Cyan
}

# Mirror to .agent\skills\frontend-audit for 100% backward compatibility
$LegacyDir = Join-Path (Get-Location) ".agent\skills\frontend-audit"
$LegacyScriptsDir = Join-Path $LegacyDir "scripts"
if (Test-Path $LegacyDir) {
    Copy-Item (Join-Path $TargetDir "SKILL.md") (Join-Path $LegacyDir "SKILL.md") -Force
    if (-not (Test-Path $LegacyScriptsDir)) { New-Item -ItemType Directory -Force -Path $LegacyScriptsDir | Out-Null }
    Copy-Item (Join-Path $ScriptsDir "audit.ts") (Join-Path $LegacyScriptsDir "audit.ts") -Force
    Copy-Item (Join-Path $ScriptsDir "audit-backend.ts") (Join-Path $LegacyScriptsDir "audit-backend.ts") -Force
}

Write-Host "✅ fullstack-audit-skill successfully installed / updated in .agent\skills\fullstack-audit!" -ForegroundColor Green
Write-Host "💡 You can now type '/fullstack-audit' (or '/frontend-audit') directly in your AI chat." -ForegroundColor Yellow
