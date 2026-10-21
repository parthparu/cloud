# Moving ChatScale to Red Hat OpenShift — plan

**Status:** Proposed (CHG-0041) · **Decided 2026-10-21:** add OpenShift *alongside* the k3d setup, after
the faculty demo. k3d stays the rehearsed, working version; nothing here changes `k8s/base/` or
`k8s/overlays/local/`. **Target:** the free hosted *Developer Sandbox for Red Hat OpenShift*
(https://developers.redhat.com/developer-sandbox).

## Why this is worth doing

- It is **real cloud OpenShift**, which closes the gap left when Azure verification failed
  (`PLAN.md` r4, CHG-0033) — without a card or a cloud bill.
- It adds genuinely OpenShift-specific material: Routes, in-cluster image builds (BuildConfig),
  the restricted security model (SCC), and the web console.

## Why *not* local OpenShift

OpenShift Local (CRC) needs about 4 CPUs, 10.5 GB RAM and 35 GB disk (from memory — verify on Red
Hat's site). This Mac has ~10 GB free disk and Docker is allotted 7.7 GB. It will not run.

## Fast path: upload one YAML in the web console (no `oc` needed)

A friend pointed to the console's **Import YAML** feature, which suits this: one file creates the
whole app. The file is `k8s/openshift/chatscale-sandbox.template.yaml`; the script
`scripts/openshift-make-yaml.sh` fills in fresh random secrets and writes the upload-ready copy to
`~/Downloads/chatscale-openshift.yaml` (outside git — it holds secrets).

1. In the console, check the **project** selector (top) shows your sandbox project (e.g. `yourname-dev`).
2. Click the **+** in the top-right header (tooltip *Import YAML*), or Developer view → **+Add** → **Import YAML**.
3. Drag `chatscale-openshift.yaml` onto the editor (or *browse to upload*), then **Create**.
4. Watch **Builds** (Administrator view: Builds → Builds): `chatscale-backend` and `chatscale-web`
   run first, a few minutes each. Until they finish, the backend/frontend pods show
   *ImagePullBackOff* — expected; OpenShift swaps the real image in when the build completes.
5. Open **Networking → Routes → chatscale** and click its URL. Sign up in the app (there are no
   demo users on purpose: this address is public).
6. The Redis break/fix: **Workloads → ConfigMaps → backend-config**, change `REDIS_URL` to empty,
   then **Deployments → backend → Actions → Restart rollout**; two users on different copies (the
   badge shows the pod) no longer see each other. Put `redis://redis:6379` back to fix it.

**Validated locally, not yet on a real sandbox.** The 12 standard Kubernetes objects passed a
server-side dry run against k3d; the 3 OpenShift-only kinds (ImageStream, BuildConfig, Route) can
only be checked by importing. First real import = the real test; expect to iterate.

**Known risks:** Docker Hub rate limits during the in-cluster builds (re-run the build);
quota rejections (limits are sized for ~3 CPU / 14 GB, unverified); Red Hat's Postgres/Redis images
or the Route timeout annotations behaving differently than expected.

## Performance: why it felt slow, and what is and isn't fixable

Measured from India against the live sandbox (2026-10-21):
- The route resolves to `34.233.x.x` — AWS **us-east-1** (US East). Every new HTTPS connection cost
  ~1 s (TCP ~0.3–0.6 s + TLS ~0.5 s) before the first byte, even for a 3-byte reply; the server's own
  time was ~0.3 s. **The delay is distance, not the app**, and the sandbox's region can't be chosen.
- The 296 KB JavaScript bundle was sent **uncompressed** (3.4 s). Fixed: `gzip` added to the nginx
  config — tested locally with the real image: JS 296 KB → 87 KB (−70%), CSS 35 KB → 7 KB (−79%).
- The live-chat connection already uses WebSocket only (no extra polling round trips).
- Static files are cached for a year, so only the **first** visit pays the download; later visits
  and the chat itself are far lighter. Open the app once before presenting.
- A phone hotspot adds jitter (first connect in one test took 3 s vs 0.3 s later); use steady Wi-Fi if possible.

What remains slow after the fix: the ~0.3–0.6 s round trip on every request. That is physics, not config.

## Updating a running app

The cluster builds from **GitHub `main`**, not from your folder. Editing files locally changes nothing
on the sandbox until the change is pushed *and* rebuilt.

| You changed | Do this |
|---|---|
| Backend code (`backend/`) | `git push`, then console: **Builds → chatscale-backend → Actions → Start build**. When it finishes, OpenShift rolls out new pods by itself. (CLI: `oc start-build chatscale-backend --follow`) |
| Frontend code (`frontend/`) | `git push`, then start the **chatscale-web** build the same way |
| nginx config, limits, environment (YAML objects) | Edit the object in the console, or `oc apply -f` a small file with just that object. A changed **ConfigMap** needs `oc rollout restart deployment/<name>` (or **Actions → Restart rollout**) |
| The template itself | `./scripts/openshift-make-yaml.sh --update` makes a file **without the Secret**; `oc apply -f` it. **Never re-import the full file** over a running app: it regenerates the passwords and the database would no longer match |

**Protect the k3d demo when using `oc` for the sandbox:** `oc login` rewrites `~/.kube/config`, and
`kubectl` shares it — the demo scripts would then talk to the sandbox. Use a separate config file:
`export KUBECONFIG=$HOME/.kube/sandbox.config` in the terminal used for the sandbox, then `oc login ...`.
Check which cluster you are on with `oc whoami --show-server`.

Optional: a GitHub webhook on the BuildConfig makes every push build automatically.

## What you do (I cannot do these)

1. Create a Red Hat account and start the Sandbox (identity + phone verification are yours).
2. In the Sandbox web console: your name (top right) → **Copy login command** → *Display token*.
3. In **your own terminal** run the `oc login --token=... --server=...` command it shows.
   The login is stored in `~/.kube/config`, so I can use `oc` from this machine **without you
   pasting the token anywhere**. Treat the token like a password: never paste it into chat or git.
   Tokens expire (about a day); log in again when they do.

## What I do, in order

1. **Probe the sandbox** before building anything: `oc whoami`, project name, quota
   (`oc describe quota`), storage classes, node architecture, and what I'm allowed to create
   (`oc auth can-i create clusterrole` — expected: no).
2. **Build images inside the cluster** (binary BuildConfigs from `backend/` and `frontend/`). The
   Mac is arm64; sandbox nodes are most likely x86_64, so images built here would not run there.
3. **Add `k8s/overlays/openshift/`**: no Namespace object (the sandbox gives you a fixed
   project), no `prometheus-adapter` or other cluster-scoped objects, `Ingress` → `Route`,
   images from the in-cluster registry, DNS names without the hard-coded `chatscale` namespace.
4. **Postgres/Redis/Grafana/Prometheus under OpenShift's random-user rule.** Our own images already
   run non-root (`USER node`; nginx-unprivileged on 8080). The third-party ones may not — the
   official Postgres image in particular fails with a random UID. Plan: a Red Hat/sclorg Postgres
   image, and a local dry-run on k3d first with the same restrictions (random `runAsUser`,
   `runAsNonRoot`, dropped capabilities) so image problems show up before the sandbox does.
5. **Deploy and verify**: the Redis break/fix (`backend/tests/cross-copy.test.js` against the
   Route URL, with Redis on and off), then CPU autoscaling.
6. **Connection-count autoscaling — probably not possible.** `prometheus-adapter` needs
   cluster-wide permissions a shared sandbox almost certainly won't give. If `can-i` says no, this
   is documented as a limitation rather than worked around.
7. **Record it**: `docs/evidence/08-openshift.md`, CHANGE_LOG entries, and update
   `docs/REPORT.md` §7 (the "no real cloud" limitation becomes "OpenShift Sandbox, shared cluster").

## Unknowns and risks

| Risk | What I'll do |
|---|---|
| Sandbox limits may differ from what I found (a community reply said ~3 cores, 14 GB RAM, 40 GB storage; 30-day lifetime; time limits on pods — **unverified, possibly outdated**) | Read the real quota in step 1, size everything to it |
| Sandbox expires / pods get paused | Capture evidence (logs, screenshots, numbers) as soon as each step works |
| Third-party images refuse a random UID | Local dry-run first; swap to OpenShift-friendly images |
| No cluster-admin | Expected; scope the plan to what a normal project user can do |
| Free-tier terms may have changed | Check the signup page before relying on any number above |
| Shared cluster ≠ our own cluster | Latency/throughput numbers are not comparable to the k3d ones; say so in the evidence file |

## What stays the same

The demo: Parts 1–3 in `docs/DEMO.md` run on the laptop/k3d exactly as before. OpenShift is a
second deployment target, not a replacement.
