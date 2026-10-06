#!/usr/bin/env bash
# Kills one backend pod on the local k3d cluster and checks that Kubernetes replaces it and that
# its users reconnect to the surviving pod — see backend/tests/failover.k8s.js for the detail.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
BASE="${BASE:-http://localhost:8080}" node tests/failover.k8s.js
