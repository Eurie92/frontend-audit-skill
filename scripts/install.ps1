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

Write-Host "✅ frontend-audit-skill successfully installed / updated in .agent\skills\frontend-audit!" -ForegroundColor Green
Write-Host "💡 You can now type '/frontend-audit' directly in your AI chat." -ForegroundColor Yellow
