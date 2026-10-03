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

## 3. Outstanding Uncommitted Work (Pre-existing, as at 2026-09-10)

Recorded for traceability. This work predates the change log and was **not** produced under CHG-0001 or CHG-0002.

**Modified:** `backend/.env`, `backend/src/config/db.js`, `backend/src/controllers/channelController.js`, `backend/src/controllers/messageController.js`, `backend/src/routes/channelRoutes.js`, `backend/src/routes/messageRoutes.js`, `backend/src/services/messageService.js`, `backend/src/socket/messageHandlers.js`, `backend/src/socket/voiceHandlers.js`, `frontend/src/App.js`, `frontend/src/components/Home.js`, `frontend/src/components/OnlineFriendsList.js`, `frontend/src/index.css`, `frontend/src/services/dmService.js`

**Untracked:** `backend/data/`, `frontend/src/components/Workspace.js`, `frontend/src/services/realtimeWorkspace.js`, `frontend/src/services/workspaceStore.js`

**Note:** Nothing has been pushed to `origin`. Per standing instruction, no push occurs without explicit authorisation from the project owner.

---
