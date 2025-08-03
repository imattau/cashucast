#!/usr/bin/env bash
# Run the Vitest suite with friendly output
set -e

echo "🧪  Running unit tests…"

pnpm test

echo -e "\n✅  Tests finished"
