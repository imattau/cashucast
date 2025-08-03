#!/usr/bin/env bash
set -e

# ── Prerequisite checks ───────────────────────────────────────
command -v pnpm >/dev/null || {
  echo "❌  pnpm not found. Install it first."; exit 1; }

# ── Detect runtimes & health ──────────────────────────────────
check_runtime() {
  local bin=$1
  if ! command -v $bin >/dev/null 2>&1; then
    echo "absent"
    return
  fi
  if $bin info >/dev/null 2>&1; then
    echo "ok"
  else
    echo "broken"
  fi
}

docker_state=$(check_runtime docker)
podman_state=$(check_runtime podman)

choose_runtime() {
  read -n1 -r -p "Both Docker and Podman detected. Use (d)ocker or (p)odman? [d]: " choice
  echo
  case "$choice" in
    p|P) echo podman ;;
    *)   echo docker ;;
  esac
}

if [[ $docker_state == "ok" && $podman_state != "ok" ]]; then
  CTL=docker
elif [[ $podman_state == "ok" && $docker_state != "ok" ]]; then
  CTL=podman
elif [[ $docker_state == "ok" && $podman_state == "ok" ]]; then
  CTL=$(choose_runtime)
else
  echo "❌  No working Docker or Podman found." >&2
  exit 1
fi

# ── Compose alias ─────────────────────────────────────────────
if [[ $CTL == "docker" ]]; then
  if $CTL compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
  else
    echo "❌  Docker Compose not found." >&2
    exit 1
  fi
else
  if $CTL compose version >/dev/null 2>&1; then
    COMPOSE="podman compose"
  elif command -v podman-compose >/dev/null 2>&1; then
    COMPOSE="podman-compose"
  else
    echo "❌  Podman Compose not found." >&2
    exit 1
  fi
fi

echo "🔧  Using container runtime: $CTL"

# ── Local side-car stack (room, tracker, regtest mint) ────────
# Some runtimes (across Docker and Podman variants) handle compose
# file flags differently. Setting the COMPOSE_FILE environment
# variable keeps the command compatible across implementations.
COMPOSE_FILE=infra/docker/docker-compose.dev.yml $COMPOSE up -d

# ── Node dependencies ─────────────────────────────────────────
pnpm install --frozen-lockfile

# ── Run the web app with hot reload ───────────────────────────
pnpm --filter apps/web dev
