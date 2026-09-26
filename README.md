# ChatScale

Group chat for people who already know each other: accounts, friends, **spaces** with text
channels, real-time messages, and a light/dark theme.

It is also the subject of a cloud-scaling study — see [PLAN.md](PLAN.md) for the experiment and
[docs/CHANGE_LOG.md](docs/CHANGE_LOG.md) for every change made so far.

| Layer | Stack |
|---|---|
| Frontend | React 18 (Create React App), React Router 6, `socket.io-client`, IBM Plex fonts (self-hosted) |
| Backend | Node.js ≥ 22, Express, Socket.IO 4.8, JWT auth |
| Database | Embedded SQLite (`node:sqlite`) — to be replaced by PostgreSQL in PLAN.md Phase 2 |

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

On first start the backend creates `backend/data/chat.sqlite` and seeds three demo users
(`parth`, `ava`, `milo`) with a sample space. Their shared password is in
`backend/src/config/db.js` (`seedDatabase`). Or just create an account.

Configuration lives in `backend/.env` (never committed; `backend/.env.example` lists the keys): `PORT`, `JWT_SECRET`, `CLIENT_URL` (the frontend origin
allowed to open sockets) and `SQLITE_PATH`. The frontend reads `REACT_APP_API_URL`
(default `http://localhost:5001`).

```bash
cd frontend && npm test                        # unit tests
```

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
│       ├── config/db.js         schema, seed data, and a mysql2-style execute() wrapper
│       ├── routes/              URL → controller mapping, one file per resource
│       ├── controllers/         request validation and responses
│       ├── services/            database queries; inviteDelivery.js is the email placeholder
│       ├── middleware/          auth (JWT), uploads, error handler
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
        │   ├── auth/            AuthLayout, LoginPage, RegisterPage
        │   ├── friends/         FriendsPage, PersonRow
        │   ├── channel/         ChannelPage, SpacePage, MessageList, Composer, TypingLine
        │   └── invite/          InvitePage (landing page for invite links)
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

## Real-time events

The client connects with its JWT (`auth.token`). Events it emits use acknowledgement callbacks
that reply `{ ok, error? }`.

| Client → server | Server → client |
|---|---|
| `join:channel`, `leave:channel`, `join:server` | `session:ready` (which node is serving you) |
| `message:send` `{ channelId, content, sentAt }` | `message:new`, `message:update`, `message:delete` |
| `message:edit`, `message:delete` | `typing:start`, `typing:stop` |
| `typing:start`, `typing:stop` | `friend:request`, `friend:response`, `friend:removed` |
| | `channel:created`, `user:status` |

Only members of a space can join its channel rooms.
