# ChatScale

Group chat for people who already know each other: accounts with optional two-step
verification, friends, **spaces** with text channels (join by invite link or by username
invitation), real-time messages, and a light/dark theme.

It is also the subject of a cloud-scaling study — see [PLAN.md](PLAN.md) for the experiment,
[docs/STATUS.md](docs/STATUS.md) for where things currently stand (read this first in a new
session), and [docs/CHANGE_LOG.md](docs/CHANGE_LOG.md) for every change made so far.

| Layer | Stack |
|---|---|
| Frontend | React 18 (Create React App), React Router 6, `socket.io-client`, IBM Plex fonts (self-hosted) |
| Backend | Node.js ≥ 22, Express, Socket.IO 4.8, JWT auth |
| Database | PostgreSQL (e.g. Supabase) when `DATABASE_URL` is set; otherwise an embedded SQLite file for local development |

## Running it locally

Two terminals, one per half. First time only, create the backend config from the template
and set `JWT_SECRET` to a long random string:

```bash
cp backend/.env.example backend/.env
```

```bash
cd backend && npm install && npm run dev      # API + sockets on http://localhost:5001
```

```bash
cd frontend && npm install && npm start       # app on http://localhost:3000
```

Without `DATABASE_URL` the backend uses `backend/data/chat.sqlite` and seeds three demo users
(`parth`, `ava`, `milo`) with a sample space; their shared password is in
`backend/src/config/seed.js`. Or just create an account.

To use **Supabase** (or any PostgreSQL) instead, set `DATABASE_URL` in `backend/.env` to the
project's *Session pooler* connection string. Tables are created on first start; demo users are
**not** seeded into PostgreSQL.

Configuration lives in `backend/.env` (never committed; `backend/.env.example` lists the keys): `PORT`, `JWT_SECRET`, `CLIENT_URL` (the frontend origin
allowed to open sockets), `SQLITE_PATH`, `REDIS_URL` (lets several copies share real-time events), and `TWO_FACTOR_KEY` (encrypts authenticator secrets;
two-step verification is unavailable without it). The frontend reads `REACT_APP_API_URL`
(default `http://localhost:5001`).

```bash
cd frontend && npm test                        # unit tests
```

### Everything in containers (docker compose)

One command builds and starts the whole system — load balancer + React app, two backend copies,
PostgreSQL and Redis — at **one address**, http://localhost:8080:

```bash
docker compose up --build
```

```bash
REDIS_URL= docker compose up        # same, without Redis: the original failure
```

```bash
docker compose down                 # stop (add -v to also delete the stack's database)
```

It uses its own throwaway PostgreSQL (demo users `ava`, `milo`, password in
`backend/src/config/seed.js`), never Supabase, and reads `JWT_SECRET` / `TWO_FACTOR_KEY` from
`backend/.env` at run time. Each backend copy exposes `/healthz` (alive) and `/readyz` (database and
Redis reachable) and shuts down gracefully on SIGTERM.

### On Kubernetes (k3d)

The same containers, now run by real Kubernetes instead of Docker Compose — a Deployment with 2
backend pods, a Service load-balancing between them, readiness/liveness probes, and a Traefik
Ingress, all on a local cluster (`k3d`, Kubernetes-in-Docker):

```bash
brew install k3d kubectl
./scripts/k8s-up.sh              # cluster up, images built, app deployed — http://localhost:8080
```

```bash
REDIS_OFF=1 ./scripts/k8s-up.sh  # same, but without Redis: the original failure, on real pods
```

```bash
./scripts/k8s-chaos.sh           # delete one backend pod; check Kubernetes replaces it and its
                                  # users reconnect to the survivor (docs/evidence/04-kubernetes.md)
```

```bash
./scripts/k8s-down.sh            # delete the cluster
```

Manifests live in `k8s/` as a Kustomize base + a `local` overlay (its own throwaway in-cluster
PostgreSQL — never Supabase); a cloud overlay is a later addition, not a rewrite. First run on a
fresh cluster pulls several images from inside the cluster (not this Mac's Docker cache) and can
take a few minutes on a slow network — re-running the script picks up where it left off.

The backend exposes Prometheus metrics at `GET /metrics` (connections, messages, broadcast
latency; see `backend/src/metrics.js`). Prometheus and Grafana run as two more pods in the same
k3d cluster, scraping it automatically — nothing to configure:

```bash
./scripts/k8s-dashboards.sh      # Grafana: http://localhost:3001  Prometheus: http://localhost:9090
```

### Tests

API suites (accounts, friends, spaces, messages, invitations, two-factor, cross-copy delivery),
run against any running backend — by default the compose stack:

```bash
cd backend && npm run test:api                  # BASE=http://localhost:5001 to target another backend
```

```bash
cd backend && node tests/failover.compose.js     # stops one Compose copy, checks its users move to the other
```

```bash
cd backend && node tests/failover.k8s.js         # deletes one k8s pod, checks the same
```

Don't point the suites at a backend using a real database (e.g. Supabase): they create users.

### Load testing

`loadtest/socketio-load.js` fakes many simultaneous chat users against any running backend. k6 has
no Socket.IO client, so it speaks the Engine.IO/Socket.IO protocol directly over a raw WebSocket —
see the script's header comment for the full protocol cheatsheet.

```bash
brew install k6
k6 run loadtest/socketio-load.js                     # local rehearsal: ramps to 20 VUs
k6 run -e PROFILE=full loadtest/socketio-load.js      # PLAN.md's real profile: 0->50->100->150 VUs
```

Like the test suites, it only ever creates throwaway users (via the real `/api/auth/register`
endpoint) in whichever database `BASE` points at — never Supabase.

### Running two backend copies (the scaling experiment)

One command starts both copies and both frontends — see [docs/DEMO.md](docs/DEMO.md) for the
full presentation script:

```bash
./scripts/demo-two-copies.sh            # the problem: messages don't cross copies
```

```bash
./scripts/demo-two-copies.sh --fixed    # the fix: copies share events through Redis (Docker)
```

Add `--local-db` to either to use the local SQLite file instead of Supabase — for networks that
block database ports. The script checks both copies are ready before saying so.

```bash
cd backend && npm run watch-redis        # live, plain-English view of what flows through Redis
```

Or by hand; each copy names itself in its logs and in the app's "Live · …" badge:

```bash
cd backend && INSTANCE_NAME=copy-A PORT=5001 CLIENT_URL=http://localhost:3000 npm run dev
```

```bash
cd backend && INSTANCE_NAME=copy-B PORT=5002 CLIENT_URL=http://localhost:3001 npm run dev
```

```bash
cd frontend && PORT=3001 REACT_APP_API_URL=http://localhost:5002 npm start
```

Without a shared adapter, a message sent through one copy doesn't reach users on the other —
see [docs/evidence/01-two-copies-break.md](docs/evidence/01-two-copies-break.md). With
`REDIS_URL` set, every copy shares live events through Redis — see
[docs/evidence/02-redis-fix.md](docs/evidence/02-redis-fix.md).

## Where things live

```
wp_project/
├── PLAN.md                      the scaling experiment, phase by phase
├── docs/CHANGE_LOG.md           dated record of every change
│
├── compose.yaml                 the whole system in containers (docker compose up)
├── k8s/                         same system on Kubernetes (base + local overlay, ./scripts/k8s-up.sh)
│   ├── base/                    Deployments, Services, Ingress — substrate-agnostic
│   └── overlays/local/          k3d: its own throwaway Postgres, generated secret
│
├── backend/
│   ├── Dockerfile               backend image (non-root, health check)
│   ├── server.js                Express + Socket.IO entry point
│   ├── tests/                   API test suites (npm run test:api) and the failover tests
│   ├── data/                    SQLite database (created on first run)
│   └── src/
│       ├── lifecycle.js         /healthz, /readyz and graceful shutdown
│       ├── config/              db.js picks PostgreSQL or SQLite (db/postgres.js, db/sqlite.js);
│       │                        schema.js (tables, written once), seed.js (demo data), instance.js
│       ├── routes/              URL → controller mapping, one file per resource
│       ├── controllers/         request validation and responses
│       ├── services/            database queries, one file per resource
│       ├── middleware/          auth (JWT), uploads, error handler
│       ├── utils/               tokens (JWT kinds), totp (authenticator codes), secretBox (encryption)
│       └── socket/              real-time events; adapter.js shares them across copies via Redis
│
└── frontend/
    ├── Dockerfile               builds the app, serves it with nginx
    ├── nginx/default.conf       load balancer: /api and /socket.io to the backend copies
    ├── public/                  index.html (applies the theme before first paint), favicon
    └── src/
        ├── index.js             entry: fonts, styles, <App />
        ├── App.js               the route map — start here
        ├── config.js            product name and API URL
        ├── routes/              RequireAuth / GuestOnly route guards
        ├── context/             app-wide state: Auth, Theme, Workspace (socket, spaces, presence)
        ├── lib/                 plain helpers: API client, socket, formatting (+ tests)
        ├── layout/              signed-in shell: AppLayout, Sidebar, SpaceItem
        ├── pages/               one folder per screen, with the pieces only it uses
        │   ├── auth/            AuthLayout, LoginPage (+ TwoFactorStep), RegisterPage
        │   ├── friends/         FriendsPage, PersonRow
        │   ├── channel/         ChannelPage, SpacePage, MessageList, Composer, TypingLine
        │   ├── invite/          InvitePage (landing page for invite links)
        │   └── settings/        SecurityPage: two-step verification setup and recovery codes
        ├── dialogs/             modal forms: create/join space, create channel, invite
        ├── components/          small shared UI: Avatar, Modal, FormError, ThemeToggle
        └── styles/              index.css imports the rest; tokens.css holds both themes
```

**Conventions**

- A component used by one screen lives in that screen's folder; it moves to `components/` only
  once a second screen needs it.
- One component per file, named after the file.
- Colours are CSS custom properties in `styles/tokens.css`; components never hard-code colours,
  which is what makes the dark theme work.
- The backend speaks database column names (`MessageID`, `ChannelName`); `lib/format.js`
  converts them to the camelCase shape the UI uses.

## Two-step verification

Optional, per account, from **Security** (shield icon in the sidebar footer). Uses standard
authenticator-app codes (TOTP, RFC 6238), so it costs nothing and needs no SMS or email provider.

- **Sign-in:** a correct password returns a 5-minute *challenge* token instead of a session; the
  code step (`POST /api/auth/login/2fa`) exchanges it for a real one. Challenge tokens are refused
  everywhere else, including the socket handshake.
- **Recovery:** 10 single-use recovery codes are shown once when 2FA is turned on; only their
  hashes are stored.
- **Protections:** TOTP secrets are AES-256-GCM encrypted with `TWO_FACTOR_KEY`; a code can't be
  used twice; 5 wrong codes per sign-in and 10 per account per 15 minutes; turning 2FA off or
  replacing recovery codes needs the password *and* a current code.

## Real-time events

The client connects with its JWT (`auth.token`). Events it emits use acknowledgement callbacks
that reply `{ ok, error? }`.

| Client → server | Server → client |
|---|---|
| `join:channel`, `leave:channel`, `join:server` | `session:ready` (which node is serving you) |
| `message:send` `{ channelId, content, sentAt }` | `message:new`, `message:update`, `message:delete` |
| `message:edit`, `message:delete` | `typing:start`, `typing:stop` |
| `typing:start`, `typing:stop` | `friend:request`, `friend:response`, `friend:removed` |
| | `channel:created`, `user:status`, `invitation:new` |

Only members of a space can join its channel rooms.
