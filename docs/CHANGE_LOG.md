# Engineering Change Log — wp_project (Discord Clone)

**Document ID:** WP-ECL-001
**Owner:** Parth
**Repository:** anjalipatil15/wp_project
**Purpose:** Authoritative record of every change made to this codebase — additions, modifications, removals, and decisions. All entries are append-only. Do not rewrite history; supersede an entry with a new one instead.

**Conventions**
- Change IDs are sequential: `CHG-####`.
- Every entry states **what** changed, **why**, **which files**, and **verification**.
- Status values: `Proposed` · `In Progress` · `Implemented` · `Verified` · `Superseded` · `Rolled Back`.
- Risk values: `Low` · `Medium` · `High`.
- Dates are ISO-8601 (YYYY-MM-DD).

---

## 1. Change Register (Summary)

| Change ID | Date | Author | Module | Summary | Type | Risk | Status |
|---|---|---|---|---|---|---|---|
| CHG-0001 | 2026-09-10 | Parth | Documentation / Process | Established engineering change log and working conventions | Process | Low | Implemented |
| CHG-0002 | 2026-09-10 | Parth | Whole system | Baseline architecture assessment recorded (no code changed) | Assessment | Low | Implemented |
| CHG-0003 | 2026-09-10 | Parth | Frontend / UI | UI and design-system assessment; toolchain viability check | Assessment | Low | Implemented |
| CHG-0004 | 2026-09-20 | Parth | Documentation / Planning | Raised ChatScale project plan: horizontal-scaling experiment on k3s | Process | Low | Implemented |
| CHG-0005 | 2026-09-20 | Parth | Documentation / Planning | PLAN.md r2: zero-cost cloud strategy added; experiment method strengthened; Keycloak dropped | Process | Low | Implemented |
| CHG-0006 | 2026-09-20 | Parth | Documentation / Planning | PLAN.md r3: Azure AKS and managed services adopted; project moved from self-managed IaaS to managed cloud | Process | Low | Implemented |
| CHG-0007 | 2026-09-20 | Parth | Documentation / Planning | PLAN.md r3.1: experiments resized to the Azure for Students vCPU quota ceiling | Process | Low | Implemented |
| CHG-0008 | 2026-09-20 | Parth | Documentation / Planning | PLAN.md §2.4: consolidated technology stack recorded, with removals and reasons | Process | Low | Implemented |
| CHG-0009 | 2026-09-20 | Parth | Planning / Risk | Azure student verification rejected; recorded as R-12 with local-first sequencing to protect the critical path | Process | Low | Implemented |
| CHG-0010 | 2026-09-26 | Parth | Dev environment | Working copy moved off iCloud-synced Desktop to ~/dev; backend and CRA dev server confirmed working on Node 24 | Environment | Low | Verified |
| CHG-0011 | 2026-09-26 | Parth | Frontend / Backend | Product frontend rebuilt (auth, friends, text channels, light/dark theme, non-Discord identity); 9 backend defects fixed incl. channel eavesdropping and Linux case-sensitivity crashes | Feature + Defect fix | Medium | Verified |
| CHG-0012 | 2026-09-26 | Parth | Frontend / Docs | Legacy frontend files and Tailwind removed; frontend reorganised into one-component files by screen; README rewritten | Refactor / Removal | Low | Verified |
| CHG-0013 | 2026-09-26 | Parth | Backend config | backend/.env untracked and ignored; JWT secret rotated; .env.example added | Security | Low | Implemented |
| CHG-0014 | 2026-09-26 | Parth | Repository | Per-folder .gitignore files consolidated into one commented root .gitignore | Process | Low | Verified |
| CHG-0015 | 2026-09-26 | Parth | Auth (backend + frontend) | Optional two-step verification with authenticator apps (TOTP), recovery codes, encrypted secrets, replay and brute-force protection | Feature (security) | Medium | Verified |
| CHG-0016 | 2026-09-26 | Parth | Socket layer / Experiment | Scaling failure reproduced with two local backend copies; instance naming and per-copy delivery logging | Experiment | Low | Verified |
| CHG-0017 | 2026-09-26 | Parth | Backend data layer | PostgreSQL support behind DATABASE_URL (Supabase-ready), shared schema, RLS on all tables, safe seeding; mysql2/bcrypt removed | Feature / Refactor | Medium | Verified locally |
| CHG-0018 | 2026-09-26 | Parth | Demo tooling / SQLite | One-command two-copy demo script and faculty guide; fixed SQLite lock and duplicate-seed races on simultaneous start | Tooling + Defect fix | Low | Verified |
| CHG-0019 | 2026-09-26 | Parth | PostgreSQL driver | Concurrent schema creation crashed a copy on Supabase; setup now serialised with an advisory lock | Defect fix | Low | Verified |
| CHG-0020 | 2026-09-26 | Parth | Invitations (backend + frontend) | Invite to a space by username; live sidebar invitations with accept/decline; blocks not revealed | Feature | Low | Verified |
| CHG-0021 | 2026-09-26 | Parth | Invites / Demo / Process | Email invite placeholder removed; demo reload pitfall documented; incident: test data written to Supabase, prevention added | Removal + Incident | Low | Implemented |
| CHG-0022 | 2026-09-26 | Parth | Supabase data | Incident closed: 11 test users and 3 test spaces deleted from Supabase with owner approval; owner data verified intact | Data cleanup | Low | Verified |
| CHG-0023 | 2026-09-27 | Parth | Socket layer / Demo | The fix: Redis adapter behind REDIS_URL (Valkey), shared 2FA counters, live-arrival highlight, demo --fixed mode; two SQLite start-up races fixed | Feature + Defect fix | Medium | Verified |
| CHG-0024 | 2026-09-27 | Parth | Demo tooling | Plain-English live Redis watcher (npm run watch-redis); copies register their names in Redis | Tooling | Low | Verified |
| CHG-0025 | 2026-09-27 | Parth | Backend / Supabase | Removed unused voice, attachment, direct-message, pin and reaction code and tables (Supabase 15 -> 9 tables); closes unauthenticated DM routes | Removal | Low | Verified |
| CHG-0026 | 2026-09-27 | Parth | Infrastructure | Docker images, compose stack with nginx load balancer, health checks, graceful shutdown; 5 defects found by failover testing fixed; tests moved into the repo | Feature + Defect fixes | Medium | Verified |
| CHG-0027 | 2026-10-01 | Parth | Demo tooling | Demo script checks backend readiness (no false "Ready"), --local-db for networks blocking database ports, clean-up on closed terminal | Defect fix + Tooling | Low | Verified |
| CHG-0028 | 2026-10-03 | Parth | Infrastructure (Kubernetes) | Experiment and chaos test re-run on a real k3d Kubernetes cluster; 3 deployment-ordering defects found and fixed (namespace inheritance, secretGenerator, crash-loop before DB ready) | Feature + Defect fixes | Medium | Verified |
| CHG-0029 | 2026-10-06 | Parth | Documentation | Added docs/STATUS.md — a session-handoff summary of project state, rules and next steps, for Claude sessions to read first | Documentation | Low | Verified |
| CHG-0030 | 2026-10-06 | Parth | Backend / Instrumentation | Added `prom-client` + `GET /metrics`: connection gauge, messages counter, broadcast-latency histogram, default process metrics (Phase 4, step 1 of 4) | Feature | Low | Verified |
| CHG-0031 | 2026-10-06 | Parth | Infrastructure (Kubernetes) | Prometheus + Grafana deployed into k3d, scraping the backend's `/metrics` via DNS service discovery; one provisioned dashboard (Phase 4, step 2 of 4) | Feature | Low | Verified |
| CHG-0032 | 2026-10-20 | Parth | Load testing | `loadtest/socketio-load.js`: k6 script speaking raw Engine.IO/Socket.IO over WebSocket (k6 has no Socket.IO client); ramps real throwaway users into a shared space and holds a chat connection each (Phase 4, step 3 of 4) | Feature | Low | Verified |
| CHG-0033 | 2026-10-20 | Parth | Documentation / Planning | PLAN.md r4: Phase 5 (real cloud) descoped — Azure verification (R-12) never resolved; project scope finalized at local Kubernetes (k3d) | Process | Low | Implemented |
| CHG-0034 | 2026-10-20 | Parth | Infrastructure (Kubernetes) | HPA autoscaling comparison, CPU vs `chatscale_socket_connections` (`prometheus-adapter`); measured: CPU-based HPA never scaled under chat load, connection-based one scaled correctly in 50s (Phase 4, step 4 of 4 — complete) | Feature | Low | Verified |
| CHG-0035 | 2026-10-20 | Parth | Experiments / Write-up | PLAN.md Phase 6 measured: Redis tax (negligible locally — explained) and scaling efficiency (p95 latency 110ms->85ms->34ms, 1->2->4 pods) | Feature | Low | Verified |
| CHG-0036 | 2026-10-20 | Parth | Documentation | docs/REPORT.md: the project's final write-up, synthesizing every measured result (CHG-0023-0035) against PLAN.md's thesis table, with an estimated cost model (step 6 of 6 — project complete) | Documentation | Low | Verified |
---

## 2. Detailed Entries

### CHG-0001 — Establish Engineering Change Log

| Field | Value |
|---|---|
| **Change ID** | CHG-0001 |
| **Date Raised** | 2026-09-10 |
| **Date Implemented** | 2026-09-10 |
| **Author** | Parth |
| **Module / Component** | Documentation, process |
| **Change Type** | Process |
| **Risk Level** | Low |
| **Status** | Implemented |

**Description**
Created `docs/CHANGE_LOG.md` as the single authoritative record of all work performed on this repository. Every subsequent change — feature, fix, refactor, config, dependency, or documentation — is to be logged here before the work is considered complete.

**Rationale**
The project is being developed into a portfolio-grade artifact for placement interviews. A maintained change register demonstrates engineering discipline, traceability, and release hygiene, and gives the author a defensible narrative for every design decision when questioned in a technical interview.

**Files Added**
- `docs/CHANGE_LOG.md`

**Files Modified**
- None

**Verification**
Document created and reviewed. Format validated against the register/entry structure defined in Section 1.

**Rollback Plan**
Delete `docs/CHANGE_LOG.md`. No code dependency.

---

### CHG-0002 — Baseline Architecture Assessment

| Field | Value |
|---|---|
| **Change ID** | CHG-0002 |
| **Date Raised** | 2026-09-10 |
| **Date Implemented** | 2026-09-10 |
| **Author** | Parth |
| **Module / Component** | Whole system (frontend, backend, data, security, ops) |
| **Change Type** | Assessment — no functional change |
| **Risk Level** | Low |
| **Status** | Implemented |

**Description**
Full read-only review of the repository to establish a baseline before the enhancement programme begins. No source files were modified. Findings recorded below.

**Findings — Current State**

*Backend (`backend/`, ~3,962 LOC)*
- Express 4 + Socket.IO 4 server with a layered structure: `routes/ → controllers/ → services/ → config/db.js`. The layering is sound and is a genuine strength.
- Persistence migrated from MySQL to Node's built-in `node:sqlite` (`DatabaseSync`) via a compatibility shim in `src/config/db.js` that mimics the `mysql2` `execute()` return shape. Schema (13 tables) and demo seed data are created at boot.
- Authentication: JWT bearer tokens, `bcryptjs` password hashing, socket handshake authentication in `src/socket/socket.js`.
- Feature surface: servers, channels, messages, direct messages, group DMs, friends, attachments (multer), voice-channel participant tracking.

*Frontend (`frontend/`, ~1,779 LOC)*
- React 18 + React Router 6 + Tailwind 3. Two routes only: `/` (Home) and `/dms/:channelId`.
- **Critical:** the UI does not consume the backend. `src/services/workspaceStore.js` holds all state in `localStorage` under key `discord-workspace-demo` with hard-coded seed users, and `src/services/realtimeWorkspace.js` simulates real-time delivery using the browser `BroadcastChannel` API — which only propagates between tabs of the same browser on the same machine.

**Findings — Defects and Risks Identified**

| Ref | Finding | Severity | Location |
|---|---|---|---|
| F-01 | Frontend is fully decoupled from the backend; "real-time messaging" is a `localStorage` + `BroadcastChannel` simulation and will not work between two machines or two browsers. The README's claim of full-stack real-time integration is not currently accurate. | Critical | `frontend/src/services/workspaceStore.js`, `realtimeWorkspace.js` |
| F-02 | `backend/.env` is committed to version control and contains `JWT_SECRET`. Any party with repository access can forge valid authentication tokens for every user. | Critical | `backend/.env` (tracked in git) |
| F-03 | No root `.gitignore`; secrets and build output are not excluded by default. | High | repository root |
| F-04 | `package.json` still declares `mysql2`, `mysql`-era dependencies, and both `bcrypt` and `bcryptjs`, although the code path uses `node:sqlite` and `bcryptjs` only. Dependency manifest does not reflect the real system. | Medium | `backend/package.json` |
| F-05 | Zero automated tests. `npm test` in the backend is the default failing stub. | High | `backend/package.json` |
| F-06 | `cors()` is applied with no origin allow-list, permitting any origin to call the API. | Medium | `backend/server.js` |
| F-07 | No rate limiting, request validation, or security headers (`helmet`) on any endpoint, including login and registration. | Medium | `backend/server.js`, all routes |
| F-08 | `auth` middleware performs a database read on every authenticated request to confirm user existence. | Low | `backend/src/middleware/auth.js` |
| F-09 | Requires Node ≥ 22 for `node:sqlite` (currently running v24.14.0) but no `engines` field declares this; the project will fail with an opaque error on older runtimes. | Medium | `backend/package.json` |
| F-10 | `frontend/build/` (compiled output) and `backend/data/*.sqlite` (database, including WAL/SHM files) are present in the working tree and are candidates for accidental commit. | Medium | repository |
| F-11 | No containerisation, CI pipeline, or deployment configuration; the project cannot be demonstrated via a live URL. | High | repository |

**Files Added**
- None

**Files Modified**
- None

**Verification**
Read-only inspection only. `git status` confirmed unchanged apart from pre-existing uncommitted work present before this assessment.

**Rollback Plan**
Not applicable — no change to source.

---

### CHG-0003 — Frontend UI and Design System Assessment

| Field | Value |
|---|---|
| **Change ID** | CHG-0003 |
| **Date Raised** | 2026-09-10 |
| **Date Implemented** | 2026-09-10 |
| **Author** | Parth |
| **Module / Component** | Frontend — UI layer, styling, build toolchain |
| **Change Type** | Assessment — no functional change |
| **Risk Level** | Low |
| **Status** | Implemented |

**Description**
Targeted review of the presentation layer, raised at the project owner's request to prioritise UI remediation ahead of the wider enhancement programme. Full read of `Workspace.js` (631 LOC), `index.css`, `tailwind.config.js`, and supporting components. An attempt was made to boot the development server for visual inspection; see Verification.

**Findings — UI Layer**

| Ref | Finding | Severity | Location |
|---|---|---|---|
| U-01 | `Workspace.js` is a 631-line monolith holding all layout, state, forms, and presentation for the entire application. Not reusable, not testable, and difficult to review. | High | `frontend/src/components/Workspace.js` |
| U-02 | "Create channel" and "Create server" forms are permanently mounted inside the channel sidebar. Production chat applications place these behind a modal or context menu; permanent inline forms consume roughly half the sidebar and read as a prototype. | High | `Workspace.js` |
| U-03 | Messages render as individually bordered cards with `rounded-[28px]` and heavy drop shadows. Chat transcripts require dense, scannable rows; card-per-message triples vertical space and breaks reading flow. No consecutive-message grouping by author. | High | `Workspace.js` |
| U-04 | Visual language does not match the product being cloned — cyan/rose accent palette on navy, `rounded-[24px]`–`rounded-[28px]` radii throughout, and wide `tracking-[0.3em]` uppercase labels. Reads as a generic dashboard template rather than a chat client. | Medium | `Workspace.js`, `index.css` |
| U-05 | `tailwind.config.js` defines custom breakpoints but leaves `theme.extend` empty. No design tokens for colour, spacing, or radius; every value is hard-coded at the call site, including arbitrary values such as `bg-[#1d1427]` and `bg-[#111827]`. | Medium | `frontend/tailwind.config.js` |
| U-06 | Developer-facing copy is rendered in the production interface: a "Backend note" panel stating "MySQL is offline", and a "Reset demo data" control in the main header. | High | `Workspace.js` |
| U-07 | No loading, empty, or error states beyond a single "No messages here yet" placeholder. No optimistic send, no delivery indication, no failure handling. | Medium | `Workspace.js` |
| U-08 | Accessibility gaps: no focus-visible styling, no ARIA labelling on icon-only and colour-only controls, presence indicated by colour alone, and unlabelled form inputs relying on placeholders. | Medium | `Workspace.js` |
| U-09 | Message list does not auto-scroll to the newest message and has no virtualisation; long channels will degrade. | Medium | `Workspace.js` |
| U-10 | Channel and voice icons are literal emoji (`🔊`, `#`) rendered inline. `react-icons` is already a dependency and unused here. | Low | `Workspace.js` |
| U-11 | Unused Create React App scaffolding remains: `App.css` still contains the default spinning-logo styles, and `logo.svg` is retained. | Low | `frontend/src/App.css`, `logo.svg` |
| U-12 | Stale duplicate views are still present in the tree (`StaticChatPage.js`, `components/try.html`, and static `public/Login.html`, `register.html`, `auth.js` predating the React app). Dead code. | Medium | `frontend/src/components/`, `frontend/public/` |
| U-13 | Build toolchain is Create React App (`react-scripts` 5.0.1). CRA is unmaintained — 5.0.1 is its final release and the React team has removed it from official documentation. It is a liability both technically and in interview. | High | `frontend/package.json` |
| U-14 | Compiled output directory `frontend/build/` is committed to the working tree alongside source. | Low | `frontend/build/` |

**Files Added**
- None

**Files Modified**
- None

**Verification**
Read-only inspection of source. A development server was started via `react-scripts start` on Node v24.14.0 to capture a visual baseline; the process ran for three minutes, produced no compiler output, and never answered HTTP on port 3000. The run was terminated and all spawned processes cleaned up. **The cause is not yet established** — it may be the sandboxed execution environment rather than a defect. This is to be reproduced by the project owner in a normal shell before any conclusion is recorded. Findings U-01 to U-14 derive from source review and are unaffected by this.

**Rollback Plan**
Not applicable — no change to source.

**Follow-up Actions Raised**
1. Confirm whether the development server starts in a normal shell on Node 24.
2. Decide on CRA → Vite migration (see U-13) before UI rework begins, to avoid doing the work twice.

---

### CHG-0004 — Raise ChatScale Project Plan

| Field | Value |
|---|---|
| **Change ID** | CHG-0004 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Documentation, planning |
| **Change Type** | Process |
| **Risk Level** | Low |
| **Status** | Implemented |

**Description**
Created `PLAN.md` at the repository root, defining the ChatScale work programme: taking this
application from a single-process deployment to a horizontally scaled, observable, self-healing
deployment on a self-hosted Kubernetes (k3s/k3d) cluster, structured as an experiment
(hypothesis → reproduced failure → fix → measurement → failover validation) rather than a service
integration checklist. The plan defines nine phases (0–8), per-phase exit criteria, an evidence
checklist (E-1 to E-10), a risk register, an effort estimate of 11.5 days for the core scope, and
the target repository layout for `k8s/`, `loadtest/`, and `docs/evidence/`.

**Rationale**
The project requires a defensible narrative and reproducible evidence, not a working demo alone.
Recording the plan before implementation fixes the hypothesis in advance and prevents the
experiment's conclusions from being written after the fact.

**Findings Recorded (source review, read-only)**

| ID | Finding | Severity | Location |
|---|---|---|---|
| P-01 | Socket.IO broadcast state is per-process (`io.to('channel:<id>').emit(...)`), which is the failure this project sets out to reproduce and fix. | Expected | `backend/src/socket/messageHandlers.js:72`, `backend/src/socket/socket.js` |
| P-02 | The database is embedded SQLite (`node:sqlite`) writing to a pod-local file. Each replica would hold a private database, so a Redis adapter alone would **not** make the application horizontally scalable. This is a second and larger statefulness blocker than the socket layer. | High | `backend/src/config/db.js` |
| P-03 | The data-access layer is a single mysql2-shaped shim — `execute(sql, params)` returning `[rows]` or `[{insertId, affectedRows}]` — used by all services. A PostgreSQL migration is therefore confined to one file plus schema DDL, provided the return contract is preserved. 15 call sites depend on `insertId`, 15 on `affectedRows`. | Informational | `backend/src/config/db.js`, `backend/src/services/` |
| P-04 | The React frontend has no Socket.IO client. `socket.io-client` is not a dependency; `realtimeWorkspace.js` simulates realtime using a browser `BroadcastChannel`, which is same-browser only. No cross-pod demonstration is possible until a real client is wired in. | High | `frontend/package.json`, `frontend/src/services/realtimeWorkspace.js` |
| P-05 | Attachments are written to pod-local disk via `multer`, so a file uploaded through one replica is unreachable through another. MinIO is therefore in scope as a correctness fix, not as optional coverage. | Medium | `backend/src/uploads/`, `backend/src/services/attachmentService.js` |
| P-06 | No metrics endpoint exists. Neither HPA signals nor the project's graphs are obtainable without instrumentation (`prom-client`). | Medium | `backend/server.js` |
| P-07 | Socket.IO's HTTP long-poll handshake upgrade requires session affinity; a round-robin Service will produce `Session ID unknown` errors that are easily mistaken for the very bug under study. Must be diagnosed and documented as a distinct finding. | Medium | Deployment-level |
| P-08 | k3s does not run natively on macOS. The plan selects k3d (k3s in Docker, 1 server + 2 agents) for development and experiments, and records that cluster "nodes" are containers rather than hosts. | Informational | Environment |
| P-09 | Host tooling: Docker 29.2.1 and kubectl v1.34.1 present; k3d, helm, and k6 absent. Host is 10 CPU / 16 GB, sufficient for the core scope with Keycloak and MinIO treated as droppable. | Informational | Environment |

**Files Added**
- `PLAN.md`

**Files Modified**
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
Findings P-01 to P-09 derive from read-only inspection of the source tree and from version checks of
host tooling. No application code was executed and no source file was modified.

**Rollback Plan**
Delete `PLAN.md` and remove this entry. No code dependency.

**Follow-up Actions Raised**
1. Reproduce the Create React App dev-server issue recorded under CHG-0003 on Node 24 in a normal shell; decide CRA vs Vite before Phase 1.
2. Install `k3d`, `helm`, and `k6`.
3. Create `docs/EXPERIMENT.md` and record the dated hypothesis before any Kubernetes work begins.

---

### CHG-0005 — PLAN.md Revision 2: Cloud Strategy and Experiment Method

| Field | Value |
|---|---|
| **Change ID** | CHG-0005 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Documentation, planning |
| **Change Type** | Process |
| **Risk Level** | Low |
| **Status** | Implemented |
| **Supersedes** | CHG-0004 (PLAN.md r1) |

**Description**
Revised `PLAN.md` to revision 2 following review. Three classes of change: (a) a zero-cost cloud
strategy was added, as revision 1 contained no cloud services of any kind; (b) the experimental
method was strengthened with measurements that revision 1 omitted; (c) scope was reduced.
Phase count changed from 9 (0–8) to 9 (0–8) with different content; core effort estimate revised
from 11.5 to 13.5 days.

**Findings That Drove the Revision**

| ID | Finding | Severity |
|---|---|---|
| P-10 | Revision 1 used no cloud services. k3d, Redis, Postgres, Prometheus, Grafana, MinIO and k6 were all self-hosted OSS on one laptop. This is cloud-*native*, not cloud — a material exposure for a cloud-computing assessment. | High |
| P-11 | **Measurement invalidity.** Revision 1 placed the k6 load generator on the same 10-core host as the cluster, database, cache and monitoring stack. At 500 VUs the run would measure host CPU contention as much as application behaviour, with no way to separate the two. This would have silently corrupted every latency figure in the load phase. | High |
| P-12 | The latency metric specified in revision 1 (server receive to broadcast emit) does not capture end-to-end cross-pod delivery, and therefore cannot answer what the Redis adapter costs. A client-stamped `sentAt` is required, and must be added in Phase 1 or every experiment needs re-running. | High |
| P-13 | Autoscaling on CPU is questionable for WebSocket workloads — idle connections consume negligible CPU, so a CPU-target HPA may not fire until memory or file descriptors are exhausted. Revision 1 relegated connection-based autoscaling to an optional stretch item; it is promoted to a first-class comparison, as a CPU-HPA failure would be the project's strongest result. | High |
| P-14 | No control condition existed. A single-pod baseline and a fixed-load 1/2/4/8-pod scaling-efficiency curve were added; without a control, later claims are unmeasurable. | Medium |
| P-15 | Redis Cloud's free tier (approx. 30 connections, 100 ops/sec) is below the load the experiments generate (500 VUs at one message per 5 s is exactly 100 ops/sec). Managed free Redis is therefore usable for the correctness demonstration only; load runs require the self-hosted instance. | Medium |
| P-16 | Oracle Cloud's Always Free ARM allocation was reduced during 2026 from 4 OCPU / 24 GB to 2 OCPU / 12 GB, and ARM capacity is frequently unobtainable on demand. Account creation is therefore moved to Phase 0 so the wait does not block the cloud phase. | Medium |
| P-17 | Host is Apple M4 (arm64), matching Oracle Ampere's architecture. Images build natively for the cloud target with no cross-compilation or multi-arch pipeline. | Informational |
| P-18 | Graceful shutdown on SIGTERM was under-specified. Without connection draining, every HPA scale-down event severs live sockets and contaminates latency data. | Medium |
| P-19 | The reconnect storm following a pod kill (all clients reconnecting simultaneously onto surviving pods) was not covered. It is both the most realistic failure mode and the best chaos evidence available. | Medium |

**Changes Made**

1. **Cloud strategy (new §4, §5).** Zero cash outlay, stated as a constraint. Oracle Cloud Always
   Free ARM VMs running real k3s as the cloud cluster (forever-free, genuine multi-host, arm64-native
   to the build host), with DigitalOcean DOKS or Civo trial credit as fallback. k6 and dashboards via
   Grafana Cloud's free tier, which supplies 500 VU-hours and moves load generation off the host
   under test. CI via GitHub Actions and GHCR. Budget discipline recorded: $1 billing alerts at
   signup, same-day teardown by script, VU-hour accounting.
2. **Method.** Client-stamped end-to-end delivery latency labelled same-pod versus cross-pod;
   a dedicated phase quantifying the Redis adapter's latency cost; a 1-pod control and scaling-
   efficiency curve; n=3 runs with warm-up discarded and percentiles rather than means; host CPU and
   memory plotted alongside application metrics so saturation is visible in the data.
3. **Autoscaling.** CPU-based and connection-based HPAs are now run as a comparison rather than the
   latter being a stretch goal.
4. **Resilience.** Graceful SIGTERM draining moved into Phase 2; reconnect-storm measurement and an
   explicit Redis single-point-of-failure analysis added to the chaos phase.
5. **Scope reduced.** Keycloak dropped (1.5 days, end-to-end auth risk late in schedule, no
   contribution to the scaling thesis). Recorded as dropped rather than silently abandoned.
6. **Added artefacts.** `docs/adr/` (five decision records), `docs/COSTS.md` (extrapolated cost of
   serving 1k/10k/100k concurrent connections from measured per-pod ceilings), `Makefile` and
   `.github/workflows/ci.yml`.

**Files Added**
- None

**Files Modified**
- `PLAN.md` (rewritten as revision 2)
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
Free-tier terms for Oracle Cloud, Grafana Cloud, DigitalOcean, Civo and Redis Cloud were checked
against public sources dated 2026 before being recorded; two had changed during the year and are
noted as requiring re-verification at signup. Host architecture confirmed as arm64 (Apple M4) via
`uname -m`. No application code was executed or modified.

**Rollback Plan**
Restore `PLAN.md` from revision 1 (CHG-0004) and remove this entry. No code dependency.

**Follow-up Actions Raised**
1. Create the Oracle Cloud account and request an ARM instance immediately — capacity waits cannot be compressed later (P-16).
2. Create the Grafana Cloud free account for dashboards and k6 VU-hours.
3. Set a $1 billing alert on every cloud account at the hour of creation.
4. Ensure the client-side `sentAt` stamp lands in Phase 1, before any measurement work (P-12).

---

### CHG-0006 — PLAN.md Revision 3: Adoption of Managed Cloud (Azure)

| Field | Value |
|---|---|
| **Change ID** | CHG-0006 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Documentation, planning, target architecture |
| **Change Type** | Process |
| **Risk Level** | Low (documentation); the plan it describes carries a financial control, see P-21 |
| **Status** | Implemented |
| **Supersedes** | CHG-0005 (PLAN.md r2) |

**Description**
Revised `PLAN.md` to revision 3 following the observation that the project — a cloud-computing
course project — still contained no managed cloud services. Revision 2's cloud content was
Infrastructure-as-a-Service only: free virtual machines onto which k3s would be installed and
self-managed, with two SaaS side-services attached. Revision 3 relocates every self-managed
component to a managed Azure service, adds infrastructure-as-code, and adds three experiments that
are not possible on local infrastructure. Core effort revised from 13.5 to 17 days.

**Findings That Drove the Revision**

| ID | Finding | Severity |
|---|---|---|
| P-20 | Revision 2 used rented virtual machines running self-installed k3s. The control plane, database, cache, object store, load balancer and secret storage were all self-managed. This is IaaS consumption, not cloud-service consumption, and does not satisfy the premise of a cloud-computing project. | High |
| P-21 | **DigitalOcean withdrew from the GitHub Student Developer Pack on 2026-08-01 and expired all issued credits**, including those already redeemed. The $200/year student credit recorded in revision 2 no longer exists and has been removed. | High (corrects r2) |
| P-22 | Azure for Students provides $100 of annual credit **with no credit card required**, and the AKS control plane is free of charge. The absence of a payment instrument makes overspend structurally impossible — the subscription suspends rather than billing. This is materially safer than any card-backed trial and is the basis for provider selection. | High |
| P-23 | AWS EKS charges approximately $73/month for the control plane alone and is excluded from the free tier; the 2025-revised AWS free tier issues $100 in credits (extensible to $200 via onboarding tasks). EKS would consume the majority of that allowance before any workload ran. AWS is therefore unsuitable under the zero-cost constraint unless mandated. | Informational |
| P-24 | Google Kubernetes Engine's free tier applies a recurring $74.40 monthly credit that offsets the management fee for one zonal or Autopilot cluster indefinitely, making it the strongest non-student option. Retained as the fallback. | Informational |
| P-25 | Three experiments central to a cloud-computing assessment **cannot be performed on local infrastructure at all**: node-level autoscaling via Cluster Autoscaler (k3d has a fixed node count); availability-zone failure; and managed-database failover. These were absent from revisions 1 and 2 and are the substantive justification for the cloud, independent of assessment criteria. | High |
| P-26 | Azure Cache for Redis resides outside the cluster, so its round-trip exceeds that of an in-cluster pod. The managed-versus-self-hosted difference can be added as a third series to the cross-pod latency measurement already planned, at no extra experimental cost. | Medium |
| P-27 | Azure Blob Storage does not expose an S3-compatible API. The attachment work must use `@azure/storage-blob` with SAS URLs rather than `@aws-sdk/client-s3`; the MinIO-to-S3 assumption carried in revisions 1 and 2 does not transfer to Azure. | Medium |
| P-28 | Build host is arm64 (Apple M4); AKS node pools are amd64. Production images must be built `linux/amd64`, which is handled by building in GitHub Actions on amd64 runners rather than locally. | Medium |
| P-29 | Grafana Cloud's free tier provides 500 k6 virtual-user-hours per month against Azure Load Testing's 50; Grafana Cloud is therefore the primary load generator, with Azure Load Testing retained for one run as the native-service demonstration. | Informational |

**Changes Made**

1. **Managed services (new §3, §4).** AKS with the free control-plane tier; Azure Database for
   PostgreSQL Flexible Server; Azure Cache for Redis; Azure Blob Storage; Azure Load Balancer with
   cert-manager TLS; Azure Key Vault via CSI driver; Azure Monitor managed Prometheus with Azure
   Managed Grafana; GHCR with GitHub Actions. A comparison table records what each replaced.
2. **Infrastructure as code (new Phase 5).** The entire estate provisioned by Terraform (`azurerm`)
   with remote state, exposed as `make cloud-up` / `make cloud-down`. Kustomize overlays `local/`
   and `azure/` allow one manifest set to deploy to both substrates, which is itself recorded as a
   portability result.
3. **New experiments (new §5, Phases 7 and 8).** Two-level elasticity (HPA driving Cluster
   Autoscaler, with node-provisioning latency measured); availability-zone failure with topology
   spread constraints; managed PostgreSQL failover timing; and managed-versus-in-cluster Redis
   latency as a third series on the existing Redis-tax graph.
4. **Financial control (new §6).** Rates tabulated per hour rather than per month to make teardown
   discipline legible: approximately $0.15–0.20/hour for the full estate, a 40-hour experimental
   budget of roughly $7 against the $100 credit, a $10 Azure budget alert set at subscription
   creation, mandatory `terraform destroy` at the end of every session, and virtual-user-hour
   accounting for the k6 allowance.
5. **Economics (revised §9).** `docs/COSTS.md` is now derived from the actual invoice and the
   measured per-pod connection ceiling rather than from estimation alone.
6. **Risk register extended.** R-5 (credit exhaustion), R-7 (regional quota), R-8 (architecture
   mismatch) and R-10 (Terraform expanding to fill available time — explicitly timeboxed, with
   hand-applied YAML named as the acceptable fallback) added.

**Files Added**
- None

**Files Modified**
- `PLAN.md` (rewritten as revision 3)
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
Provider terms were checked against public sources dated 2026 before being recorded: Azure for
Students credit and card-free enrolment; AKS free control-plane tier; the AWS free-tier revision of
July 2025 and EKS control-plane pricing; the GKE recurring free-tier credit; Azure Load Testing and
Grafana Cloud k6 virtual-user-hour allowances; and DigitalOcean's withdrawal from the GitHub Student
Pack, which invalidated a statement carried in revision 2 (P-21). All monetary figures in §6 are
approximate list rates recorded as requiring confirmation in the Azure pricing calculator during
Phase 0. Host architecture confirmed arm64 via `uname -m`. No application code was executed or
modified, and no cloud resource has been provisioned.

**Rollback Plan**
Restore `PLAN.md` from revision 2 (CHG-0005) and remove this entry. No code dependency and no
infrastructure dependency — nothing has been provisioned.

**Follow-up Actions Raised**
1. Redeem Azure for Students and set the $10 budget alert in the same session (P-22, R-5).
2. Confirm AKS quota and availability-zone support in the target region during Phase 0, not Phase 5 (R-7).
3. Re-verify all §6 rates in the Azure pricing calculator before provisioning.
4. Ensure the client-side `sentAt` stamp lands in Phase 1, before any measurement work.

---

### CHG-0007 — PLAN.md Revision 3.1: Experiments Resized to Subscription Quota

| Field | Value |
|---|---|
| **Change ID** | CHG-0007 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Documentation, planning, experiment sizing |
| **Change Type** | Process |
| **Risk Level** | Low (documentation); corrects a High-severity planning assumption |
| **Status** | Implemented |
| **Amends** | CHG-0006 (PLAN.md r3) |

**Description**
Confirmed that the Azure credit named in revision 3 is obtainable through the GitHub Student
Developer Pack's Microsoft Azure offer — $100 of credit plus 25+ free services, verified by linking
a GitHub account, with no credit card. This is the same Azure for Students programme reached by an
alternative verification path, so the provider decision in CHG-0006 stands unchanged.

Investigating that offer surfaced a constraint that revision 3 had not accounted for, and which
governs the size of every experiment in the project.

**Findings**

| ID | Finding | Severity |
|---|---|---|
| P-30 | The GitHub Student Developer Pack's Azure offer is the Azure for Students programme under a different verification route (GitHub account linkage rather than an institutional email address). Credit, free-service list and card-free enrolment are identical. No change to provider selection. | Informational |
| P-31 | **Azure for Students subscriptions carry a regional compute quota of approximately 4–6 vCPUs, and some regions default to zero. Free Trial and Azure for Students subscriptions are explicitly ineligible for quota increases.** The only escape is conversion to pay-as-you-go, which requires a credit card and forfeits the overspend protection that drove the provider choice in CHG-0006. This is therefore a hard ceiling. | **High** |
| P-32 | The node pool specified in revision 3 (autoscaling 2 → 6 × `Standard_B2s` = 4 → 12 vCPU) exceeds that ceiling and would have failed at provisioning time in Phase 5, after four phases of work had been built on the assumption. | **High** |
| P-33 | The binding constraint on this project is compute quota, not budget. At roughly $0.15–0.20/hour the $100 credit funds far more cluster time than the quota permits cluster size. Planning attention belongs on the quota. | Medium |
| P-34 | Managed PostgreSQL and Azure Cache for Redis draw on quotas separate from the Compute-VM core pool, so the managed-service architecture does not compete with the node budget. | Informational |

**Changes Made**

1. **New §6.1** recording the quota ceiling, the `az vm list-usage` check that must precede region
   selection, and a node layout sized to 6 vCPU: a fixed single-node `Standard_B2s` system pool plus
   an autoscaled user pool of 1 → 2 `Standard_B2s`.
2. **Phase 0** reordered so the quota check is the first action taken after subscription creation,
   ahead of region choice. Phase exit criteria now require a recorded quota figure and chosen region.
3. **Experiments resized.** Cluster Autoscaler demonstration reduced from a 2 → 6 node step to
   1 → 2; pod-count scaling series reduced from 1/2/4/8 to 1/2/4; load ramp reduced from 500 to
   150 virtual users; reconnect-storm scale adjusted accordingly. Pod CPU requests are to be set at
   approximately 400m so that node pressure — and therefore the autoscaler trigger — occurs within
   the available capacity.
4. **Rationale recorded** that these reductions do not weaken the results: the autoscaler's trigger
   condition and node-provisioning latency are scale-independent, and the scaling-efficiency curve
   depends on its shape rather than on absolute capacity. Driving 500 virtual users at a 6-vCPU
   cluster would have measured the load generator rather than the application. The quota ceiling is
   to be stated explicitly in the report rather than extrapolated past silently.
5. **R-7 re-rated** from Medium to High and rewritten, including an explicit instruction not to
   convert to pay-as-you-go in order to escape the quota.

**Files Added**
- None

**Files Modified**
- `PLAN.md` (revision 3.1 — eleven targeted amendments; revision 3 structure otherwise intact)
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
Quota limits and the ineligibility of Azure for Students subscriptions for quota increases were
checked against Microsoft documentation and support answers dated 2026. Offer terms were confirmed
against the GitHub Student Developer Pack listing supplied by the project owner. Figures in §6.1
remain marked as requiring confirmation against the subscription itself during Phase 0 — the quota
is per-subscription and per-region, and the plan now treats measuring it as the first action rather
than an assumption.

**Rollback Plan**
Revert the eleven amendments and remove this entry. No code or infrastructure dependency.

**Follow-up Actions Raised**
1. Redeem the offer via the GitHub Student Developer Pack and record the actual vCPU quota per candidate region before selecting one (P-31).
2. Confirm the selected region supports availability zones, required for the Phase 8 zone-failure test.
3. If the measured quota is below 6 vCPU, reduce the user pool to a single node and record the Cluster Autoscaler demonstration as the one experiment the subscription cannot support, rather than silently dropping it.

---

### CHG-0008 — Consolidated Technology Stack Recorded

| Field | Value |
|---|---|
| **Change ID** | CHG-0008 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Documentation |
| **Change Type** | Process |
| **Risk Level** | Low |
| **Status** | Implemented |
| **Amends** | CHG-0006, CHG-0007 |

**Description**
Added `PLAN.md` §2.4 recording the technology stack as it stands after revisions 1 to 3.1. The stack
had been distributed across the architecture, phase and cloud-posture sections and was not stated in
one place, which made it impossible to quote accurately for the project sheet. The section gives a
single-line form for the sheet, a layered table, and a table of removals with reasons.

**Rationale**
Three revisions changed the stack substantially — the database, the object store, the orchestration
target and the identity component all moved or were dropped — and the original project-sheet stack
line is now inaccurate in five places. Recording removals alongside additions keeps the reasoning
defensible under questioning, which is the same rationale as the ADR set.

**Stack Changes Consolidated (no new decisions)**

| Item | Status | Origin |
|---|---|---|
| PostgreSQL | Added, replaces SQLite | CHG-0004 (P-02) |
| Azure AKS, Database for PostgreSQL, Cache for Redis, Blob Storage, Key Vault, Load Balancer, Monitor + Managed Grafana | Added | CHG-0006 |
| Terraform, GitHub Actions, GHCR, Kustomize, cert-manager | Added | CHG-0006 |
| Cluster Autoscaler, KEDA / prometheus-adapter | Added | CHG-0005, CHG-0006 |
| k6 relocated to Grafana Cloud | Changed | CHG-0005 (P-11) |
| SQLite (`node:sqlite`) | Removed | CHG-0004 (P-02) |
| `mysql2` dependency | Flagged for removal in Phase 2 — unused legacy; the data shim is mysql2-shaped but SQLite-backed | CHG-0004 (P-03) |
| MinIO | Removed, superseded by Azure Blob Storage | CHG-0006 (P-27) |
| Keycloak | Removed | CHG-0005 |
| Standalone k3s on a VM | Removed; k3d retained for local development only | CHG-0006 (P-20) |

**Files Added**
- None

**Files Modified**
- `PLAN.md` (new §2.4)
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
§2.4 was reconciled line by line against the architecture diagram (§4), the cloud-posture table (§3)
and the phase definitions (§7); no component appears in one and not the others. No new technology was
introduced by this entry — it consolidates decisions already recorded under CHG-0004 to CHG-0007.

**Rollback Plan**
Remove §2.4 and this entry. No code dependency.

**Amendment (2026-09-20, same day)**
§2.4's one-line form was reformatted to the class sheet's own convention (comma-separated, provider
services grouped in parentheses, e.g. `Azure (AKS, ...)`) after the sheet was inspected directly:
*BTech CE (C) Cloud Computing Project groups*, Team 4, cell E14/E15, roll numbers B104 and B118. A
compact single-line fallback was added alongside it. No stack content changed.

**Follow-up Actions Raised**
1. Update the project sheet's stack line, which still names Keycloak, MinIO and k3s and omits Azure, Terraform and PostgreSQL.
2. Remove the unused `mysql2` dependency from `backend/package.json` during Phase 2.

---

### CHG-0009 — Azure Student Verification Rejected; Risk R-12 Raised

| Field | Value |
|---|---|
| **Change ID** | CHG-0009 |
| **Date Raised** | 2026-09-20 |
| **Date Implemented** | 2026-09-20 |
| **Author** | Parth |
| **Module / Component** | Planning, risk register |
| **Change Type** | Process |
| **Risk Level** | Low (documentation); records a Medium delivery risk |
| **Status** | Implemented |
| **Amends** | CHG-0006, CHG-0007 |

**Description**
Azure for Students automated verification was attempted on 2026-09-20 with the institutional address
`PARTH.SANGANI58@nmims.in` and was rejected with "Unable to confirm your University ID"
(SessionID `96aff2a9-1334-477e-b190-b5e57c6d4e34`). The plan is amended to record the cause, the
remediation path, and — more importantly — the sequencing that prevents it from delaying the project.

**Findings**

| ID | Finding | Severity |
|---|---|---|
| P-35 | **GitHub Education and Azure for Students use separate verification systems.** An approved GitHub Student Developer Pack does not confer Azure eligibility. CHG-0007 (P-30) described the Pack's Azure offer as an alternative verification route; that is incorrect and is corrected here — the Pack surfaces the same offer but Microsoft still runs its own check. | **High (corrects P-30)** |
| P-36 | The automated check fails when the institution is absent from Microsoft's database, when the academic domain is not linked, when the credit was previously redeemed, or when the region qualifies only for the creditless Starter plan. `nmims.in` (NMIMS / MPSTME) appears not to be matched by the automated check. | Medium |
| P-37 | Manual verification is available through Azure Education support (`aka.ms/AzureEduSupport`) on production of a student ID, enrolment confirmation or transcript. Turnaround is measured in days, not hours. | Informational |
| P-38 | **Phases 0 to 4 — approximately 8 days covering the baseline, socket client, PostgreSQL migration, the break/fix experiment and instrumentation — run entirely on local infrastructure and require no cloud subscription.** The verification delay therefore consumes schedule slack rather than critical path, provided the ticket is filed now and the local work proceeds in parallel. | **High (mitigating)** |

**Changes Made**
1. Phase 0 amended: the separate-verification-systems caveat recorded explicitly, manual-verification
   path named, and redemption reclassified from a gating exit criterion to a lead-time dependency.
2. **R-12 added** to the risk register: rated Medium (affects Phase 5 only), mitigated by filing the
   support ticket immediately, by the second team member (B118) attempting verification in parallel,
   and by the local-first phase ordering. Card-backed alternatives (Azure free trial, GCP) recorded
   as a last resort only, since adopting one forfeits the no-credit-card overspend protection that
   drove provider selection in CHG-0006 (P-22).

**Files Added**
- None

**Files Modified**
- `PLAN.md` (Phase 0 redemption step; risk register R-12)
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
Failure reproduced and captured from the signup flow on 2026-09-20 at 14:18 UTC. Causes and the
manual-verification path were checked against Microsoft Q&A and GitHub Community discussions dated
2026, including cases specifically reporting GitHub Education approval alongside Azure rejection,
which is the basis for the correction in P-35.

**Rollback Plan**
Remove R-12 and restore the Phase 0 wording. No code or infrastructure dependency.

**Follow-up Actions Raised**
1. File the manual-verification ticket at `aka.ms/AzureEduSupport` with student ID or enrolment proof.
2. Have B118 attempt verification independently; if it succeeds, the team uses that subscription.
3. Begin Phase 1 immediately — it is unaffected by the outcome.
4. Re-attempt with a personal Microsoft Account if the institutional tenant proves to be the obstacle.

---

### CHG-0010 — Working Copy Relocated Out of iCloud-Synced Desktop; Toolchain Hang Resolved

| Field | Value |
|---|---|
| **Change ID** | CHG-0010 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Development environment (backend and frontend runtime) |
| **Change Type** | Environment |
| **Risk Level** | Low |
| **Status** | Verified |
| **Resolves** | CHG-0003 follow-up action 1 (dev-server behaviour on Node 24) |

**Description**
The working copy at `~/Desktop/discord/wp_project` was slow to the point of appearing hung: the
backend took more than two minutes to print its startup line, individual `require()` calls
(`bcrypt`, `jsonwebtoken`, `multer`) timed out inconsistently, and an in-place `mv` of the
directory did not complete within two minutes. The pattern — slow first reads, no errors, eventual
success — is consistent with the Desktop folder being synced by iCloud Drive with file eviction
enabled. This was inferred from behaviour; the dataless-file check was not run.

The project was copied (not moved) to `~/dev/wp_project`, excluding `node_modules`, and
dependencies were reinstalled fresh in the new location.

**Findings**

| ID | Finding | Severity |
|---|---|---|
| E-01 | Backend startup: **>120 s** from `~/Desktop`, **<3 s** from `~/dev`. Same code, same Node v24.14.0. | High (resolved) |
| E-02 | **CRA (`react-scripts` 5.0.1) starts and serves on Node 24** — "Compiled successfully", HTTP 200 on :3000 in ~3 s. The CHG-0003 hang was environmental, not a toolchain defect. The case for Vite now rests on U-13 (CRA unmaintained) alone, not on breakage. | Medium |

**Changes Made**
1. `rsync -a --exclude node_modules` from `~/Desktop/discord/wp_project/` to `~/dev/wp_project/`.
2. `npm install` in `backend/` (217 packages) and `frontend/` (1469 packages).
3. The original at `~/Desktop/discord/wp_project` is left in place, untouched, pending owner sign-off.

**Files Added**
- None (repository content unchanged; only its location)

**Files Modified**
- `docs/CHANGE_LOG.md` (this entry and the register row) — in the `~/dev` copy only

**Verification**
- Non-`node_modules` file count identical in both locations (147 / 147); `git status --short`
  identical (20 entries), so the pre-existing uncommitted work in §3 carried over intact.
- Backend from `~/dev`: "Server running on port 5001" and "Database connected successfully".
- Frontend from `~/dev`: webpack "Compiled successfully", `<title>React App` served on :3000.

**Rollback Plan**
Continue working from `~/Desktop/discord/wp_project`, which is unmodified. Delete `~/dev/wp_project`.

**Follow-up Actions Raised**
1. Owner to confirm `~/dev/wp_project` as the working copy, then delete the Desktop original so the
   two do not diverge.
2. Decide CRA vs Vite on maintainability grounds (U-13) before Phase 1 UI work.
3. Update PLAN.md risk R-9 ("CRA on Node 24 does not build") — not observed; downgrade or close.

---

### CHG-0011 — Product Frontend Rebuilt (Auth, Friends, Text Channels, Themes); Backend Defects Fixed

| Field | Value |
|---|---|
| **Change ID** | CHG-0011 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Frontend (whole app); backend auth, friends, servers, channels, socket layer |
| **Change Type** | Feature + Defect fix |
| **Risk Level** | Medium (frontend replaced wholesale; socket contract changed) |
| **Status** | Verified |
| **Advances** | PLAN.md Phase 1 (real Socket.IO client, `sentAt` stamp, served-by-node badge) |

**Description**
The frontend was a landing page plus a simulated chat (`BroadcastChannel`, same-browser only) with a
separate AngularJS login page. It is replaced by a working product: sign-up and sign-in, friends by
username, spaces with text channels only, real-time messaging over Socket.IO, invite links, and a
light/dark theme toggle. The visual identity was deliberately moved away from Discord: a tree
sidebar (space → channels) instead of a server-icon rail, warm paper / warm charcoal palettes with a
forest-green accent instead of blurple, "Spaces" instead of "servers", and IBM Plex Sans / Serif /
Mono (self-hosted via `@fontsource`) instead of generic UI fonts. Working product name: **ChatScale**,
set once in `frontend/src/config.js`.

Email delivery of invites is a **placeholder**: `backend/src/services/inviteDelivery.js` is the
single seam where a free provider will be wired in. Until then the API returns `202` with
`delivered: false` and the UI states that nothing was sent.

**Defects found and fixed (backend)**

| ID | Defect | Impact |
|---|---|---|
| D-01 | `authRoutes.js` required `../controllers/AuthController`; file is `authController.js` | **Crash on any case-sensitive filesystem (Linux, Docker, AKS)** — would have surfaced in Phase 2 |
| D-02 | `voiceHandlers.js` required `voicechannelService`; file is `voiceChannelService.js` | Same as D-01 |
| D-03 | `socket.js` `join:channel` joined any room without a membership check | **Any authenticated user could read any channel's live messages** |
| D-04 | `message:send` emitted an undefined `messageId` after broadcasting | Every send raised a ReferenceError and reported failure to the sender |
| D-05 | `message:edit` / `message:delete` treated `getMessageById`'s object as an array; edit wrote a non-existent `EditDate` column | Edit and delete over the socket never worked |
| D-06 | Declining a friend request set status `Blocked` | Declining silently blocked the requester |
| D-07 | `db.js` shim passed `undefined` to SQLite | Creating a server without a description always returned 500 |
| D-08 | Invite codes from `Math.random()` | Guessable invite codes |
| D-09 | No input validation on register/login | Malformed input reached bcrypt and the database |

**Changes Made — backend**
1. Register validates username (`[a-z0-9_.]{3,24}`, stored lowercase), email format, password ≥ 8.
   Username and email lookups are case-insensitive (`LOWER()`, portable to Postgres).
2. Friends: `GET /friends` returns `direction` (`incoming` / `outgoing`) for pending requests;
   decline deletes the request; socket payloads carry the responder's real username.
3. Spaces: new spaces get one `general` text channel (no voice channel); name validated (≤ 60).
   Invite codes from `crypto.randomBytes`. Joining is idempotent (`alreadyMember` flag).
   New routes: `GET /servers/invites/:code` (preview) and `POST /servers/:id/invites/send` (placeholder).
4. Channels: names normalised to lowercase slugs; type defaults to `Text`; `channel:created` is
   broadcast to the `server:<id>` room.
5. Socket: `join:channel` / `join:server` gated on membership; `leave:channel` added; all message
   events use acknowledgement callbacks (`{ ok, error }`); `message:send` validates content
   (non-empty, ≤ 4000 chars) and passes through the client `sentAt`; typing events relayed only
   within admitted rooms; `session:ready` reports `os.hostname()` for the served-by-node badge.

**Changes Made — frontend**
- New: `config.js`, `lib/` (API client, socket, formatting), `context/` (Auth, Theme, Workspace),
  `components/` (AppLayout, Sidebar, Avatar, Modal, dialogs), `pages/` (Auth, Friends, Channel,
  Invite), `styles/app.css`. `App.js`, `index.js`, `App.test.js`, `public/index.html` and
  `manifest.json` rewritten. Dependencies added: `socket.io-client`, `@fontsource/ibm-plex-{sans,serif,mono}`.
- Theme follows the OS on first visit, persists in `localStorage`, and is applied by an inline
  script before first paint (no flash).
- Legacy components (Workspace, DirectMessage, Hero, Card, landing-page parts, `public/Login.html`,
  `register.html`, `auth.js`) are **no longer referenced but not deleted** — several are
  pre-existing uncommitted work (§3), so removal awaits owner sign-off. `index.css` is no longer
  imported and was left untouched for the same reason.

**Files Added**
- `backend/src/services/inviteDelivery.js`
- `frontend/src/config.js`, `frontend/src/lib/*`, `frontend/src/context/*`, `frontend/src/pages/*`,
  `frontend/src/styles/app.css`, `frontend/src/components/{AppLayout,Sidebar,Avatar,Modal,FormError,ThemeToggle,SpaceDialogs,InviteDialog}.js`

**Files Modified**
- Backend: `config/db.js`, `controllers/{auth,friend,server,channel}Controller.js`,
  `routes/{auth,server}Routes.js`, `services/userService.js`, `socket/{socket,messageHandlers,voiceHandlers}.js`
- Frontend: `App.js`, `App.test.js`, `index.js`, `package.json`, `package-lock.json`,
  `public/index.html`, `public/manifest.json`
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
- Backend smoke test against a throwaway database (`SQLITE_PATH` in a temp directory; the real
  `chat.sqlite` was not touched): **32/32 checks passed** — validation, case-insensitive
  identity, friend request/decline/accept, space creation, invite create/preview/send-placeholder/join
  (incl. idempotent rejoin), non-member denied `join:channel`, two-client real-time delivery with
  `sentAt` intact, empty-message rejection, cross-user delete denied, own edit/delete, channel slug
  and `channel:created` broadcast.
- Browser walkthrough (built-in browser, test backend): sign-up → friend request → live update on
  acceptance by a second client → create space → invite dialog (link + email placeholder) → second
  client joins by code → typing indicator → two-way real-time messages (multi-line preserved,
  measured local delivery 2 ms) → create channel → dark theme persisted across reload. Checked at
  phone width (drawer navigation) and 1280 px.
- `react-scripts build`: compiled with no lint warnings. Unit tests (`lib/format`): 3/3 pass.

**Known Limitations (not addressed here)**
1. `dmRoutes.js` endpoints have **no auth middleware** (pre-existing). DMs are not in this UI, but
   the API is exposed.
2. JWT stored in `localStorage` (XSS-readable); acceptable for now, revisit with httpOnly cookies.
3. `POST /auth/login` marks a user Online before any socket connects (pre-existing behaviour).
4. Socket CORS allows a single `CLIENT_URL` origin; a second dev port needs that variable changed.

**Rollback Plan**
Restore the modified files from git and delete the added files. The original tree also remains
intact at `~/Desktop/discord/wp_project` (CHG-0010).

**Follow-up Actions Raised**
1. Choose a free email provider and implement `inviteDelivery.sendInviteEmail`.
2. Owner decision on deleting the legacy frontend files and `public/*.html` AngularJS pages.
3. Add auth middleware to `dmRoutes.js`.
4. Confirm the product name (currently "ChatScale", one constant).

---

### CHG-0012 — Legacy Frontend Removed; Frontend Restructured; README Rewritten

| Field | Value |
|---|---|
| **Change ID** | CHG-0012 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Frontend (file layout, dependencies, assets); root README |
| **Change Type** | Refactor / Removal |
| **Risk Level** | Low (no behaviour change) |
| **Status** | Verified |
| **Resolves** | CHG-0011 follow-up action 2 (owner approved deletion of legacy frontend files) |

**Description**
With the owner's approval, every frontend file left unreferenced by CHG-0011 was deleted, unused
tooling was removed, and the remaining source was reorganised so each folder has one job and each
file holds one component. No behaviour changed.

**Removed**

| Item | Notes |
|---|---|
| `src/components/`: Card, CreateServer, DirectMessage, Discover, Featured, Groups, Hero, Home, MainComponent, OnlineFriendsList, OtherUserProfile, StaticChatPage, Topic, `try.html` | Landing page and simulated chat |
| `src/components/Workspace.js`, `src/services/realtimeWorkspace.js`, `src/services/workspaceStore.js` | **Untracked pre-existing work (§3).** Not recoverable from git; byte-identical copies remain at `~/Desktop/discord/wp_project` (verified with `cmp` before deletion) |
| `src/services/dmService.js`, `src/photos/` (18 images), `App.css`, `index.css`, `logo.svg`, `reportWebVitals.js` | Unused |
| `public/Login.html`, `public/register.html`, `public/auth.js` | Standalone AngularJS login pages |
| `public/favicon.ico`, `logo192.png`, `logo512.png` | React logos; replaced by `public/favicon.svg` |
| `tailwind.config.js`, `postcss.config.js`; npm: `tailwindcss`, `postcss`, `autoprefixer`, `web-vitals` | The new UI uses plain CSS custom properties |
| `frontend/README.md` | Create React App boilerplate; superseded by the root README |
| `frontend/build/` | Stale, git-ignored build output |

**Restructure**

| Before | After |
|---|---|
| `pages/AuthPages.js` (3 components) | `pages/auth/{AuthLayout,LoginPage,RegisterPage}.js` |
| `pages/ChannelPage.js` (~360 lines, 4 components) | `pages/channel/{ChannelPage,SpacePage,MessageList,Composer,TypingLine}.js` |
| `pages/FriendsPage.js` | `pages/friends/{FriendsPage,PersonRow}.js` |
| `pages/InvitePage.js` | `pages/invite/InvitePage.js` |
| `components/SpaceDialogs.js` (3 dialogs + hook) | `dialogs/{CreateSpaceDialog,JoinSpaceDialog,CreateChannelDialog,useSubmit}.js`; `InviteDialog.js` moved alongside |
| `components/{AppLayout,Sidebar}.js` | `layout/{AppLayout,Sidebar,SpaceItem}.js` |
| Route guards inside `App.js` | `routes/RouteGuards.js`; `App.js` is now only the route map |
| `App.test.js` | `lib/format.test.js`, next to the code it tests |
| `styles/app.css` (~1,000 lines) | `styles/index.css` importing `tokens`, `base`, `controls`, `layout`, `pages`, `channel`, `modal`, `auth`, `responsive` — same rules, same order |

Convention recorded in the README: a component used by one screen lives in that screen's folder
and moves to `components/` only when a second screen needs it.

**Files Modified**
- `README.md` — rewritten: what the product is, how to run it, a map of the tree, conventions,
  and the real-time event contract. The previous text described MySQL, which the project has not used.
- `frontend/src/index.js`, `App.js`, `public/index.html`, `public/manifest.json`, `package.json`, `package-lock.json`
- `docs/CHANGE_LOG.md` (this entry and the register row)

**Verification**
- `react-scripts build`: compiled, no lint warnings. Unit tests: 3/3 pass.
- Browser run against a throwaway backend: sign-up → create space → send message → message
  rendered live, connection badge "Live", SVG favicon served.

**Rollback Plan**
Tracked files: `git checkout` / `git restore`. The three untracked files: copy back from
`~/Desktop/discord/wp_project/frontend/src/`. Then `npm install tailwindcss postcss autoprefixer web-vitals`.

**Follow-up Actions Raised**
1. Once the owner confirms `~/dev/wp_project`, the Desktop original — now the only copy of the
   three untracked files above — may be deleted; after that they are gone for good.

---

### CHG-0013 — Secrets Removed from Version Control; JWT Secret Rotated

| Field | Value |
|---|---|
| **Change ID** | CHG-0013 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 (files); git index change pending owner |
| **Author** | Parth |
| **Module / Component** | Backend configuration |
| **Change Type** | Security |
| **Risk Level** | Low |
| **Status** | Implemented — `git rm --cached backend/.env` to be run by owner |

**Description**
Ahead of pushing the repository to the owner's new remote (`parthparu/cloud`), `backend/.env` was
found to be **tracked in git** (4 commits). Its history contains `JWT_SECRET` and a legacy MySQL
password, and the working copy was still using that same JWT secret, so anyone with repository
access could forge login tokens.

**Changes Made**
1. `JWT_SECRET` in the local `backend/.env` replaced with a fresh 48-byte random value (value not
   recorded anywhere). Existing sessions are invalidated once; users sign in again.
2. `backend/.gitignore`: ignores `.env`, `/data` (SQLite database) and `/src/uploads`.
3. `backend/.env.example` added with placeholder values and generation instructions.
4. `README.md` run steps now start from `.env.example`.

**Residual Risk**
The old secret and MySQL password **remain in git history** and will be visible in any remote that
receives this history. They are now dead values: the JWT secret is rotated and MySQL is no longer
used. Purging history (e.g. `git filter-repo`) is possible but rewrites every commit; not done.

**Files Added / Modified**
- Added: `backend/.env.example`
- Modified: `backend/.gitignore`, `backend/.env` (local only, untracked after the owner's `git rm --cached`), `README.md`, `docs/CHANGE_LOG.md`

**Verification**
Hash comparison confirms the local secret no longer matches the committed one;
`git check-ignore` confirms `backend/data/chat.sqlite` is ignored.

**Rollback Plan**
Not recommended. Restore `.gitignore` from git to re-expose the files.

---

### CHG-0014 — Single Root .gitignore

| Field | Value |
|---|---|
| **Change ID** | CHG-0014 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Repository configuration |
| **Change Type** | Process |
| **Risk Level** | Low |
| **Status** | Verified |
| **Supersedes** | The `.gitignore` part of CHG-0013 |

**Description**
Ignore rules were split across `backend/.gitignore` and `frontend/.gitignore` (the Create React App
default). They are consolidated into one commented root `.gitignore` for the new repository
`parthparu/cloud`, and the two per-folder files are removed.

**Covers:** dependencies; `.env` / `.env.*` (with `.env.example` explicitly kept); `backend/data/`
and `backend/src/uploads/`; `frontend/build/` and coverage; logs; OS and editor files;
`.claude/settings.local.json`; `graphify-out/`.

**Files Added / Removed**
- Added: `.gitignore`
- Removed: `backend/.gitignore`, `frontend/.gitignore`
- Modified: `docs/CHANGE_LOG.md`

**Verification**
`git check-ignore` confirms `backend/.env`, `backend/data/chat.sqlite`, both `node_modules`,
`frontend/build/` and `.DS_Store` are ignored, and `backend/.env.example` is not.

**Rollback Plan**
Restore the two per-folder files from git and delete the root file.

---

### CHG-0015 — Two-Step Verification (Authenticator App) Added

| Field | Value |
|---|---|
| **Change ID** | CHG-0015 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Backend auth; frontend sign-in and new Security settings page |
| **Change Type** | Feature (security) |
| **Risk Level** | Medium (changes the sign-in path) |
| **Status** | Verified |

**Description**
Optional per-account two-step verification using time-based one-time passwords (TOTP, RFC 6238) —
the six-digit codes shown by Google Authenticator, 1Password, Authy and similar. Chosen over SMS
(paid) and email codes (no email provider yet, see CHG-0011) because it is free, works offline and
is the industry default.

**Design**

| Concern | Decision |
|---|---|
| Algorithm | RFC 6238, HMAC-SHA1, 30 s steps, 6 digits, ±1 step drift. Implemented on `node:crypto` (~70 lines) rather than a dependency; verified against the RFC 6238 test vector |
| Sign-in | Password step returns a 5-minute `typ: 2fa` challenge JWT, not a session. `POST /auth/login/2fa` exchanges it plus a code for an access token. `utils/tokens.js` makes the REST middleware and socket handshake reject challenge tokens |
| Secret storage | AES-256-GCM (`utils/secretBox.js`) keyed by new env var `TWO_FACTOR_KEY`; a copied database alone cannot generate codes. Placeholder or short keys are refused |
| Replay | Last accepted time step stored per user; reusing a code is refused with a distinct "wait for a new code" message and is not counted as a failure |
| Brute force | 5 wrong codes per challenge, then restart; 10 per account per 15 minutes across challenges |
| Recovery | 10 single-use codes (`xxxxx-xxxxx`, no ambiguous characters), SHA-256 hashed, shown once; remaining count shown in settings, warning at ≤ 2 |
| Sensitive changes | Turning 2FA off or regenerating recovery codes requires the password **and** a current or recovery code |

**Changes Made — backend**
- New: `utils/totp.js`, `utils/secretBox.js`, `utils/tokens.js`, `services/twoFactorService.js`,
  `controllers/twoFactorController.js`.
- `config/db.js`: columns `Users.TwoFactorSecret`, `TwoFactorEnabled`, `TwoFactorLastStep` and table
  `RecoveryCodes`, via an idempotent add-missing-columns migration so existing databases upgrade in
  place (already applied to the local `chat.sqlite`; additive only).
- `authController.js`: login branches on 2FA; JWT creation moved to `utils/tokens.js`; `/auth/me`
  and sign-in responses include `twoFactorEnabled`.
- `middleware/auth.js`, `socket/socket.js`: use `verifyAccessToken`.
- Routes: `POST /auth/login/2fa`, `GET /auth/2fa`, `POST /auth/2fa/{setup,enable,disable,recovery-codes}`.
- Dependency: `qrcode` (server-side QR PNG returned as a data URL).
- `.env.example` documents `TWO_FACTOR_KEY`; a random key was generated into the local `.env`.

**Changes Made — frontend**
- `pages/auth/TwoFactorStep.js`; `LoginPage.js` shows it after the password step (authenticator code
  or recovery code; returns to the password step when the challenge is spent).
- `pages/settings/`: `SecurityPage`, `TwoFactorSetup` (QR, manual key, confirm), `RecoveryCodes`
  (copy, download .txt, "I've saved them" gate), `ConfirmIdentityForm`.
- Route `/settings/security`; shield link in the sidebar footer; `styles/settings.css`.
- `AuthContext`: `login` reports when a code is required; adds `completeTwoFactor`, `updateUser`.
  `ApiError` now carries the response body (used for the server's `restart` flag).

**Files Added**
- `backend/src/utils/{totp,secretBox,tokens}.js`, `backend/src/services/twoFactorService.js`,
  `backend/src/controllers/twoFactorController.js`
- `frontend/src/pages/auth/TwoFactorStep.js`, `frontend/src/pages/settings/*`, `frontend/src/styles/settings.css`

**Files Modified**
- Backend: `config/db.js`, `controllers/authController.js`, `middleware/auth.js`, `routes/authRoutes.js`,
  `socket/socket.js`, `package.json`, `package-lock.json`, `.env.example`
- Frontend: `App.js`, `context/AuthContext.js`, `lib/api.js`, `layout/Sidebar.js`,
  `pages/auth/{AuthLayout,LoginPage}.js`, `styles/index.css`
- `README.md`, `docs/CHANGE_LOG.md`

**Verification**
- RFC 6238 test vector passes; AES-GCM round-trip passes.
- 2FA API test on a throwaway database: **24/24** — setup and QR, enable, challenge-only password
  step, challenge token refused by REST and socket, wrong-code countdown, success, reuse refused
  with a clear message, recovery code (case-insensitive) and single use, both attempt caps, disable
  and regenerate gated on password + code, non-2FA users unaffected.
- Original backend suite re-run: **32/32**.
- Browser: enabled via the Security page, recovery-code gate, sign out, wrong code
  ("4 tries left"), correct code returns to the originating page, recovery-code sign-in decrements
  the remaining count.
- `react-scripts build` clean.

**Known Limitations**
1. Attempt counters live in process memory: they reset on restart and become per-pod once the
   backend scales out. Move to Redis alongside the Socket.IO adapter in PLAN.md Phase 3.
2. No "trust this device" option — every sign-in asks for a code.
3. Rotating `TWO_FACTOR_KEY` makes stored secrets unreadable; affected users would need 2FA reset.

**Rollback Plan**
Revert the listed files. The added columns and table are ignored by the old code and can stay.

**Follow-up Actions Raised**
1. PLAN.md Phase 3: move the attempt-limiter state to Redis.
2. Offer email codes as an alternative second factor once an email provider exists (CHG-0011).

---

### CHG-0016 — Scaling Failure Reproduced with Two Backend Copies (Local)

| Field | Value |
|---|---|
| **Change ID** | CHG-0016 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Socket layer (instrumentation); experiment evidence |
| **Change Type** | Experiment + Instrumentation |
| **Risk Level** | Low |
| **Status** | Verified |
| **Advances** | PLAN.md Phase 3a (reproduced on a laptop ahead of the Kubernetes version) |

**Description**
The core failure of the thesis was reproduced without containers: two backend processes
(`copy-A` :5001, `copy-B` :5002) sharing one database, two browsers each connected to a different
copy. A message sent through `copy-A` was stored in the database and delivered to `copy-A`'s own
socket only; the user on `copy-B` never received it live. Full record in
`docs/evidence/01-two-copies-break.md`.

**Changes Made**
1. `config/instance.js` (new): `INSTANCE_NAME` env var, defaulting to the hostname (a pod's name
   under Kubernetes). Kept in its own module to avoid a circular import between `socket.js` and
   `messageHandlers.js`.
2. `session:ready` reports the instance name, so the app's "Live · …" badge distinguishes copies on one machine.
3. Connect/disconnect logs are prefixed with the instance name; each broadcast logs how many
   sockets **this** copy delivered to — the evidence that other copies are never reached.

**Files Added / Modified**
- Added: `backend/src/config/instance.js`, `docs/evidence/01-two-copies-break.md`
- Modified: `backend/src/socket/socket.js`, `backend/src/socket/messageHandlers.js`, `README.md`, `docs/CHANGE_LOG.md`

**Verification**
Browser run: ava on `copy-A` ("Live · copy-A"), milo on `copy-B` ("Live · copy-B"). ava's
message appeared for ava only; `copy-A` logged `delivered to 1 socket(s) on this copy`; `copy-B`
logged nothing; the row was present in `Messages` (ID 3).

**Rollback Plan**
Revert the two socket files; the logging has no functional effect.

---

### CHG-0017 — PostgreSQL Support (Supabase-Ready); Database Layer Split by Driver

| Field | Value |
|---|---|
| **Change ID** | CHG-0017 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Backend data layer; server start-up |
| **Change Type** | Feature / Refactor |
| **Risk Level** | Medium (every query now runs through a translation layer on PostgreSQL) |
| **Status** | Verified locally — Supabase connection pending owner's project setup |
| **Advances** | PLAN.md Phase 2 (blocker B-2: per-machine SQLite) |

**Description**
The backend can now run on PostgreSQL, chosen by `DATABASE_URL`; without it, the local SQLite file
is used as before. This removes blocker B-2 (each copy on a separate machine would have its own
database) and lets the project use **Supabase** as a free managed PostgreSQL. Only Supabase's
database is used: its Realtime would replace Socket.IO (the subject of the experiment) and its Auth
would duplicate CHG-0011/CHG-0015.

**Design**

| Concern | Decision |
|---|---|
| One code path | Services are unchanged. Both drivers implement the existing mysql2-style `execute(sql, params)` → `[rows]` / `[{ insertId, affectedRows }]` |
| Placeholders | `?` → `$1..$n` in the PostgreSQL driver |
| Insert IDs | `RETURNING <primary key>` appended to INSERTs; keys read from the shared schema |
| Identifier case | PostgreSQL folds unquoted names to lower case. Rows are renamed back to their schema spelling (`userid` → `UserID`) and to any `AS Alias` in the query — no query rewrites needed |
| Schema | Written once (`config/schema.js`, SQLite dialect); PostgreSQL gets `GENERATED BY DEFAULT AS IDENTITY` for auto-increment. Added columns use `ADD COLUMN IF NOT EXISTS` |
| Supabase public API | Supabase exposes the `public` schema over REST. Every table gets **row-level security** with no policies, so that API can read nothing; the backend connects as the table owner, which RLS does not restrict |
| Demo data | Seeded by default only for SQLite. Never for PostgreSQL unless `SEED_DEMO_DATA=true` — the demo password is in source |
| TLS | Required for remote hosts. `DATABASE_CA_CERT` enables certificate verification; without it the connection is encrypted but unverified, and the start-up log says so |
| Start-up | `.env` now loads before any module (previously after, so `SQLITE_PATH` from `.env` was silently ignored); the server listens only after `db.ready` resolves |
| Credentials in logs | Only host, port and database name are ever logged |

**Also changed**
- `dmService.js`: `IsGroup = true` → `IsGroup = 1` (integer/boolean comparison is an error in PostgreSQL).
- Seed no longer creates a voice channel or DM (neither is part of the product); seed text neutralised.
- Removed unused dependencies `mysql2` (PLAN.md P-03) and `bcrypt` (only `bcryptjs` is used). Added `pg`.
- `.env.example` documents `DATABASE_URL`, `DATABASE_CA_CERT`, `SEED_DEMO_DATA`; `.gitignore` ignores `backend/certs/`.

**Files Added**
- `backend/src/config/schema.js`, `backend/src/config/seed.js`, `backend/src/config/db/sqlite.js`, `backend/src/config/db/postgres.js`

**Files Modified**
- `backend/src/config/db.js` (now a 20-line driver selector), `backend/server.js`,
  `backend/src/services/dmService.js`, `backend/package.json`, `backend/package-lock.json`,
  `backend/.env.example`, `.gitignore`, `README.md`, `docs/CHANGE_LOG.md`

**Verification**
- Local PostgreSQL 16 (throwaway Docker container, since removed): original suite **32/32**,
  two-factor suite **24/24**; no demo users created; RLS enabled on **14 of 14** tables.
- SQLite: both suites re-run, **32/32** and **24/24**; demo data seeded.
- The two running copies (`copy-A`, `copy-B`) restarted on the new layer against the existing
  `chat.sqlite` without data loss.

**Known Limitations**
1. Dates remain ISO-8601 `TEXT` (not `TIMESTAMPTZ`) to keep both dialects identical; revisit if
   time-based queries are needed.
2. No data migration from the local SQLite file — a Supabase database starts empty.
3. The `?` → `$n` rewrite assumes no literal `?` inside SQL strings (true for every current query).

**Rollback Plan**
Unset `DATABASE_URL` to return to SQLite immediately. To revert the code, restore the previous
`config/db.js` and `server.js` from git.

**Follow-up Actions Raised**
1. Owner: create the Supabase project and set `DATABASE_URL` (steps given in the session).
2. Download Supabase's CA certificate and set `DATABASE_CA_CERT` to verify the connection.

---

### CHG-0018 — Faculty Demo Script and Guide; Two Start-up Races Fixed

| Field | Value |
|---|---|
| **Change ID** | CHG-0018 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Demo tooling; SQLite driver; seed |
| **Change Type** | Tooling + Defect fix |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Packages the two-copy failure (CHG-0016) as a repeatable five-minute presentation for faculty, and
fixes two defects found while making it reliable.

**Changes Made**
1. `scripts/demo-two-copies.sh`: one command starts `copy-A` (:5001) + frontend :3000 and `copy-B`
   (:5002) + frontend :3001; refuses to start if a port is busy; shows only instance-tagged and
   database lines; full logs to `.demo-logs/` (git-ignored); Ctrl-C stops every process it started.
2. `docs/DEMO.md`: preparation, projector layout, a step-by-step script with what to say, how to show
   the stored row (SQLite or Supabase Table Editor), likely questions with answers, troubleshooting.
3. **Defect — "database is locked" on simultaneous start.** Observed live: `copy-B` crashed at
   start-up (`ERR_SQLITE_ERROR`, errcode 261) when both copies opened the shared SQLite file at once.
   Fix: 5-second busy timeout (`DatabaseSync({ timeout })` + `PRAGMA busy_timeout`).
4. **Defect — duplicate seed on a fresh database.** Found by stress test: two copies starting on
   an empty database both attempted to seed; the loser crashed on `UNIQUE(Users.Email)`, stopping
   the server. Fix: the first user insert decides the winner; a unique-constraint error there
   (SQLite message or PostgreSQL `23505`) means another copy seeded, and this copy continues.

**Files Added / Modified**
- Added: `scripts/demo-two-copies.sh`, `docs/DEMO.md`
- Modified: `backend/src/config/db/sqlite.js`, `backend/src/config/seed.js`, `.gitignore`,
  `README.md`, `docs/CHANGE_LOG.md`

**Verification**
- Demo script run in the terminal panel: both copies and frontends up, "Ready." banner, existing
  browser sessions reconnected (`[copy-A] … ava`, `[copy-B] … milo`).
- Stress test: 10 rounds × 4 processes starting simultaneously on a fresh SQLite file — before the
  fixes, lock and duplicate-seed failures; after, **0 failures**, demo data created exactly once
  (3 users, 1 space, 2 messages).

**Rollback Plan**
Delete the script and guide; revert the two backend files.

---

### CHG-0019 — PostgreSQL Schema Setup Serialised Across Copies

| Field | Value |
|---|---|
| **Change ID** | CHG-0019 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | PostgreSQL driver (`config/db/postgres.js`) |
| **Change Type** | Defect fix |
| **Risk Level** | Low |
| **Status** | Verified |
| **Related** | CHG-0017, CHG-0018 (same class of race, SQLite) |

**Description**
First run of the demo script against **Supabase** (both copies starting together on an empty
database): `copy-A` created the schema; `copy-B` exited with
`duplicate key value violates unique constraint "pg_class_relname_nsp_index"`. Concurrent
`CREATE TABLE IF NOT EXISTS` is not atomic in PostgreSQL — both sessions pass the existence check,
and the second fails on the system catalog.

**Fix**
Schema setup runs on one dedicated connection holding a session-level advisory lock
(`pg_advisory_lock(7310001)`); other copies block until it is released, then find every table
present. Released in `finally`. Session-mode poolers (Supabase *Session pooler*) support this.

**Finding for the report**
Starting several copies at once is the normal case under Kubernetes (a Deployment starts replicas
in parallel), so start-up must be safe under concurrency — not only request handling. Kubernetes
alternatives (an init Job or a separate migration step) are noted for PLAN.md Phase 3.

**Files Modified**
- `backend/src/config/db/postgres.js`, `docs/CHANGE_LOG.md`

**Verification**
Local PostgreSQL 16 (throwaway container): 8 rounds × 4 processes starting simultaneously on a
freshly emptied schema — **0 failures**, 14/14 tables each round. Supabase connection confirmed from
`copy-A`'s log (`aws-0-ap-south-1.pooler.supabase.com`, TLS).

**Rollback Plan**
Revert `init()` to per-statement `pool.query`; start copies one at a time.

---

### CHG-0020 — Invite to a Space by Username

| Field | Value |
|---|---|
| **Change ID** | CHG-0020 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Backend invitations API; sidebar; invite dialog |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |
| **Relates to** | CHG-0011 (invite link + email placeholder) |

**Description**
Members can invite a specific person to a space by username — a free, in-app alternative to the
email placeholder. The person must accept; nobody is added to a space without consent.

**Behaviour**
- Invite dialog: **Invite by username** first (friends offered as suggestions), then the share
  link, then the email placeholder.
- The invitee gets `invitation:new` over their socket; the invitation appears at the top of their
  sidebar with ✓ (join, opens the space) and ✕ (decline).
- Rules: only members can invite; no self-invites; no invitations to existing members; one
  pending invitation per person per space; re-inviting after a decline is allowed.
- Blocks: if either person has blocked the other, the response is the same generic
  "Couldn't invite …" as for an unknown username, so a block is never revealed.
- Only the invitee can accept or decline (others get 404).

**Changes Made**
- Schema: table `SpaceInvitations` (`UNIQUE(ServerID, InviteeID)`, cascades on space/user delete);
  a row exists only while pending.
- Backend: `services/invitationService.js`, `controllers/invitationController.js`,
  `routes/invitationRoutes.js` mounted at `/api/invitations` (`GET /`, `POST /`,
  `POST /:id/accept`, `DELETE /:id`) — a separate prefix so nothing collides with `/servers/:serverId`.
- Frontend: `WorkspaceContext` holds invitations (loaded on sign-in, updated live);
  `layout/InvitationList.js`; `dialogs/InviteByUsername.js`; styles in `layout.css`.
- `docs/DEMO.md` preparation simplified to invite-by-username; `README.md` updated.

**Files Added**
- `backend/src/services/invitationService.js`, `backend/src/controllers/invitationController.js`,
  `backend/src/routes/invitationRoutes.js`, `frontend/src/layout/InvitationList.js`,
  `frontend/src/dialogs/InviteByUsername.js`

**Files Modified**
- `backend/src/config/schema.js`, `backend/server.js`, `frontend/src/context/WorkspaceContext.js`,
  `frontend/src/layout/Sidebar.js`, `frontend/src/dialogs/InviteDialog.js`,
  `frontend/src/styles/layout.css`, `docs/DEMO.md`, `README.md`, `docs/CHANGE_LOG.md`

**Verification**
- Invitation API suite **17/17 on SQLite and 17/17 on PostgreSQL**: case-insensitive username,
  live socket notification, duplicate/self/member/non-member rules, generic response for unknown
  and blocked users, only the invitee can accept, membership only after accepting, decline and re-invite.
- Regression on both databases: core 32/32, two-factor 24/24.
- Browser: invitation appeared in the sidebar without refresh; ✓ joined and opened
  Demo Day #general; invite dialog suggested a friend, focused the username field, and sent the
  invitation (confirmed from the invitee's side).
- `react-scripts build` clean.

**Rollback Plan**
Remove the route mount and the new files; the table can stay.

---

### CHG-0021 — Email Invite Placeholder Removed; Demo Guidance; Test Data Written to Supabase (Incident)

| Field | Value |
|---|---|
| **Change ID** | CHG-0021 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Invite dialog; server routes; demo guide; test procedure |
| **Change Type** | Removal + Incident record |
| **Risk Level** | Low |
| **Status** | Implemented — test-data cleanup in Supabase pending owner approval |
| **Supersedes** | Email placeholder from CHG-0011 |

**1. Email invite removed (owner request)**
Invite by username (CHG-0020) replaces it. Removed: the "Send by email" section of the invite
dialog, `POST /servers/:serverId/invites/send`, `serverController.sendInvite`,
`services/inviteDelivery.js`, and the now-unused `.placeholder-block` and `.badge` styles.
The invite dialog is now: invite by username, or share a link.

**2. "It's not broken any more" — investigated, still broken (as intended)**
Owner observed Bob seeing Alice's message in the demo. Logs showed every broadcast still
`delivered to 1 socket(s) on this copy`, with repeated `User disconnected` / `User connected`
pairs for both users: the pages were **reloading** (frontend hot-reload during code edits, and
Chrome sleeping/reloading background tabs, as Alice and Bob were tabs in one window). A reload
reads history from the database, so the message appeared without having been delivered live.
`docs/DEMO.md` now requires two side-by-side windows, no refreshing until step 8, and no code
edits during the demo; its troubleshooting table explains how to recognise a reload in the logs.
The same session's `Request failed (404)` came from demo backends started before
`/api/invitations` existed (backends don't hot-reload); added to troubleshooting.

**3. Incident: automated test data written to the owner's Supabase database**
- **What:** After the owner added `DATABASE_URL` to `backend/.env`, test servers started for
  CHG-0020 and this change loaded `.env` and connected to **Supabase** instead of a throwaway
  SQLite file (`SQLITE_PATH` alone doesn't select SQLite once `DATABASE_URL` is set).
- **Impact:** 11 test users (`inv_*`, `*_t`, `ui_*`) and 3 test spaces ("Demo Day" ×2,
  "Test Space") with their channels, messages and invitations were created in Supabase. The
  owner's data (users `alice`, `bob`; space "demo day") was not modified and no test user joined it.
- **Correction to CHG-0020:** its "17/17 on SQLite" run actually ran against Supabase
  (PostgreSQL). The suites have now been re-run on genuine local SQLite: core 31/31,
  invitations 17/17, two-factor 24/24.
- **Prevention:** test servers are now started with `DATABASE_URL=` (empty), which forces
  SQLite regardless of `.env`; the start-up line `[db] ready: SQLite (…)` is checked before tests run.
- **Cleanup:** listed to the owner; deletion awaits approval.

**Files Modified / Removed**
- Removed: `backend/src/services/inviteDelivery.js`
- Modified: `frontend/src/dialogs/InviteDialog.js`, `frontend/src/styles/modal.css`,
  `frontend/src/styles/controls.css`, `backend/src/routes/serverRoutes.js`,
  `backend/src/controllers/serverController.js`, `docs/DEMO.md`, `README.md`, `docs/CHANGE_LOG.md`

**Verification**
`react-scripts build` clean; suites on local SQLite all pass (above); the removed endpoint returns 404.

---

### CHG-0022 — Incident Closed: Test Data Removed from Supabase

| Field | Value |
|---|---|
| **Change ID** | CHG-0022 |
| **Date Raised** | 2026-09-26 |
| **Date Implemented** | 2026-09-26 |
| **Author** | Parth |
| **Module / Component** | Supabase database (data only) |
| **Change Type** | Data cleanup |
| **Risk Level** | Low |
| **Status** | Verified |
| **Closes** | CHG-0021 §3 |

**Description**
With the owner's approval, the test data written to Supabase (CHG-0021) was deleted in a single
transaction. Guards, each of which would have rolled back everything: exactly 11 named test users
found; exactly 3 spaces owned by them; no membership or channel of a test user in any other space.

**Deleted**
- Users: `inv_alice`, `inv_bob`, `inv_carl`, `inv_dora`, `alice_t`, `bob_t`, `erin_t`, `finn_t`,
  `ui_alice`, `ui_bob`, `ui_carl` (their friendships, memberships, messages, invitations and
  recovery codes removed by cascade).
- Spaces: "Demo Day" #2, "Test Space" #3, "Demo Day" #4 (channels, messages, invite links,
  invitations by cascade).

**State afterwards (verified by query)**
Users `alice`, `bob`; one space, "demo day" (owner bob, 2 members, 2 messages); 1 friendship;
0 pending invitations; 5 invite links (all for "demo day"); 0 recovery codes. Counts before:
13 users, 4 spaces, 2 messages — the owner's messages were unaffected.

**Rollback Plan**
None needed; the deleted rows were test data only.

---

### CHG-0023 — The Fix: Redis Adapter Behind a Switch; Shared Counters; Demo Part 2

| Field | Value |
|---|---|
| **Change ID** | CHG-0023 |
| **Date Raised** | 2026-09-27 |
| **Date Implemented** | 2026-09-27 |
| **Author** | Parth |
| **Module / Component** | Socket layer; two-factor limits; SQLite start-up; demo tooling; channel UI |
| **Change Type** | Feature (experiment) + Defect fix |
| **Risk Level** | Medium (changes how every broadcast is delivered when enabled) |
| **Status** | Verified |
| **Advances** | PLAN.md Phase 3b; closes CHG-0015 limitation 1 |

**Description**
Implements the fix for blocker B-1. With `REDIS_URL` set, Socket.IO uses the official
`@socket.io/redis-adapter`, so every copy delivers every broadcast to its own users. Without
`REDIS_URL` the in-memory adapter is kept, so the original failure stays reproducible from the same
code — the experiment is a switch, not a code change. Redis is run as **Valkey 8** (open-source).

**Changes Made**
1. `socket/adapter.js` (new): connects publisher and subscriber clients, installs the adapter,
   fails start-up with a clear message if Redis is unreachable; exposes the command client.
   `server.js` waits for both the database and the adapter before listening.
2. Delivery log now reports reach across copies via `fetchSockets()`
   (`… on this copy + N on other copies via Redis`), asynchronously after the emit;
   `LOG_DELIVERY=false` disables it for load tests.
3. `utils/counters.js` (new): short-lived counters in Redis when configured, else in memory.
   Two-factor wrong-code limits (per challenge and per account) use it, so the budget is shared by
   all copies and survives restarts.
4. Channel UI: someone else's message arriving over the socket is briefly highlighted
   (`.msg--live`), distinguishing live delivery from history loaded by a reload.
5. `scripts/demo-two-copies.sh --fixed`: starts Valkey in Docker (`chatscale-demo-valkey`, :6379),
   passes `REDIS_URL` to both copies, banner states the mode, container removed on exit.
   Default mode explicitly passes an empty `REDIS_URL`, so it stays broken even if `.env` gains one.
6. `docs/DEMO.md` part 2 (the fix, with script and questions); `docs/evidence/02-redis-fix.md`.
7. Dependencies: `@socket.io/redis-adapter` 8.3, `redis` 4.7.

**Defects fixed (SQLite, found while testing two copies on fresh files)**
- **D-10:** `PRAGMA journal_mode = WAL` failed with "database is locked" when two copies created a
  file together — the mode switch needs exclusive access and ignores the busy timeout. Now skipped
  when the file is already WAL, retried briefly otherwise.
- **D-11:** both copies could see the 2FA columns missing and both `ALTER TABLE`, crashing the
  second ("SQL logic error"). Schema setup now runs in one `BEGIN IMMEDIATE` transaction.
- Stress test: 25 rounds × 4 simultaneous starts on fresh files — before: 10 failures in 60;
  after: **0 in 100**.

**Verification**
- Cross-copy test (Alice on copy-A, Bob on copy-B): without Redis — message and friend request
  **not** delivered; with Redis — both delivered, message in **6 ms**.
- Shared 2FA budget: 3 wrong codes on copy-A + 2 on copy-B, then a 6th — **429 with Redis**,
  still accepted without (per-copy counts).
- Full suites, with and without Redis: core 31/31, invitations 17/17, two-factor 24/24.
- Browser, `--fixed` demo (port-shifted test copy, scratch database — the owner's running demo and
  Supabase untouched): milo's page, verified not reloaded, received ava's message **7 ms** after
  send, highlighted live; log showed `+ 1 on other copies via Redis`. Ctrl-C removed the container.
- `react-scripts build` clean.

**Files Added**
- `backend/src/socket/adapter.js`, `backend/src/utils/counters.js`, `docs/evidence/02-redis-fix.md`

**Files Modified**
- `backend/server.js`, `backend/src/socket/messageHandlers.js`, `backend/src/controllers/twoFactorController.js`,
  `backend/src/config/db/sqlite.js`, `backend/package.json`, `backend/package-lock.json`, `backend/.env.example`,
  `frontend/src/pages/channel/ChannelPage.js`, `frontend/src/pages/channel/MessageList.js`,
  `frontend/src/styles/channel.css`, `scripts/demo-two-copies.sh`, `docs/DEMO.md`, `README.md`, `docs/CHANGE_LOG.md`

**Known Limitations / next measurements**
1. Redis is now a single point of failure for cross-copy delivery (chaos test, PLAN.md Phase 8).
2. The Redis hop's latency cost needs measuring under load and against a managed Redis (Phase 6).
3. Classic (non-sharded) pub/sub adapter chosen for compatibility with Valkey and managed Redis
   free tiers; sharded pub/sub is a later optimisation.

**Rollback Plan**
Unset `REDIS_URL` — behaviour returns to the in-memory adapter immediately. Tag `demo-break-v1`
holds the pre-fix code.

---

### CHG-0024 — Redis Watcher for Demos; Copies Register Their Names in Redis

| Field | Value |
|---|---|
| **Change ID** | CHG-0024 |
| **Date Raised** | 2026-09-27 |
| **Date Implemented** | 2026-09-27 |
| **Author** | Parth |
| **Module / Component** | Demo tooling; socket adapter |
| **Change Type** | Tooling |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Redis pub/sub messages are delivered and gone, so there is nothing to inspect afterwards and generic
tools (`MONITOR`, RedisInsight) show them as MessagePack binaries. For the faculty demo,
`backend/scripts/watch-redis.js` (`npm run watch-redis`) subscribes to the adapter's channels,
decodes each broadcast and prints it in plain words — which copy sent it, the event, who it is for,
and the content — plus the shared two-factor counters as they change.

**Changes Made**
1. `socket/adapter.js`: on start-up each copy records `adapter uid → INSTANCE_NAME` in the Redis hash
   `chatscale:copies` (7-day expiry), so the watcher can name the sender.
2. `backend/scripts/watch-redis.js` (new) + `npm run watch-redis`; `--all` adds typing indicators and
   inter-copy requests. `notepack.io` (MessagePack, already used by the adapter) listed as a direct dependency.
3. Demo script `--fixed` banner shows how to open the watcher; `docs/DEMO.md` gains step 6b, the
   watcher section, and the Supabase SQL query (with a warning not to open the `users` table on a projector);
   `README.md` updated.

**Finding surfaced by the watcher**
Presence (`user:status`) also travels through Redis — one more cross-copy event that was silently
per-copy before CHG-0023.

**Verification**
Two copies on a throwaway Valkey, watcher running: it listed `copy-A, copy-B` as registered and showed,
in order, both users coming online, `copy-A → … message:new for channel:2 — alice_watch: "hello bob"`,
`copy-A → … friend:request for user 5`, both going offline, and the 2FA counters reaching 5.

**Files Added / Modified**
- Added: `backend/scripts/watch-redis.js`
- Modified: `backend/src/socket/adapter.js`, `backend/package.json`, `backend/package-lock.json`,
  `scripts/demo-two-copies.sh`, `docs/DEMO.md`, `README.md`, `docs/CHANGE_LOG.md`

**Rollback Plan**
Delete the script and the `hSet` lines; nothing else depends on them.

---

### CHG-0025 — Unused Features and Tables Removed (Voice, Attachments, Direct Messages, Pins, Reactions)

| Field | Value |
|---|---|
| **Change ID** | CHG-0025 |
| **Date Raised** | 2026-09-27 |
| **Date Implemented** | 2026-09-27 |
| **Author** | Parth |
| **Module / Component** | Schema; backend routes, controllers, services, socket; Supabase |
| **Change Type** | Removal |
| **Risk Level** | Low |
| **Status** | Verified |
| **Resolves** | CHG-0011 known limitation 1 (unauthenticated DM routes) |

**Description**
At the owner's request, tables and code for features the product does not have were removed, from
the codebase and from the Supabase database. The product scope is: accounts (with 2FA), friends,
spaces with text channels, messages, invite links and username invitations.

**Removed**

| Area | Tables | Code |
|---|---|---|
| Voice | `VoiceChannels`, `VoiceChannelParticipants` | `services/voiceChannelService.js`, `socket/voiceHandlers.js` |
| Attachments | `Attachments` | `controllers/attachmentController.js`, `routes/attachmentRoutes.js`, `services/attachmentService.js` |
| Direct messages | `DirectMessageChannels`, `DirectMessages`, `GroupDMUsers` | `controllers/dmController.js`, `routes/dmRoutes.js`, `services/dmService.js` — these routes had **no authentication** |
| Pins, reactions | none existed | six endpoints in `messageRoutes.js` / `messageController.js` that called service functions which did not exist (would have returned 500) |
| REST send | — | `POST /messages/channels/:id/messages` — it saved without notifying anyone live; messages are sent over the socket only, keeping one delivery path for the experiment |

Kept: `GET` channel history and REST edit/delete. The upload middleware stays (still referenced by
the unused server-icon and profile-picture routes).

**Supabase**
Guarded transaction: row count checked per table, abort if any held data. All six had **0 rows**;
dropped. Before: 15 tables; after: 9 (`channels, friends, messages, recoverycodes, serverinvites,
servermembers, servers, spaceinvitations, users`). Owner data unchanged: 2 users, 1 space, 9 messages.

**Local SQLite** (`backend/data/chat.sqlite`) still contains the old tables and the seed's voice
channel/DM rows; they are unused and harmless. Not modified.

**Verification**
- Fresh database created by the new schema: exactly the 9 tables above.
- Suites on a scratch database: core 31/31, invitations 17/17, two-factor 24/24.
- Removed endpoints (`/api/dms`, `/api/attachments/:id`, pin, REST send) return 404.
- No remaining references to the removed tables or modules in `backend/src` or `server.js`.

**Files Removed**
- `backend/src/controllers/{attachment,dm}Controller.js`, `backend/src/routes/{attachment,dm}Routes.js`,
  `backend/src/services/{attachment,dm,voiceChannel}Service.js`, `backend/src/socket/voiceHandlers.js`

**Files Modified**
- `backend/src/config/schema.js`, `backend/server.js`, `backend/src/socket/socket.js`,
  `backend/src/controllers/messageController.js`, `backend/src/routes/messageRoutes.js`,
  `backend/src/services/messageService.js`, `docs/CHANGE_LOG.md`

**Rollback Plan**
Restore the files from git; the tables are recreated automatically on the next start.

---

### CHG-0026 — Containers, Load Balancer, Health Checks, Graceful Shutdown; Tests Moved into the Repository

| Field | Value |
|---|---|
| **Change ID** | CHG-0026 |
| **Date Raised** | 2026-09-27 |
| **Date Implemented** | 2026-09-27 |
| **Author** | Parth |
| **Module / Component** | Docker images, compose stack, nginx, backend lifecycle, frontend socket client, tests |
| **Change Type** | Feature (infrastructure) + Defect fixes |
| **Risk Level** | Medium |
| **Status** | Verified |
| **Advances** | PLAN.md Phase 2 (containerise, health, graceful shutdown); resolves blocker B-5 |

**Description**
The system now runs entirely in containers with one command (`docker compose up --build`) at one
address (http://localhost:8080): nginx (React app + load balancer) → two backend copies →
PostgreSQL and Valkey. Backends gained liveness/readiness endpoints and graceful shutdown. The API
test suites, previously kept in a temporary folder that was lost when the session restarted, were
rebuilt inside the repository.

**Changes Made**
1. **`backend/Dockerfile`**: two-stage `node:24-alpine`, production dependencies only, runs as the
   unprivileged `node` user, `HEALTHCHECK` on `/healthz`; `.dockerignore` excludes `.env`, data, certs.
   Image 263 MB.
2. **`frontend/Dockerfile`**: builds the app, serves it from `nginxinc/nginx-unprivileged:1.27-alpine`
   (non-root, port 8080). Image 80 MB. `REACT_APP_API_URL` empty = same origin.
3. **`frontend/nginx/default.conf`**: `/api/` and `/socket.io/` proxied to an upstream of both copies
   with `least_conn` (spreads long-lived WebSockets); WebSocket upgrade headers; 1 h read timeout;
   SPA fallback; long cache for hashed static files.
4. **`compose.yaml`**: services `web`, `backend-a`, `backend-b` (shared YAML anchor), `db`
   (postgres:16-alpine, local and throwaway), `redis` (valkey:8-alpine); health-based start order;
   backends read-only with `/tmp` tmpfs; secrets from `backend/.env` at run time via `env_file`,
   overridden `DATABASE_URL` so the stack never uses Supabase (`COMPOSE_DATABASE_URL` to opt in);
   `REDIS_URL= docker compose up` reproduces the failure.
5. **`backend/src/lifecycle.js`**: `GET /healthz` (alive), `GET /readyz` (database, and Redis when
   configured; 503 while shutting down); on SIGTERM/SIGINT: not-ready → drain
   (`SHUTDOWN_DRAIN_SECONDS`, 3 in compose) → `io.close()` → close idle/remaining HTTP connections →
   close database and Redis → exit, with a hard deadline.
6. **Frontend socket client**: `transports: ['websocket']` — no long-polling handshake that must hit
   the same copy, so no sticky sessions are needed (**B-5 resolved**; trade-off: no fallback where
   WebSockets are blocked). Reconnects after `io server disconnect` with a 0.5–2.5 s random delay.
7. **PostgreSQL driver**: honours `sslmode=disable` (used only on the private compose network).
8. **`UPLOADS_DIR`** env var so the upload folder can live on a writable mount.
9. **Tests in the repo**: `backend/tests/` — `core`, `invitations`, `two-factor`, `cross-copy`
   (`EXPECT=shared|isolated`) suites, a shared `lib.js`, `run-all.js` (`npm run test:api`,
   `BASE=` to target), and `failover.compose.js`. Unique usernames per run, so suites repeat on one
   database. `socket.io-client` added as a backend dev dependency.

**Defects found and fixed**

| ID | Defect | Found by |
|---|---|---|
| D-12 | Driver forced TLS for any non-localhost host, so containers couldn't reach the compose database | first `compose up` |
| D-13 | nginx resolved backend addresses once at start; recreated containers get new IPs → stale routing. Now `resolver` + `resolve` | review during broken-mode switch |
| D-14 | **Shutting down one copy disconnected every user on every copy** (`io.disconnectSockets()` is broadcast by the Redis adapter). Now `io.close()` | failover test: 10/10 disconnected instead of 5 |
| D-15 | Shutdown hung until the forced deadline (keep-alive and WebSocket connections held the HTTP server open) | failover test: 13 s forced exit |
| D-16 | Reconnections hung up to 60 s: a stopped container's address is silent and nginx waited its default connect timeout. Now `proxy_connect_timeout 2s` | failover test: 0/5 reconnected in 8 s |

**Verification**
- All containers healthy; `/readyz` reports database and Redis ok; demo data seeded exactly once.
- Through the load balancer: API suites 4/4 (repeated 3×); cross-copy message in 2 ms with users on
  different copies; with `REDIS_URL=` the isolated behaviour reproduces.
- Failover (Evidence 03): stopping either copy — clean exit in ~3 s, 0 bystanders disconnected, 5/5
  users reconnected to the surviving copy within 3.7–5.5 s.
- Browser at http://localhost:8080: sign-in, "Live · copy-A", message sent; all API calls same-origin.
- **Observed once, not reproduced:** immediately after the copy-B failover run, one two-factor suite
  run failed at "enable with the right code" (then cascaded). 13 subsequent runs (10 of that suite,
  3 of all suites) were clean; container and host clocks agreed. Cause unknown — noted for watching.

**Files Added**
- `compose.yaml`, `backend/Dockerfile`, `backend/.dockerignore`, `frontend/Dockerfile`,
  `frontend/.dockerignore`, `frontend/nginx/default.conf`, `backend/src/lifecycle.js`,
  `backend/tests/{lib,run-all,core.test,invitations.test,two-factor.test,cross-copy.test,failover.compose}.js`,
  `docs/evidence/03-graceful-failover.md`

**Files Modified**
- `backend/server.js`, `backend/src/config/db/postgres.js`, `backend/src/middleware/upload.js`,
  `backend/package.json`, `backend/package-lock.json`, `frontend/src/config.js`,
  `frontend/src/lib/socket.js`, `README.md`, `docs/CHANGE_LOG.md`

**Rollback Plan**
The non-container workflow (`npm run dev`, demo script) is unchanged and still works. Revert the
listed files to remove the container setup.

---

### CHG-0027 — Demo Script: Real Readiness Check, `--local-db`, Clean-up on Closed Terminal

| Field | Value |
|---|---|
| **Change ID** | CHG-0027 |
| **Date Raised** | 2026-10-01 |
| **Date Implemented** | 2026-10-01 |
| **Author** | Parth |
| **Module / Component** | `scripts/demo-two-copies.sh`; demo guide |
| **Change Type** | Defect fix + Tooling |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Owner ran the demo; both backend copies exited with `could not start: Connection terminated due to
connection timeout`, yet the script printed **"Ready."** Diagnosis: DNS for the Supabase pooler
resolved and HTTPS (443) to it connected in 20 ms, but TCP to **5432 and 6543 timed out** — as did
5432 to an unrelated public test host. The network blocks outgoing database ports; Supabase and the
application were not at fault.

**Defects**
1. **False "Ready."** The script waited only for the two frontends. It now polls both backends'
   `/readyz` (30 s each) and, if one isn't ready, prints *NOT READY* with the likely cause and the
   exact command to retry with `--local-db`, then stops everything.
2. **Closing the terminal window skipped clean-up** (found while testing): the trap handled
   EXIT/INT/TERM but not HUP, leaving the Redis container running. HUP added.

**Added**
- `--local-db`: forces `DATABASE_URL` empty for both copies, so they use `backend/data/chat.sqlite`
  instead of Supabase. Combines with `--fixed`. The banner states which database is in use.
- `docs/DEMO.md`: "check the venue's network" section and a troubleshooting row; `README.md` note.

**Verification**
On the blocking network, with a port-shifted copy of the script: default mode → both copies fail,
*NOT READY* message with the `--local-db` suggestion after the readiness window, clean stop.
`--fixed --local-db` → both copies `[db] ready: SQLite`, Redis connected, banner shows the local
database. The stray container from the closed-window case was removed.

**Files Modified**
- `scripts/demo-two-copies.sh`, `docs/DEMO.md`, `README.md`, `docs/CHANGE_LOG.md`

**Rollback Plan**
Revert the script.

---

### CHG-0028 — The Experiment on Real Kubernetes (k3d); Three Deployment-Ordering Defects Found and Fixed

| Field | Value |
|---|---|
| **Change ID** | CHG-0028 |
| **Date Raised** | 2026-10-03 |
| **Date Implemented** | 2026-10-03 |
| **Author** | Parth |
| **Module / Component** | `k8s/` manifests (new); `scripts/k8s-up.sh`, `k8s-down.sh`, `k8s-chaos.sh` (new); `backend/tests/failover.k8s.js` (new) |
| **Change Type** | Feature (experiment) + Defect fixes |
| **Risk Level** | Medium (new infrastructure layer; no change to application code paths already covered by CHG-0023/0026) |
| **Status** | Verified |
| **Advances** | PLAN.md Phase 3 (k3d: break it, then fix it, on real pods) and lays the groundwork the Phase 5 cloud overlay will reuse unchanged |

**Description**
Everything up to CHG-0027 ran as plain processes or Docker Compose containers, where the number of
copies and their restart was decided by hand or by Compose's own (non-Kubernetes) supervision. This
change runs the identical containers under real Kubernetes — a local `k3d` cluster (1 server + 2
agent nodes) — using Deployments, a Service for load-balancing between backend pods, readiness and
liveness probes, and a Traefik Ingress at one address, http://localhost:8080. The break/fix
experiment and a pod-kill chaos test were both re-run on this substrate and produced the same
result as on a laptop and in Docker Compose, with zero application code changes.

**Manifests** (`k8s/`)
- `base/`: `backend-deployment.yaml` (2 replicas; CPU/memory requests sized per PLAN.md §6.1's
  "~400m per pod" guidance for the later autoscaling phase; readiness/liveness probes on
  `/readyz`/`/healthz`; a `preStop` sleep so the load balancer notices a terminating pod before it
  exits), `backend-service.yaml`, `redis.yaml` (Valkey), `frontend-deployment.yaml` +
  `frontend-nginx-configmap.yaml` (simpler than `frontend/nginx/default.conf` — a Kubernetes
  Service address is stable and self-updating, so none of Compose's DNS-caching workaround
  (`resolver`/`resolve`, CHG-0026 D-13) is needed here), `ingress.yaml`, `secret.example.yaml`
  (template only), `namespace.yaml`.
- `overlays/local/`: its own throwaway in-cluster PostgreSQL (never Supabase — per the
  `tests-never-touch-supabase` project rule), a `backend-config` ConfigMap, and a `secretGenerator`
  reading `secret.env` (gitignored; `scripts/k8s-up.sh` generates one per cluster with fresh
  random `JWT_SECRET`/`TWO_FACTOR_KEY`). A cloud overlay (Phase 5) adds to this base rather than
  replacing it.
- `scripts/k8s-up.sh`: builds both images, creates/reuses the cluster, imports images (k3d nodes
  don't share the host's Docker image store), applies the overlay, flips `REDIS_URL` for
  `REDIS_OFF=1` mode, waits for every Deployment to roll out, prints next steps.
- `scripts/k8s-down.sh`: deletes the cluster. `scripts/k8s-chaos.sh`: thin wrapper around the new
  test below.
- `backend/tests/failover.k8s.js`: connects 10 users through the Ingress, `kubectl delete pod`s
  whichever backend pod has the most of them, and checks Kubernetes schedules a replacement and
  that pod's users reconnect to the survivor — the Kubernetes analogue of CHG-0026's
  `failover.compose.js`.

**Defects found and fixed (all three while bringing the cluster up for the first time)**

| ID | Defect | Found by |
|---|---|---|
| D-17 | **Kustomize's `namespace:` field only applies to resources listed in the kustomization.yaml that sets it** — `postgres.yaml` and `configmap.yaml`, added directly in `overlays/local/kustomization.yaml` (not via `../../base`), didn't inherit base's `namespace: chatscale` and were created in `default`. Backend pods (correctly in `chatscale`) then failed with `CreateContainerConfigError: configmap "backend-config" not found`. Fixed by restating `namespace: chatscale` in the overlay too; documented in the file as a caught bug, not just a style choice. | First `kubectl apply`; `kubectl get pods` showing pods for a Deployment that itself showed as created |
| D-18 | `secretGenerator` used `behavior: replace`, which requires a base resource of that name to replace — there is deliberately none (base never defines a secret; only an overlay should). `kubectl apply` failed outright: `merging from generator ...: id ... does not exist`. Fixed by removing `behavior: replace` (plain `create` is correct here). | First `kubectl apply` |
| D-19 | **Deployment-ordering race on first boot.** Backend pods started before Postgres's image had even finished pulling; `server.js` correctly refused to listen and `exit(1)`'d — but Kubernetes' crash-loop backoff then doubled the retry delay each time (up to 5 min), so one bad-timing start cost minutes even after Postgres became ready. Fixed with an `initContainer` (`wait-for-database`, reusing the backend image — no extra pull) that parses `DATABASE_URL` and polls the TCP port every 2 s before the main container starts at all; skips immediately if `DATABASE_URL` is unset. Costs seconds instead of minutes and never triggers the backoff. | A from-scratch cluster run: backend sat in `CrashLoopBackOff` with a 4 min 22 s backoff gap even after Postgres was `1/1 Running` |

**Also found, not a defect — operating condition already documented for this network** (see
CHG-0027): pulling images *inside* the k3d nodes (they have their own containerd store, separate
from the host Docker cache) is slow and occasionally needs the same per-image retry as the Supabase
connection did. `scripts/k8s-up.sh`'s rollout-wait timeouts were raised accordingly (postgres 90s
→ 240s, backend 120s → 180s, frontend 60s → 120s) and it now prints a clear "NOT READY, check
`kubectl describe pod`, re-run the script" message instead of a bare timeout error — re-running is
safe and reuses the existing cluster.

**Verification**
- `kubectl -n chatscale get pods`: 5/5 `Running`, `1/1` ready (backend ×2, frontend, redis, postgres).
- Fixed mode: all 4 API suites pass through the Ingress; `cross-copy.test.js` shows two *real*
  Kubernetes pods (`backend-...-mspcv` / `...-mkrjd`) and **2 ms** delivery latency. Repeated
  3× clean after the chaos test below.
- `REDIS_OFF=1` reproduced via `kubectl set env deployment/backend REDIS_URL=` (an explicit `env:`
  entry overrides the ConfigMap's `envFrom` value — `kubectl set env ... REDIS_URL-` is a no-op
  here since no explicit entry exists until one is set, corrected in `k8s-up.sh`'s own logic too):
  pods log `adapter: in-memory`; the isolated-mode assertions in `cross-copy.test.js` passed
  (message and friend-request notification both **do not** cross pods) — the original failure,
  unchanged, on Kubernetes-scheduled pods. Reverting the override restored the fix; retested clean.
- **Chaos test** (`docs/evidence/04-kubernetes.md`): 10 users through the Ingress, 7 landed on one
  pod; that pod deleted outright. Kubernetes scheduled a replacement in **7 s**; **0** bystanders on
  the untouched pod were disconnected; **7/7** victims reconnected within **0.6–1.4 s**, all to the
  surviving pod; Deployment back to `2/2` ready in **16.3 s** total — markedly faster than Docker
  Compose's `stop` (CHG-0026: 3.7–5.5 s), because a Kubernetes Service removes a terminating pod
  from routing immediately rather than relying on a connect-timeout.
- Browser: signed in via http://localhost:8080; "Live · backend-79db6b7f95-km2hh" badge shows the
  real pod hostname with no `INSTANCE_NAME` configuration needed (unlike the laptop/Compose setups).
- Full teardown (`k3d cluster delete`) and a clean `./scripts/k8s-up.sh` re-run reproduced the same
  healthy end state (after D-17–D-19 were fixed), confirming the script works unattended from zero.

**Files Added**
- `k8s/base/{namespace,backend-deployment,backend-service,redis,frontend-deployment,`
  `frontend-nginx-configmap,ingress,secret.example,kustomization}.yaml`
- `k8s/overlays/local/{postgres,configmap,kustomization,secret.env.example}.yaml`
- `scripts/{k8s-up.sh,k8s-down.sh,k8s-chaos.sh}`
- `backend/tests/failover.k8s.js`
- `docs/evidence/04-kubernetes.md`

**Files Modified**
- `.gitignore` (`k8s/overlays/local/secret.env`), `README.md`, `docs/CHANGE_LOG.md`

**Known Limitations**
1. Single laptop: every "node" is a container sharing one Docker daemon, so this cannot show a
   whole **machine** or **availability zone** failing — that needs Phase 5's real cloud cluster.
2. No autoscaling yet (HPA / Cluster Autoscaler) — Phase 4/7.
3. `k8s/overlays/local`'s Postgres is throwaway and unauthenticated-by-default beyond its
   in-cluster-only Service — acceptable for a local experiment cluster, not for Phase 5.

**Rollback Plan**
`./scripts/k8s-down.sh` deletes the cluster and everything in it; no other part of the project
depends on it. Revert the listed files to remove the Kubernetes layer entirely.

---

### CHG-0029 — Session Handoff Doc (`docs/STATUS.md`)

| Field | Value |
|---|---|
| **Change ID** | CHG-0029 |
| **Date Raised** | 2026-10-06 |
| **Date Implemented** | 2026-10-06 |
| **Author** | Parth |
| **Module / Component** | Documentation |
| **Change Type** | Documentation |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Added `docs/STATUS.md`, a concise "read this first" summary for a new Claude session (or a human
picking the project back up): one-paragraph project summary, a step-by-step status table, exact
commands to run every variant of the app (local, Docker Compose, Kubernetes, the laptop demo), the
project's hard rules established through this chat (never push, always log changes, never let test
scripts touch Supabase, repo location, known network quirks, both collaborators are new to cloud/
Kubernetes), a table of the files most worth reading first, and what Phase 4 (next) actually
involves. Distinct from `docs/CHANGE_LOG.md` (a complete, append-only record of every change) and
`PLAN.md` (the original phase-by-phase plan) — this is a live, overwritten-in-place snapshot of
*current* state, meant to be read in under two minutes.

**Why now:** raised directly by the owner, who wants a new chat session to be able to pick up the
project without re-deriving context already established over many prior sessions.

**Files Added**
- `docs/STATUS.md`

**Files Modified**
- `README.md` (links to it), `docs/CHANGE_LOG.md`

**Verification**
Read back for accuracy against current `git status`, `k3d cluster list`, and the change register.

**Rollback Plan**
Delete the file; nothing else depends on it.

---

### CHG-0030 — Metrics Endpoint (`GET /metrics`)

| Field | Value |
|---|---|
| **Change ID** | CHG-0030 |
| **Date Raised** | 2026-10-06 |
| **Date Implemented** | 2026-10-06 |
| **Author** | Parth |
| **Module / Component** | Backend / Instrumentation |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
First step of Phase 4 (PLAN.md §"Phase 4 — Instrumentation"): added `prom-client` and a new
`backend/src/metrics.js` registry, exposed at `GET /metrics` (placed alongside `/healthz`/`/readyz`,
ahead of `morgan`, so scrapes don't spam the access log). Four series, each labelled `instance`
(reusing `INSTANCE_NAME`, same as every other per-copy log line in this project):

- `chatscale_socket_connections` (gauge) — incremented/decremented in `socket.js` on
  Socket.IO `connection`/`disconnect`.
- `chatscale_messages_total` (counter) — incremented in `messageHandlers.js` on a successful
  `message:send`.
- `chatscale_broadcast_latency_seconds` (histogram) — times the same work the existing
  `logDelivery` console line already did (the room `emit`, plus the cross-copy `fetchSockets()`
  check when the Redis adapter is active). That function was renamed `recordBroadcast` and now
  always records the metric, even when `LOG_DELIVERY=false` silences its console line for load
  tests — load tests are exactly when this number matters most.
- `chatscale_delivery_latency_seconds` (histogram, labelled `same_pod`/`cross_pod`) — defined per
  PLAN.md's spec but **not fed yet**: true client-send-to-client-receive latency needs the
  *receiving* client to report back, which means frontend changes. That's Phase 6 work (the load
  test), not this step.
- Default Node process metrics (`prom-client`'s `collectDefaultMetrics`) — CPU, memory, event
  loop lag, GC, all free with the registry.

**Why now:** next item on `docs/STATUS.md`'s step 4 list, raised directly by the owner.

**Files Added**
- `backend/src/metrics.js`

**Files Modified**
- `backend/server.js` (mounts `/metrics`), `backend/src/socket/socket.js` (connection gauge),
  `backend/src/socket/messageHandlers.js` (`logDelivery` → `recordBroadcast`: messages counter +
  broadcast histogram), `backend/package.json`/`package-lock.json` (`prom-client` dependency),
  `docs/STATUS.md`, `docs/CHANGE_LOG.md`

**Verification**
Started a throwaway backend (`DATABASE_URL=` + scratch `SQLITE_PATH`, never Supabase — rule 3)
on a spare port. `curl /metrics` showed all four series registered. Connected a real
`socket.io-client` with a signed JWT for the seeded `parth` user, confirmed `chatscale_socket_connections`
went 0→1→0 across connect/disconnect, joined a channel, sent a message, and confirmed
`chatscale_messages_total` incremented by 1 and `chatscale_broadcast_latency_seconds_count` recorded
one observation. Did not run the full `npm run test:api` against the already-running k3d cluster
(its pods run an older image without this code, and it wasn't worth disturbing); nothing touched by
this change intersects with the existing test suites' coverage.

**Known Limitations**
1. `chatscale_delivery_latency_seconds` has no data yet — needs a frontend round trip, deferred to
   Phase 6's load test.
2. Not yet wired into Kubernetes: no `ServiceMonitor`/scrape annotation, and Prometheus/Grafana
   themselves aren't deployed — next items on the Phase 4 list (PLAN.md).
3. `npm audit` reports pre-existing vulnerabilities across the dependency tree, unrelated to
   `prom-client`; not addressed here (out of scope, no `audit fix --force` run).

**Rollback Plan**
Remove `backend/src/metrics.js`, the `/metrics` route in `server.js`, the two call sites in
`socket.js` and `messageHandlers.js` (revert `recordBroadcast` back to `logDelivery`), and the
`prom-client` dependency. Nothing else depends on this endpoint yet.

---

### CHG-0031 — Prometheus + Grafana on k3d

| Field | Value |
|---|---|
| **Change ID** | CHG-0031 |
| **Date Raised** | 2026-10-06 |
| **Date Implemented** | 2026-10-06 |
| **Author** | Parth |
| **Module / Component** | Infrastructure (Kubernetes) |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Second step of Phase 4: Prometheus and Grafana now run as two more Deployments in the same k3d
cluster, following the existing hand-rolled `k8s/base/*.yaml` shape (same pattern as `redis.yaml`/
`postgres.yaml`) rather than the `kube-prometheus-stack` Helm chart PLAN.md originally named — that
chart brings an operator, CRDs, node-exporter and kube-state-metrics, which is a lot of new moving
parts (and resource requests) for a 3-node laptop cluster that just needs one app's own `/metrics`
scraped. Can revisit Helm later if cluster-wide metrics (node CPU/memory, for the HPA-vs-CPU side
of the Phase 4 experiment) are needed — noted as a limitation below, not solved here.

- **Discovery, no RBAC needed:** added a headless Service, `backend-headless`
  (`k8s/base/backend-service.yaml`) — `clusterIP: None` means its DNS name resolves to one A
  record per *ready* backend pod instead of load-balancing to one. Prometheus's `dns_sd_configs`
  (`k8s/base/prometheus.yaml`) resolves that name every 15s and scrapes every pod it finds — the
  usual `kubernetes_sd_configs` approach would need a ServiceAccount + RBAC to watch the
  Kubernetes API, which this avoids entirely.
- **Prometheus** (`k8s/base/prometheus.yaml`): one ConfigMap (`prometheus.yml`) + Deployment +
  Service, port 9090. 6h retention, no PersistentVolume (see Known Limitations).
- **Grafana** (`k8s/base/grafana.yaml`): one Deployment + Service, port 3000, fully provisioned —
  a datasource ConfigMap pointing at `http://prometheus:9090` and a dashboard ConfigMap, both read
  on startup, so there is nothing to click through by hand. Anonymous viewer access is enabled
  (`GF_AUTH_ANONYMOUS_ENABLED`) since this is reached only via port-forward, never the Ingress —
  no login wall needed for a local, throwaway dashboard.
- **Dashboard** ("ChatScale — Backend Overview", `uid: chatscale-overview`): 4 panels —
  connections by pod, messages/sec, broadcast latency p50/p95, backend pods up. Covers what
  `backend/src/metrics.js` (CHG-0030) actually feeds today; no panel yet for
  `chatscale_delivery_latency_seconds` (needs a frontend round trip — Phase 6) or for cluster
  CPU/memory (needs node-exporter/kube-state-metrics or metrics-server — not deployed here).
- **`scripts/k8s-dashboards.sh`** (new): foreground `kubectl port-forward` for both — Grafana at
  `localhost:3001`, Prometheus at `localhost:9090` — since neither sits behind the Ingress.
- `scripts/k8s-up.sh` now also waits on the Prometheus/Grafana rollouts (longer timeout, and a
  slow-pull explicitly does not fail the script — the app itself doesn't depend on either) and
  mentions the new dashboard script in its final output.

**Why now:** next item on `docs/STATUS.md`'s step 4 list, raised directly by the owner, right
after CHG-0030 gave Prometheus something to scrape.

**Files Added**
- `k8s/base/prometheus.yaml`, `k8s/base/grafana.yaml`, `scripts/k8s-dashboards.sh`

**Files Modified**
- `k8s/base/backend-service.yaml` (added the `backend-headless` Service), `k8s/base/kustomization.yaml`
  (registered the two new manifests), `scripts/k8s-up.sh`, `README.md`, `docs/STATUS.md`,
  `docs/CHANGE_LOG.md`

**Verification**
`kubectl kustomize k8s/overlays/local` built cleanly; the embedded dashboard JSON was extracted
from the rendered output and parsed to confirm it's valid. Applied to the actual running k3d
cluster (`./scripts/k8s-up.sh`, then `kubectl rollout restart deployment/backend` — the Deployment
spec was otherwise unchanged, so it would not have picked up the rebuilt image on its own).
Hit the same slow/partial registry pull this project has seen before (CHG-0028) on the Prometheus
image; resolved with the documented workaround, `docker exec <node> crictl pull <image>`.
Confirmed via Prometheus's own `/api/v1/targets` that both backend pods were discovered and
scraped (`health: up`) — proving the headless-Service DNS trick actually works, not just that the
config parses. Connected a real `socket.io-client` through a `kubectl port-forward` straight to
the backend Service, sent 10 messages, and watched `chatscale_messages_total` and
`chatscale_broadcast_latency_seconds_count` both read back `10` from Prometheus. Queried Grafana's
own datasource-proxy endpoint (not just Prometheus directly) for `sum(rate(chatscale_messages_total[1m]))`
and got a non-zero rate back, confirming Grafana can actually reach and query Prometheus, not just
that both pods are `Running`.

**Known Limitations**
1. **No cluster CPU/memory metrics** — the per-pod CPU numbers the Phase 4 CPU-vs-connection-count
   HPA experiment needs aren't flowing yet. That needs either `metrics-server` (what Kubernetes'
   own HPA reads natively) or node-exporter/kube-state-metrics (for Prometheus/Grafana to show
   them too). Neither is deployed by this change — next piece of Phase 4, not this one.
2. **No Prometheus persistence** — a restarted Prometheus pod loses its history. Acceptable for a
   local, short-retention (6h) experiment cluster; would need a PersistentVolumeClaim (like
   `postgres.yaml` already has) if that ever matters.
3. **Discovered a real Prometheus gotcha while verifying:** Prometheus overwrites a scraped
   sample's `instance` label with its own scrape-target address and renames the app's own
   `instance` label (CHG-0030) to `exported_instance`. The dashboard's "Connections by pod" panel
   had to use `{{exported_instance}}`, not `{{instance}}`, to show the pod name instead of an IP.
   Documented inline in `k8s/base/grafana.yaml`.
4. Anonymous Grafana access and a fixed `GF_SECURITY_ADMIN_PASSWORD` are fine only because this is
   never exposed beyond `kubectl port-forward` on the owner's own machine — would need real auth
   before any cloud overlay (Phase 5) exposed it further.

**Rollback Plan**
`kubectl delete -f k8s/base/prometheus.yaml -f k8s/base/grafana.yaml` (or just drop both from
`k8s/base/kustomization.yaml` and re-apply) removes both. Also revert the `backend-headless`
addition in `backend-service.yaml`, `scripts/k8s-up.sh`'s new rollout checks, and delete
`scripts/k8s-dashboards.sh`. The app itself has no dependency on any of this — it keeps running
unmodified either way.

---

### CHG-0032 — Load Testing (`loadtest/socketio-load.js`)

| Field | Value |
|---|---|
| **Change ID** | CHG-0032 |
| **Date Raised** | 2026-10-20 |
| **Date Implemented** | 2026-10-20 |
| **Author** | Parth |
| **Module / Component** | Load testing |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Third step of Phase 4 (PLAN.md Phase 7): a k6 script that fakes many simultaneous chat users
against a running backend (local, Docker Compose, or k3d — anything `BASE` points at).

- **The protocol problem PLAN.md flagged as the biggest risk here:** k6 has no Socket.IO client.
  The script speaks Engine.IO/Socket.IO directly over a raw WebSocket — connects with
  `?EIO=4&transport=websocket`, waits for the server's Engine.IO open packet, sends a Socket.IO
  connect packet carrying the JWT (`40{"token":...}`, the same `auth` payload
  `backend/src/socket/socket.js`'s `io.use()` reads), then sends/receives events as
  `42[...]`/ack replies as `43<id>[...]`. Found and handled one real gotcha while building this:
  Socket.IO v4 flipped ping/pong direction from earlier versions — the *server* pings (`"2"`), the
  *client* must pong (`"3"`) within `pingTimeout` (20s) or silently gets dropped. Missing this
  would have looked like "VUs randomly disconnect after ~20s" with no obvious cause.
- **Real users, not fabricated tokens:** each VU registers its own throwaway user via the actual
  `POST /api/auth/register` endpoint (same one the UI uses — mirrors the existing convention in
  `backend/tests/lib.js`'s `register()`), rather than forging JWTs against a shared secret read out
  of `k8s/overlays/local/secret.env`. Inherits whatever database the target backend is already
  running with — never touches Supabase itself, same rule as every other test script here.
  `setup()` runs once, creates one throwaway space + channel + invite code; every VU joins it via
  the real `POST /api/servers/join` endpoint before connecting (channel membership is required to
  send — `getAccessibleChannel` in `messageHandlers.js` checks it), so all VUs land in the same
  shared channel and genuinely broadcast-fan-out to each other, not into separate rooms.
- **Load shape** (PLAN.md Phase 7): each VU holds one connection for its lifetime, sending a chat
  message every `MESSAGE_INTERVAL_MS` (default 5000, matching "~5s" in the plan). Two profiles:
  `local` (default, ramps to 20 VUs — "rehearse at 20 VUs locally before spending cloud VUH") and
  `full` (0→50→100→150 VUs, 2-minute hold — the plan's real profile, sized for the off-host
  Grafana Cloud k6 runner against a real cluster, not this laptop's 2-pod local deployment).
- **Metrics:** `connect_success` / `join_channel_success` (Rate), `message_ack_latency` (Trend —
  the client-perceived round trip, counterpart to the server-side
  `chatscale_broadcast_latency_seconds` from CHG-0030), `chat_messages_sent`/`_acked` (Counter),
  plus whatever k6's `k6/ws` module reports for free (`ws_connecting`, `ws_msgs_sent/received`,
  `ws_sessions`). Thresholds set loosely for a local rehearsal (`p95 < 2000ms`, success rates
  `>95%`) — exploratory limits, not SLA claims.
- Added `k6` via `brew install k6` (not yet in any `brew bundle`/`Brewfile` this project uses —
  there isn't one; README documents the install step like it already does for `k3d`/`kubectl`).

**Why now:** next item on `docs/STATUS.md`'s step 4 list, raised directly by the owner.

**Files Added**
- `loadtest/socketio-load.js`

**Files Modified**
- `README.md`, `docs/STATUS.md`, `docs/CHANGE_LOG.md`

**Verification**
Ran against the live k3d cluster (not just syntax-checked). A `smoke` profile (2 VUs, 15s) first,
to validate the protocol parsing cheaply: 100% connect/join success, 7 messages sent and acked,
p95 ack latency 16.39ms. Cross-checked against Prometheus directly — `chatscale_messages_total`
on the backend pod the VUs landed on read back exactly `7`, confirming the k6 traffic was real
traffic the app's own instrumentation (CHG-0030) also saw, not an artifact of the test script.
Then ran the actual default `local` profile end to end (20 VUs, ~1.5 min): 100% connect success,
100% join success, 328 messages sent and acked with zero failures, p95 ack latency 17.64ms, all
three thresholds passed. `ws_msgs_received: 7109` versus `328` sent confirms the broadcast fan-out
is real — every VU receiving every other VU's messages in the shared channel, not isolated rooms.

**Known Limitations**
1. **Not yet run at the `full` profile (150 VUs) or against anything but the local 2-pod k3d
   deployment.** That's explicitly cloud/Phase-7 scope (Grafana Cloud k6, off-host, against a
   cluster with CPU `requests`/`limits` and real node sizing) — running 150 VUs against 2 local
   pods on a laptop would mostly measure the laptop, not the app.
2. **No client-side delivery-latency measurement** (receiving client's own perceived latency,
   `chatscale_delivery_latency_seconds` same_pod/cross_pod from CHG-0030) — this script measures
   send-to-ack latency, not send-to-every-receiver latency. Closing that gap means each VU timing
   its own `message:new` receipts, deferred as a possible follow-up, not required for this step.
3. **No HPA yet to react to this load** — `metrics-server` isn't installed, so there's nothing
   watching `chatscale_socket_connections`/CPU to scale on. Next piece of Phase 4, not this one.

**Rollback Plan**
Delete `loadtest/socketio-load.js`. Nothing else depends on it; it only ever adds throwaway users
and a throwaway space to whichever database `BASE` points at, same as the existing test suites.

---

### CHG-0033 — PLAN.md r4: Phase 5 (Real Cloud) Descoped

| Field | Value |
|---|---|
| **Change ID** | CHG-0033 |
| **Date Raised** | 2026-10-20 |
| **Date Implemented** | 2026-10-20 |
| **Author** | Parth |
| **Module / Component** | Documentation / Planning |
| **Change Type** | Process |
| **Risk Level** | Low (documentation); resolves a Medium delivery risk (R-12) |
| **Status** | Implemented |
| **Amends** | CHG-0006, CHG-0007, CHG-0009 |

**Description**
`PLAN.md` revised to r4: **Phase 5 (Azure/AKS, the real-cloud deployment) and everything that
depended on it are descoped, not deferred.** Project scope now ends at local Kubernetes (k3d).

**Why.** Azure for Students automated verification was rejected on 2026-09-20 for the `nmims.in`
institutional email (CHG-0009, risk R-12). Manual SheerID review was pursued over the following
weeks: SheerID (Liz, verification-help@sheerid.com) reported on 2026-10-07 that the original
ticket could not be found and asked for a resubmission via Microsoft's student-pricing flow, which
in turn surfaced further friction (no Microsoft account existed under the institutional email; the
public student-pricing page is for discounted Microsoft 365, a different product from the Azure
free-credit offer, and easy to land on by mistake instead of `azure.microsoft.com/en-us/free/students/`).
A formal reply to Liz was drafted but it's unknown whether it was sent or answered. R-12's own
mitigation already named the decision point: *"if verification is unresolved when Phase 4 closes,
switch to GCP"* (also considered: DigitalOcean, which has a $200 GitHub Student Pack credit
requiring no identity verification at all). With Phase 4 now complete, that decision point was
reached — but rather than restart the same signup/verification cycle with a second provider, the
owner chose to stop at local Kubernetes instead.

**What changed in `PLAN.md`:**
- Header metadata (Revision, Status, Cloud, Budget) updated to reflect no cloud account.
- New **"r4 Amendment"** section added directly under the header — the first thing anyone reading
  the plan now sees — explaining the decision and its scope impact.
- §§3–6 (Cloud posture, Target architecture, Why a real cloud, Cost control) and §9 (Cost model)
  annotated as historical record, left otherwise intact — the original reasoning for wanting a real
  cloud is still sound engineering and worth keeping visible, just no longer being acted on.
- **Phase 5** (Azure/Terraform) marked descoped in full.
- **Phase 7** (load/autoscaling) — clarified as **mostly still in scope**: the k6 load test and the
  HPA CPU-vs-connection-count comparison need only k3d and remain the project's next step; only
  "two-level elasticity" (real Cluster Autoscaler adding whole nodes) is descoped.
- **Phase 8** (chaos) — items 1 (pod kill, already done), 5 (Redis kill) and 6 (reconnect storm)
  stay in scope; items 2–4 (node kill, zone failure, managed-DB failover) need real separate
  machines and are descoped. Exit criterion revised from six recorded failure events to three.
- **Phase 9** (cross-pod attachments via Azure Blob) marked descoped — was always a stretch goal,
  and additionally moot since CHG-0025 already removed attachment support from the app entirely.
- §10 Risks — R-3, R-5, R-6, R-7, R-10 marked moot (no cloud account exists for them to apply to);
  R-2 marked resolved (materialized as CHG-0032, under budget); R-12 marked resolved by this
  decision; R-11's "Phases 0–8 are the project" line updated to reflect the new scope.
- §14 Immediate next actions (written 2026-09-20, before Phase 0 started) marked superseded by
  `docs/STATUS.md`, which is the maintained, live version of "what's next."

**Why now:** raised directly by the owner, who asked whether a non-cloud alternative (Heroku) could
replace Azure for Phase 5. Heroku has no Kubernetes offering at all, so it can't fulfill what Phase
5 actually needed (a real Cluster Autoscaler, multi-zone failure testing, Terraform-managed
infrastructure) — explained in chat, along with DigitalOcean as the closer like-for-like
replacement PLAN.md's own R-12 already named. After weighing the cost/effort of a second cloud
provider's signup process against what Phase 5 would have actually added on top of the local
Kubernetes work already done, the owner chose to finalize scope at local k3d rather than continue.

**Files Modified**
- `PLAN.md`, `docs/STATUS.md`, `docs/CHANGE_LOG.md`

**Verification**
Read back `PLAN.md` end to end after editing to confirm every cloud-dependent section either points
to the r4 amendment note or is clearly marked historical/descoped, and that nothing still reads as
a live, pending task. Cross-checked against `docs/CHANGE_LOG.md`'s existing register for R-12's
history (CHG-0009) before writing the "why" section, rather than relying on chat memory alone.

**Known Limitations**
1. This is a planning/scope decision, not a code change — there is nothing to test, only to read
   back for internal consistency (done above).
2. The formal reply drafted for SheerID support was never confirmed sent; if the owner later
   decides to pursue it anyway (e.g. out of curiosity, or because MPSTME IT turns out to already
   have an Azure for Education tenant), that remains possible — this change records a decision to
   stop *investing project time* in it, not a technical blocker that prevents revisiting it.

**Rollback Plan**
Revert `PLAN.md` to its r3 state (pre-amendment) and remove the corresponding notes from
`docs/STATUS.md`. No code or infrastructure changed, so there is nothing else to undo — this
entry exists purely to record a scope decision for the project's own history.

---

### CHG-0034 — Autoscaling: CPU vs Connection Count (Phase 4, step 4 of 4 — complete)

| Field | Value |
|---|---|
| **Change ID** | CHG-0034 |
| **Date Raised** | 2026-10-20 |
| **Date Implemented** | 2026-10-20 |
| **Author** | Parth |
| **Module / Component** | Infrastructure (Kubernetes) |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
Final piece of Phase 4: a Horizontal Pod Autoscaler comparison answering PLAN.md §2.2's question —
does the Kubernetes default (CPU) actually react to chat load, or does connection count matter
more? Full write-up with real numbers: [docs/evidence/05-autoscaling.md](evidence/05-autoscaling.md).

- **`metrics-server`** — already bundled with k3s/k3d; confirmed working (`kubectl top nodes`),
  nothing to install.
- **`k8s/base/prometheus-adapter.yaml`** (new) — exposes `chatscale_socket_connections` (CHG-0030)
  through Kubernetes' `external.metrics.k8s.io` API, so an HPA can scale on it the same way it
  scales on CPU. Uses the *external* metrics API rather than the more common *pods* API on
  purpose: the pods API needs each Prometheus sample to carry `namespace`/`pod` labels matching a
  real Kubernetes object, which our DNS-discovery-based scrape (CHG-0031) doesn't provide and
  deliberately avoids the RBAC that would be needed to add them. External metrics sidestep that
  entirely — the adapter just hands over one aggregate number.
- **`k8s/experiments/hpa-cpu.yaml` + `hpa-connections.yaml`** (new) — the two HPA configs under
  comparison. Deliberately **not** wired into `k8s/base/kustomization.yaml`: both target the same
  `Deployment/backend`, and Kubernetes doesn't prevent two HPAs pointing at one target — it just
  makes them fight each other, silently. Applied one at a time.
- **`scripts/hpa-compare.sh`** (new) — applies one HPA, runs `loadtest/socketio-load.js`
  (CHG-0032), and prints `kubectl get hpa`/`get pods` every 10s so the scaling decision (or lack
  of one) is visible live, not just in a final summary. Cleans up the HPA it applied on exit.

**Why now:** last item on `docs/STATUS.md`'s step 4 list, raised directly by the owner, who asked
to "start the metrics-server and HPA setup."

**Files Added**
- `k8s/base/prometheus-adapter.yaml`, `k8s/base/prometheus-adapter-kube-system-rbac.yaml`,
  `k8s/experiments/hpa-cpu.yaml`, `k8s/experiments/hpa-connections.yaml`,
  `scripts/hpa-compare.sh`, `docs/evidence/05-autoscaling.md`

**Files Modified**
- `k8s/base/kustomization.yaml` (registered `prometheus-adapter.yaml`), `scripts/k8s-up.sh`
  (waits on the adapter rollout; applies the kube-system RoleBinding separately), `README.md`,
  `docs/STATUS.md`, `docs/CHANGE_LOG.md`

**Verification — measured against the live k3d cluster, not simulated:**
- CPU-based HPA: `kubectl apply -f k8s/experiments/hpa-cpu.yaml`, then the k6 `local` profile (20
  VUs). CPU peaked at 54% (an HTTP registration/bcrypt burst at ramp-up, not the chat traffic
  itself) then settled at 36% — never crossed the 60% target. Zero `SuccessfulRescale` events;
  replica count stayed at 2 for the entire run. k6: 328 messages, 100% success.
- Connection-based HPA: same load, three runs needed to get a trustworthy result (see Known
  Limitations/bugs below) — the third run showed `chatscale_socket_connections` crossing the
  8-per-pod target at t+50s and a real `SuccessfulRescale` Kubernetes event at t+60s (2→3 pods),
  cross-checked against Prometheus's own `query_range` for the same window (a sustained total of
  20 connections for 65+ seconds) to rule out a measurement artifact rather than just trusting the
  HPA's own display.

**Known Limitations / defects found and fixed during verification (kept, not hidden — an honest
account of what broke is a better record than a clean-looking one that skips the debugging):**
1. **`prometheus-adapter` crashed on startup** (`CrashLoopBackOff`) — tried to generate its
   self-signed serving cert in a non-writable directory. Fixed with an explicit `--cert-dir`
   pointed at an `emptyDir` volume.
2. **A real double-division bug** (not the staleness it first looked like). The first two
   connection-based HPA runs plateaued at exactly half the true value and never scaled. Initially
   suspected the adapter's 30s metric-refresh interval was too coarse for a ~90s test and tightened
   it to 10s — that turned out to be a red herring; the third run still plateaued at half-value
   with the faster interval. The actual cause: an `AverageValue`-type HPA target divides the
   external metric by the current replica count *itself*; the adapter's PromQL was already
   computing `avg()` (dividing by 2), so the value got halved twice. Caught by comparing the HPA's
   displayed value against Prometheus's own `query_range` for the identical window, not assumed —
   the true sum was a sustained 20, the HPA showed 5, exactly `20÷2÷2`. Fixed by changing the
   adapter's `metricsQuery` from `avg()` to `sum()`.
3. A kustomize gotcha found and fixed *before* applying anything (CHG-0031's lesson repeated):
   `k8s/base/kustomization.yaml`'s `namespace: chatscale` would have silently overwritten a
   RoleBinding's explicit `kube-system` namespace, breaking the aggregated API server's auth.
   Caught via `kubectl kustomize` dry-run before applying, same discipline as CHG-0031. Fixed by
   extracting that one object into `prometheus-adapter-kube-system-rbac.yaml`, applied separately.
4. `k8s/experiments/hpa-connections.yaml`'s `averageValue: "8"` threshold and `hpa-cpu.yaml`'s
   `maxReplicas: 6` are both tuned for the k6 `local` profile (20 VUs) specifically — PLAN.md's
   full 150-VU profile would need different numbers, same caveat as CHG-0032's load test itself.
5. No true Cluster Autoscaler comparison (adding whole nodes, not just pods) — that's cloud-only
   and was descoped along with Phase 5 (CHG-0033); this HPA comparison is the pod-level piece of
   Phase 7 that PLAN.md's own r4 amendment marked as still fully in scope locally.

**Rollback Plan**
Delete `k8s/base/prometheus-adapter.yaml`, `prometheus-adapter-kube-system-rbac.yaml`,
`k8s/experiments/`, and `scripts/hpa-compare.sh`; remove the `prometheus-adapter.yaml` line from
`kustomization.yaml` and the adapter rollout wait from `k8s-up.sh`. Neither HPA is applied by
default (both live in `k8s/experiments/`, outside the base kustomization), so a fresh
`./scripts/k8s-up.sh` run is unaffected either way — nothing here changes the app's normal
behavior.

---

### CHG-0035 — Phase 6 Measured: Redis Tax and Scaling Efficiency

| Field | Value |
|---|---|
| **Change ID** | CHG-0035 |
| **Date Raised** | 2026-10-20 |
| **Date Implemented** | 2026-10-20 |
| **Author** | Parth |
| **Module / Component** | Experiments / Write-up |
| **Change Type** | Feature |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
PLAN.md's thesis table (§1) names two measurements — "Cost of fix" (same-pod vs cross-pod Redis
delivery latency) and "Scaling" (throughput/latency at 1/2/4 pods) — that were planned from the
start (PLAN.md Phase 6) but never actually run; both are fully local and were not part of the r4
cloud descope, just genuinely overlooked while CHG-0030–0034 focused on metrics/load-test/HPA.
Caught and raised directly by the owner before starting the project's final write-up, rather than
let the report quietly omit or fabricate them.

- **Redis tax** ([docs/evidence/06-redis-tax.md](evidence/06-redis-tax.md)): new
  `backend/tests/redis-tax.k8s.js`, modeled on the existing `cross-copy.test.js`/`failover.k8s.js`
  pattern — finds a same-pod and a cross-pod receiver pairing, measures n=200 sequential
  send-to-receive round trips for each. **Result: no measurable difference** (both ~1–3ms) — not
  claimed as "the Redis tax is zero" in general, but explained honestly: a k3d cluster is multiple
  containers on one Docker daemon on one physical machine, so there's no real network hop for a
  tax to show up on. A genuine, stated limitation of local-only measurement, not glossed over.
- **Scaling efficiency** ([docs/evidence/07-scaling-efficiency.md](evidence/07-scaling-efficiency.md)):
  new `scripts/scaling-efficiency.sh` + a `fixed` load profile added to
  `loadtest/socketio-load.js` (k6's `constant-vus` executor — a steady VU count, not a ramp, so
  throughput is comparable apples-to-apples across pod counts, per PLAN.md's "fixed load, pods
  pinned at 1 → 2 → 4"). Calibrated the VU count first (100, not the 20 Evidence 05 used — at 20
  VUs nothing is saturated enough to show a scaling difference at all). **Result: message delivery
  never failed at any pod count (100% success, ~1900 messages, all three runs), but p95 ack
  latency dropped 110ms → 85ms → 34ms as pods went 1 → 2 → 4** — roughly a 3.2x improvement,
  monotonic and large enough that run-to-run noise doesn't explain it.

**Why now:** raised directly by the owner mid-conversation, in response to being asked to "move on
to the write-up" — correctly flagged that writing a polished final report before these two
measurements existed would mean either silently omitting two rows of the project's own thesis
table or, worse, writing around the gap. Measuring first was chosen over writing the gap into the
report.

**Files Added**
- `backend/tests/redis-tax.k8s.js`, `scripts/scaling-efficiency.sh`,
  `docs/evidence/06-redis-tax.md`, `docs/evidence/07-scaling-efficiency.md`

**Files Modified**
- `loadtest/socketio-load.js` (added the `fixed` load profile), `docs/STATUS.md`,
  `docs/CHANGE_LOG.md`

**Verification**
Both measured against the live k3d cluster, not simulated. Redis tax: run twice (n=60, then
n=200) for consistency — same shape both times, no directional gap. Scaling efficiency: calibrated
VU count empirically (30-second trial run showed p95 96ms at 100 VUs/1 pod vs ~17ms at 20
VUs/2 pods from Evidence 05, confirming enough headroom to see a real effect) before committing to
the full 3-configuration, ~8-minute experiment; checked `checks_failed: 0.00%` across all three
runs before trusting the latency numbers; confirmed the cluster returned to a clean 2-pod baseline
(`kubectl -n chatscale get pods -l app=backend`, `get hpa`) afterward.

**Known Limitations**
1. Scaling-efficiency ran n=1 per configuration (one 90s run each), not PLAN.md's n=3 with a
   discarded 2-minute warm-up — a real simplification to keep total experiment time reasonable,
   stated in the evidence doc rather than assumed away. Good enough to see a clear, large,
   monotonic trend; not rigorous enough for tight confidence intervals on the exact percentiles.
2. Redis tax's negligible-locally result is specific to a single-Docker-daemon k3d cluster; a real
   multi-machine deployment (descoped, r4) would very likely show a nonzero tax from genuine
   network hops — recorded as a limitation of what local infrastructure can measure, not resolved.

**Rollback Plan**
Delete `backend/tests/redis-tax.k8s.js`, `scripts/scaling-efficiency.sh`, and the two evidence
files; revert the `fixed` profile addition in `loadtest/socketio-load.js`. Nothing else depends on
any of this — purely additive measurement work.

---

### CHG-0036 — Final Report (`docs/REPORT.md`) — Step 6 of 6, Project Complete

| Field | Value |
|---|---|
| **Change ID** | CHG-0036 |
| **Date Raised** | 2026-10-20 |
| **Date Implemented** | 2026-10-20 |
| **Author** | Parth |
| **Module / Component** | Documentation |
| **Change Type** | Documentation |
| **Risk Level** | Low |
| **Status** | Verified |

**Description**
`docs/REPORT.md`: the project's final write-up, the last item on `docs/STATUS.md`'s step list.
Walks through `PLAN.md`'s original thesis table (§1) row by row, with every claim traced to a
`docs/evidence/*.md` file and an exact command to reproduce it — no number in the report is
unsourced. Structure: the hypothesis and three-substrate reproduction of the failure, the fix, the
Redis tax (CHG-0035), scaling efficiency (CHG-0035), the autoscaling comparison (CHG-0034, the
project's strongest single result), an explicit section naming what's *not* claimed and why
(Cluster Autoscaler, zone failure, managed-DB failover, a real cloud invoice — all needed
infrastructure that CHG-0033's r4 amendment deliberately dropped), an estimated cost model (per
`PLAN.md` §9's r4 note — labelled as an estimate throughout, not presented as a measured bill), a
methodology/honesty section, and a reproduction guide.

**Why a single comprehensive doc, not split per PLAN.md §9's original `docs/COSTS.md` naming:**
asked directly; the owner chose one document over splitting the cost model into its own file,
since every section references the same shared evidence and thesis table — a single narrative
reads better than cross-referencing two files for one story.

**Why now:** last item on `docs/STATUS.md`'s step list. Writing it surfaced the Phase 6 gap closed
by CHG-0035 immediately beforehand — raised directly by the owner rather than let the report either
omit two rows of its own thesis table or claim them without evidence.

**Files Added**
- `docs/REPORT.md`

**Files Modified**
- `docs/STATUS.md`, `README.md`, `docs/CHANGE_LOG.md`

**Verification**
Every quoted number cross-checked against its source evidence file while writing (not
transcribed from memory): Evidence 01/02/03/04's headline results reread directly from those
files; Evidence 05/06/07's numbers reused from this session's own measurements. One overreaching
claim caught and corrected before finalizing — an initial draft said "`git log` shows
[`adapter.js`] as the entire implementation" without having actually run that command; corrected
to state the file's line count instead, which was verified.

**Known Limitations**
Inherits every limitation already stated in the evidence files it cites (n=1 scaling-efficiency
runs, local-only Redis tax, no Cluster Autoscaler/zone/DB-failover data, an estimated not measured
cost model) — the report states them again at point of use rather than only in `docs/STATUS.md`,
so a reader of the report alone (without `STATUS.md`) still sees them.

**Rollback Plan**
Delete `docs/REPORT.md`. Nothing else depends on it — it's a synthesis of work already recorded
elsewhere, not a dependency for anything.

---

## 3. Outstanding Uncommitted Work (Pre-existing, as at 2026-09-10)

Recorded for traceability. This work predates the change log and was **not** produced under CHG-0001 or CHG-0002.

**Modified:** `backend/.env`, `backend/src/config/db.js`, `backend/src/controllers/channelController.js`, `backend/src/controllers/messageController.js`, `backend/src/routes/channelRoutes.js`, `backend/src/routes/messageRoutes.js`, `backend/src/services/messageService.js`, `backend/src/socket/messageHandlers.js`, `backend/src/socket/voiceHandlers.js`, `frontend/src/App.js`, `frontend/src/components/Home.js`, `frontend/src/components/OnlineFriendsList.js`, `frontend/src/index.css`, `frontend/src/services/dmService.js`

**Untracked:** `backend/data/`, `frontend/src/components/Workspace.js`, `frontend/src/services/realtimeWorkspace.js`, `frontend/src/services/workspaceStore.js`

**Note:** Nothing has been pushed to `origin`. Per standing instruction, no push occurs without explicit authorisation from the project owner.

---
