# Evidence 03 — Stopping a copy: its users move to the other copy, nobody else is affected

**Date:** 2026-09-27 · **Setup:** `docker compose` stack — nginx load balancer, two backend
copies, PostgreSQL, Valkey · **Tool:** `backend/tests/failover.compose.js` · **Result:** pass,
after three defects found by this test were fixed

## Method

10 users connect through the load balancer (http://localhost:8080) with the browser app's connection
settings; `least_conn` places 5 on each copy. One copy is stopped exactly as Docker or Kubernetes
stops it (`docker compose stop` → SIGTERM). The test records who is disconnected, when each user is
connected again, and to which copy.

## Result (final)

| | Stop copy-A | Stop copy-B |
|---|---|---|
| Copy stopped cleanly (no forced exit) | ✅ 3.2 s | ✅ 3.1 s |
| Users on the *other* copy disconnected | **0** | **0** |
| Users of the stopped copy reconnected | **5/5**, all to copy-B | **5/5**, all to copy-A |
| Time without a connection | 3.7–4.3 s | 3.7–5.5 s |

Copy-A's own log:

```
[copy-A] SIGTERM received — draining for 3s, then closing
[copy-A] closed 5 live connection(s); they will reconnect elsewhere
[copy-A] http server closed
[copy-A] database and redis connections closed
[copy-A] stopped cleanly in 3.0s
```

The 3.7–5.5 s gap is ~1 s of the client's randomised reconnect delay, up to 2 s of nginx trying the
stopped copy's address before moving on, and the reconnection itself. On Kubernetes, readiness
checks remove a stopping pod from the load balancer *during* its drain, which should shorten it.

## Defects this test found (all fixed)

1. **Shutting down one copy disconnected every user on every copy.** With the Redis adapter,
   `io.disconnectSockets()` is broadcast to all copies. First run: all 10 users disconnected, not 5.
   Fix: `io.close()`, which acts on this copy only. *A rolling update would have logged everyone out.*
2. **Shutdown hung until the 13 s deadline forced it.** The HTTP server waited for idle keep-alive
   connections and for live WebSockets to close politely. Fix: `io.close()` plus
   `closeIdleConnections()` / `closeAllConnections()` after 2 s. Clean stop now takes ~3 s (the drain).
3. **Reconnecting users hung for up to 60 s.** A stopped container's address doesn't refuse
   connections, it goes silent; nginx still had it cached and waited its default 60 s before trying
   the other copy. Fix: `proxy_connect_timeout 2s`, plus re-resolving backend addresses every 5 s
   (`resolve`), since recreated containers get new addresses.

## Also verified

- Health endpoints: `/readyz` → `{"status":"ready","checks":{"database":"ok","redis":"ok"}}`;
  `/healthz` → alive. Readiness reports "shutting down" (503) during the drain.
- All API suites through the load balancer: 4/4 (and 3/3 repeat runs); cross-copy latency 2 ms.
- `REDIS_URL= docker compose up`: the original failure reproduces inside containers.
