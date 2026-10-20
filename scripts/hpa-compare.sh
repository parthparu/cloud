#!/usr/bin/env bash
# Runs the Phase 7 autoscaler comparison (PLAN.md §2.2, docs/evidence/05-autoscaling.md): the same
# k6 load test against the backend, once with a CPU-based HPA and once with a connection-count-
# based HPA, so the two can be watched side by side. Needs ./scripts/k8s-up.sh already run.
#
#   ./scripts/hpa-compare.sh cpu           apply the CPU-based HPA, run the load test
#   ./scripts/hpa-compare.sh connections   apply the connection-count-based HPA, run the load test
#
# Prints `kubectl get hpa`/`get pods` every 10s for ~2 minutes so the scaling decision (or lack of
# one) is visible as it happens, not just in the final summary. Deletes the HPA it applied when
# done, so the two modes don't fight each other if run back to back — leaves the backend at
# whatever replica count the HPA left it at; `kubectl apply -k k8s/overlays/local` resets that to
# the base 2 if you want a clean baseline before the next run.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NS=chatscale
MODE="${1:-}"

if [ "$MODE" != "cpu" ] && [ "$MODE" != "connections" ]; then
  echo "Usage: $0 cpu|connections"
  exit 1
fi

HPA_FILE="$ROOT/k8s/experiments/hpa-$MODE.yaml"
HPA_NAME="backend-hpa-$MODE"

cleanup() { kubectl -n "$NS" delete -f "$HPA_FILE" --ignore-not-found >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "==> Applying $HPA_FILE"
kubectl apply -f "$HPA_FILE"

echo "==> Starting k6 (PROFILE=local, ~1.5 min) in the background"
(cd "$ROOT" && k6 run loadtest/socketio-load.js > /tmp/hpa-compare-k6.log 2>&1) &
K6_PID=$!

echo "==> Watching $HPA_NAME for ~2 minutes (Ctrl-C to stop early)"
for i in $(seq 1 12); do
  echo "--- t+$((i*10))s ---"
  kubectl -n "$NS" get hpa "$HPA_NAME" --no-headers
  kubectl -n "$NS" get pods -l app=backend --no-headers | wc -l | xargs echo "backend pods:"
  sleep 10
done

wait "$K6_PID" || true
echo
echo "k6 summary: /tmp/hpa-compare-k6.log"
echo "Full result: kubectl -n $NS describe hpa $HPA_NAME"
