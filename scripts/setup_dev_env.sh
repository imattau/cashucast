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

# ── Container engine ────────────────────────────────────────────
if command -v docker >/dev/null 2>&1; then
  if ! docker compose version >/dev/null 2>&1; then
    echo "⬇️  Installing Docker compose plugin…"
    sudo apt-get install -y docker-compose-plugin
  fi
elif command -v podman >/dev/null 2>&1; then
  if ! command -v podman-compose >/dev/null 2>&1; then
    echo "⬇️  Installing podman-compose…"
    sudo apt-get install -y podman-compose
  fi
else
  read -r -p "No container engine found. Install Podman or Docker? [podman/docker] (default: podman): " choice
  choice=${choice:-podman}
  if [[ "$choice" == "docker" ]]; then
    echo "⬇️  Installing Docker…"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    sudo apt-get install -y docker-compose-plugin
  else
    echo "⬇️  Installing Podman…"
    sudo apt-get install -y podman podman-compose
  fi
fi

# ── Install Node dependencies ─────────────────────────────────
echo "📦  Installing Node dependencies…"
pnpm install --frozen-lockfile

echo -e "\n✅  Development environment ready."
