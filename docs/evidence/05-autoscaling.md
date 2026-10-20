# Evidence 05 — Autoscaling: CPU vs connection count

**Date:** 2026-10-20 · **Setup:** k3d cluster from Evidence 04, `metrics-server` (bundled with
k3s), `prometheus-adapter` exposing `chatscale_socket_connections` (CHG-0030) through Kubernetes'
external metrics API · **Result:** a CPU-based HPA never scaled under realistic chat load; a
connection-count-based HPA scaled correctly, on the same load, within 50 seconds.

## Why this matters

PLAN.md §2.2's hypothesis: a chat app's idle WebSocket connections barely use CPU, so the default
Kubernetes autoscaling signal (CPU utilization) may not react to the thing that actually matters —
how many users are connected. This is the single result PLAN.md called out as the strongest this
project could produce, *if* it held up under a real, measured test. It did.

## Setup

```bash
# metrics-server is already bundled with k3s/k3d — confirmed, no install needed:
kubectl top nodes

# prometheus-adapter (k8s/base/prometheus-adapter.yaml) exposes chatscale_socket_connections
# through external.metrics.k8s.io — already deployed as part of ./scripts/k8s-up.sh

# The two HPAs under comparison (mutually exclusive — same scaleTargetRef):
kubectl apply -f k8s/experiments/hpa-cpu.yaml           # target: 60% CPU utilization
# ...test, then...
kubectl delete -f k8s/experiments/hpa-cpu.yaml
kubectl apply -f k8s/experiments/hpa-connections.yaml   # target: 8 connections/pod (averageValue)

# Load, both times, identical:
k6 run loadtest/socketio-load.js   # PROFILE=local: ramps to 20 VUs over 20s, holds 1 minute
```

## 1. CPU-based HPA: never scaled

```
NAME              REFERENCE            TARGETS        MINPODS   MAXPODS   REPLICAS
backend-hpa-cpu   Deployment/backend   cpu: 10%/60%   2         6         2    (idle, before load)
backend-hpa-cpu   Deployment/backend   cpu: 54%/60%   2         6         2    (peak, during registration burst)
backend-hpa-cpu   Deployment/backend   cpu: 36%/60%   2         6         2    (settled, steady chat load)
```

k6: 328 messages sent and acked, 100% connect/join success, zero failures. The brief spike to 54%
came from the HTTP burst of 20 users registering/joining almost simultaneously at ramp-up
(bcrypt password hashing is genuinely CPU-heavy) — not from the WebSocket/chat traffic itself,
which is what the HPA actually needs to react to. It never crossed the 60% target. No
`SuccessfulRescale` event was ever recorded; `kubectl get pods -l app=backend` stayed at 2 the
entire test. Exactly the predicted failure mode: a CPU signal that reacts to incidental HTTP load,
not to the thing that matters (how many chat connections are open).

## 2. Connection-count HPA: scaled correctly

```
t+40s   2/8 (avg)    2 pods   (still ramping up)
t+50s  10/8 (avg)    2 pods   (above target — 20 real connections / 2 pods)
t+60s  6667m/8 (avg) 3 pods   (scaled: 20 / 3 = 6.667, back under target)
...    6667m/8 (avg) 3 pods   (held stable for the rest of the run)
```

```
kubectl describe hpa backend-hpa-connections:
  Events:
    SuccessfulRescale  New size: 3; reason: external metric chatscale_socket_connections(nil) above target
```

Same k6 run, same 328 messages, same 100% success rate — the only variable was the autoscaling
signal. Cross-checked against Prometheus's own `query_range` for the same window (not just the
HPA's own display) to rule out a measurement artifact: the true connection count held a sustained
plateau of exactly 20 (sum across both pods) for over a minute, confirming the HPA reacted to a
real, sustained signal, not a transient spike it happened to catch.

## 3. Two real bugs found and fixed while building this (left in the manifests' comments)

1. **`prometheus-adapter` crashed on startup** — self-signed TLS cert generation (same mechanism
   `metrics-server` uses) failed with "permission denied" because no writable `--cert-dir` was
   set. Fixed by pointing it at an `emptyDir` volume.
2. **A real double-division bug, not a staleness issue.** First two measured runs showed the
   connection metric plateau at exactly half the true value (e.g. `5/8` when the true per-pod
   average was `10`) and never scale. Initially suspected the adapter's 30s metric-refresh
   interval was too slow for a ~90s test (tightened it to 10s) — that turned out to be a red
   herring. The actual cause: an `AverageValue`-type HPA target divides the external metric's raw
   value by the current replica count *itself*; the adapter's PromQL was already computing
   `avg()` (dividing by 2), so the HPA divided by 2 again. Confirmed by comparing the HPA's
   displayed value against Prometheus's own `query_range` for the identical window — proof, not a
   guess — before changing `avg()` to `sum()` and re-running to confirm the fix.

## Conclusion

The hypothesis holds, measured, not assumed: under identical realistic chat load (20 concurrent
users, periodic messages), a CPU-based HorizontalPodAutoscaler never scaled, while a
connection-count-based one scaled correctly within 50 seconds of load starting. A chat
application's useful scaling signal is not the default one Kubernetes ships with.
