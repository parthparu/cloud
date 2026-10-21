# ChatScale — Scope & Honesty Notes (Faculty Handout)

*Excerpted from docs/REPORT.md, sections 7 and 9. Full report: docs/REPORT.md*

---

## What this project deliberately does not claim

Three rows of the original thesis table (PLAN.md §1) needed real, separate physical machines —
Cluster Autoscaler adding whole nodes, an actual availability-zone failure, a managed database
failover — and a fourth needed a real cloud invoice to measure economics rather than estimate them.

**Why these are missing, honestly:** Azure for Students verification was attempted and never
resolved (SheerID lost the original request, a resubmission ran into further account/product-page
friction; full account in PLAN.md's r4 amendment and docs/CHANGE_LOG.md CHG-0009/CHG-0033).
Rather than restart the same signup/verification process with a second cloud provider
(DigitalOcean or GCP, both considered — PLAN.md's own risk R-12 named both as fallbacks), the
decision was to finalize this project's scope at local Kubernetes. This is a stated, reasoned
engineering tradeoff — not an oversight, and not something quietly worked around by claiming local
results as if they answered a cloud-scale question they don't. See PLAN.md's r4 amendment for the
complete reasoning.

What this means concretely:

- **No Cluster Autoscaler comparison.** The HPA comparison (§6) is pod-level only (more pods on
  existing nodes) — real elasticity (nodes appearing to host pods that don't fit anywhere yet)
  needs a cloud provisioning node pools on demand.
- **No zone-failure or managed-database-failover chaos test.** The pod-kill test (§2.3) is the one
  chaos scenario that's fully meaningful locally; "kill a zone" has no local equivalent when every
  "node" is a container on one machine.
- **No real cloud invoice.** The cost model (§8) is an estimate from measured resource requests
  and published pricing, explicitly labelled as such.

---

## Methodology notes and honesty

Consistent with how this project has recorded its work throughout (see docs/CHANGE_LOG.md's
entries, which keep debugging stories rather than cleaning them into tidy-looking successes):

- Every number in the report traces to a docs/evidence/*.md file with the exact command used to
  reproduce it. Nothing is estimated unless explicitly labeled as an estimate (§8).
- Bugs found while measuring (the HPA double-division bug, §6; the registration-burst CPU spike
  mistaken for chat load, §6) are reported as part of the finding, not edited out.
- Sample sizes and simplifications (n=1 vs PLAN.md's n=3 in §5) are stated, not hidden.
- Three results are explicitly *not* claimed (§7 above), with the reason why.
