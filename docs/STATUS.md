# ChatScale / Cloud Scaling Study — Status

**Read this first in a new session.** It's the "what's going on" doc — for the full plan see
[PLAN.md](../PLAN.md) (**read its r4 amendment note near the top first** — project scope changed),
for the final write-up see **[docs/REPORT.md](REPORT.md)**, for the formal record of every change
see [docs/CHANGE_LOG.md](CHANGE_LOG.md) (CHG-0001 to CHG-0036 so far), for the demo script see
[docs/DEMO.md](DEMO.md).

**Last updated:** 2026-10-20, after `docs/REPORT.md` (CHG-0036) — **the project is complete.**
Every step in the table below is done. What remains, if anything, is pushing the last few CHGs and
whatever the owner wants to do with the finished report (submit it, present it, revisit a
descoped piece later).

---

## The one-paragraph version

ChatScale is a working group-chat app (sign-up, 2FA, friends, spaces, live messages, invites,
light/dark theme). It's also the subject of a cloud-scaling experiment: we proved that running the
backend as two copies silently breaks live message delivery (one copy never hears about the other's
users), fixed it with a Redis adapter switchable by one env var, and reproduced both the break and
the fix unchanged on Docker Compose and then on a real local Kubernetes cluster (k3d) — including a
chaos test that kills a pod and measures recovery. The backend now exposes Prometheus metrics at
`/metrics` (connections, messages, broadcast latency), Prometheus + Grafana run as two more pods
in the same k3d cluster scraping and graphing it live, and a k6 script (`loadtest/socketio-load.js`)
can fake many simultaneous chat users. **And the project's central hypothesis is now measured, not
just assumed**: a CPU-based Horizontal Pod Autoscaler never scaled under realistic chat load
(peaked at 36% against a 60% target), while a connection-count-based one (via `prometheus-adapter`
reading `chatscale_socket_connections`) scaled correctly within 50 seconds of identical load — see
[docs/evidence/05-autoscaling.md](evidence/05-autoscaling.md). Two measurements PLAN.md's own
thesis table named but that had been missed — Redis's same-pod-vs-cross-pod latency cost, and
whether throughput/latency actually scales with pod count — are now measured too: Redis tax is
negligible on this local single-machine cluster (explained, not just reported), and p95 message
latency dropped 110ms → 85ms → 34ms going from 1 to 4 pods under identical fixed load (see
[evidence/06](evidence/06-redis-tax.md) and [evidence/07](evidence/07-scaling-efficiency.md)).
**The project's scope is finalized at local Kubernetes**: Azure for Students verification never
resolved (R-12), and rather than restart that process with a second cloud provider, the decision
was to stop here. **Every row of the local-scope thesis table is measured, and the final write-up
exists: [docs/REPORT.md](REPORT.md).** The project is complete.

---

## ⚠️ First thing to check in a new session

```bash
cd ~/dev/wp_project && git status --short
```

**As of this writing, everything through CHG-0033 (Kubernetes, metrics, Prometheus/Grafana, the k6
load test, the PLAN.md r4 scope change) is pushed** — `origin/main` has it all. **CHG-0034 through
CHG-0036 (the HPA comparison, Redis tax + scaling efficiency, and docs/REPORT.md itself) are not
yet committed** — check `git status`; if it shows `k8s/base/prometheus-adapter*.yaml`,
`k8s/experiments/`, `scripts/hpa-compare.sh`, `scripts/scaling-efficiency.sh`,
`backend/tests/redis-tax.k8s.js`, `docs/evidence/05-*.md` through `07-*.md`, `docs/REPORT.md`, and
the usual doc files uncommitted, that work is done but just sitting there; don't redo it, just
offer the git commands again. The user has a standing rule: **Claude never runs
`git add`/`commit`/`push` — always give the commands and let the user run them.**

Also check whether a k3d cluster is running (`k3d cluster list`) and Docker Desktop is up
(`docker info`) before assuming anything about live infra — both get torn down/forgotten between
sessions, especially after the host Mac sleeps. **This actually happened on 2026-10-20**: Docker
had stopped, and after restarting it one k3d node (`agent-0`) came back crash-looping with a
networking init error ("failed to find interface with specified node ip") — exactly the "comes
back confused" failure mode this file already warned about. Fix was the one already documented:
`k3d cluster delete chatscale && ./scripts/k8s-up.sh`. It's designed to be thrown away and rebuilt
— don't try to debug a confused node, just do that. **If the cluster from this session is still
up, Prometheus and Grafana are already deployed and scraping** — `./scripts/k8s-dashboards.sh`
opens them, no redeploy needed. If the backend Deployment's pods look old (same age as before
CHG-0030/31), they're still running the pre-metrics image — `kubectl -n chatscale rollout restart
deployment/backend` after any `./scripts/k8s-up.sh` re-run, since it won't repull/restart on its
own when only the image content (not the manifest) changed.

**Resolved (2026-10-20): Azure for Students verification (R-12, PLAN.md) is closed by descoping
Phase 5, not by getting verification working.** SheerID support (Liz) said on 2026-10-07 they had
no record of the original request and asked for a resubmit via Microsoft's student-pricing flow;
that flow turned out confusing in practice (no Microsoft account existed under the `.nmims.in`
address; the generic "Student Discount" page is for discounted Office 365, a different product
from the Azure free-credit offer — the correct URL was `azure.microsoft.com/en-us/free/students/`).
A formal reply to Liz was drafted but it's unknown whether it was sent or answered — **moot now**:
rather than keep chasing verification (or restart the whole signup process with DigitalOcean/GCP),
the owner chose to stop the project's scope at local Kubernetes. See `PLAN.md`'s r4 amendment note
for the full reasoning and CHG-0033 for the formal record.

---

## Where things stand, step by step

| # | Step | Status |
|---|---|---|
| — | The app itself: auth, 2FA, friends, spaces, live chat, invites, themes | ✅ Done, pushed |
| — | Supabase (cloud PostgreSQL) as the real database | ✅ Done, pushed — **never point test scripts at it, see below** |
| — | **The bug, proven:** two backend copies, Alice's message never reaches Bob | ✅ Done, pushed — [evidence/01](evidence/01-two-copies-break.md) |
| 1 | **The fix:** Redis (Valkey) adapter, on/off via `REDIS_URL` | ✅ Done, pushed — [evidence/02](evidence/02-redis-fix.md) |
| 2 | **Containers:** Docker images, nginx load balancer, health checks, graceful shutdown, `docker compose up` | ✅ Done, pushed — [evidence/03](evidence/03-graceful-failover.md) |
| 3 | **Kubernetes (k3d):** same experiment on real pods + pod-kill chaos test | ✅ Done, pushed — [evidence/04](evidence/04-kubernetes.md) |
| 4a | **Metrics endpoint** (`prom-client`, `GET /metrics`: connections, messages, broadcast latency) | ✅ Done, pushed — CHG-0030 |
| 4b | **Prometheus + Grafana** in k3d, scraping `/metrics`, one dashboard | ✅ Done, pushed — CHG-0031 |
| 4c | **Load test** (`loadtest/socketio-load.js`, k6 over raw WebSocket) | ✅ Done, pushed — CHG-0032 |
| 4d | **Autoscaling** (HPA: CPU vs connection count) | ✅ Built & tested — **⚠️ NOT pushed**, see above — CHG-0034, [evidence/05](evidence/05-autoscaling.md) |
| — | **Phase 4 is complete.** | ✅ |
| — | **Redis tax** (same-pod vs cross-pod delivery latency, PLAN.md Phase 6) | ✅ Built & tested — **⚠️ NOT pushed** — CHG-0035, [evidence/06](evidence/06-redis-tax.md) |
| — | **Scaling efficiency** (throughput/latency, 1/2/4 pods, PLAN.md Phase 6) | ✅ Built & tested — **⚠️ NOT pushed** — CHG-0035, [evidence/07](evidence/07-scaling-efficiency.md) |
| 5 | ~~Cloud~~ (real machines, Cluster Autoscaler, zone failures, public link) | **DESCOPED (r4)** — Azure verification never resolved; project scope finalized at local k3d — see `PLAN.md`'s r4 amendment, CHG-0033 |
| 6 | **Write-up:** [docs/REPORT.md](REPORT.md) — findings, cost model, full reproduction guide | ✅ Built & tested — **⚠️ NOT pushed**, see above — CHG-0036 |
| — | **Project complete.** | ✅ |
| 7 | **OpenShift** (hosted Developer Sandbox) as a second deployment target, after the demo | 📝 **Proposed** — plan in [OPENSHIFT.md](OPENSHIFT.md), CHG-0041. Needs the owner's Red Hat account + `oc login`. k3d stays the demo stack |

---

## How to run it, right now

```bash
# The app, locally, no containers:
cd backend && npm run dev          # :5001
cd frontend && npm start           # :3000

# Everything in Docker, one address:
docker compose up --build          # http://localhost:8080
REDIS_URL= docker compose up       # same, but broken (no Redis) — the original bug

# Everything on Kubernetes (k3d):
./scripts/k8s-up.sh                # http://localhost:8080
REDIS_OFF=1 ./scripts/k8s-up.sh    # broken mode on real pods
./scripts/k8s-chaos.sh             # kill a pod, watch it heal
./scripts/k8s-dashboards.sh        # Grafana :3001, Prometheus :9090 (port-forward, foreground)
./scripts/k8s-down.sh              # tear down

# The two-copy laptop demo (no Docker needed) — what's actually been shown to faculty:
./scripts/demo-two-copies.sh              # broken
./scripts/demo-two-copies.sh --fixed      # fixed
./scripts/demo-two-copies.sh --local-db   # add this flag if the network blocks Supabase (port 5432)

# Run all the automated checks against whatever's running at :8080 (or set BASE=):
cd backend && npm run test:api

# Fake many simultaneous chat users against whatever's running at :8080 (or set BASE=):
k6 run loadtest/socketio-load.js                        # local rehearsal: ramps to 20 VUs
k6 run -e PROFILE=full loadtest/socketio-load.js         # PLAN.md's real profile: 0->50->100->150

# Autoscaling comparison (k3d only — needs prometheus-adapter, applied by k8s-up.sh):
./scripts/hpa-compare.sh cpu           # CPU-based HPA + load test, watched live
./scripts/hpa-compare.sh connections   # connection-count-based HPA + load test, watched live

# Redis tax: same-pod vs cross-pod delivery latency (needs >=2 k8s pods, Redis on):
cd backend && SAMPLES=200 node tests/redis-tax.k8s.js

# Scaling efficiency: fixed load at 1, 2, 4 pods (k3d only, ~8 minutes total):
./scripts/scaling-efficiency.sh
```

Demo accounts in **Supabase** (the laptop demo's database): `alice` / `bob`, in space "demo day".
Owner-chosen passwords — Claude doesn't know them. Demo accounts in **local/Docker/k8s** databases:
`ava@example.com` / `milo@example.com` / `parth@example.com`, password `password123` (see
`backend/src/config/seed.js` — this password is in source, so these users only ever get seeded into
throwaway local databases, never Supabase).

---

## Hard rules established this project (don't relearn these the hard way)

1. **Never run `git commit`/`git push` — ever.** Finish the work, then give the user the exact
   commands in fenced bash blocks, and stop. This came up explicitly and repeatedly.
2. **Every change gets a CHG-#### entry in `docs/CHANGE_LOG.md`**, corporate-engineering-log style
   (what/why/files/verification/rollback). The user wants this project to read as professionally
   maintained for placement interviews.
3. **Test scripts must never touch Supabase.** Start any throwaway backend for testing with
   `DATABASE_URL=` (empty) explicitly, plus a scratch `SQLITE_PATH` — don't rely on `backend/.env`
   being absent, because it has the real `DATABASE_URL` in it. This was violated once (CHG-0021/
   0022 incident: test users got written into Supabase, then found and deleted with the owner's
   approval). Don't repeat it — for local PostgreSQL testing, spin up a throwaway Docker container
   with an explicit connection string, never anything that could resolve to Supabase.
4. **The repo lives at `~/dev/wp_project`**, not under `~/Desktop` — it was moved off the
   iCloud-synced Desktop early on because that made `npm` and file I/O extremely slow (CHG-0010).
   GitHub remote: `https://github.com/parthparu/cloud` (fresh history, deliberately **not** a fork
   of the original `anjalipatil15/wp_project` — the user chose a clean start).
5. **This network sometimes blocks things.** Outgoing PostgreSQL (port 5432, used by Supabase) and
   Docker registry pulls (ghcr.io, docker.io) have both been observed hanging/timing out on this
   Wi-Fi — not a bug in the app. `./scripts/demo-two-copies.sh` has a `--local-db` escape hatch for
   the Supabase case; for slow registry pulls, just retry (`k8s-up.sh` is idempotent — re-running it
   picks up where it left off) or manually `docker exec <node> crictl pull <image>` on the specific
   k3d node to speed it along (see CHG-0028 for exactly how this was diagnosed).
6. **The user and their teammate (B118) have zero prior cloud/Kubernetes experience.** Explain
   concepts in plain English before diving into commands — this has been the norm throughout. Don't
   assume familiarity with Docker, Kubernetes, or even what a "load balancer" is.

---

## Key files to know

| File | What it is |
|---|---|
| `docs/REPORT.md` | **The final write-up (CHG-0036).** Every measured result, the cost model, what's explicitly not claimed, and a full reproduction guide — the one document to hand someone who asks "what did this project show?" |
| `PLAN.md` | The master plan, phase by phase (this project's phases ≠ the "step" numbers used in chat — Phase 3 in PLAN.md is "steps 1–3" here: Redis fix, containers, Kubernetes). **Read its r4 amendment note first** |
| `docs/CHANGE_LOG.md` | Every change, CHG-0001 onward. Read the last few entries to know exactly what just happened |
| `docs/evidence/0{1..7}-*.md` | The experiment's actual measured results, written up for the report — `05` is the CPU-vs-connections HPA finding, the project's strongest single result; `06`/`07` are the Redis tax and scaling-efficiency measurements |
| `docs/DEMO.md` | The faculty-facing presentation script (two parts: broken, then fixed) |
| `backend/src/socket/adapter.js` | The Redis fix itself — the whole thesis in one file |
| `backend/src/config/instance.js` | How a copy knows its own name (`INSTANCE_NAME` env var, or the pod hostname on Kubernetes automatically) |
| `backend/tests/*.test.js` + `run-all.js` | The automated checks (`npm run test:api`) — see chat history for what each one checks, or just read them, they're short |
| `backend/tests/failover.compose.js` / `failover.k8s.js` | The chaos tests — kill a copy/pod, measure recovery |
| `compose.yaml` | Docker Compose: nginx + 2 backend copies + Postgres + Redis |
| `k8s/base/` + `k8s/overlays/local/` | Kubernetes manifests (Kustomize). `base/` was kept substrate-agnostic for a future cloud overlay that, per the r4 amendment, won't now be added — `local/` is the only overlay this project will have |
| `backend/src/metrics.js` | The Prometheus metrics the backend exposes at `/metrics` (CHG-0030) |
| `k8s/base/prometheus.yaml` + `grafana.yaml` | Prometheus + Grafana, provisioned, in-cluster (CHG-0031) |
| `scripts/k8s-up.sh` | Reading this script's comments explains most of the Kubernetes gotchas hit along the way |
| `scripts/k8s-dashboards.sh` | Port-forwards Grafana (`:3001`) and Prometheus (`:9090`) to this machine |
| `loadtest/socketio-load.js` | k6 load-test script (CHG-0032) — the Engine.IO/Socket.IO protocol cheatsheet in its header comment is worth reading before touching it |
| `k8s/base/prometheus-adapter.yaml` | Exposes `chatscale_socket_connections` to Kubernetes' HPA via the external metrics API (CHG-0034) |
| `k8s/experiments/hpa-cpu.yaml` + `hpa-connections.yaml` | The two HPA configs under comparison — apply one at a time (CHG-0034) |
| `scripts/hpa-compare.sh` | Applies one HPA, runs the load test, watches it scale (or not) live |
| `backend/tests/redis-tax.k8s.js` | Measures same-pod vs cross-pod delivery latency (CHG-0035) |
| `scripts/scaling-efficiency.sh` | Fixed load at 1/2/4 pods, measures throughput/latency at each (CHG-0035) |

---

## Phase 4 is complete, and the thesis table's local-scope rows are all measured

Plain-English goal: show that the cluster can **add copies automatically when busy** (not just
survive failures), and settle the "CPU vs connection count" autoscaling question from PLAN.md §2.2 —
a chat app's idle WebSocket connections use almost no CPU, so a naive CPU-based autoscaler may not
react to real load. All four pieces are done:

1. ✅ **Metrics** (CHG-0030): `backend/src/metrics.js`, `GET /metrics` —
   `chatscale_socket_connections`, `chatscale_messages_total`, `chatscale_broadcast_latency_seconds`,
   default Node process metrics. (`chatscale_delivery_latency_seconds` is defined but not fed —
   would need the *receiving* client to report back, a frontend change that was never required for
   anything that followed.)
2. ✅ **Prometheus + Grafana** in k3d (CHG-0031), scraping `/metrics`, one dashboard. Reach with
   `./scripts/k8s-dashboards.sh`. Hand-rolled, not the `kube-prometheus-stack` Helm chart PLAN.md
   originally named — see CHG-0031 for why.
3. ✅ **Load test** (CHG-0032): `loadtest/socketio-load.js`, k6 speaking raw Engine.IO/Socket.IO
   over WebSocket (the "no Socket.IO client built in" gotcha PLAN.md flagged). Verified at 20 VUs:
   100% connect/join success, 328 messages sent and acked, p95 ack latency ~17ms. The full 150-VU
   profile (`PROFILE=full`) was never run — it's sized for an off-host load generator against a
   real multi-node cluster, not this laptop's 2-pod local deployment; not needed once Phase 5 was
   descoped (r4).
4. ✅ **Autoscaling comparison** (CHG-0034): `metrics-server` (bundled with k3s, confirmed working)
   + `prometheus-adapter` (exposes `chatscale_socket_connections` via the external metrics API) +
   two HPA configs (`k8s/experiments/`). **Measured, the project's strongest single result**: a
   CPU-based HPA never scaled under the 20-VU chat load (peaked 54%→36%, well under the 60%
   target); a connection-count-based HPA scaled 2→3 pods within 50 seconds of identical load,
   confirmed by a real `SuccessfulRescale` Kubernetes event and cross-checked against Prometheus's
   raw data to rule out a measurement artifact. Full writeup, including two real bugs found and
   fixed along the way (a cert-dir crash, and a subtle sum/avg double-division that silently halved
   every reading): [docs/evidence/05-autoscaling.md](evidence/05-autoscaling.md). Run it yourself
   with `./scripts/hpa-compare.sh cpu` / `./scripts/hpa-compare.sh connections`.

All of this ran locally on k3d — no cloud account needed, and **none ever will be for this
project**: Phase 5 (real cloud) is descoped as of 2026-10-20 (r4 amendment in `PLAN.md`, CHG-0033).

**Two more measurements, found missing and then measured (CHG-0035)**, round out PLAN.md's thesis
table (§1) for everything that doesn't need real cloud infrastructure:

5. ✅ **Redis tax** ([evidence/06](evidence/06-redis-tax.md)): same-pod vs cross-pod delivery
   latency, n=200 each. **No measurable difference locally** (~1–3ms both ways) — explained, not
   just reported: a k3d cluster is one Docker daemon on one physical machine, so there's no real
   network hop for a tax to show up on. A real multi-machine cluster (descoped, r4) would very
   likely show one.
6. ✅ **Scaling efficiency** ([evidence/07](evidence/07-scaling-efficiency.md)): fixed load (100
   VUs, calibrated — 20 VUs showed no saturation at all) at 1, 2, then 4 pods. **p95 message ack
   latency: 110ms → 85ms → 34ms**, a ~3.2x improvement, while delivery success stayed at 100% even
   at 1 pod — throughput never collapsed, but latency scaled down roughly with pod count.

**The write-up (step 6) is done: [docs/REPORT.md](REPORT.md) (CHG-0036).** Walks through
`PLAN.md`'s thesis table row by row, every number traced to a `docs/evidence/0{1..7}-*.md` file and
an exact command to reproduce it, an estimated cost model (from local resource requests + published
cloud pricing, since there's no real cloud invoice — `PLAN.md` §9's r4 note), and an explicit
section on what's deliberately not claimed and why. **The project is complete.**

---

## Loose ends / known limitations (not blocking, just unresolved)

- One 2FA test suite run failed once, right after a Docker Compose failover test — never reproduced
  in 13+ follow-up runs. Noted in CHG-0026, not chased further.
- The product name "ChatScale" was never explicitly confirmed by the user — it's just what Claude
  picked and it stuck.
- `backend/data/chat.sqlite` (the local dev database) still has old demo rows (a voice channel, a
  DM) from before those features were removed from the schema (CHG-0025) — harmless, unused.
- Supabase's SSL certificate was never downloaded (`DATABASE_CA_CERT` unset) — the connection is
  encrypted but not certificate-verified. Low priority.
- Grafana (CHG-0031) has anonymous viewer access and a fixed admin password — fine because it's
  reached exclusively via `kubectl port-forward` on the owner's own machine, and per the r4
  amendment this project will never put it behind a public address, so this isn't a gap to close.
- `k8s/experiments/hpa-connections.yaml`'s `averageValue: "8"` threshold and `hpa-cpu.yaml`'s
  `maxReplicas: 6` are tuned for the k6 `local` profile (20 VUs) specifically — raise them if
  testing against more replicas or VUs (CHG-0034).
- No true Cluster Autoscaler comparison (adding whole nodes, not just pods) exists or ever will —
  that needs real multi-node cloud infrastructure, descoped along with Phase 5 (r4). The HPA
  comparison (CHG-0034) is the pod-level piece of Phase 7 that stayed in scope.
- Scaling-efficiency (CHG-0035) ran n=1 per pod-count configuration, not PLAN.md's n=3 with a
  discarded 2-minute warm-up — a real simplification stated plainly in evidence/07, not hidden. The
  3.2x effect size is large enough that run-to-run noise doesn't explain it, but exact percentile
  values shouldn't be read as tightly confident.
- Redis tax's negligible-locally finding (CHG-0035, evidence/06) is specific to this single-
  Docker-daemon k3d cluster, not a general claim that the Redis hop is free — see that evidence
  doc for why, and what a real multi-machine deployment would likely show instead.
