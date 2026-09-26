#!/usr/bin/env bash
# "Alice and Bob" demo: two copies of the backend, each with its own frontend.
#
#   Alice -> http://localhost:3000 -> backend copy-A (:5001)
#   Bob   -> http://localhost:3001 -> backend copy-B (:5002)
#
# Both copies share one database.
#
#   ./scripts/demo-two-copies.sh           THE PROBLEM: no shared adapter, so neither copy knows
#                                          about the other's live connections
#   ./scripts/demo-two-copies.sh --fixed   THE FIX: both copies share events through Redis (Valkey,
#                                          started in Docker and removed again on exit)
#
# This terminal shows only the lines that matter; Ctrl-C stops everything.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/.demo-logs"
mkdir -p "$LOG_DIR"

MODE="broken"
case "${1:-}" in
  --fixed) MODE="fixed" ;;
  "") ;;
  *) echo "Usage: $0 [--fixed]"; exit 1 ;;
esac

REDIS_CONTAINER="chatscale-demo-valkey"
REDIS_URL=""

ports=(3000 3001 5001 5002)
[ "$MODE" = fixed ] && ports+=(6379)
for port in "${ports[@]}"; do
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop whatever is running there (Ctrl-C in its terminal) and try again."
    exit 1
  fi
done

cleanup() {
  trap - EXIT INT TERM
  echo
  echo "Stopping demo..."
  [ "$MODE" = fixed ] && docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1 || true
  kill 0 2>/dev/null
}
# Stop every process this script started when it exits or on Ctrl-C
trap cleanup EXIT INT TERM

if [ "$MODE" = fixed ]; then
  if ! docker info >/dev/null 2>&1; then
    echo "--fixed needs Docker for Redis. Open Docker Desktop, wait until it says it's running, and try again."
    exit 1
  fi
  echo "Starting Redis (Valkey) in Docker..."
  docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$REDIS_CONTAINER" -p 6379:6379 valkey/valkey:8-alpine >/dev/null
  for _ in $(seq 1 30); do
    docker exec "$REDIS_CONTAINER" valkey-cli ping 2>/dev/null | grep -q PONG && break
    sleep 1
  done
  REDIS_URL="redis://localhost:6379"
fi

# Backend copy: full log to a file, highlights to this terminal
start_backend() {
  local name=$1 port=$2 client=$3
  (
    cd "$ROOT/backend"
    INSTANCE_NAME="$name" PORT="$port" CLIENT_URL="$client" REDIS_URL="$REDIS_URL" node server.js 2>&1 \
      | tee "$LOG_DIR/$name.log" \
      | grep --line-buffered -E "^\[(copy-|db\]|realtime\])|Server running|could not start"
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

if [ "$MODE" = fixed ]; then
  MODE_LINE="FIXED: copies share events through Redis — Bob gets Alice's messages
  To watch Redis live, in another terminal:  cd backend && npm run watch-redis"
else
  MODE_LINE="BROKEN: no Redis — Bob will NOT get Alice's messages live"
fi

cat <<READY

  ------------------------------------------------------------
  Ready.  $MODE_LINE
    Alice: open http://localhost:3000   (badge: Live · copy-A)
    Bob:   open http://localhost:3001   (badge: Live · copy-B)
  Watch this terminal: each message shows who it was delivered to.
  Press Ctrl-C to stop everything.
  ------------------------------------------------------------

READY

wait
