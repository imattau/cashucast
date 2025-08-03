#!/usr/bin/env bash
set -e

# ── Detect runtimes & health ───────────────────────────────────
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

docker_state=$(check_runtime docker)   # ok / broken / absent
podman_state=$(check_runtime podman)   # ok / broken / absent

choose_runtime() {
  # Both ok → prompt
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

# ── Compose alias ───────────────────────────────────────────────
if [[ $CTL == "docker" ]]; then
  COMPOSE="docker compose"
else
  # prefer 'podman compose' else fallback to podman-compose binary
  if $CTL compose version >/dev/null 2>&1; then
    COMPOSE="podman compose"
  else
    COMPOSE="podman-compose"
  fi
fi

echo "🔧  Using container runtime: $CTL"

# ── LAN IP helper ───────────────────────────────────────────────
LAN_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')

# ── Start services ─────────────────────────────────────────────
$COMPOSE -f infra/docker/docker-compose.dev.yml up -d
pnpm install --frozen-lockfile

echo
echo "🌐  Open in browser:"
echo "   • Local : http://localhost:5173"
echo "   • LAN   : http://$LAN_IP:5173"
echo
pnpm --filter apps/web dev -- --host 0.0.0.0
