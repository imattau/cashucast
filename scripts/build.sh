#!/usr/bin/env bash
set -e

echo "🏗  Building CashuCast for production…"

# Clean old artifacts
rm -rf apps/web/dist

# Build workers first, then the React shell
pnpm turbo run build --filter="worker-*"
pnpm --filter apps/web build

echo -e "\n✅  Build complete →  apps/web/dist"
