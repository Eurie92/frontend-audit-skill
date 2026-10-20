# frontend-audit-skill — One-line installer & updater (Windows / PowerShell)
#
# Usage:
#   irm https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

# Ensure console and environment handle UTF-8 cleanly
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# Unicode symbols safely represented without source encoding dependencies
$emojiMap  = "$([char]::ConvertFromUtf32(0x1F5FA))$([char]0xFE0F)"
$emojiTool = "$([char]::ConvertFromUtf32(0x1F6E0))$([char]0xFE0F)"
$emDash    = [char]0x2014

$TargetDir = Join-Path (Get-Location) ".agent\skills\frontend-audit"
$ScriptsDir = Join-Path $TargetDir "scripts"

if (-not (Test-Path $ScriptsDir)) {
    New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
}

$BaseUrl = "https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main"

Write-Host "📥 Installing / Updating frontend-audit-skill to latest version..." -ForegroundColor Cyan

Invoke-WebRequest -Uri "$BaseUrl/SKILL.md" -OutFile (Join-Path $TargetDir "SKILL.md")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit.ts" -OutFile (Join-Path $ScriptsDir "audit.ts")

# Rule block with markers for safe, idempotent, in-place updates (never duplicated or appended to EOF)
$RuleLines = @(
    "<!-- START_FRONTEND_AUDIT_RULE -->",
    "## $emojiMap Frontend Architecture & Component Lookup Rule",
    "For all UI, component, route, or color theme tasks (including screenshots and visual bug reports):",
    "1. **Instant Atlas Lookup**: The FIRST tool call MUST be `view_file` on:",
    "   - `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` (by Route or Screen)",
    "   - `docs/frontend-atlas/06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text in a screenshot)",
    "   - `docs/frontend-atlas/07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)",
    "   It indexes all routes, page files, imported components, labels, and icons with 0ms runtime overhead.",
    "2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches and do NOT spawn CLI scripts (`npx tsx scripts/audit-frontend.ts`) for simple lookups. The atlas is already written on disk as Markdown$([char]0x2014)read the file directly.",
    "3. **Continuous Sync**: At the completion of every frontend modification, execute `npm run audit:frontend` to keep the atlas 100% synchronized for subsequent tasks.",
    "",
    "## $emojiTool Available Commands",
    "- `/frontend-audit` or `npm run audit:frontend`: Regenerates the entire Frontend Atlas (all 8 documents).",
    "- `npx tsx scripts/audit-frontend.ts --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).",
    "- `npx tsx scripts/audit-frontend.ts --manifest <file:line>`: Generates zero-search agent handoff manifest.",
    "- `npx tsx scripts/audit-frontend.ts --find <query>`: Instant sub-second search across components, text labels, and icons.",
    "- `npx tsx scripts/audit-frontend.ts --update`: Checks and updates frontend-audit-skill to latest GitHub release.",
    "- `npx tsx scripts/audit-frontend.ts --watch`: Live file watcher for continuous background sync.",
    "- `npx tsx scripts/audit-frontend.ts --dead`: Scans for potential orphaned components.",
    "<!-- END_FRONTEND_AUDIT_RULE -->"
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
        if ($content -match "<!-- START_FRONTEND_AUDIT_RULE -->" -or $content -match "Frontend Architecture\s*&(?:amp;)?\s*Component Lookup") {
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

    $markerPattern = "(?s)<!-- START_FRONTEND_AUDIT_RULE -->.*?<!-- END_FRONTEND_AUDIT_RULE -->"
    $legacyPattern = "(?s)##[ \t]*[^\r\n#]*?Frontend Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*.*?(?=(?:\r?\n---|\r?\n##\s+(?![🛠️\?]|Available Commands)[^\r\n]+)|\z)"

    if ($existing -match $markerPattern) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $markerPattern, $RuleBlock)
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔄 Cleanly updated Frontend Architecture Rule in $TargetFile" -ForegroundColor Cyan
    } elseif ($existing -match $legacyPattern) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace($existing, $legacyPattern, $RuleBlock)
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔄 Upgraded legacy Frontend Architecture Rule in-place in $TargetFile" -ForegroundColor Cyan
    } else {
        $separator = if ($existing.EndsWith("`n")) { "`n" } else { "`n`n" }
        $updated = $existing + $separator + $RuleBlock + "`n"
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        Write-Host "🔗 Injected Frontend Architecture Rule into $TargetFile" -ForegroundColor Cyan
    }
} else {
    $initialContent = "# AGENTS.md $emDash Workspace Guidelines for AI Assistants`n`n$RuleBlock`n"
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) "AGENTS.md"), $initialContent, $utf8NoBom)
    Write-Host "📄 Created AGENTS.md with 100% Always-Active Frontend Atlas rule!" -ForegroundColor Cyan
}

Write-Host "✅ frontend-audit-skill successfully installed / updated in .agent\skills\frontend-audit!" -ForegroundColor Green
Write-Host "💡 You can now type '/frontend-audit' directly in your AI chat." -ForegroundColor Yellow
