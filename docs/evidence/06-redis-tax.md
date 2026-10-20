# Evidence 06 — The Redis tax: same-pod vs cross-pod delivery latency

**Date:** 2026-10-20 · **Setup:** k3d cluster from Evidence 04/05, `REDIS_URL` on (the fix) ·
**Result:** no measurable difference locally — both same-pod and cross-pod delivery land at 1–3ms,
because every pod and Redis itself share one physical machine.

## Why this matters

PLAN.md Phase 6's question: Evidence 04 already proved cross-pod delivery *works* through Redis
(CHG-0023's fix). This asks what it *costs* — does the extra Redis publish/subscribe hop add
meaningful latency compared to a same-pod broadcast (a direct in-process `io.to().emit()`, no
network hop at all)?

## Method

`backend/tests/redis-tax.k8s.js` (new): connects two users, finds one receiver connection that
lands on the *same* backend pod as the sender and another that lands on a *different* pod (k3d's
Service load-balances new connections somewhat randomly — found by reconnecting until both cases
are seen), then sends messages one at a time, waiting for arrival before the next send, recording
wall-clock send→receive latency for each. 5 warm-up messages discarded per pairing, then n=200
samples each.

```bash
kubectl -n chatscale get pods -l app=backend   # confirm >=2 pods
cd backend && BASE=http://localhost:8080 SAMPLES=200 node tests/redis-tax.k8s.js
```

## Result

```
Same-pod (ms):   { n: 200, p50: 1, p95: 2, p99: 2, max: 3 }
Cross-pod (ms):  { n: 200, p50: 1, p95: 1, p99: 3, max: 3 }

Redis tax, p50: +0 ms
Redis tax, p95: -1 ms
Redis tax, p99: +1 ms
```

Reproduced twice (n=60 first, then n=200) with the same shape both times: both distributions sit
in the 1–3ms range, with differences at the noise floor of `Date.now()`'s millisecond resolution —
not a consistent, directional gap.

## Why — and the honest limitation

This isn't "the Redis tax is zero" as a general claim. It's zero **on this specific setup**: a k3d
cluster is several containers sharing one Docker daemon on one physical machine, all on the same
bridge network, with Redis itself running as just another container a few hops away on that same
loopback-adjacent network. The actual network round-trip for a Redis `PUBLISH`/`SUBSCRIBE` here is
sub-millisecond — there's no real network in the way to charge a tax on.

On a real multi-machine cluster (what Phase 5 would have measured, see `PLAN.md`'s r4 amendment),
pods and the Redis instance would be on genuinely separate hosts, possibly separate availability
zones — real network latency (and a managed Redis's own request handling) would very likely produce
a measurable, nonzero tax there. That measurement needs real cloud infrastructure and is out of
this project's finalized scope (r4) — recorded here as a limitation, not glossed over.

## What this result is still worth

It isolates *where* the Redis fix's cost would show up if it showed up at all: not in the
mechanism itself (Redis pub/sub dispatch is fast), but specifically in the network hop between
machines that a local single-Docker-daemon cluster can't reproduce. Combined with
[Evidence 05](05-autoscaling.md)'s finding that connection count — not CPU — is the right
autoscaling signal for this app, the overall picture is consistent: this workload's real costs are
about *how many connections are open*, not about the computational cost of relaying a message
through Redis.
