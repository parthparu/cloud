# Evidence 01 — Two backend copies, no shared adapter: live messages don't cross

**Date:** 2026-09-26 · **Setup:** laptop, no containers (PLAN.md Phase 3 preview) · **Result:** failure reproduced

## Setup

| | Frontend | Backend copy | Signed in as |
|---|---|---|---|
| Browser 1 | http://localhost:3000 | `copy-A` on :5001 | ava |
| Browser 2 | http://localhost:3001 | `copy-B` on :5002 | milo |

Both copies read and write the **same database file** (`backend/data/chat.sqlite`), so the data
layer is shared. Neither copy has a Socket.IO adapter, so each only knows its own connections.
Both users were in `#general` of the "Builders Lab" space. Each browser's badge confirmed which
copy served it ("Live · copy-A" / "Live · copy-B").

Commands:

```bash
INSTANCE_NAME=copy-A PORT=5001 CLIENT_URL=http://localhost:3000 npm run dev   # backend/
INSTANCE_NAME=copy-B PORT=5002 CLIENT_URL=http://localhost:3001 npm run dev   # backend/
PORT=3001 REACT_APP_API_URL=http://localhost:5002 npm start                   # frontend/
```

## What happened

ava sent: *"Hi milo, can you see this? (sent via copy-A)"*

| Observer | Saw the message live? |
|---|---|
| ava (copy-A) | Yes |
| milo (copy-B) | **No** — last visible message stayed the previous one |

**copy-A log**

```
[copy-A] User connected: ava (2)
[copy-A] message 3 from ava -> channel:1, delivered to 1 socket(s) on this copy
```

**copy-B log** — milo's connection, then nothing about message 3:

```
[copy-B] User connected: milo (3)
```

**Database** — the message was stored correctly:

```
MessageID  Username  MessageContent                                MessageDate
3          ava       Hi milo, can you see this? (sent via copy-A)  2026-09-26T13:50:23.139Z
```

Reloading milo's page shows the message, because history is read from the database.

## Conclusion

The failure is entirely in the **broadcast layer**: `io.to('channel:1').emit(...)` on copy-A
reaches only sockets connected to copy-A. Persistence is correct. No error is raised anywhere —
the message silently doesn't arrive. This is blocker B-1 in PLAN.md §2.2; the fix under test is a
shared Redis adapter (Phase 3b).
