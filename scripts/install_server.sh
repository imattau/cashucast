#!/usr/bin/env bash
# One-shot installer for Ubuntu 24.04 VPS
# Usage (as root):  curl -sL https://raw.githubusercontent.com/<your-org>/cashucast/main/scripts/install_server.sh | bash
set -e

APT_PKGS="docker.io docker-compose caddy ufw fail2ban git"
export DEBIAN_FRONTEND=noninteractive

echo "🔑  Installing base packages…"
apt-get update -y
apt-get install -y $APT_PKGS

systemctl enable --now docker

echo "🔒  Configuring UFW…"
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw --force enable

echo "📦  Cloning repo & starting stack…"
mkdir -p /opt
git clone https://github.com/<your-org>/cashucast /opt/cashucast
cd /opt/cashucast/infra/docker
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

echo "🌐  Reloading Caddy (auto-TLS)…"
cp /opt/cashucast/infra/docker/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

echo -e "\n🚀  CashuCast room + tracker live under HTTPS."
