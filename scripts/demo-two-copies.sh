#!/usr/bin/env bash
# "Alice and Bob" demo: two copies of the backend, each with its own frontend.
#
#   Alice -> http://localhost:3000 -> backend copy-A (:5001)
#   Bob   -> http://localhost:3001 -> backend copy-B (:5002)
#
# Both copies share one database, but neither knows about the other's live connections.
# This terminal shows only the lines that matter; Ctrl-C stops everything.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/.demo-logs"
mkdir -p "$LOG_DIR"

for port in 3000 3001 5001 5002; do
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop whatever is running there (Ctrl-C in its terminal) and try again."
    exit 1
  fi
done

# Stop every process this script started when it exits or on Ctrl-C
trap 'trap - EXIT INT TERM; echo; echo "Stopping demo..."; kill 0 2>/dev/null' EXIT INT TERM

# Backend copy: full log to a file, highlights to this terminal
start_backend() {
  local name=$1 port=$2 client=$3
  (
    cd "$ROOT/backend"
    INSTANCE_NAME="$name" PORT="$port" CLIENT_URL="$client" node server.js 2>&1 \
      | tee "$LOG_DIR/$name.log" \
      | grep --line-buffered -E "^\[(copy-|db\])|Server running|could not start"
  ) &
}

# Frontend: log to a file only (webpack output is noise for an audience)
start_frontend() {
  local port=$1 api=$2
  (
    cd "$ROOT/frontend"
    BROWSER=none PORT="$port" REACT_APP_API_URL="$api" npx react-scripts start >"$LOG_DIR/frontend-$port.log" 2>&1
  ) &
}

echo "Starting two backend copies and two frontends (logs in .demo-logs/)..."
start_backend copy-A 5001 http://localhost:3000
start_backend copy-B 5002 http://localhost:3001
start_frontend 3000 http://localhost:5001
start_frontend 3001 http://localhost:5002

# Wait until both frontends answer
for port in 3000 3001; do
  for _ in $(seq 1 180); do
    curl -s -o /dev/null "http://localhost:$port" && break
    sleep 1
  done
done

cat <<'READY'

  ------------------------------------------------------------
  Ready.
    Alice: open http://localhost:3000   (badge: Live · copy-A)
    Bob:   open http://localhost:3001   (badge: Live · copy-B)
  Watch this terminal: each message shows how many people the
  copy that received it delivered it to.
  Press Ctrl-C to stop everything.
  ------------------------------------------------------------

READY

wait
