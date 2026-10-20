#!/usr/bin/env bash
# Brings up a local Kubernetes cluster (k3d) running the whole system — the same containers as
# docker compose, now managed by real Kubernetes: Deployments, a Service load-balancing between
# backend pods, readiness/liveness probes, and an Ingress exposing it at one address.
#
#   ./scripts/k8s-up.sh            cluster up, images built, app deployed, Redis on (the fix)
#   REDIS_OFF=1 ./scripts/k8s-up.sh   same, but without Redis — the original failure, on real pods
#
# Needs: Docker running, k3d, kubectl (brew install k3d kubectl).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLUSTER=chatscale
NS=chatscale

if ! docker info >/dev/null 2>&1; then
  echo "Docker isn't running. Open Docker Desktop and try again."
  exit 1
fi

echo "==> Building images"
docker build -t chatscale-backend:local "$ROOT/backend" >/dev/null
docker build -t chatscale-web:local "$ROOT/frontend" >/dev/null

if ! k3d cluster get "$CLUSTER" >/dev/null 2>&1; then
  echo "==> Creating k3d cluster '$CLUSTER' (1 server + 2 agents, port 8080 -> ingress)"
  k3d cluster create "$CLUSTER" \
    --servers 1 --agents 2 \
    -p "8080:80@loadbalancer"
else
  echo "==> Cluster '$CLUSTER' already exists, reusing it"
fi

echo "==> Importing images into the cluster (k3d nodes don't share the host's Docker images)"
k3d image import chatscale-backend:local chatscale-web:local -c "$CLUSTER"

SECRET_FILE="$ROOT/k8s/overlays/local/secret.env"
if [ ! -f "$SECRET_FILE" ]; then
  echo "==> Generating a one-off secret.env for this cluster (not committed to git)"
  {
    echo "JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))')"
    echo "TWO_FACTOR_KEY=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  } > "$SECRET_FILE"
fi

echo "==> Applying manifests (kustomize overlay: local)"
kubectl apply -k "$ROOT/k8s/overlays/local"
# One RoleBinding has to live in kube-system (that's where the Role it binds to exists) and so
# can't go through the namespace-forcing kustomization above — see its own file for why.
kubectl apply -f "$ROOT/k8s/base/prometheus-adapter-kube-system-rbac.yaml"

# REDIS_URL normally comes from the backend-config ConfigMap (envFrom). An explicit env: entry
# on the Deployment overrides envFrom for the same name, so that's how we flip modes without
# editing the ConfigMap. "REDIS_URL-" only removes an existing *explicit* entry — it's a no-op
# the first time, which is why the fixed branch always sets one too (idempotent either way).
if [ "${REDIS_OFF:-}" = "1" ]; then
  echo "==> REDIS_OFF=1: overriding REDIS_URL to empty so pods don't share live events (the original bug)"
  kubectl -n "$NS" set env deployment/backend REDIS_URL=
else
  kubectl -n "$NS" set env deployment/backend REDIS_URL- >/dev/null 2>&1 || true
fi

echo "==> Waiting for everything to be ready..."
echo "    (first run on a fresh cluster: postgres/redis/local-path-provisioner images are pulled"
echo "    fresh inside the cluster — not from this Mac's Docker cache — which can take a few"
echo "    minutes on a slow or restricted network. Later runs reuse the cluster and are quick.)"
set +e
kubectl -n "$NS" rollout status deployment/postgres --timeout=240s
pg_status=$?
kubectl -n "$NS" rollout status deployment/redis --timeout=120s
redis_status=$?
kubectl -n "$NS" rollout status deployment/backend --timeout=180s
backend_status=$?
kubectl -n "$NS" rollout status deployment/frontend --timeout=120s
frontend_status=$?
# Prometheus/Grafana images are large and this network sometimes stalls mid-pull (see hard rule 5
# in docs/STATUS.md) — give them a generous timeout but don't fail k8s-up.sh over a dashboard.
kubectl -n "$NS" rollout status deployment/prometheus --timeout=240s
prometheus_status=$?
kubectl -n "$NS" rollout status deployment/grafana --timeout=240s
grafana_status=$?
kubectl -n "$NS" rollout status deployment/prometheus-adapter --timeout=240s
adapter_status=$?
set -e
if [ "$prometheus_status" != 0 ] || [ "$grafana_status" != 0 ] || [ "$adapter_status" != 0 ]; then
  echo
  echo "Prometheus/Grafana/prometheus-adapter are not ready yet (the app itself is fine). If this"
  echo "is a fresh cluster, the images are probably still pulling: 'kubectl -n $NS get pods' to"
  echo "check, or nudge a slow pull along with 'docker exec <node> crictl pull <image>' on the"
  echo "specific k3d node."
fi
if [ "$pg_status" != 0 ] || [ "$redis_status" != 0 ] || [ "$backend_status" != 0 ] || [ "$frontend_status" != 0 ]; then
  echo
  echo "NOT READY after the wait above. This almost always means an image is still being pulled"
  echo "inside the cluster. Check progress and nudge it along:"
  echo "    kubectl -n $NS get pods"
  echo "    kubectl -n $NS describe pod <name>        (look for 'Pulling image' in Events)"
  echo "  then re-run this script — it reuses the existing cluster and picks up where it left off."
  exit 1
fi

echo
echo "------------------------------------------------------------"
echo "Ready.  http://localhost:8080"
if [ "${REDIS_OFF:-}" = "1" ]; then
  echo "Mode: BROKEN (no Redis) — open two browser tabs, send a message, refresh to see it 'arrive'"
else
  echo "Mode: FIXED (Redis on)"
fi
echo "Pods:"
kubectl -n "$NS" get pods -l app=backend -o wide
echo
echo "Try:  kubectl -n chatscale get pods -w"
echo "      kubectl -n chatscale delete pod <name>        (kill one, watch it get replaced)"
echo "      ./scripts/k8s-dashboards.sh                   (Grafana + Prometheus, localhost:3001/:9090)"
echo "      ./scripts/hpa-compare.sh cpu|connections      (autoscaler comparison, docs/evidence/05)"
echo "      ./scripts/k8s-down.sh                         (tear the cluster down)"
echo "------------------------------------------------------------"
