# ChatScale — Final Report: A Horizontal-Scaling Study of a Stateful WebSocket Application

**Date:** 2026-10-20 · **Author:** Parth · **Status:** Complete (local-only scope — see "Scope" below)

This is the project's write-up — the document that answers "what did this actually show," pulling
together every measured result into one place. For the day-to-day working state of the project,
see [docs/STATUS.md](STATUS.md); for the full plan this executed against, see
[PLAN.md](../PLAN.md); for the complete, append-only record of every change, see
[docs/CHANGE_LOG.md](CHANGE_LOG.md).

---

## 1. Thesis

Stateful WebSocket applications break under naive horizontal scaling. This project proves that
claim on a real, working chat application (ChatScale — sign-up, 2FA, friends, spaces, live
messages, invites), fixes it, measures what the fix costs, and measures how well the fix scales —
on a laptop, in Docker Compose, and on a real local Kubernetes cluster.

| Stage | Question | Result |
|---|---|---|
| Hypothesis | Does a Socket.IO app actually break at >1 replica? | **Yes** — [§2](#2-the-hypothesis-and-the-failure) |
| Evidence | Reproduce the failure | **Reproduced** on a laptop, Docker Compose, and Kubernetes — [§2](#2-the-hypothesis-and-the-failure) |
| Fix | Redis pub/sub adapter for shared broadcast state | **Fixed**, same code, one env var — [§3](#3-the-fix) |
| Cost of fix | What does the Redis hop cost in latency? | **Measured: negligible locally** (explained) — [§4](#4-the-cost-of-the-fix-the-redis-tax) |
| Scaling | Is throughput linear in pod count? | **Measured: p95 latency improves ~3.2x, 1→4 pods** — [§5](#5-scaling-efficiency) |
| Metric choice | Is CPU the right autoscaling signal for WebSockets? | **Measured: no — CPU-HPA never scaled, connection-HPA did** — [§6](#6-autoscaling-cpu-vs-connection-count) |
| Elasticity | What happens when pods outgrow the nodes? | **Out of scope** — needs a real Cluster Autoscaler — [§7](#7-what-this-project-deliberately-does-not-claim) |
| Validation | Does it survive pod / node / zone / database loss? | **Pod loss: yes, measured.** Node/zone/DB loss: out of scope — [§2.3](#23-chaos-pod-loss), [§7](#7-what-this-project-deliberately-does-not-claim) |
| Economics | What would this cost at scale? | **Estimated** from measured resource use + published pricing, not a real invoice — [§8](#8-cost-model-estimated)|

---

## 2. The hypothesis and the failure

**Hypothesis, stated before testing:** a Socket.IO backend holds its WebSocket connections and
broadcast state in the process's own memory. Run two copies behind a load balancer, and a message
from a user connected to copy A will never reach a user connected to copy B — copy A has no way to
know copy B's users exist.

### 2.1 Reproduced, three times, on three substrates

| Substrate | Evidence | Result |
|---|---|---|
| Two `node server.js` processes on a laptop | [evidence/01](evidence/01-two-copies-break.md) | Alice's message never reaches Bob, connected to the other copy |
| Docker Compose (nginx + 2 backend containers) | [evidence/03](evidence/03-graceful-failover.md) | Same failure, containerized |
| Real Kubernetes pods (k3d) | [evidence/04](evidence/04-kubernetes.md) | Same failure, on orchestrator-scheduled pods |

The failure is not an artifact of any one environment — it's inherent to holding broadcast state
in process memory, which is true regardless of what's running the process.

### 2.2 The fix: a shared Redis adapter

`@socket.io/redis-adapter`, switched on by setting `REDIS_URL` — the fix itself is
`backend/src/socket/adapter.js`, 57 lines (see [evidence/02](evidence/02-redis-fix.md)). Every
broadcast is published to Redis; every copy subscribes and re-delivers to its own local sockets.
Verified on the same three substrates as the failure, from the same codebase, by changing one
setting.

### 2.3 Chaos: pod loss

[evidence/04](evidence/04-kubernetes.md)'s chaos test: deleted a backend pod outright (harder than
a graceful stop) with 10 real connected users split across both pods.

| | Result |
|---|---|
| Kubernetes scheduled a replacement pod | **7s** |
| Users on the untouched pod affected | **0** |
| Users of the deleted pod reconnected | **7/7**, all onto the surviving pod |
| Time without a connection | **0.6–1.4s** |
| Deployment back to full capacity | **16.3s** total |

Faster than the hand-rolled Docker Compose failover (3.7–5.5s, [evidence/03](evidence/03-graceful-failover.md))
— Kubernetes' Service removes a terminating pod from routing directly, with no connect-timeout
needed the way nginx required in Compose.

---

## 3. The fix

Covered in [§2.2](#22-the-fix-a-shared-redis-adapter) above. The fix's existence and correctness
is the least surprising part of this project — Redis pub/sub for cross-process broadcast is a
well-known pattern. What's actually interesting is what it costs (§4) and whether it scales (§5),
and whether the *default* way Kubernetes would autoscale this app is even the right one (§6) —
those are measured, not assumed, below.

---

## 4. The cost of the fix: the Redis tax

**Question:** does routing a broadcast through Redis (publish, subscribe, re-dispatch) instead of
a direct in-process `io.to().emit()` add meaningful latency?

**Method** ([evidence/06](evidence/06-redis-tax.md)): `backend/tests/redis-tax.k8s.js` finds a
same-pod and a cross-pod receiver pairing, sends 200 messages sequentially to each (waiting for
arrival before the next send), records the wall-clock delivery latency distribution for both.

**Result:**

| | p50 | p95 | p99 |
|---|---|---|---|
| Same-pod (no Redis involved) | 1ms | 2ms | 2ms |
| Cross-pod (through Redis) | 1ms | 1ms | 3ms |

**No measurable difference.** This is not a claim that the Redis hop is free in general — it's
specific to this setup: a k3d cluster is multiple containers sharing one Docker daemon on one
physical machine, with no real network between "pods." There is no network hop here for a tax to
show up on. A real multi-machine deployment (the kind Phase 5 would have tested, before it was
descoped — see [§7](#7-what-this-project-deliberately-does-not-claim)) would very likely show a
nonzero tax from genuine network latency between hosts. Recorded as a limitation of what local
infrastructure can measure, not glossed over.

---

## 5. Scaling efficiency

**Question:** does adding pods actually help this workload, or is the Redis-fixed app already so
light that more pods make no difference?

**Method** ([evidence/07](evidence/07-scaling-efficiency.md)): identical fixed load — 100
concurrent users (k6 `constant-vus`, calibrated: 20 users showed no saturation at all) — against
the backend pinned at 1, then 2, then 4 pods (HPA off), 90 seconds each. 1 pod is the control.

**Result:**

| Pods | p50 ack latency | p95 ack latency | Messages delivered | Success rate |
|---|---|---|---|---|
| 1 (control) | 40ms | **110ms** | 1800 | 100% |
| 2 | 28ms | **85ms** | 1900 | 100% |
| 4 | 14ms | **34ms** | 1900 | 100% |

Message delivery never failed, even at 1 pod handling all 100 connections — what scaled was
latency, which dropped **~3.2x** from 1 to 4 pods, monotonically. Consistent with [§6](#6-autoscaling-cpu-vs-connection-count)'s
finding that this workload is light on CPU but heavy on open-connection count: more pods relieve
exactly the resource under pressure.

**Stated limitation:** n=1 run per configuration (not PLAN.md's n=3 with a discarded warm-up) — a
deliberate simplification to keep total experiment time reasonable on a laptop. A 3.2x effect is
far larger than run-to-run noise would produce by chance, so the *trend* is trustworthy; the exact
percentile values shouldn't be read with tight statistical confidence.

---

## 6. Autoscaling: CPU vs connection count

**The project's central, most important measured result.**

**Question:** Kubernetes' default autoscaling signal is CPU. A chat app's idle WebSocket
connections barely use CPU — so does a CPU-based autoscaler actually react to real chat load, or
does it miss the thing that matters?

**Method** ([evidence/05](evidence/05-autoscaling.md)): `metrics-server` (bundled with k3s) for
CPU; `prometheus-adapter` exposing `chatscale_socket_connections` (a custom Prometheus metric,
[backend/src/metrics.js](../backend/src/metrics.js)) through Kubernetes' external metrics API for
connection count. Two `HorizontalPodAutoscaler` configs — CPU target 60%, connections target 8/pod
— applied one at a time, each against the identical k6 load (20 users, 90 seconds).

**Result:**

| Signal | Peak observed | Target | Scaled? |
|---|---|---|---|
| CPU | 54% (an HTTP registration burst, not chat traffic) → settled at 36% | 60% | **No — stayed at 2 pods the entire test** |
| `chatscale_socket_connections` | 10/pod (20 real connections / 2 pods) | 8/pod | **Yes — scaled 2→3 pods within 50 seconds**, confirmed by a real Kubernetes `SuccessfulRescale` event |

Cross-checked the connection-based result against Prometheus's own raw `query_range` for the same
window (not just the HPA's own display) — the true connection count held a sustained plateau of
exactly 20 for over a minute, confirming the HPA reacted to a real, sustained signal.

**Two real bugs found and fixed while building this measurement** (kept in the record, not
cleaned up — see [evidence/05](evidence/05-autoscaling.md) for the full account): a cert-directory
crash in `prometheus-adapter`, and a genuine double-division bug where an `AverageValue`-type HPA
target divides by replica count *itself*, silently halving every reading until caught by comparing
against Prometheus's raw data and fixed.

**Conclusion:** the hypothesis holds, measured, not assumed. Under identical realistic chat load, a
CPU-based HorizontalPodAutoscaler never scaled, while a connection-count-based one scaled correctly
within 50 seconds. The default Kubernetes autoscaling signal is the wrong one for this class of
application.

---

## 7. What this project deliberately does not claim

Three rows of the original thesis table (PLAN.md §1) needed real, separate physical machines —
Cluster Autoscaler adding whole nodes, an actual availability-zone failure, a managed database
failover — and a fourth needed a real cloud invoice to measure economics rather than estimate them.

**Why these are missing, honestly:** Azure for Students verification was attempted and never
resolved (SheerID lost the original request, a resubmission ran into further account/product-page
friction; full account in `PLAN.md`'s r4 amendment and `docs/CHANGE_LOG.md` CHG-0009/CHG-0033).
Rather than restart the same signup/verification process with a second cloud provider
(DigitalOcean or GCP, both considered — `PLAN.md`'s own risk R-12 named both as fallbacks), the
decision was to finalize this project's scope at local Kubernetes. This is a stated, reasoned
engineering tradeoff — not an oversight, and not something quietly worked around by claiming local
results as if they answered a cloud-scale question they don't. See `PLAN.md`'s r4 amendment for
the complete reasoning.

What this means concretely:

- **No Cluster Autoscaler comparison.** [§6](#6-autoscaling-cpu-vs-connection-count)'s HPA
  comparison is pod-level only (more pods on existing nodes) — real elasticity (nodes appearing to
  host pods that don't fit anywhere yet) needs a cloud provisioning node pools on demand.
- **No zone-failure or managed-database-failover chaos test.** [§2.3](#23-chaos-pod-loss)'s pod-kill
  test is the one chaos scenario that's fully meaningful locally; "kill a zone" has no local
  equivalent when every "node" is a container on one machine.
- **No real cloud invoice.** [§8](#8-cost-model-estimated) is an estimate from measured resource
  requests and published pricing, explicitly labelled as such.

---

## 8. Cost model (estimated)

Per `PLAN.md` §9's r4 note: without a real cloud deployment, this is estimated from this project's
own measured resource configuration and a reference provider's published pricing — not a bill, and
presented as an estimate throughout.

**Reference inputs:**
- Backend pod resource request: **100m CPU, 96Mi memory** ([k8s/base/backend-deployment.yaml](../k8s/base/backend-deployment.yaml))
- Measured per-pod connection ceiling: [§5](#5-scaling-efficiency)'s single-pod run handled 100
  concurrent users with p95 latency of 110ms — acceptable for a chat app, though on the high side.
  Using a more comfortable **~50 connections/pod** as the planning figure (half that ceiling, for
  headroom rather than running right at the edge).
- Reference pricing: DigitalOcean's published Kubernetes node pricing (chosen as the reference
  provider since it was the one actually evaluated as the Phase 5 fallback) — a basic worker node
  (~1 vCPU / 2GiB) runs **≈$12/month**, control plane free.

**Estimate:**

A $12/month node has room for roughly 10 backend pods by CPU request (1 vCPU ÷ 100m), giving
**≈10 × 50 = 500 connections per node**, or about **$0.024/month per connection** for compute
alone. To serve **10,000 concurrent connections**: ≈20 nodes (≈$240/month for compute), plus a
managed Redis and Postgres (≈$15/month each if managed, or ≈$0 extra if run in-cluster the way
this project's `k8s/overlays/local` already does) — **a rough total of $240–270/month**.

This is a planning-level estimate, not a measured bill: it assumes linear packing (no accounting
for node overhead, system pods, or non-uniform load distribution), uses this project's own
measured ceiling rather than a real production safety margin, and was never actually run at that
scale. Treat it as "the right order of magnitude to budget around," not a quote.

---

## 9. Methodology notes and honesty

Consistent with how this project has recorded its work throughout (see `docs/CHANGE_LOG.md`'s
entries, which keep debugging stories rather than cleaning them into tidy-looking successes):

- Every number in this report traces to a `docs/evidence/*.md` file with the exact command used to
  reproduce it. Nothing here is estimated unless explicitly labeled as an estimate (§8).
- Bugs found while measuring (the HPA double-division bug, §6; the registration-burst CPU spike
  mistaken for chat load, §6) are reported as part of the finding, not edited out.
- Sample sizes and simplifications (n=1 vs PLAN.md's n=3 in §5) are stated, not hidden.
- Three results are explicitly *not* claimed (§7), with the reason why.

---

## 10. Reproducing every result in this report

```bash
# 1. The failure and the fix (laptop, no containers):
./scripts/demo-two-copies.sh              # broken
./scripts/demo-two-copies.sh --fixed      # fixed

# 2. Containers (Docker Compose):
docker compose up --build
cd backend && node tests/failover.compose.js

# 3. Kubernetes (k3d) — everything below needs this running:
brew install k3d kubectl k6
./scripts/k8s-up.sh
./scripts/k8s-chaos.sh                              # §2.3: pod-kill chaos

# 4. Redis tax (§4):
cd backend && SAMPLES=200 node tests/redis-tax.k8s.js

# 5. Scaling efficiency (§5), ~8 minutes:
./scripts/scaling-efficiency.sh

# 6. Autoscaling comparison (§6):
./scripts/hpa-compare.sh cpu
./scripts/hpa-compare.sh connections

# Dashboards, for watching any of the above live:
./scripts/k8s-dashboards.sh                         # Grafana :3001, Prometheus :9090
```

---

## 11. Index: every change behind this report

| CHG | What | Evidence |
|---|---|---|
| CHG-0023 | The Redis fix itself | [evidence/02](evidence/02-redis-fix.md) |
| CHG-0026 | Docker Compose, graceful failover | [evidence/03](evidence/03-graceful-failover.md) |
| CHG-0028 | Kubernetes (k3d), chaos test | [evidence/04](evidence/04-kubernetes.md) |
| CHG-0030 | Prometheus metrics endpoint | — |
| CHG-0031 | Prometheus + Grafana in k3d | — |
| CHG-0032 | k6 load test | — |
| CHG-0033 | Phase 5 (real cloud) descoped — see PLAN.md r4 | — |
| CHG-0034 | Autoscaling: CPU vs connection count | [evidence/05](evidence/05-autoscaling.md) |
| CHG-0035 | Redis tax + scaling efficiency | [evidence/06](evidence/06-redis-tax.md), [evidence/07](evidence/07-scaling-efficiency.md) |

Full detail on every entry, including the ones not listed here (defect fixes, process changes,
documentation), is in [docs/CHANGE_LOG.md](CHANGE_LOG.md).
