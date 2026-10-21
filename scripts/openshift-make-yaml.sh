#!/usr/bin/env bash
# Makes the file you upload to the OpenShift web console ("Import YAML"): the template in
# k8s/openshift/ with fresh random secrets filled in.
#
#   ./scripts/openshift-make-yaml.sh                 -> ~/Downloads/chatscale-openshift.yaml
#   ./scripts/openshift-make-yaml.sh --update        -> ~/Downloads/chatscale-openshift-update.yaml
#   OUT=/some/path.yaml ./scripts/openshift-make-yaml.sh
#
# --update is for CHANGING an app that is already running (new nginx config, new limits...). It
# leaves out the Secret: re-applying a regenerated Secret would give the app new passwords that no
# longer match the existing database. Apply it with `oc apply -f` (the console's Import YAML may
# refuse objects that already exist). A changed ConfigMap needs a restart to take effect:
#   oc rollout restart deployment/frontend
#
# The output contains secrets (login-token signing key, database password), so it is written
# OUTSIDE this repo and readable only by you. Never commit it. Running this again makes a NEW set
# of secrets — fine for a fresh sandbox, but don't re-import over an existing deployment (the
# database would keep the old password).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$ROOT/k8s/openshift/chatscale-sandbox.template.yaml"
UPDATE=false
[ "${1:-}" = "--update" ] && UPDATE=true
if [ "$UPDATE" = true ]; then
  OUT="${OUT:-$HOME/Downloads/chatscale-openshift-update.yaml}"
else
  OUT="${OUT:-$HOME/Downloads/chatscale-openshift.yaml}"
fi

# Hex only, so the values are safe inside the database URL and need no escaping
JWT_SECRET="$(openssl rand -hex 48)"
TWO_FACTOR_KEY="$(openssl rand -hex 32)"
DB_PASSWORD="$(openssl rand -hex 16)"

mkdir -p "$(dirname "$OUT")"
umask 077
sed -e "s/__JWT_SECRET__/$JWT_SECRET/g" \
    -e "s/__TWO_FACTOR_KEY__/$TWO_FACTOR_KEY/g" \
    -e "s/__DB_PASSWORD__/$DB_PASSWORD/g" \
    "$TEMPLATE" > "$OUT"

if [ "$UPDATE" = true ]; then
  # Drop the Secret document (documents are separated by '---' lines)
  awk 'function flush() { if (doc !~ /(^|\n)kind: Secret\n/) printf "%s", doc }
       /^---$/ { flush(); doc = $0 "\n"; next }
       { doc = doc $0 "\n" }
       END { flush() }' "$OUT" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
fi

if grep -qE "__(JWT_SECRET|TWO_FACTOR_KEY|DB_PASSWORD)__" "$OUT"; then
  echo "A placeholder was left unfilled in $OUT — not safe to upload." >&2
  rm -f "$OUT"
  exit 1
fi

echo "Wrote $OUT"
if [ "$UPDATE" = true ]; then
  echo "UPDATE file (no Secret). Apply to a running app with:  oc apply -f \"$OUT\""
  echo "then, if the nginx config changed:  oc rollout restart deployment/frontend"
else
  echo "Upload this file in the OpenShift web console: + (Import YAML) -> upload -> Create."
  echo "It contains secrets: don't commit it or send it to anyone."
fi
