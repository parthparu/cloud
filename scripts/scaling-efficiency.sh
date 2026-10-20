#!/usr/bin/env bash
# PLAN.md Phase 6's scaling-efficiency curve: identical fixed load against the backend pinned at
# 1, then 2, then 4 pods (HPA off — delete any active HPA first), to see whether throughput/
# latency actually improves as pods are added, against a 1-pod control.
#
#   ./scripts/scaling-efficiency.sh              # FIXED_VUS=100, FIXED_DURATION=90s (defaults)
#   FIXED_VUS=150 ./scripts/scaling-efficiency.sh
#
# PLAN.md calls for n=3 runs per configuration with a discarded 2-minute warm-up; this runs n=1
# per configuration (one 90s run) to keep total experiment time reasonable on a laptop — a real
# simplification from the full methodology, stated plainly in docs/evidence/06-scaling-efficiency.md
# rather than silently assumed away.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NS=chatscale
FIXED_VUS="${FIXED_VUS:-100}"
FIXED_DURATION="${FIXED_DURATION:-90s}"
OUT_DIR="${OUT_DIR:-/tmp/scaling-efficiency}"

mkdir -p "$OUT_DIR"
kubectl -n "$NS" delete hpa --all --ignore-not-found >/dev/null 2>&1 || true

for REPLICAS in 1 2 4; do
  echo "==> Scaling backend to $REPLICAS pod(s)"
  kubectl -n "$NS" scale deployment/backend --replicas="$REPLICAS"
  kubectl -n "$NS" rollout status deployment/backend --timeout=60s

  echo "==> Running k6 (FIXED_VUS=$FIXED_VUS, FIXED_DURATION=$FIXED_DURATION) against $REPLICAS pod(s)"
  LOG="$OUT_DIR/${REPLICAS}pod.log"
  (cd "$ROOT" && k6 run -e PROFILE=fixed -e FIXED_VUS="$FIXED_VUS" -e FIXED_DURATION="$FIXED_DURATION" loadtest/socketio-load.js > "$LOG" 2>&1)
  echo "    saved: $LOG"
  echo
done

echo "==> Restoring backend to 2 pods (the base manifest's replica count)"
kubectl apply -k "$ROOT/k8s/overlays/local" >/dev/null

echo
echo "------------------------------------------------------------"
echo "Done. Summaries in $OUT_DIR/{1,2,4}pod.log"
echo "Pull out the numbers that matter:"
echo "  grep -A2 'message_ack_latency' $OUT_DIR/*pod.log"
echo "  grep 'chat_messages_acked'     $OUT_DIR/*pod.log"
echo "------------------------------------------------------------"
