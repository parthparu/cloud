# Demo Guide — "Alice and Bob": why a chat app breaks when you add servers

**Length:** about 5 minutes · **Needs:** this laptop, no internet (unless using Supabase) ·
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
| 9 | Close | "Our project proves this, fixes it with a shared message bus called Redis, measures what the fix costs, and tests it on real cloud infrastructure." |

### Showing the database (step 7)

**Local database** — in a second terminal:

```bash
sqlite3 -header -column ~/dev/wp_project/backend/data/chat.sqlite "SELECT MessageID, MessageContent, MessageDate FROM Messages ORDER BY MessageID DESC LIMIT 1;"
```

**Supabase** — open the Supabase dashboard → **Table Editor** → `messages`; the newest row is at
the bottom. (Visually better for an audience.)

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

**"How do you fix it?"**
A shared message bus — Redis pub/sub. Every copy publishes each message to Redis and listens to
Redis; whichever copy holds Bob's connection then delivers it. Socket.IO has an official adapter for
exactly this.

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
| "Request failed (404)" | The backends are older than the frontend (new feature added since they started). Ctrl-C the demo and start it again |
| Asked to sign in again | Normal after restarting; each window keeps its own session |

**Stop the demo:** Ctrl-C in the demo terminal stops everything.

---

## Evidence already recorded

[docs/evidence/01-two-copies-break.md](evidence/01-two-copies-break.md) — the first run, with
logs and the database row.
