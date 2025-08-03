#!/usr/bin/env bash
set -e

# ── Prerequisite checks ───────────────────────────────────────
command -v pnpm >/dev/null || {
  echo "❌  pnpm not found. Install it first."; exit 1; }

if command -v podman >/dev/null; then
  RUNTIME=podman
elif command -v docker >/dev/null; then
  RUNTIME=docker
else
  echo "❌  Neither podman nor docker found. Install one first."
  exit 1
fi

# ── Local side-car stack (room, tracker, regtest mint) ────────
${RUNTIME} compose -f infra/docker/docker-compose.dev.yml up -d

# ── Node dependencies ─────────────────────────────────────────
pnpm install --frozen-lockfile

# ── Run the web app with hot reload ───────────────────────────
pnpm --filter apps/web dev
