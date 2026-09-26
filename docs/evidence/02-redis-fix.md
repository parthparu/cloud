# Evidence 02 — The fix: a shared Redis adapter makes live events cross copies

**Date:** 2026-09-27 · **Setup:** laptop, two backend copies, Valkey 8 (open-source Redis) in
Docker · **Result:** fix verified; failure (Evidence 01) and fix reproduced from the same code by
one setting

## What changed

`backend/src/socket/adapter.js`: when `REDIS_URL` is set, Socket.IO uses
`@socket.io/redis-adapter`. Every broadcast is published to Redis; every copy subscribes and
delivers it to its own users. Without `REDIS_URL` nothing changes — the in-memory adapter, and the
original failure, remain available for comparison.

## Automated measurement (same code, one setting different)

Two copies sharing one database; Alice connected to `copy-A`, Bob to `copy-B`.

| | `REDIS_URL` unset | `REDIS_URL` set |
|---|---|---|
| Alice's message reaches Bob | **No** | **Yes — 6 ms** (send → receive, local machine) |
| Friend request (sent via copy-A) reaches Bob live | **No** | **Yes** |
| copy-A's log line | `delivered to 1 socket(s) on this copy` | `delivered to 1 socket(s) on this copy + 1 on other copies via Redis` |

## Browser verification (demo script, `--fixed`)

- ava on `copy-A` (:3000 in the real demo), milo on `copy-B` (:3001), both in `#general`.
- ava sent *"Milo, can you see this? (sent via copy-A, with Redis)"*.
- milo's page — confirmed **not reloaded** (a marker set on the page beforehand survived) —
  received it **7 ms** after send, highlighted as a live arrival.
- copy-A log:
  ```
  [copy-A] message 3 from ava -> channel:1, delivered to 1 socket(s) on this copy + 1 on other copies via Redis
  ```

## A wider finding

The failure was never specific to chat messages. **Every** live event emitted by one copy —
friend requests, space invitations, new channels, presence — was invisible to users on other
copies, and so was per-copy memory such as the two-factor wrong-code counters (a user could get
5 guesses *per copy*). With Redis configured, those counters are shared too: measured, a 6th wrong
code spread across two copies is refused with Redis and still accepted without it.

**Rule this suggests:** any state a copy keeps in its own memory is a scaling bug waiting to happen.

## What the fix costs (to be measured, PLAN.md Phase 6)

1. **Latency:** every broadcast now makes a network hop through Redis. 6–7 ms locally includes
   everything; the Redis share needs measuring under load, and on a managed Redis in the cloud.
2. **A new single point of failure:** if Redis stops, cross-copy delivery stops. Chaos test planned.
