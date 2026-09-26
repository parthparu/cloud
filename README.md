# ChatScale

Group chat for people who already know each other: accounts with optional two-step
verification, friends, **spaces** with text channels (join by invite link or by username
invitation), real-time messages, and a light/dark theme.

It is also the subject of a cloud-scaling study — see [PLAN.md](PLAN.md) for the experiment and
[docs/CHANGE_LOG.md](docs/CHANGE_LOG.md) for every change made so far.

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
allowed to open sockets), `SQLITE_PATH`, and `TWO_FACTOR_KEY` (encrypts authenticator secrets;
two-step verification is unavailable without it). The frontend reads `REACT_APP_API_URL`
(default `http://localhost:5001`).

```bash
cd frontend && npm test                        # unit tests
```

### Running two backend copies (the scaling experiment)

One command starts both copies and both frontends — see [docs/DEMO.md](docs/DEMO.md) for the
full presentation script:

```bash
./scripts/demo-two-copies.sh
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
see [docs/evidence/01-two-copies-break.md](docs/evidence/01-two-copies-break.md).

## Where things live

```
wp_project/
├── PLAN.md                      the scaling experiment, phase by phase
├── docs/CHANGE_LOG.md           dated record of every change
│
├── backend/
│   ├── server.js                Express + Socket.IO entry point
│   ├── data/                    SQLite database (created on first run)
│   └── src/
│       ├── config/              db.js picks PostgreSQL or SQLite (db/postgres.js, db/sqlite.js);
│       │                        schema.js (tables, written once), seed.js (demo data), instance.js
│       ├── routes/              URL → controller mapping, one file per resource
│       ├── controllers/         request validation and responses
│       ├── services/            database queries, one file per resource
│       ├── middleware/          auth (JWT), uploads, error handler
│       ├── utils/               tokens (JWT kinds), totp (authenticator codes), secretBox (encryption)
│       └── socket/              real-time events: rooms, messages, typing, presence
│
└── frontend/
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
