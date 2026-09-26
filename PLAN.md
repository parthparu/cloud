# ChatScale — Project Plan

**Document ID:** WP-PLAN-001
**Revision:** 3 (supersedes r2 of 2026-09-20)
**Owner:** Parth
**Base repository:** `anjalipatil15/wp_project` (branch `main`, local only — nothing pushed)
**Date:** 2026-09-20
**Status:** Draft — Phase 0 not started
**Cloud:** Microsoft Azure (AKS + managed services), funded by Azure for Students
**Budget:** $100 student credit (redeemable via GitHub Student Developer Pack), **no credit card on
file**. Target spend ≤ $15. **The binding constraint is vCPU quota, not money — see §6.1.**

---

## 1. Thesis

Stateful WebSocket applications break under naive horizontal scaling. This project proves that
claim on a real application, fixes it, measures what the fix costs, and validates the result under
failures that only a real cloud can produce.

| Stage | Question | Artefact |
|---|---|---|
| Hypothesis | Does a Socket.IO app actually break at >1 replica? | Dated prediction, written before testing |
| Evidence | Reproduce the failure | Two-browser recording + pod logs showing the message never crosses pods |
| Fix | Redis pub/sub adapter for shared broadcast state | Same test, passing |
| Cost of fix | What does the Redis hop cost in latency? | Same-pod vs cross-pod vs **managed-Redis** p95 delivery latency |
| Scaling | Is throughput linear in pod count? | Scaling-efficiency curve, 1/2/4/8 pods, against a 1-pod control |
| Metric choice | Is CPU the right autoscaling signal for WebSockets? | CPU-HPA vs connection-HPA, compared |
| **Elasticity** | **What happens when the pods outgrow the nodes?** | **HPA → Cluster Autoscaler: two-level scaling trace** |
| Validation | Does it survive pod / node / **zone** / **database** loss? | Chaos traces including the reconnect storm |
| **Economics** | **What would this cost at 10k connections?** | **Cost model derived from the measured per-pod ceiling and the actual Azure bill** |

The three bolded rows are impossible to produce on a laptop. They are the reason this project runs
on a real cloud, not a reason invented after the fact.

---

## 2. Current state — verified findings

Read from source on 2026-09-20. Facts about the repo as it stands.

### 2.1 What exists

| Component | Reality |
|---|---|
| Backend | Node/Express, `socket.io@4.8.1`, entry `backend/server.js`, ~4k LOC under `backend/src/` |
| Socket layer | `backend/src/socket/socket.js` — JWT handshake auth, rooms `user:<id>`, `server:<id>`, `channel:<id>`, `voice:<id>` |
| Broadcast pattern | `io.to('channel:<id>').emit('message:new', ...)` — `backend/src/socket/messageHandlers.js:72` |
| Database | **Embedded SQLite** via `node:sqlite`, file at `backend/data/chat.sqlite` — `backend/src/config/db.js` |
| DB interface | A single mysql2-shaped shim: `execute(sql, params)` returning `[rows]` or `[{insertId, affectedRows}]` |
| Auth | Local JWT (`jsonwebtoken`), secret in `backend/.env` |
| Uploads | `multer` writing to `backend/src/uploads/` (local disk) |
| Frontend | CRA React 18 (`react-scripts@5.0.1`) |
| Frontend realtime | **None.** `socket.io-client` is not a dependency. `frontend/src/services/realtimeWorkspace.js` fakes realtime with a browser `BroadcastChannel` — same-browser tabs only |

### 2.2 Blockers to horizontal scaling (ranked)

**The Redis adapter fixes only the first one.** A Redis adapter on top of per-pod SQLite produces an
app that is still broken, just less obviously.

| # | Blocker | Why it breaks | Fix | Phase |
|---|---|---|---|---|
| B-1 | Socket.IO broadcast state is per-process | Pod A's `io.to(room)` has no knowledge of Pod B's sockets | `@socket.io/redis-adapter` | 3 |
| B-2 | **SQLite on pod-local disk** | Each pod gets its own database. A user registered on Pod A cannot log in on Pod B | Postgres → Azure Database for PostgreSQL | 2, 5 |
| B-3 | Uploads on pod-local disk | File uploaded via Pod A 404s when served by Pod B | Azure Blob Storage | 9 |
| B-4 | No Socket.IO client in the frontend | There is nothing to demo the failure *with* | Wire `socket.io-client` in | 1 |
| B-5 | Sticky sessions | Socket.IO's long-poll handshake upgrade needs the same pod each request; round-robin breaks it with 400 "Session ID unknown" | `transports: ['websocket']` or ingress affinity — decide and document | 3 |
| B-6 | No metrics endpoint | No HPA signal, no graphs | `prom-client` + `/metrics` | 4 |
| B-7 | Secrets in `.env` | Not cluster-native | K8s `Secret`, then Azure Key Vault | 2, 5 |

### 2.3 Environment

| Item | State |
|---|---|
| Host | macOS 26.6.2, **Apple M4 (arm64)**, 10 CPU, 16 GB RAM |
| Node | v24.14.0 (`node:sqlite` needs ≥22; after Phase 2 any LTS works) |
| Docker + buildx | 29.2.1 / v0.32.1 — present |
| kubectl | v1.34.1 — present |
| k3d / helm / k6 / terraform / az | **Not installed** |
| Cloud accounts | **None yet** — Phase 0 |

**Architecture note.** The M4 builds `arm64` natively; AKS node pools are `amd64`. Images must be
built `--platform linux/amd64` (buildx is present) or built in CI on GitHub's amd64 runners. Doing
the production build in GitHub Actions is the cleaner answer and is already planned.

### 2.4 Technology stack (as of r3.1)

**Sheet cell E14/E15 — "BTech CE (C) Cloud Computing Project groups", Team 4 (B104, B118).**
Formatted to the sheet's own convention, provider services grouped in parentheses:

> Node.js, Socket.IO, React, PostgreSQL, Redis, Docker, Kubernetes (k3d, HPA, Cluster Autoscaler,
> KEDA), Terraform, Azure (AKS, PostgreSQL Flexible Server, Cache for Redis, Blob Storage, Key
> Vault, Load Balancer, Monitor, Managed Grafana), Prometheus, Grafana, k6, GitHub Actions

Compact fallback if the cell must stay on one line:

> Node.js, Socket.IO, React, PostgreSQL, Redis, Docker, Kubernetes (HPA, Cluster Autoscaler),
> Terraform, Azure (AKS, PostgreSQL, Cache for Redis, Blob Storage, Monitor), Prometheus,
> Grafana, k6

| Layer | Technology | Role |
|---|---|---|
| **Application** | Node.js 22 LTS, Express | Backend runtime and HTTP API |
| | Socket.IO 4.8 | WebSocket transport — the subject of the experiment |
| | `@socket.io/redis-adapter` (sharded) | Cross-pod broadcast; the fix for B-1 |
| | React 18 + `socket.io-client` | Frontend; Vite replaces CRA if Phase 0 confirms the build failure |
| | PostgreSQL 16 | Shared relational state; replaces embedded SQLite (B-2) |
| **Containers** | Docker (multi-stage, non-root, `linux/amd64`) | Images |
| | Kubernetes — **k3d** local, **AKS** cloud | Two substrates, one manifest set |
| | Kustomize (`base` + `local`/`azure` overlays) | The portability result depends on this |
| | HPA · Cluster Autoscaler · PodDisruptionBudget | Pod-level and node-level elasticity |
| | KEDA *or* prometheus-adapter | Custom-metric (connection-count) autoscaling |
| **Azure managed** | AKS (Free control-plane tier) | Managed control plane |
| | Azure Database for PostgreSQL — Flexible Server | Managed DB + HA failover experiment |
| | Azure Cache for Redis | Managed pub/sub; also the managed-vs-in-cluster latency series |
| | Azure Blob Storage (`@azure/storage-blob`, SAS URLs) | Attachments (B-3) — note: **not** an S3 API |
| | Azure Key Vault (CSI driver) | Secrets out of `.env` (B-7) |
| | Azure Load Balancer + cert-manager / Let's Encrypt | Public ingress and TLS |
| | Azure Monitor managed Prometheus + Azure Managed Grafana | Cloud observability |
| **IaC / CI** | **Terraform** (`azurerm`, remote state) | Whole estate as code; enables same-day teardown |
| | GitHub Actions → **GHCR** | amd64 builds and deploys |
| **Measurement** | `prom-client` | Custom metrics, incl. end-to-end delivery latency |
| | Prometheus (kube-prometheus-stack) + Grafana | Local observability |
| | **k6 via Grafana Cloud** (500 free VUH) | Load generated off-host — see R-3 |

**Removed from the original stack, with reasons:**

| Dropped | Why |
|---|---|
| SQLite (`node:sqlite`) | Pod-local file; each replica got its own database (B-2) |
| MySQL (`mysql2` dependency) | Unused legacy — the shim is mysql2-*shaped* but SQLite-backed. Remove in Phase 2 |
| MinIO | Superseded by Azure Blob Storage — a managed service instead of a self-hosted stand-in |
| Keycloak | 1.5 days, end-to-end auth risk late in the schedule, no contribution to the scaling thesis (CHG-0005). Microsoft Entra ID is the managed option if auth is ever needed |
| Standalone k3s on a VM | Self-managing a control plane is IaaS, not cloud (CHG-0006). k3d stays for local dev only |

---

---

## 3. Cloud posture — what "using the cloud" means here

Revision 1 used no cloud at all. Revision 2 added free VMs that we would install k3s on ourselves —
which is **IaaS: renting Linux**. Self-managing the control plane, the database, the cache, the
object store and the load balancer is precisely *not* using cloud services.

Revision 3 moves every one of those to a managed Azure service, and keeps the local cluster only as
a development loop.

| Layer | r2 (self-managed) | r3 (managed Azure service) |
|---|---|---|
| Kubernetes control plane | k3s installed on a VM | **AKS** (free control plane tier) |
| Worker capacity | Fixed VM count | **AKS node pool + Cluster Autoscaler** |
| Relational database | Postgres StatefulSet + PVC | **Azure Database for PostgreSQL — Flexible Server** |
| Cache / pub-sub | Redis Deployment | **Azure Cache for Redis** |
| Object storage | MinIO | **Azure Blob Storage** (SAS URLs) |
| Ingress | Traefik on localhost | **Azure Load Balancer** + cert-manager/Let's Encrypt TLS |
| Secrets | `.env` file | **Azure Key Vault** via CSI driver |
| Provisioning | `kubectl apply` by hand | **Terraform** (`azurerm`) — the whole estate as code |
| Registry | local k3d registry | **GHCR** (free), built by GitHub Actions |
| Metrics / dashboards | Prometheus + Grafana pods | **Azure Monitor managed Prometheus + Azure Managed Grafana** |
| Load generation | k6 on the same laptop as the cluster | **Grafana Cloud k6** (500 free VUH) — off-host |

**Two environments, one manifest set.** Local k3d for iteration and the Phase 3 break/fix demo;
AKS for every measured experiment. The same Kustomize base deploys to both, with overlays for the
differences. That the identical manifests run on both substrates is itself a portability result.

---

## 4. Target architecture (Azure)

```
                Internet
                    │  DNS + TLS (cert-manager / Let's Encrypt)
           ┌────────▼─────────────┐
           │ Azure Load Balancer  │   ← managed, public IP
           └────────┬─────────────┘
                    │
  ┌─────────────────▼──────────────────────────────────────┐
  │  AKS  (free control plane — Azure runs etcd/apiserver)  │
  │                                                         │
  │   zone 1            zone 2            zone 3            │
  │  ┌────────┐        ┌────────┐        ┌────────┐         │
  │  │ node   │        │ node   │        │ node   │ ← Cluster Autoscaler 2..6
  │  │ pod pod│        │ pod pod│        │ pod pod│ ← HPA 2..20
  │  └────────┘        └────────┘        └────────┘         │
  └───────┬─────────────────┬───────────────┬───────────────┘
          │                 │               │
  ┌───────▼──────┐  ┌───────▼───────┐  ┌────▼──────────┐
  │ Azure Cache  │  │ Azure DB for  │  │ Azure Blob    │
  │ for Redis    │  │ PostgreSQL    │  │ Storage       │
  │ (pub/sub)    │  │ (HA failover) │  │ (attachments) │
  └──────────────┘  └───────────────┘  └───────────────┘

  Azure Key Vault ──CSI──► pods
  Azure Monitor managed Prometheus ──► Azure Managed Grafana
  Grafana Cloud k6 ──load──► public endpoint        (generated off-cluster)
  GitHub Actions ──build amd64, push──► GHCR ──► AKS
  Terraform ──provisions──► all of the above
```

---

## 5. Why a real cloud, concretely

Three experiments that **cannot exist** on k3d, plus one bonus data series:

1. **Two-level elasticity.** Load rises → HPA adds pods → pods go `Pending` for lack of capacity →
   **Cluster Autoscaler provisions a node** → pods schedule. A graph with two staircases. On k3d the
   node count is whatever number of containers you started; there is nothing to autoscale.
2. **Zone failure.** Spread pods across availability zones with topology constraints, then take a
   zone's nodes down. Real cloud topology, real scheduler response.
3. **Managed database failover.** Trigger a failover on the Postgres Flexible Server and measure how
   long the app takes to recover. A self-hosted StatefulSet cannot demonstrate this honestly.
4. **Bonus series — managed Redis latency.** Azure Cache for Redis sits outside the cluster, so its
   round-trip is higher than an in-cluster pod. Phase 6 already measures the cross-pod "Redis tax" in
   milliseconds; managed vs self-hosted becomes a third line on a graph that was being drawn anyway.

And the economics section stops being arithmetic: `docs/COSTS.md` is built from the **actual bill**.

---

## 6. Cost control

Azure for Students: **$100/year, no credit card required.** With no payment instrument on file the
account suspends rather than charging — overspend is structurally impossible, which is why this
provider was chosen over AWS (EKS control plane alone is ~$73/month) or a card-backed trial.

Approximate list rates — **verify in the Azure pricing calculator for your region at Phase 0**:

| Resource | ≈ $/hour | Notes |
|---|---|---|
| AKS control plane (Free tier) | **$0.00** | Azure runs it; no SLA on the free tier, which is fine here |
| 2 × `Standard_B2s` nodes | ≈ 0.083 | 3 nodes at autoscaler peak ≈ 0.125 — capped by quota, see §6.1 |
| PostgreSQL Flexible Server `B1ms` | ≈ 0.017 | + a few cents/month storage |
| Azure Cache for Redis Basic C0 | ≈ 0.022 | Single node, no SLA — state that honestly |
| Standard Load Balancer | ≈ 0.025 | + trivial data processing |
| Blob Storage | ≈ 0 | Pennies at this volume |
| **Running total** | **≈ 0.15–0.20/hr** | |
| Postgres GP tier w/ zone-redundant HA | ≈ 0.40 | **Only** for the Phase 8 failover run — a few hours |

**Budget: 40 hours of cluster time ≈ $7, plus ~$1 for the HA failover window.** Against $100 that is
comfortable, provided the estate is torn down between sessions.

Rules:
- `terraform destroy` (`make cloud-down`) at the end of **every** session. Nothing runs overnight.
- Azure Budget alert at **$10**, set the same hour the subscription is created.
- Grafana Cloud k6's 500 free VUH is the load-testing budget: a 500-VU run for 12 minutes costs
  100 VUH, so **five full-scale runs**. Rehearse locally at 20 VUs; spend VUH only on report-bound
  runs. Track remaining VUH in `loadtest/results/`. (Azure Load Testing is the native alternative —
  50 free VUH/month, no resource fee, and it accepts k6 scripts — worth one run for the native story.)
- Nothing is provisioned without a `terraform plan` reviewed first.

### 6.1 The real constraint: vCPU quota

Money is not what limits this project. **Azure for Students subscriptions carry a regional compute
quota of roughly 4–6 vCPUs — and are not eligible for quota increases.** Some regions default to
zero. The only way to raise it is converting to pay-as-you-go, which requires a credit card and
throws away the overspend protection that made this provider the right choice. We do not do that.

**First command of Phase 0, before anything else is planned around a region:**

```bash
az vm list-usage --location <region> --output table | grep -i "Total Regional vCPUs"
```

Try several regions; pick one with headroom. Everything below is sized to fit **6 vCPUs total**:

| Pool | SKU | Nodes | vCPU |
|---|---|---|---|
| System | `Standard_B2s` | 1 (fixed) | 2 |
| User (autoscaled) | `Standard_B2s` | 1 → 2 | 2 → 4 |
| **Peak total** | | | **6** |

Managed PostgreSQL and Azure Cache for Redis draw on separate quotas, not the Compute-VM core pool,
so they do not compete with the node budget.

**Consequences, and why they are acceptable:**

- The Cluster Autoscaler demo is a **1 → 2 node** step, not 2 → 6. The mechanism, the `Pending`-pod
  trigger and the node-provisioning latency are identical at any scale; only the staircase is
  shorter. Size pod CPU `requests` (≈400m) so that a handful of pods fills a node and the scale-out
  fires early — the experiment is about the *trigger and the latency*, not about node count.
- Load targets drop from 500 VUs to roughly **100–150 VUs**. A 6-vCPU cluster saturates well before
  500, and driving past saturation measures the load generator, not the app. The scaling-efficiency
  curve needs its *shape*, not a large absolute number — and 150 VUs is well inside the free k6
  virtual-user-hour allowance, which helps.
- Pin the pod-count experiment to 1/2/4 rather than 1/2/4/8.
- State the quota ceiling in the report. "Measured within a 6-vCPU quota" is a normal engineering
  constraint, honestly reported. Extrapolating past it without saying so would not be.

---

## 7. Phases

Each phase has a hard **exit criterion**, and closes with a `CHG-####` entry in `docs/CHANGE_LOG.md`.

### Phase 0 — Baseline, hypothesis, accounts (1 day)

- Run backend + frontend locally on Node 24. A previous session found `react-scripts start` never
  answered on :3000 (CHG-0003, U-13) — reproduce in a normal shell; if CRA is genuinely broken on
  Node 24, migrate to **Vite** now rather than after the UI work.
- **Write the hypothesis before testing anything** — a dated paragraph in `docs/EXPERIMENT.md`
  predicting exactly what will fail at 2 replicas and why.
- Redeem **Azure for Students**. **Note: GitHub Education and Azure use separate verification
  systems** — an approved GitHub Student Pack does *not* carry over, and automated university-ID
  checks fail routinely for institutions not in Microsoft's database. If verification fails, open a
  manual-verification ticket at `aka.ms/AzureEduSupport` with a student ID or enrolment letter, and
  **treat it as a lead-time dependency, not a blocker** (R-12). Set the $10 budget alert once the
  subscription exists.
- **Check the vCPU quota before anything else** (§6.1). Student subscriptions get ~4–6 regional
  vCPUs, some regions zero, and **increases cannot be requested**. Run
  `az vm list-usage --location <region> -o table` across several regions and choose one with
  headroom. This decision constrains every later phase, so it is made first.
- Install `az`, `terraform`, `k3d`, `helm`, `k6`.
- Create the **Grafana Cloud** free account (k6 VUH + dashboards).
- Confirm the Free control-plane tier is selectable and that the chosen region offers availability
  zones (needed for the Phase 8 zone-failure test).

**Exit:** app runs locally; dated hypothesis on file; Azure subscription live with a budget alert and
a **recorded vCPU quota figure and chosen region**.

### Phase 1 — Make the app demonstrably realtime (1.5 days)

- Add `socket.io-client`; `frontend/src/services/socket.js` (JWT from login, reconnect enabled).
- Replace the BroadcastChannel fake in the chat view with real socket events: emit `message:send`,
  `join:channel`, `typing:start/stop`; subscribe to `message:new`, `message:update`,
  `message:delete`, `user:status`.
- **Served-by-pod badge** in the UI (pod name from `process.env.HOSTNAME`, returned on connect).
  This is what makes the demo legible — a viewer sees *which pod* each browser is on.
- **Stamp every outgoing message with a client `sentAt`.** Phase 6's end-to-end latency metric
  depends on it; retrofitting it later means re-running every experiment.

**Exit:** two browsers, one backend process — a message in one appears in the other in real time.

### Phase 2 — Containerise + de-state the data layer (3 days)

- **PostgreSQL migration.** Rewrite `backend/src/config/db.js` only, preserving the
  `execute(sql, params) → [rows] | [{insertId, affectedRows}]` contract so the ~15 `insertId` and
  ~15 `affectedRows` call sites are untouched. The shim must translate `?` → `$1..$n`, append
  `RETURNING <pk>` to inserts, map `rowCount` → `affectedRows`, port the DDL (identity columns,
  `TIMESTAMPTZ`), and make the seed idempotent and env-gated so it does not re-run per pod.
  Highest-risk change in the project — do it on a branch against a Docker Postgres first.
- `Dockerfile` backend (multi-stage, non-root, read-only rootfs, `node:22-alpine`) and frontend
  (build → nginx). Build `linux/amd64` for AKS.
- `docker-compose.yml`: backend + frontend + postgres + redis. Everything works here first.
- `/healthz` (liveness) and `/readyz` (readiness — DB + Redis reachable). Readiness must genuinely
  fail when a dependency is down, or the Phase 8 failover demo will not work.
- **Graceful shutdown:** SIGTERM → stop accepting, notify clients, drain; matching
  `terminationGracePeriodSeconds`. Without it, every scale-down severs live sockets and pollutes the
  latency data.

**Exit:** `docker compose up` gives a working chat app on Postgres. SQLite is gone.

### Phase 3 — The experiment: break it, then fix it (2 days) ⭐

Run locally on k3d — it costs nothing and the failure is substrate-independent.

**3a — Reproduce.** k3d cluster (1 server + 2 agents); backend at `replicas: 2`, **no Redis
adapter**. Two browsers, confirmed on different pods via the badge. Send a message; it does not
arrive. Capture: side-by-side recording · `kubectl logs` from both pods · **the row in Postgres
proving it was persisted** — the data layer is fine and the failure is purely in the broadcast
layer. That distinction is the interesting part. Diagnose B-5 separately if `400 Session ID unknown`
appears; it is *not* the bug under study and must not be conflated with it.

**3b — Fix.** `@socket.io/redis-adapter` (sharded variant, Redis ≥7) behind `REDIS_URL` so the app
still runs adapter-less locally. Re-run the identical test; capture the same three artefacts.

**Exit:** a before/after pair of recordings and log excerpts in `docs/evidence/`.

### Phase 4 — Instrumentation (1.5 days)

- `prom-client` on `/metrics`: `chatscale_socket_connections` (gauge, per pod) ·
  `chatscale_messages_total` · `chatscale_broadcast_latency_seconds` ·
  **`chatscale_delivery_latency_seconds`** (client `sentAt` → receiving client, labelled
  `same_pod` / `cross_pod`) · default Node process metrics.
- Local: kube-prometheus-stack via Helm. Cloud: **Azure Monitor managed Prometheus** scraping the
  same endpoint, rendered in **Azure Managed Grafana**.
- One dashboard, JSON in `k8s/grafana/`: connections by pod · messages/sec · p95 delivery latency
  split same-pod/cross-pod · pod count · **node count** · cluster CPU and memory, so saturation is
  visible in the data rather than hidden behind it.

**Exit:** dashboard shows live data from a manual two-browser session.

### Phase 5 — Azure: Terraform the estate (2.5 days)

- Terraform (`azurerm`) modules: resource group · AKS (Free control-plane tier, 3 zones,
  system pool 1 × `Standard_B2s` + autoscaled user pool 1→2 `Standard_B2s`, sized to the §6.1 quota) · PostgreSQL Flexible Server ·
  Azure Cache for Redis · Storage Account + container · Key Vault · Log Analytics + managed
  Prometheus + Managed Grafana. Remote state in a storage account.
- `make cloud-up` / `make cloud-down`. Teardown is not optional — see §6.
- GitHub Actions: build `linux/amd64`, push to GHCR, deploy via Kustomize overlay.
- Kustomize overlays: `local/` (in-cluster Postgres + Redis) and `azure/` (managed services, Key
  Vault CSI secrets, LoadBalancer service, TLS).
- Migrate secrets from `.env` → Key Vault (B-7).

**Exit:** `make cloud-up` produces a working, publicly reachable chat app on AKS from nothing, and
`make cloud-down` removes every billable resource. Verified by a `$0.00/hr` resource list afterwards.

### Phase 6 — The cost of the fix, and scaling efficiency (1.5 days)

- **Redis tax.** p50/p95/p99 `delivery_latency` for `same_pod` vs `cross_pod`, under identical load.
  Answer in milliseconds: *what does correctness cost?* Then add the third series: **in-cluster Redis
  vs Azure Cache for Redis** — the managed service is a network hop away, and the difference is
  exactly the price of handing that component to the cloud.
- **Scaling efficiency.** Fixed load, pods pinned at 1 → 2 → 4 (HPA off; 8 exceeds the quota — §6.1). Plot throughput and
  p95 against pod count. The 1-pod run is the control; every later claim is measured against it.
- **Method.** n=3 per configuration, 2-minute warm-up discarded, percentiles not means, cluster CPU
  recorded alongside. One run per configuration is not a measurement.

**Exit:** two graphs — the Redis tax (three series) and the scaling-efficiency curve.

### Phase 7 — Load, autoscaling, and elasticity (2.5 days)

- `loadtest/socketio-load.js`. **k6 has no Socket.IO client** — the script must speak the protocol
  over raw WebSocket (`40` connect, `42["event",payload]`) via k6's websockets module, or use an
  xk6 Socket.IO extension. Budget half a day; most underestimated task in this plan. Rehearse at
  20 VUs locally before spending cloud VUH.
- Ramp 0→50→100→150 VUs, each holding a connection and sending a message every ~5 s. (Not 500 — a
  6-vCPU cluster saturates long before that, and driving past saturation measures k6, not the app.)
- CPU `requests`/`limits` set — HPA is meaningless without `requests`.
- **Autoscaler comparison.** Same load, two configurations: HPA on **CPU** (target 60%) vs HPA on
  **`chatscale_socket_connections`** via KEDA or prometheus-adapter. Idle WebSocket connections burn
  almost no CPU, so the CPU HPA may not fire until memory or file descriptors are exhausted. **If the
  CPU HPA scales late or not at all while the connection HPA scales correctly, that is the strongest
  single result this project can produce** — a real, non-obvious finding about a default that most
  tutorials present as correct.
- **Two-level elasticity.** Size pod CPU `requests` (≈400m) so a handful of pods fills a node, then
  push past the user pool's capacity so pods go `Pending` and the **Cluster Autoscaler** adds a node
  (1 → 2 within quota — a short staircase, identical mechanism). Capture pod count and node count on one time axis. Record
  node-provisioning latency — the minutes-long gap between "pods pending" and "pods running" is the
  real cost of elasticity and is invisible in every laptop demo.
- Record ramp-down too; HPA scale-down is deliberately slow (5-minute stabilisation) and explaining
  that demonstrates understanding rather than installation.

**Exit:** the two-staircase graph (pods and nodes), plus the CPU-vs-connection autoscaler comparison.

### Phase 8 — Chaos and failure domains (1.5 days)

With an active session and load running:

1. **Pod kill** — `kubectl delete pod`; client reconnects, lands elsewhere, session continues.
2. **Node kill** — delete a VMSS instance; pods reschedule, Cluster Autoscaler replaces the node.
3. **Zone failure** — take down a zone's nodes; verify topology-spread constraints keep the service
   up. Cloud-only.
4. **Managed database failover** — trigger a Postgres Flexible Server failover and measure app
   recovery time. Cloud-only. (Provision the HA-capable tier for this window only; see §6.)
5. **Redis kill** — cross-pod broadcast stops, per-pod messaging and persistence continue, then
   recovers. State plainly that the Phase 3 fix introduced a new single point of failure and measure
   it. An honest failure-domain analysis is a better finding than claiming robustness. Note Redis
   clustering/replicas as the production answer.
6. **Reconnect storm** — kill a pod holding the full VU load (~150 connections) and watch every client reconnect at once
   onto the survivors; a CPU spike that may itself trigger further scaling. Best chaos material here.
   Measure with and without backoff jitter.
- Add a `PodDisruptionBudget`; confirm the Phase 2 drain logic holds under real eviction.

**Exit:** six recorded failure events, each with a dashboard trace.

### Phase 9 — Cross-pod attachments (stretch, 1 day)

Closes B-3 — a correctness fix, not decoration. Replace multer disk storage with **Azure Blob
Storage** via `@azure/storage-blob`, serving by SAS URL. Note: Blob does not expose an S3-compatible
API, so this is the Azure SDK rather than `@aws-sdk/client-s3`. Demo: upload via pod A, retrieve from
a browser pinned to pod B.

### ~~Keycloak~~ — dropped (r2)

1.5 days, end-to-end auth risk late in the schedule, no contribution to the scaling thesis. If auth
coverage is needed, **Microsoft Entra ID** is the managed option at a fraction of the effort.
Recorded as dropped rather than silently abandoned.

---

## 8. Repository layout to be added

```
wp_project/
├── PLAN.md
├── Makefile                    ← local-up/down, cloud-up/down, load, teardown-verify
├── docs/
│   ├── CHANGE_LOG.md           ← one CHG entry per phase
│   ├── EXPERIMENT.md           ← hypothesis, method, results, conclusions
│   ├── COSTS.md                ← §9
│   ├── adr/                    ← decision records
│   └── evidence/               ← recordings, logs, dashboard screenshots
├── backend/Dockerfile
├── frontend/Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml    ← build amd64 → GHCR → deploy
├── terraform/
│   ├── main.tf  variables.tf  outputs.tf
│   └── modules/{aks,postgres,redis,storage,keyvault,observability}/
├── k8s/
│   ├── base/                   ← deployment, service, ingress, configmap
│   └── overlays/{local,azure}/ ← in-cluster deps vs managed services
└── loadtest/{socketio-load.js,results/}
```

**ADRs** to write as decisions are made, one page each: Redis adapter vs sticky-sessions-only ·
Postgres vs retaining SQLite · Azure vs AWS/GCP (student credit, free control plane, no card) ·
managed vs in-cluster Redis · CPU vs connection-count autoscaling · Blob vs S3-compatible storage.
Minutes each if written at the time, and exactly what the experiment framing is selling.

---

## 9. Cost model (`docs/COSTS.md`)

A section the assessment rewards and almost nobody writes — and with a real cloud it is **measured,
not estimated**. Take the per-pod connection ceiling from Phase 6 and the actual Azure invoice, then
extrapolate the monthly cost of 1k / 10k / 100k concurrent connections: nodes, managed Redis,
managed Postgres, load balancer, egress. Egress is usually the surprise. Compare against the
self-hosted alternative to show what the managed services actually bought. The point the project is
really making: architecture decisions are cost decisions.

---

## 10. Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-1 | Postgres migration destabilises the app (Phase 2) | High — blocks everything downstream | Isolated branch; keep the `db.js` contract identical; verify under docker-compose first |
| R-2 | k6 cannot speak Socket.IO out of the box | Medium — delays Phase 7 | Budget half a day; fall back to a Node-based harness if raw frames stall |
| R-3 | Load generator co-located with the system under test | **High — silently invalidates every latency number** | Grafana Cloud k6 generates load off-host. Record cluster CPU regardless |
| R-4 | Sticky-session errors mistaken for the Redis bug | High — corrupts the conclusion | Diagnose B-5 explicitly in 3a; document as a separate finding |
| R-5 | Azure credit exhausted by resources left running | **High — ends the cloud work** | `make cloud-down` every session; $10 budget alert; no card on file means suspension, not a bill |
| R-6 | 500 VUH k6 allowance exhausted | Medium | Rehearse locally; spend VUH only on report-bound runs; track remaining |
| R-7 | **Student-subscription vCPU quota (~4–6 cores, increases not permitted, some regions zero)** | **High — caps cluster size and therefore every load and elasticity result** | Quota is the first Phase 0 action, not a Phase 5 discovery (§6.1). Experiments sized to 6 vCPU; targets and node counts already reduced. Do **not** convert to pay-as-you-go to escape it — that requires a card and forfeits the overspend protection |
| R-8 | arm64 build host vs amd64 nodes | Low but confusing when hit | Production images built on GitHub's amd64 runners; `--platform linux/amd64` locally |
| R-9 | Frontend (CRA on Node 24) does not build | Medium | Resolve in Phase 0; migrate to Vite if confirmed |
| R-10 | Terraform work expands to fill available time | Medium | Terraform is a means, not a deliverable. Timebox Phase 5 to 2.5 days; hand-applied YAML is acceptable if it threatens the experiments |
| R-11 | Scope creep back into auth/extras | High — ends with an incomplete experiment | Phases 0–8 are the project. Phase 9 is the only stretch |
| R-12 | **Azure for Students verification fails or is slow** (automated university-ID check rejected 2026-09-20 for `nmims.in`; manual review takes days) | Medium — delays Phase 5 only | Routes, in order: **SheerID manual review** (the actual verification vendor); **Microsoft Q&A**, which is staffed and escalates these cases; and **NMIMS/MPSTME IT or faculty**, since the institution may already hold an Azure for Education tenant. The `azureforeducation.microsoft.com/institutions/contact` form is for institution administrators and resolves to Engage Center with no access for a student account — not a student route. **Phases 0–4 are entirely local (~8 days) and need no cloud account**, so the critical path is unaffected. **Decision point: if verification is unresolved when Phase 4 closes, switch to GCP** (GKE's recurring free-tier credit covers the control plane indefinitely), accepting that a card-backed account forfeits the overspend protection from CHG-0006 (P-22). Second team member (B118) attempts verification in parallel |

---

## 11. Effort estimate

| Phase | Days |
|---|---|
| 0 Baseline + accounts | 1 |
| 1 Real socket client | 1.5 |
| 2 Containerise + Postgres | 3 |
| 3 Break it / fix it ⭐ | 2 |
| 4 Instrumentation | 1.5 |
| 5 Terraform + AKS + managed services | 2.5 |
| 6 Redis tax + scaling efficiency | 1.5 |
| 7 Load + autoscaling + elasticity | 2.5 |
| 8 Chaos | 1.5 |
| **Core total** | **17** |
| 9 Blob attachments | +1 |

---

## 12. Tooling to install (Phase 0)

```bash
brew install k3d helm k6 terraform azure-cli postgresql@16
```

`docker` and `kubectl` are present. `postgresql@16` supplies the `psql` client only. Accounts to
create in the same sitting: **Azure for Students** (redeem with .edu or student ID — no card),
**Grafana Cloud** (free tier, 500 k6 VUH). GHCR comes with the GitHub account.

---

## 13. Working conventions

- Every phase closes with a `CHG-####` entry in `docs/CHANGE_LOG.md` (what / why / files /
  verification / rollback).
- **Nothing is pushed to `origin` without explicit authorisation from the project owner.**
- Results are recorded as measured, including runs that contradict the hypothesis. A negative result
  is a finding; a quietly discarded one is a defect in method.
- No cloud resource is created without a reviewed `terraform plan`, and none is left running at the
  end of a session.

---

## 14. Immediate next actions

1. Redeem **Azure for Students** via the GitHub Student Developer Pack, create the subscription, set
   the **$10 budget alert** the same hour, then **check the vCPU quota across regions** (§6.1) — that
   number, not the credit, determines how large every experiment can be.
2. Create the **Grafana Cloud** free account (dashboards + 500 k6 VUH).
3. Reproduce the CRA dev-server issue on Node 24 in a normal shell → decide CRA vs Vite.
4. `brew install k3d helm k6 terraform azure-cli`.
5. Write the dated hypothesis into `docs/EXPERIMENT.md` **before** touching any Kubernetes.
6. Begin Phase 1 (`socket.io-client` wiring **including the `sentAt` stamp**) — without it there is
   no demo and no latency metric.
