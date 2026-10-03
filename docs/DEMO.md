# Demo Guide — "Alice and Bob": why a chat app breaks when you add servers

**Length:** about 7 minutes (5 for the problem, 2 for the fix) · **Needs:** this laptop, no internet (unless using Supabase) ·
**Presenters:** Parth, B118

---

## The point you are making

> When a live chat app gets busy, the usual fix is to run more copies of the server.
> For chat, that silently breaks: a message sent to one copy never reaches people on the other.
> Nothing crashes and no error appears — the message just doesn't arrive.

Everything below exists to make that one sentence visible.

---

## Prepare (the day before)

1. **Create the two accounts** (one time). Start the demo (below), then:
   - In window 1 (http://localhost:3000) sign up as **alice**.
   - In window 2 (http://localhost:3001) sign up as **bob**.
   - As alice: create a space called **Demo Day**, click **Invite**, type `bob`, click **Invite**.
   - As bob: the invitation appears at the top of the sidebar — click the ✓ to join.
   - Both of you should now be in `#general` of Demo Day.
2. **Do one full run-through**, then delete test messages if you like (hover → bin icon).
3. **Screen layout** for the projector:
   ```
   ┌──────────────────┬──────────────────┐
   │ Alice  :3000      │ Bob    :3001      │
   │ (normal window)   │ (second window)   │
   ├──────────────────┴──────────────────┤
   │ Terminal running the demo script      │
   └───────────────────────────────────────┘
   ```
   Use a large terminal font (Cmd +). Keep each browser's **bottom-left badge** visible:
   "Live · copy-A" and "Live · copy-B".

   **Use two separate windows, not two tabs.** Chrome may put a hidden tab to sleep and reload it
   when you switch back — and a reload fetches messages from the database, which makes the message
   *look* delivered. Both windows must stay visible, untouched and un-refreshed until step 8.
   Don't edit any code while the demo runs either: the frontend reloads the page on every change.

---

## Before the day: check the venue's network

Supabase needs outgoing port 5432, which many college and office networks block. On the venue's
Wi-Fi, run the demo once beforehand. If it stops with **"NOT READY … connection timeout"**, plan to
use a **phone hotspot**, or run with `--local-db` and prepare alice/bob in the local database.

## Start

```bash
cd ~/dev/wp_project && ./scripts/demo-two-copies.sh
```

Wait for **"Ready."** (about 20 seconds). Refresh both browser windows once.

---

## The demo, step by step

| # | Do | Say |
|---|---|---|
| 1 | Point at the terminal | "We're running **two copies** of the same backend server — copy-A and copy-B. This is what every website does when it gets busy." |
| 2 | Point at both badges | "Alice is connected to copy-A. Bob is connected to copy-B. Same app, same database, different servers." |
| 3 | **Alice** types *"Hi Bob, can you see this?"* and presses Enter | — |
| 4 | Point at Alice's window | "Alice sees her message." |
| 5 | Point at Bob's window — **nothing** | "Bob sees… nothing. No error, no warning. It just never arrived." |
| 6 | Point at the terminal line `[copy-A] message … delivered to 1 socket(s) on this copy` | "copy-A delivered it to exactly **one** person — Alice herself. copy-B never even heard about it." |
| 7 | Show the database (below) | "But the message **was saved**. The data is fine — only the live delivery is broken." |
| 8 | **Refresh** Bob's window — the message appears | "When Bob reloads, it's there, because reloading reads the database. So it isn't lost — it's just not *live*. That's what makes this bug dangerous: in testing with one server it never happens." |
| 9 | Bridge to part 2 | "So how do real apps fix this? Let's switch it on." |

### Showing the database (step 7)

**Supabase** (the database in use) — in the Supabase dashboard open **SQL Editor** and run the saved
query **"Demo – latest messages"** (create it once, beforehand):

```sql
SELECT m.messageid AS id, u.username AS sender, c.channelname AS channel,
       m.messagecontent AS message, m.messagedate AS sent_at
FROM messages m
JOIN users u    ON u.userid = m.userid
JOIN channels c ON c.channelid = m.channelid
ORDER BY m.messageid DESC
LIMIT 10;
```

Say: *"This is a managed PostgreSQL database on Supabase's servers in Mumbai. Both copies read and
write it. The message is saved — the data layer works. A database stores data; it doesn't push it
to anyone's screen. That's the part that's broken."*

**Don't open the `users` table on the projector** — it holds password hashes and encrypted 2FA
secrets. Use the query above.

**Local database** (only if running without Supabase) — in a second terminal:

```bash
sqlite3 -header -column ~/dev/wp_project/backend/data/chat.sqlite "SELECT MessageID, MessageContent, MessageDate FROM Messages ORDER BY MessageID DESC LIMIT 1;"
```


---

## Part 2 — the fix (about 2 minutes)

Needs **Docker Desktop running** (it starts Redis). Check before the demo: the whale icon in the
menu bar says "Docker Desktop is running".

| # | Do | Say |
|---|---|---|
| 1 | **Ctrl-C** in the demo terminal, then run `./scripts/demo-two-copies.sh --fixed` | "Same app, same code, same two servers. One change: both copies now share a message bus — Redis." |
| 2 | Wait for **"Ready. FIXED …"**; refresh both windows once; both back in `#general` | — |
| 3 | Point at the terminal line `[realtime] adapter: Redis …` | "Each copy connects to Redis at start-up." |
| 4 | **Alice** types *"Hi Bob, what about now?"* | — |
| 5 | Point at **Bob's window** — it appears **instantly, with a green highlight** | "Bob gets it immediately. The highlight means it arrived *live*, not from a page reload." |
| 6 | Point at the terminal: `delivered to 1 socket(s) on this copy + 1 on other copies via Redis` | "copy-A published it to Redis, copy-B picked it up and delivered it to Bob." |
| 6b | *(optional, strong)* Show the **Redis watcher** (below) and have Alice send one more message | "This is Redis itself, live. Every line is one copy telling all the others something." |
| 7 | Close | "The fix works — but it isn't free. Every message now makes an extra trip through Redis, and if Redis goes down, we're back to the broken behaviour. Measuring both of those, and running this on cloud Kubernetes with automatic scaling, is the rest of our project." |

### The Redis watcher (for step 6b)

Before part 2, open a **second terminal** next to the demo terminal:

```bash
cd ~/dev/wp_project/backend && npm run watch-redis
```

It translates what flows through Redis into plain words:

```
14:32:07  copy-A → Redis → every copy   message:new for channel:1
          alice: "Hi Bob, what about now?"
14:32:15  copy-B → Redis → every copy   friend:request for user 1 (personal notification)
          friend request from bob
14:33:02  shared counter 2fa:user:2 = 3
          wrong 2FA codes so far for user 2 — every copy sees this same number
```

Say: *"Redis messages disappear the moment they're delivered — so we can't show them afterwards;
we watch them fly past. Notice it's not just chat: friend requests, online status, even our
two-factor lockout counter all go through here. Anything one copy knows that the others need to
know has to be shared."*

(`npm run watch-redis -- --all` also shows typing indicators and the copies' internal questions to
each other.)

---

## Questions faculty are likely to ask

**"Why not just use one server?"**
One server has a ceiling — CPU, memory, how many connections it can hold. Past that, you *must* add
servers. And one server is a single point of failure: if it restarts, everyone disconnects.

**"Why doesn't the second server know about the message?"**
Each live connection (a WebSocket) is held open by exactly one server. When copy-A sends a message
"to the channel", it can only push it down the connections *it* holds. Nothing tells copy-B.

**"Isn't the database shared? Why doesn't that fix it?"**
The database stores messages; it doesn't *push* them to anyone. Delivery happens over the live
connections, and those are split between the copies.

**"How exactly does the fix work?"**
Redis publish/subscribe. When copy-A has a message for a channel, instead of only pushing it to its
own connections it also publishes it to Redis; every copy is subscribed and pushes it to *its* users
in that channel. Socket.IO's official Redis adapter does this. We use Valkey, the open-source Redis.

**"Was it only chat messages that were broken?"**
No — every live notification (friend requests, invitations, new channels) had the same bug, and so
did anything a copy remembered on its own, like the count of wrong two-factor codes. The same fix
covers all of them.

**"Doesn't that add a new problem?"**
Yes — two, and measuring them is part of the project: every message takes an extra network hop
(we measure the delay), and Redis becomes a new single point of failure (we test what happens when
it dies).

**"Is this realistic, or just a toy?"**
Every chat product that scales (Slack, Discord, WhatsApp Web) has to solve this. The same app, same
code, runs here on a laptop and later on Kubernetes in the cloud; only the number of copies changes.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| "Port … is already in use" | Another server is running. Stop it (Ctrl-C in its terminal), start again |
| Badge says "Reconnecting…" | The script isn't ready yet, or was stopped. Wait for "Ready.", refresh |
| Bob **does** get the message | Check the badges say copy-A and copy-B. If they do, Bob's page reloaded (tab switch, refresh, or a code edit) — the terminal will show `User disconnected: bob` then `User connected: bob`, and the message line still says `delivered to 1 socket(s)`. Use side-by-side windows and resend |
| **"NOT READY … connection timeout"** at start | The network blocks database ports (common on college/office Wi-Fi), so Supabase can't be reached. Use a **phone hotspot**, or add **`--local-db`** (e.g. `./scripts/demo-two-copies.sh --local-db`, `… --fixed --local-db`). The local database doesn't have alice/bob — sign up there once, or use the demo users `ava` / `milo` (password in `backend/src/config/seed.js`) |
| `--fixed` says Docker is needed | Open Docker Desktop, wait until it's running, start again |
| "Request failed (404)" | The backends are older than the frontend (new feature added since they started). Ctrl-C the demo and start it again |
| Asked to sign in again | Normal after restarting; each window keeps its own session |

**Stop the demo:** Ctrl-C in the demo terminal stops everything.

---

## Evidence already recorded

- [docs/evidence/01-two-copies-break.md](evidence/01-two-copies-break.md) — the failure, with
  logs and the database row.
- [docs/evidence/02-redis-fix.md](evidence/02-redis-fix.md) — the fix, measured both ways.
