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

# ── Pre-flight daemon check ───────────────────────────────────
if ! $CTL info >/dev/null 2>&1 && ! $COMPOSE version >/dev/null 2>&1; then
  echo "❌  $CTL daemon is unavailable. Is it running?" >&2
  exit 1
fi

# ── Local side-car stack (room, tracker, regtest mint) ────────
# Some compose implementations only support either the short `-f` flag or
# the long `--file` flag when selecting the compose file. Inspect the help
# output of `config` to determine which one is available without contacting
# the daemon.
COMPOSE_FILE=infra/docker/docker-compose.dev.yml
help_output=$($COMPOSE config --help 2>&1) || {
  echo "$help_output" >&2
  echo "❌  Unable to run '$COMPOSE config --help'." >&2
  exit 1
}
if echo "$help_output" | grep -q -- '--file'; then
  COMPOSE_FILE_FLAG="--file"
elif echo "$help_output" | grep -qE '[[:space:]]-f[ ,]'; then
  COMPOSE_FILE_FLAG="-f"
else
  COMPOSE_FILE_FLAG="-f"
fi

$COMPOSE $COMPOSE_FILE_FLAG "$COMPOSE_FILE" up -d

# ── Node dependencies ─────────────────────────────────────────
pnpm install --frozen-lockfile

# ── Run the web app with hot reload ───────────────────────────
pnpm --filter apps/web dev
