# ChatScale / Cloud Scaling Study — Status

**Read this first in a new session.** It's the "what's going on" doc — for the full plan see
[PLAN.md](../PLAN.md), for the formal record of every change see
[docs/CHANGE_LOG.md](CHANGE_LOG.md) (CHG-0001 to CHG-0028 so far), for the demo script see
[docs/DEMO.md](DEMO.md).

**Last updated:** 2026-10-06, after Kubernetes (Phase 3 / step 3).

---

## The one-paragraph version

ChatScale is a working group-chat app (sign-up, 2FA, friends, spaces, live messages, invites,
light/dark theme). It's also the subject of a cloud-scaling experiment: we proved that running the
backend as two copies silently breaks live message delivery (one copy never hears about the other's
users), fixed it with a Redis adapter switchable by one env var, and reproduced both the break and
the fix unchanged on Docker Compose and then on a real local Kubernetes cluster (k3d) — including a
chaos test that kills a pod and measures recovery. Next up is dashboards, load testing, and
autoscaling (Phase 4), then a real cloud (Phase 5).

---

## ⚠️ First thing to check in a new session

```bash
cd ~/dev/wp_project && git status --short
```

**As of this writing, the Kubernetes work (step 3 below) is built, tested, and documented but NOT
pushed to GitHub.** The user has a standing rule: **Claude never runs `git add`/`commit`/`push` —
always give the commands and let the user run them.** If `git status` shows uncommitted files
matching the step-3 list below, that work is done but just sitting there; don't redo it, just offer
the git commands again.

Also check whether a k3d cluster is running (`k3d cluster list`) and Docker Desktop is up
(`docker info`) before assuming anything about live infra — both get torn down/forgotten between
sessions, especially after the host Mac sleeps (the cluster survives on disk but often comes back
confused — easiest fix is `k3d cluster delete chatscale && ./scripts/k8s-up.sh`, it's designed to be
thrown away and rebuilt).

---

## Where things stand, step by step

| # | Step | Status |
|---|---|---|
| — | The app itself: auth, 2FA, friends, spaces, live chat, invites, themes | ✅ Done, pushed |
| — | Supabase (cloud PostgreSQL) as the real database | ✅ Done, pushed — **never point test scripts at it, see below** |
| — | **The bug, proven:** two backend copies, Alice's message never reaches Bob | ✅ Done, pushed — [evidence/01](evidence/01-two-copies-break.md) |
| 1 | **The fix:** Redis (Valkey) adapter, on/off via `REDIS_URL` | ✅ Done, pushed — [evidence/02](evidence/02-redis-fix.md) |
| 2 | **Containers:** Docker images, nginx load balancer, health checks, graceful shutdown, `docker compose up` | ✅ Done, pushed — [evidence/03](evidence/03-graceful-failover.md) |
| 3 | **Kubernetes (k3d):** same experiment on real pods + pod-kill chaos test | ✅ Built & tested — **⚠️ NOT pushed**, see above — [evidence/04](evidence/04-kubernetes.md) |
| 4 | **Dashboards + load test + autoscaling** (Prometheus/Grafana, k6, HPA: CPU vs connection count) | ⏭️ **Not started — next up** |
| 5 | **Cloud** (real machines, Cluster Autoscaler, zone failures, public link) | Not started — needs a cloud account (see below) |
| 6 | Write-up: graphs, recordings, findings, cost model | Not started |

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
./scripts/k8s-down.sh              # tear down

# The two-copy laptop demo (no Docker needed) — what's actually been shown to faculty:
./scripts/demo-two-copies.sh              # broken
./scripts/demo-two-copies.sh --fixed      # fixed
./scripts/demo-two-copies.sh --local-db   # add this flag if the network blocks Supabase (port 5432)

# Run all the automated checks against whatever's running at :8080 (or set BASE=):
cd backend && npm run test:api
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
| `PLAN.md` | The master plan, phase by phase (this project's phases ≠ the "step" numbers used in chat — Phase 3 in PLAN.md is "steps 1–3" here: Redis fix, containers, Kubernetes) |
| `docs/CHANGE_LOG.md` | Every change, CHG-0001 onward. Read the last few entries to know exactly what just happened |
| `docs/evidence/0{1,2,3,4}-*.md` | The experiment's actual measured results, written up for the report |
| `docs/DEMO.md` | The faculty-facing presentation script (two parts: broken, then fixed) |
| `backend/src/socket/adapter.js` | The Redis fix itself — the whole thesis in one file |
| `backend/src/config/instance.js` | How a copy knows its own name (`INSTANCE_NAME` env var, or the pod hostname on Kubernetes automatically) |
| `backend/tests/*.test.js` + `run-all.js` | The automated checks (`npm run test:api`) — see chat history for what each one checks, or just read them, they're short |
| `backend/tests/failover.compose.js` / `failover.k8s.js` | The chaos tests — kill a copy/pod, measure recovery |
| `compose.yaml` | Docker Compose: nginx + 2 backend copies + Postgres + Redis |
| `k8s/base/` + `k8s/overlays/local/` | Kubernetes manifests (Kustomize). `base/` is meant to be substrate-agnostic — a future cloud overlay adds to it, doesn't replace it |
| `scripts/k8s-up.sh` | Reading this script's comments explains most of the Kubernetes gotchas hit along the way |

---

## What step 4 (next) actually involves

Plain-English goal: show that the cluster can **add copies automatically when busy** (not just
survive failures), and settle the "CPU vs connection count" autoscaling question from PLAN.md §2.2 —
a chat app's idle WebSocket connections use almost no CPU, so a naive CPU-based autoscaler may not
react to real load. This needs:

1. A load-testing script that fakes many simultaneous chat users (k6 — "no Socket.IO client built
   in" is a known gotcha, budget time for it, see PLAN.md Phase 7).
2. Metrics exposed from the backend (`prom-client`, a `/metrics` endpoint) — connections, messages/
   sec, delivery latency.
3. Prometheus + Grafana (can run as more pods in the same k3d cluster).
4. A Horizontal Pod Autoscaler (HPA) — first on CPU, then compare against scaling on connection
   count (KEDA or prometheus-adapter).

All of this still runs locally on k3d — no cloud account needed yet. Phase 5 (real cloud) is what
needs DigitalOcean (user has a GitHub Student Pack with $200 credit — easiest path, no Azure
verification needed) or Oracle Cloud's free tier, since Azure for Students verification was
rejected early on (CHG-0009) and hasn't been revisited.

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
