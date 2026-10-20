# Evidence 07 — Scaling efficiency: 1 → 2 → 4 pods

**Date:** 2026-10-20 · **Setup:** k3d cluster, identical fixed load (100 VUs, k6's `constant-vus`
executor, 90s each), backend manually pinned at 1, then 2, then 4 pods (HPA off) · **Result:**
message delivery never failed at any pod count, but p95 ack latency dropped from 110ms (1 pod) to
85ms (2 pods) to 34ms (4 pods) — roughly a 3.2x improvement from 1 to 4 pods.

## Why this matters

PLAN.md Phase 6's other question, alongside the Redis tax: is throughput/latency actually linear
in pod count, or does adding pods not help this particular workload? A 1-pod run is the control —
every later number is measured against it, not against an assumption of what "should" happen.

## Method

`scripts/scaling-efficiency.sh` (new): deletes any active HPA, then for each of 1/2/4 replicas —
scales the Deployment, waits for the rollout, runs `loadtest/socketio-load.js` with a new `fixed`
load profile (`PROFILE=fixed`, k6's `constant-vus` executor: a steady 100 VUs for 90s, not a ramp
— PLAN.md: "fixed load, pods pinned at 1 → 2 → 4"), saves the summary, repeats. Restores the
backend to its base-manifest replica count (2) when done.

**100 VUs, not 20:** calibrated first — at the 20-VU load Evidence 05's HPA comparison used,
nothing is saturated enough to show a scaling difference at all (consistent with that evidence's
own finding that CPU barely moves under light chat load). A quick 100-VU/30s/1-pod run showed a
real, clearly non-flat signal (p95 ack latency 96ms vs ~17ms at 20 VUs) — enough headroom to
actually see a difference as pods are added.

```bash
./scripts/scaling-efficiency.sh                 # FIXED_VUS=100, FIXED_DURATION=90s (defaults)
grep -A2 'message_ack_latency' /tmp/scaling-efficiency/*pod.log
```

## Result

| Pods | p50 | p90 | p95 | avg | Messages delivered | Success rate |
|---|---|---|---|---|---|---|
| 1 | 40ms | 94ms | **110ms** | 52ms | 1800 | 100% |
| 2 | 28ms | 66ms | **85ms** | 32ms | 1900 | 100% |
| 4 | 14ms | 29ms | **34ms** | 16ms | 1900 | 100% |

Zero failed checks in any of the three runs (`checks_failed: 0.00%` across all three). Message
*delivery* never degraded, even at 1 pod handling all 100 connections — what scaled was *latency*:
p95 dropped by roughly a third each time a pod was added, a reduction factor of about **3.2x** from
1 pod to 4.

## Reading this honestly

1. **Throughput looks flat because this workload is connection-paced, not throughput-paced.** Each
   VU sends on a fixed wall-clock interval regardless of server responsiveness
   (`loadtest/socketio-load.js`'s `socket.setInterval`), so "messages delivered" measures demand,
   not capacity — it was never going to show a ceiling at this message rate. The real signal here
   is latency, and it moved a lot.
2. **n=1 per configuration, not PLAN.md's n=3 with a discarded 2-minute warm-up.** A real
   simplification, stated plainly rather than assumed away: one 90-second run per pod count, no
   separate warm-up/measurement split. Good enough to see a clear, large, monotonic trend (a 3.2x
   change is not a result that a little run-to-run noise would have produced by chance) but not
   rigorous enough to report tight confidence intervals on the exact percentile values.
3. **Consistent with Evidence 05's HPA finding.** The same backend that barely used any CPU under
   WebSocket connection load (Evidence 05: 10–36% against a 60% target) still visibly benefits from
   more pods under a busier connection count — reinforcing that *connections*, not *CPU*, is the
   resource actually under pressure here, and the resource that scaling pods genuinely relieves.
