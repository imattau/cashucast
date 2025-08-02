#!/usr/bin/env bash
set -e

# ── Prerequisite checks ───────────────────────────────────────
for cmd in pnpm docker; do
  command -v "$cmd" >/dev/null || {
    echo "❌  $cmd not found. Install it first."; exit 1; }
done

# ── Local side-car stack (room, tracker, regtest mint) ────────
docker compose -f infra/docker/docker-compose.dev.yml up -d

# ── Node dependencies ─────────────────────────────────────────
pnpm install --frozen-lockfile

# ── Run the web app with hot reload ───────────────────────────
pnpm --filter apps/web dev
