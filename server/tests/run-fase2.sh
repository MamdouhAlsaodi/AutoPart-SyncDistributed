#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$SCRIPT_DIR/.."

cleanup() {
  local status=$?
  docker compose -f ../compose.yaml stop mongodb-test || true
  exit "$status"
}
trap cleanup EXIT

docker compose -f ../compose.yaml up -d --wait mongodb-test
NODE_ENV=test JWT_SECRET='fase2-test-secret-only-01234567890123456789' MONGODB_URI=mongodb://127.0.0.1:27018/autopart_fase1_test node --test tests/fase2.test.js
node --test ../client/tests/fase2-static.test.js
