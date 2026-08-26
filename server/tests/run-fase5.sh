#!/usr/bin/env bash
set -Eeuo pipefail
status=0
cleanup(){ status=$?; docker compose -f ../compose.yaml stop mongodb-test >/dev/null 2>&1 || true; exit "$status"; }
trap cleanup EXIT
docker compose -f ../compose.yaml up -d --wait mongodb-test
NODE_ENV=test JWT_SECRET='fase5-test-secret-only-01234567890123456789' MONGODB_URI=mongodb://127.0.0.1:27018/autopart_fase1_test node --test tests/fase5.test.js
node --test ../client/tests/fase5-client.test.js
