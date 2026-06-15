#!/usr/bin/env bash
# Install everything needed to run skeleton-app:
#   git, Node 22, pnpm, GitHub CLI (gh), Claude Code CLI, and optionally VS Code or Cursor.
#
# Supports: macOS (Homebrew), Ubuntu/Debian Linux (apt).
#
# Usage:
#   curl -fsSL <raw-url>/install-prereqs.sh | bash
#   bash scripts/install-prereqs.sh
#
# Flags:
#   --ide=vscode   skip the IDE prompt, install VS Code
#   --ide=cursor   skip the IDE prompt, install Cursor
#   --ide=none     skip the IDE prompt entirely
#   --yes          assume yes for all prompts (CI / non-interactive)

set -euo pipefail

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
ok()    { color "32" "✔ $1"; }
info()  { color "36" "ℹ $1"; }
warn() { color "33" "⚠ $1"; }
fatal() { color "31" "✖ $1"; exit 1; }

# Read from /dev/tty so prompts work when piped through `curl | bash`.
read_tty() {
  local prompt="$1" reply
  if [[ -t 0 ]]; then read -r -p "$prompt " reply
  else read -r -p "$prompt " reply </dev/tty
  fi
  echo "$reply"
}

ASSUME_YES=0
IDE_CHOICE=""

for arg in "$@"; do
  case "$arg" in
    --yes|-y) ASSUME_YES=1 ;;
    --ide=vscode) IDE_CHOICE="vscode" ;;
    --ide=cursor) IDE_CHOICE="cursor" ;;
    --ide=none)   IDE_CHOICE="none" ;;
    *) warn "Unknown flag: $arg" ;;
  esac
done

ask_yes() {
  if [[ $ASSUME_YES -eq 1 ]]; then return 0; fi
  local reply
  reply="$(read_tty "$1 [Y/n]")"
  [[ -z "$reply" || "$reply" =~ ^[Yy] ]]
}

OS="$(uname -s)"
is_mac()   { [[ "$OS" == "Darwin" ]]; }
is_linux() { [[ "$OS" == "Linux" ]]; }

if ! is_mac && ! is_linux; then
  fatal "Unsupported OS: $OS. Use the PowerShell installer on Windows."
fi

# ─── Homebrew (mac only) ──────────────────────────────────────────────────────
ensure_brew() {
  if ! is_mac; then return; fi
  if command -v brew >/dev/null 2>&1; then ok "Homebrew installed"; return; fi
  info "Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if   [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew   ]]; then eval "$(/usr/local/bin/brew shellenv)"
  fi
}

# ─── apt prep (linux only) ────────────────────────────────────────────────────
ensure_apt_prep() {
  if ! is_linux; then return; fi
  if ! command -v apt-get >/dev/null 2>&1; then
    fatal "apt-get not found. This installer supports apt-based distros only."
  fi
  info "Updating apt index"
  sudo apt-get update -y
  sudo apt-get install -y curl ca-certificates gnupg lsb-release
}

# ─── git ──────────────────────────────────────────────────────────────────────
ensure_git() {
  if command -v git >/dev/null 2>&1; then ok "git $(git --version | awk '{print $3}')"; return; fi
  info "Installing git"
  if is_mac;   then brew install git
  elif is_linux; then sudo apt-get install -y git
  fi
}

# ─── Node 22+ ─────────────────────────────────────────────────────────────────
ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local v; v="$(node -v | sed 's/v//' | cut -d. -f1)"
    if [[ "$v" -ge 22 ]]; then ok "Node v$(node -v | sed 's/v//')"; return; fi
    warn "Node v$v < 22 — upgrading"
  fi
  info "Installing Node 22"
  if is_mac; then
    brew install node@22
    brew link --overwrite --force node@22 >/dev/null 2>&1 || true
  elif is_linux; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
}

# ─── pnpm (via corepack, the official path) ──────────────────────────────────
ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then ok "pnpm $(pnpm --version)"; return; fi
  info "Enabling pnpm via corepack"
  corepack enable
  corepack prepare pnpm@latest --activate
}

# ─── GitHub CLI ───────────────────────────────────────────────────────────────
ensure_gh() {
  if command -v gh >/dev/null 2>&1; then ok "gh $(gh --version | head -n1 | awk '{print $3}')"; return; fi
  info "Installing GitHub CLI"
  if is_mac; then
    brew install gh
  elif is_linux; then
    # Official repo per https://github.com/cli/cli/blob/trunk/docs/install_linux.md
    sudo mkdir -p -m 755 /etc/apt/keyrings
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | sudo dd of=/etc/apt/keyrings/githubcli-archive-keyring.gpg
    sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
    sudo apt-get update -y
    sudo apt-get install -y gh
  fi
}

# ─── Claude Code CLI ──────────────────────────────────────────────────────────
ensure_claude_code() {
  if command -v claude >/dev/null 2>&1; then ok "Claude Code CLI installed"; return; fi
  info "Installing Claude Code CLI"
  npm install -g @anthropic-ai/claude-code
}

# ─── IDE ──────────────────────────────────────────────────────────────────────
install_vscode() {
  if command -v code >/dev/null 2>&1; then ok "VS Code already installed"; return; fi
  info "Installing VS Code"
  if is_mac; then
    brew install --cask visual-studio-code
  elif is_linux; then
    sudo apt-get install -y wget apt-transport-https
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc \
      | gpg --dearmor \
      | sudo tee /etc/apt/keyrings/packages.microsoft.gpg >/dev/null
    echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" \
      | sudo tee /etc/apt/sources.list.d/vscode.list >/dev/null
    sudo apt-get update -y
    sudo apt-get install -y code
  fi
}

install_cursor() {
  if command -v cursor >/dev/null 2>&1; then ok "Cursor already installed"; return; fi
  info "Installing Cursor"
  if is_mac; then
    brew install --cask cursor
  elif is_linux; then
    warn "Cursor has no official apt package — download from https://www.cursor.com"
    warn "Skipping Cursor on Linux."
  fi
}

choose_ide() {
  if [[ -n "$IDE_CHOICE" ]]; then return; fi
  if [[ $ASSUME_YES -eq 1 ]]; then IDE_CHOICE="none"; return; fi

  echo
  color "35" "─── IDE ────────────────────────────────────────"
  echo "  1) VS Code"
  echo "  2) Cursor"
  echo "  3) Skip"
  local reply
  reply="$(read_tty "Choose [1/2/3, default=3]:")"
  case "$reply" in
    1) IDE_CHOICE="vscode" ;;
    2) IDE_CHOICE="cursor" ;;
    *) IDE_CHOICE="none" ;;
  esac
}

main() {
  color "35" "
┌──────────────────────────────────────────────┐
│  skeleton-app prerequisites                  │
│  git · Node 22 · pnpm · gh · Claude Code     │
└──────────────────────────────────────────────┘
"
  ensure_brew
  ensure_apt_prep
  ensure_git
  ensure_node
  ensure_pnpm
  ensure_gh
  ensure_claude_code

  choose_ide
  case "$IDE_CHOICE" in
    vscode) install_vscode ;;
    cursor) install_cursor ;;
    none)   info "Skipping IDE install" ;;
  esac

  echo
  ok "All prerequisites installed."
  echo
  info "Next: bootstrap a new project with"
  echo "  curl -fsSL https://raw.githubusercontent.com/davidevenhaim/skeleton-app/main/scripts/setup.sh | bash"
}

main "$@"
