# Install everything needed to run skeleton-app on Windows:
#   git, Node 22, pnpm, GitHub CLI (gh), Claude Code CLI, and optionally VS Code or Cursor.
#
# Uses winget (built into Windows 10 1809+ / 11). No Chocolatey fallback.
#
# Usage (PowerShell):
#   irm https://raw.githubusercontent.com/davidevenhaim/skeleton-app/main/scripts/install-prereqs.ps1 | iex
#   .\scripts\install-prereqs.ps1
#
# Flags:
#   -Ide vscode | cursor | none
#   -Yes  (assume yes, non-interactive)

param(
  [ValidateSet("vscode", "cursor", "none", "")]
  [string]$Ide = "",
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Write-Ok    ($msg) { Write-Host "✔ $msg" -ForegroundColor Green }
function Write-Info  ($msg) { Write-Host "ℹ $msg" -ForegroundColor Cyan }
function Write-Warn  ($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Fatal ($msg) { Write-Host "✖ $msg" -ForegroundColor Red; exit 1 }

function Test-Command($name) {
  $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Ensure-Winget {
  if (Test-Command "winget") { Write-Ok "winget available"; return }
  Write-Fatal "winget is not available. Update to Windows 10 1809+ or install 'App Installer' from the Microsoft Store, then re-run."
}

function Install-WingetPkg($id, $displayName) {
  Write-Info "Installing $displayName ($id)"
  winget install --id $id --silent --accept-source-agreements --accept-package-agreements --source winget
  if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
    # -1978335189 = already installed
    Write-Warn "winget reported exit code $LASTEXITCODE for $id (continuing)."
  }
}

function Refresh-Path {
  # Re-pull PATH so newly installed CLIs are visible in this session.
  $env:Path = `
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + `
    [Environment]::GetEnvironmentVariable("Path", "User")
}

# ─── git ──────────────────────────────────────────────────────────────────────
function Ensure-Git {
  if (Test-Command "git") { Write-Ok "git $(git --version)"; return }
  Install-WingetPkg "Git.Git" "Git"
  Refresh-Path
}

# ─── Node 22+ ─────────────────────────────────────────────────────────────────
function Ensure-Node {
  if (Test-Command "node") {
    $v = (node -v).TrimStart("v").Split(".")[0]
    if ([int]$v -ge 22) { Write-Ok "Node $(node -v)"; return }
    Write-Warn "Node $(node -v) < 22 — installing newer"
  }
  Install-WingetPkg "OpenJS.NodeJS.LTS" "Node.js LTS"
  Refresh-Path
}

# ─── pnpm (via corepack) ──────────────────────────────────────────────────────
function Ensure-Pnpm {
  if (Test-Command "pnpm") { Write-Ok "pnpm $(pnpm --version)"; return }
  Write-Info "Enabling pnpm via corepack"
  corepack enable
  corepack prepare pnpm@latest --activate
}

# ─── GitHub CLI ───────────────────────────────────────────────────────────────
function Ensure-Gh {
  if (Test-Command "gh") { Write-Ok "gh $((gh --version)[0])"; return }
  Install-WingetPkg "GitHub.cli" "GitHub CLI"
  Refresh-Path
}

# ─── Claude Code CLI ──────────────────────────────────────────────────────────
function Ensure-ClaudeCode {
  if (Test-Command "claude") { Write-Ok "Claude Code CLI installed"; return }
  Write-Info "Installing Claude Code CLI"
  npm install -g "@anthropic-ai/claude-code"
}

# ─── IDE ──────────────────────────────────────────────────────────────────────
function Install-VSCode {
  if (Test-Command "code") { Write-Ok "VS Code already installed"; return }
  Install-WingetPkg "Microsoft.VisualStudioCode" "VS Code"
}

function Install-Cursor {
  if (Test-Command "cursor") { Write-Ok "Cursor already installed"; return }
  Install-WingetPkg "Anysphere.Cursor" "Cursor"
}

function Choose-Ide {
  if ($Ide -ne "") { return $Ide }
  if ($Yes) { return "none" }
  Write-Host ""
  Write-Host "─── IDE ────────────────────────────────────────" -ForegroundColor Magenta
  Write-Host "  1) VS Code"
  Write-Host "  2) Cursor"
  Write-Host "  3) Skip"
  $reply = Read-Host "Choose [1/2/3, default=3]"
  switch ($reply) {
    "1" { return "vscode" }
    "2" { return "cursor" }
    default { return "none" }
  }
}

# ─── main ─────────────────────────────────────────────────────────────────────
Write-Host @"

┌──────────────────────────────────────────────┐
│  skeleton-app prerequisites                  │
│  git · Node 22 · pnpm · gh · Claude Code     │
└──────────────────────────────────────────────┘
"@ -ForegroundColor Magenta

Ensure-Winget
Ensure-Git
Ensure-Node
Ensure-Pnpm
Ensure-Gh
Ensure-ClaudeCode

$chosenIde = Choose-Ide
switch ($chosenIde) {
  "vscode" { Install-VSCode }
  "cursor" { Install-Cursor }
  "none"   { Write-Info "Skipping IDE install" }
}

Write-Host ""
Write-Ok "All prerequisites installed."
Write-Host ""
Write-Info "Next: open a NEW PowerShell window (so PATH updates take effect), then bootstrap a project with:"
Write-Host "  irm https://raw.githubusercontent.com/davidevenhaim/skeleton-app/main/scripts/setup.ps1 | iex" -ForegroundColor White
