# Evidence 04 — The same experiment on real Kubernetes (k3d)

**Date:** 2026-10-03 · **Setup:** local k3d cluster (1 server + 2 agent nodes), Traefik ingress,
in-cluster PostgreSQL and Valkey · **Result:** the break and the fix both reproduce unchanged;
Kubernetes' self-healing measured directly

## Why this matters

Everything up to this point (Evidence 01–03) ran as plain processes or Docker Compose containers,
where *we* decided how many copies existed and *we* restarted one if it died. Kubernetes is the
layer that does that automatically — the same layer every managed cloud (AKS, GKE, EKS) is built
on. This evidence shows the experiment holds on the real thing, not just an approximation of it.

## Setup

```bash
brew install k3d kubectl
./scripts/k8s-up.sh
```

One k3d cluster, Kubernetes manifests in `k8s/` (`base/` + a `local` overlay via Kustomize — the
same base will grow an `azure`/cloud overlay in Phase 5, per PLAN.md). Two backend pods, one
frontend pod (nginx + the built React app) behind a Traefik Ingress at **http://localhost:8080**,
Redis (Valkey) and a throwaway in-cluster PostgreSQL. Each pod's own hostname (assigned by
Kubernetes) is used directly as its "which copy served you" id — no `INSTANCE_NAME` needed, unlike
the laptop and Docker Compose setups.

## 1. Both suites pass through the Ingress, on real pods

```
=== core.test.js ===            PASS bob receives it live, with sentAt
=== cross-copy.test.js ===      PASS alice and bob are on different copies  (two real backend pods)
                                 PASS bob receives alice's message live  latency 2 ms
                                 PASS friend request notification crosses copies
=== invitations.test.js ===     (17/17)
=== two-factor.test.js ===      (24/24)
4/4 suites passed — repeated twice more after the chaos test below, still 4/4
```

## 2. The failure reproduces on real pods

`REDIS_URL` was overridden to empty on the `backend` Deployment (`kubectl set env
deployment/backend REDIS_URL=`) — Kubernetes did a normal rolling update, two fresh pods came up
with the in-memory adapter:

```
[realtime] adapter: in-memory — this copy only reaches its own users
```

```
PASS alice and bob are on different copies
PASS bob does NOT receive alice's message (isolated copies)
PASS friend request notification does NOT cross copies
```

Same result as Evidence 01, now on Kubernetes-scheduled pods instead of two `node server.js`
processes. Restoring Redis (`kubectl set env deployment/backend REDIS_URL-`, another rolling
update) brought the fix back; retested clean.

## 3. Chaos test: deleting a pod (`backend/tests/failover.k8s.js`)

10 users connected through the Ingress; Kubernetes' own Service load-balancing put 7 on one pod, 3
on the other. The pod with more users was deleted outright (`kubectl delete pod`) — a harder test
than Evidence 03's graceful `stop`, since there's no SIGTERM warning built into the test itself
(Kubernetes still sends one, via `terminationGracePeriodSeconds` and the Deployment's `preStop`
hook).

| | Result |
|---|---|
| Kubernetes scheduled a replacement pod | **7 s** |
| Users on the *untouched* pod affected | **0** |
| Users of the deleted pod reconnected | **7/7**, all to the surviving pod |
| Time without a connection | **0.6–1.4 s** |
| Deployment back to 2/2 ready | **16.3 s** total |

```bash
./scripts/k8s-chaos.sh
```

**Faster than Docker Compose's failover** (Evidence 03: 3.7–5.5 s). There, nginx had to notice a
*silent* stopped container via a connect-timeout (`proxy_connect_timeout 2s`, itself a fix for a
defect found during that testing). Kubernetes' Service removes a terminating pod from its routing
targets directly — no timeout needed — so recovery is close to instant from the client's point of
view, and a Service address never needs the Docker-DNS workaround nginx's config required for
Compose (see `k8s/base/frontend-nginx-configmap.yaml`, noticeably simpler than
`frontend/nginx/default.conf`).

## What this demonstrates for the thesis

1. The core result (scaling breaks live delivery; Redis fixes it) is **substrate-independent** —
   true on a laptop, in Docker Compose, and on Kubernetes, with zero code changes between them.
2. Kubernetes' job — replace a dead pod, keep routing only to pods that are up — works as
   advertised, and is measurably better at it than the hand-rolled Docker Compose setup.
3. This is the same mechanism (Deployments, Services, readiness probes) that PLAN.md Phase 5 will
   run on a managed cloud Kubernetes; nothing here needs to change to get there except the overlay.

## Known limitations of this setup

- Single laptop: all "nodes" are containers sharing one Docker daemon, so this cannot show a whole
  **machine** or **zone** failing (PLAN.md Phase 8) — that needs real cloud, Phase 5.
- No autoscaling yet (HPA / Cluster Autoscaler) — Phase 4/7.
- The in-cluster PostgreSQL is throwaway, for this cluster's lifetime only — intentional, so this
  never touches Supabase (see `tests-never-touch-supabase` project rule).
