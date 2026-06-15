#!/usr/bin/env bash
# skeleton-app interactive bootstrap.
#
# What it does:
#   1. Ensures Homebrew (mac), Node 22+, pnpm, gh CLI, git are installed
#   2. Authenticates with GitHub (if needed)
#   3. Creates a new repo from this template (or clones it)
#   4. Installs dependencies
#   5. Asks for a project name + locales to keep
#   6. Optionally asks for Supabase keys (skippable — app runs without them)
#   7. Writes .env.local
#   8. Optionally runs `pnpm reset` to strip demo content
#   9. Starts the dev server
#
# Usage:
#   curl -fsSL https://your.url/setup.sh | bash
#   or:  bash scripts/setup.sh

set -euo pipefail

TEMPLATE_REPO="davidevenhaim/skeleton-app"   # change to your template's slug
DEFAULT_PROJECT_NAME="my-skeleton-app"

color()    { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
ok()       { color "32" "✔ $1"; }
info()     { color "36" "ℹ $1"; }
warn()     { color "33" "⚠ $1"; }
fatal()    { color "31" "✖ $1"; exit 1; }
ask()      { local prompt="$1" default="${2:-}" reply; read -r -p "$prompt " reply; echo "${reply:-$default}"; }
ask_yes()  { local reply; read -r -p "$1 [Y/n] " reply; [[ -z "$reply" || "$reply" =~ ^[Yy] ]]; }
ask_no()   { local reply; read -r -p "$1 [y/N] " reply; [[ "$reply" =~ ^[Yy] ]]; }

OS="$(uname -s)"
is_mac()   { [[ "$OS" == "Darwin" ]]; }
is_linux() { [[ "$OS" == "Linux" ]]; }

require_brew() {
  if ! command -v brew >/dev/null 2>&1; then
    info "Homebrew not found — installing"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [[ -d /opt/homebrew/bin ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
    if [[ -d /usr/local/bin/brew ]]; then eval "$(/usr/local/bin/brew shellenv)"; fi
  else ok "Homebrew installed"; fi
}

ensure_pkg() {
  local cmd="$1" brew_pkg="${2:-$1}" apt_pkg="${3:-$1}"
  if command -v "$cmd" >/dev/null 2>&1; then
    ok "$cmd installed"
    return
  fi
  info "$cmd not found — installing"
  if is_mac; then brew install "$brew_pkg"
  elif is_linux && command -v apt-get >/dev/null 2>&1; then sudo apt-get update && sudo apt-get install -y "$apt_pkg"
  else fatal "Please install $cmd manually for your OS"; fi
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local v
    v="$(node -v | sed 's/v//' | cut -d. -f1)"
    if [[ "$v" -ge 22 ]]; then ok "Node $v installed"; return; fi
    warn "Node $v < 22 — upgrading"
  fi
  if is_mac; then brew install node@22 || brew upgrade node@22 || true
  elif is_linux; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else fatal "Install Node 22+ manually"; fi
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then ok "pnpm installed"; return; fi
  info "pnpm not found — installing via corepack"
  corepack enable
  corepack prepare pnpm@latest --activate
}

ensure_gh_auth() {
  if gh auth status >/dev/null 2>&1; then ok "gh authenticated"; return; fi
  info "Run 'gh auth login' to authenticate"
  gh auth login
}

bootstrap_repo() {
  local project_name="$1"
  if [[ -d "$project_name" ]]; then
    fatal "Directory '$project_name' already exists. Pick a different name."
  fi
  info "Creating new repo from template $TEMPLATE_REPO"
  if ! gh repo create "$project_name" --template "$TEMPLATE_REPO" --private --clone; then
    warn "Could not create via gh — falling back to git clone"
    git clone "https://github.com/$TEMPLATE_REPO.git" "$project_name"
    rm -rf "$project_name/.git"
    (cd "$project_name" && git init && git add . && git commit -m "Initial commit from skeleton-app" >/dev/null)
  fi
}

write_env() {
  local dir="$1" supabase_url="$2" supabase_key="$3"
  local target="$dir/.env.local"
  cp "$dir/.env.example" "$target"
  if [[ -n "$supabase_url" ]]; then
    sed -i.bak "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|" "$target"
    rm -f "$target.bak"
  fi
  if [[ -n "$supabase_key" ]]; then
    sed -i.bak "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key|" "$target"
    rm -f "$target.bak"
  fi
  ok ".env.local written"
}

main() {
  color "35" "
┌──────────────────────────────────────────────┐
│  skeleton-app bootstrap                      │
│  Next.js + Supabase + Claude Code ready      │
└──────────────────────────────────────────────┘
"

  if is_mac; then require_brew; fi
  ensure_pkg git
  ensure_pkg gh
  ensure_node
  ensure_pnpm
  ensure_gh_auth

  echo
  local project_name
  project_name="$(ask "Project name? [$DEFAULT_PROJECT_NAME]" "$DEFAULT_PROJECT_NAME")"

  bootstrap_repo "$project_name"
  cd "$project_name"

  info "Installing dependencies (pnpm install)"
  pnpm install --silent

  echo
  if ask_yes "Strip demo content (recommended for a fresh start)?"; then
    pnpm reset --yes
  else
    info "Skipped reset — you can run 'pnpm reset' later"
  fi

  echo
  color "35" "─── Supabase (optional) ───────────────────────"
  info "Supabase powers auth + database. You can skip and add later."
  info "Get keys from your Supabase project: Settings → API"

  local supabase_url="" supabase_key=""
  if ask_yes "Configure Supabase now?"; then
    supabase_url="$(ask "  NEXT_PUBLIC_SUPABASE_URL?" "")"
    supabase_key="$(ask "  NEXT_PUBLIC_SUPABASE_ANON_KEY?" "")"
  else
    warn "Skipping — the app still runs. Edit .env.local later to enable auth."
  fi

  write_env "." "$supabase_url" "$supabase_key"

  echo
  ok "Setup complete."
  info "Starting dev server at http://localhost:3000"
  pnpm dev
}

main "$@"
