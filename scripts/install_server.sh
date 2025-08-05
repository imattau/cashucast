#!/usr/bin/env bash
# One-shot installer for Ubuntu 24.04 VPS
# Usage (as root):  curl -sL https://raw.githubusercontent.com/<your-org>/cashucast/main/scripts/install_server.sh | bash
set -e

: "${SSB_APP_KEY:?SSB_APP_KEY environment variable must be set}"

CONTAINER_RUNTIME=${CONTAINER_RUNTIME:-$(command -v podman >/dev/null 2>&1 && echo podman || echo docker)}

BASE_PKGS="caddy ufw fail2ban git"
if [ "$CONTAINER_RUNTIME" = "podman" ]; then
  APT_PKGS="podman podman-compose $BASE_PKGS"
  COMPOSE_CMD="podman compose"
  SERVICE="podman"
else
  APT_PKGS="docker.io docker-compose $BASE_PKGS"
  COMPOSE_CMD="docker compose"
  SERVICE="docker"
fi

export DEBIAN_FRONTEND=noninteractive

echo "🔑  Installing base packages…"
apt-get update -y
apt-get install -y $APT_PKGS

systemctl enable --now $SERVICE

echo "🔒  Configuring UFW…"
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw --force enable

echo "📦  Cloning repo & starting stack…"
mkdir -p /opt
git clone https://github.com/<your-org>/cashucast /opt/cashucast
cd /opt/cashucast/infra/docker
$COMPOSE_CMD -f docker-compose.prod.yml pull
$COMPOSE_CMD -f docker-compose.prod.yml up -d

echo "🌐  Reloading Caddy (auto-TLS)…"
cp /opt/cashucast/infra/docker/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

echo -e "\n🚀  CashuCast room + tracker live under HTTPS."
