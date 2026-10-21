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
#   ./scripts/demo-two-copies.sh --lan     TWO COMPUTERS: Alice on this Mac, Bob on another computer
#                                          on the same Wi-Fi / hotspot (works with --fixed too)
#
# This terminal shows only the lines that matter; Ctrl-C stops everything.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/.demo-logs"
mkdir -p "$LOG_DIR"

MODE="broken"
LOCAL_DB=false
# The address the browsers use to reach this Mac. "localhost" = everything on this one computer
# (the default, unchanged). --lan, or DEMO_HOST=<address>, swaps in this Mac's network address so a
# second computer on the same network can open Bob's window.
HOST="${DEMO_HOST:-localhost}"
for arg in "$@"; do
  case "$arg" in
    --fixed) MODE="fixed" ;;
    # Ignore DATABASE_URL in backend/.env and use the local SQLite file (backend/data/chat.sqlite).
    # For networks that block database ports (5432), where Supabase can't be reached.
    --local-db) LOCAL_DB=true ;;
    --lan)
      HOST="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
      if [ -z "$HOST" ]; then
        echo "--lan: couldn't find this Mac's network address (is it on Wi-Fi or a hotspot?)."
        echo "Find it yourself and run:  DEMO_HOST=<address> $0 ${*/--lan/}"
        exit 1
      fi
      ;;
    *) echo "Usage: $0 [--fixed] [--local-db] [--lan]"; exit 1 ;;
  esac
done

# Which browser addresses each backend accepts for live (WebSocket) connections. On one computer
# that's just its own frontend. Over the network the browser's address varies (an IP, a hostname),
# so any origin is accepted instead — fine for a demo, and the reason to stop the demo afterwards:
# while it runs, anyone on the same network can reach these backends.
if [ "$HOST" = localhost ]; then
  CLIENT_A="http://localhost:3000"
  CLIENT_B="http://localhost:3001"
else
  CLIENT_A=""
  CLIENT_B=""
fi

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
  trap - EXIT INT TERM HUP
  echo
  echo "Stopping demo..."
  [ "$MODE" = fixed ] && docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1 || true
  kill 0 2>/dev/null
}
# Stop every process this script started when it exits, on Ctrl-C, or if its terminal is closed
trap cleanup EXIT INT TERM HUP

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
    if [ "$LOCAL_DB" = true ]; then export DATABASE_URL=""; fi
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
start_backend copy-A 5001 "$CLIENT_A"
start_backend copy-B 5002 "$CLIENT_B"
start_frontend 3000 "http://$HOST:5001"
start_frontend 3001 "http://$HOST:5002"

# Both backend copies must be ready (database and Redis reachable) before we say "Ready"
for port in 5001 5002; do
  ready=false
  for _ in $(seq 1 30); do
    if curl -sf -o /dev/null "http://localhost:$port/readyz"; then ready=true; break; fi
    sleep 1
  done
  if [ "$ready" != true ]; then
    echo
    echo "  NOT READY: the backend on port $port couldn't start (see the lines above)."
    echo "  'connection timeout' to the database usually means this network blocks database"
    echo "  ports. Use a phone hotspot, or run without Supabase:  $0 ${*:+$* }--local-db"
    exit 1
  fi
done

# Wait until both frontends answer
for port in 3000 3001; do
  for _ in $(seq 1 180); do
    curl -s -o /dev/null "http://localhost:$port" && break
    sleep 1
  done
done

if [ "$LOCAL_DB" = true ]; then
  DB_LINE="Database: local file (backend/data/chat.sqlite) — not Supabase"
else
  DB_LINE="Database: from backend/.env (Supabase if DATABASE_URL is set)"
fi

if [ "$MODE" = fixed ]; then
  MODE_LINE="FIXED: copies share events through Redis — Bob gets Alice's messages
  To watch Redis live, in another terminal:  cd backend && npm run watch-redis"
else
  MODE_LINE="BROKEN: no Redis — Bob will NOT get Alice's messages live"
fi

if [ "$HOST" = localhost ]; then
  NET_LINE=""
else
  NET_LINE="
  TWO COMPUTERS: Bob's computer must be on the SAME Wi-Fi / hotspot as this Mac.
  If Bob's page won't load, the network is blocking device-to-device traffic
  (common on college Wi-Fi) — switch both to a phone hotspot.
  While this runs, anyone on that network can reach these backends. Ctrl-C when done."
fi

cat <<READY

  ------------------------------------------------------------
  Ready.  $MODE_LINE
  $DB_LINE
    Alice: open http://$HOST:3000   (badge: Live · copy-A)
    Bob:   open http://$HOST:3001   (badge: Live · copy-B)$NET_LINE
  Watch this terminal: each message shows who it was delivered to.
  Press Ctrl-C to stop everything.
  ------------------------------------------------------------

READY

wait
