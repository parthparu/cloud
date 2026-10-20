#!/usr/bin/env bash
# Opens Grafana and Prometheus on this machine via `kubectl port-forward` — neither is behind the
# Ingress, so this is the only way to reach them. Runs in the foreground; Ctrl-C closes both.
#
#   Grafana:    http://localhost:3001  (anonymous viewer access, no login needed)
#   Prometheus: http://localhost:9090  (raw query UI — useful for checking scrape targets:
#                                        Status -> Targets)
set -euo pipefail
NS=chatscale

cleanup() { kill "${GRAFANA_PID:-}" "${PROM_PID:-}" 2>/dev/null || true; }
trap cleanup EXIT

kubectl -n "$NS" port-forward svc/grafana 3001:3000 &
GRAFANA_PID=$!
kubectl -n "$NS" port-forward svc/prometheus 9090:9090 &
PROM_PID=$!

echo "Grafana:    http://localhost:3001"
echo "Prometheus: http://localhost:9090"
echo "Ctrl-C to stop."
wait
