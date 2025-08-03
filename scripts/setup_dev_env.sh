#!/usr/bin/env bash
set -e

# ── OS check ───────────────────────────────────────────────────
if [[ "$(uname -s)" != "Linux" ]]; then
  echo "❌  This setup script only supports Linux."; exit 1
fi

# ── Node.js 20 ────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1 || [[ $(node -v) != v20.* ]]; then
  echo "⬇️  Installing Node.js 20…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# ── pnpm package manager ──────────────────────────────────────
if ! command -v pnpm >/dev/null 2>&1; then
  echo "⬇️  Installing pnpm…"
  sudo npm install -g pnpm
fi

# ── Docker + compose plugin ───────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  echo "⬇️  Installing Docker…"
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "⬇️  Installing Docker compose plugin…"
  sudo apt-get install -y docker-compose-plugin
fi

# ── Install Node dependencies ─────────────────────────────────
echo "📦  Installing Node dependencies…"
pnpm install --frozen-lockfile

echo -e "\n✅  Development environment ready."
