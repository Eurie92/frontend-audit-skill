# frontend-audit-skill — One-line installer & updater (Windows / PowerShell)
#
# Usage:
#   irm https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

$TargetDir = Join-Path (Get-Location) ".agent\skills\frontend-audit"
$ScriptsDir = Join-Path $TargetDir "scripts"

if (-not (Test-Path $ScriptsDir)) {
    New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
}

$BaseUrl = "https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main"

Write-Host "📥 Installing / Updating frontend-audit-skill to latest version..." -ForegroundColor Cyan

Invoke-WebRequest -Uri "$BaseUrl/SKILL.md" -OutFile (Join-Path $TargetDir "SKILL.md")
Invoke-WebRequest -Uri "$BaseUrl/scripts/audit.ts" -OutFile (Join-Path $ScriptsDir "audit.ts")

# Automatically inject Frontend Architecture Rule into AGENTS.md / GEMINI.md
$RuleText = @"

## 🗺️ Frontend Architecture & Component Lookup Rule
For all UI, component, route, or color theme tasks (including screenshots and visual bug reports):
1. **Instant Atlas Lookup**: The FIRST tool call MUST be `view_file` on `docs/frontend-atlas/01_ROUTES_AND_PANELS_MAP.md` (or relevant atlas file in `docs/frontend-atlas/`). It indexes all routes, page files, and imported components with 0ms runtime overhead.
2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches and do NOT spawn CLI scripts (`npx tsx scripts/audit-frontend.ts`) for simple lookups. The atlas is already written on disk as Markdown—read the file directly.
3. **Continuous Sync**: At the completion of every frontend modification, execute `npm run audit:frontend` to keep the atlas 100% synchronized for subsequent tasks.

## 🛠️ Available Commands
- `/frontend-audit` or `npm run audit:frontend`: Regenerates the entire Frontend Atlas.
- `npx tsx scripts/audit-frontend.ts --watch`: Live file watcher for continuous background sync.
- `npx tsx scripts/audit-frontend.ts --dead`: Scans for potential orphaned components.
"@

$AgentRuleFile = if (Test-Path "GEMINI.md") { "GEMINI.md" } elseif (Test-Path "CLAUDE.md") { "CLAUDE.md" } else { "AGENTS.md" }

if (Test-Path $AgentRuleFile) {
    $existing = Get-Content $AgentRuleFile -Raw
    if ($existing -notmatch "Frontend Architecture & Component Lookup Rule") {
        Add-Content -Path $AgentRuleFile -Value "`n$RuleText"
        Write-Host "🔗 Injected Frontend Architecture Rule into $AgentRuleFile" -ForegroundColor Cyan
    }
} else {
    Set-Content -Path "AGENTS.md" -Value "# AGENTS.md — Workspace Guidelines for AI Assistants`n$RuleText"
    Write-Host "📄 Created AGENTS.md with 100% Always-Active Frontend Atlas rule!" -ForegroundColor Cyan
}

Write-Host "✅ frontend-audit-skill successfully installed / updated in .agent\skills\frontend-audit!" -ForegroundColor Green
Write-Host "💡 You can now type '/frontend-audit' directly in your AI chat." -ForegroundColor Yellow
