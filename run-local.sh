#!/usr/bin/env bash
set -euo pipefail

# Runs Mehrsungold locally (frontend + backend)
# - Frontend: http://localhost:3000 (Next.js)
# - Backend:  http://localhost:3003 (NestJS app)
# Logs:      .logs/frontend.log , .logs/backend.log
# PIDs:      .pids/frontend.pid , .pids/backend.pid

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="$SCRIPT_DIR"
BACK_DIR="$SCRIPT_DIR/../../Back/mehrsungold-backend"

LOG_DIR="$FRONT_DIR/.logs"
PID_DIR="$FRONT_DIR/.pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

FRONT_PORT=3000
BACK_PORT=3003

usage() {
  cat <<'USAGE'
Usage:
  ./run-local.sh            # start (idempotent)
  ./run-local.sh restart    # stop tracked processes, then start
  ./run-local.sh stop       # stop tracked processes

Notes:
- If ports are occupied by non-tracked processes, the script will abort and show what's using the port.
- Backend requires a valid .env. If missing, this script copies .env.example -> .env and you must edit DATABASE_URI/JWT secrets.
USAGE
}

is_port_listening() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

port_owner() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
}

pid_is_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

stop_by_pidfile() {
  local pidfile="$1"
  local name="$2"

  if [[ ! -f "$pidfile" ]]; then
    return 0
  fi

  local pid
  pid="$(cat "$pidfile" 2>/dev/null || true)"
  if [[ -z "$pid" ]]; then
    rm -f "$pidfile"
    return 0
  fi

  if pid_is_running "$pid"; then
    echo "Stopping ${name} (PID ${pid})..."
    kill "$pid" >/dev/null 2>&1 || true

    # Wait a moment then force kill if needed
    for _ in {1..20}; do
      if ! pid_is_running "$pid"; then
        break
      fi
      sleep 0.2
    done
    if pid_is_running "$pid"; then
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
  fi

  rm -f "$pidfile"
}

start_process() {
  local name="$1"
  local workdir="$2"
  local command="$3"
  local pidfile="$4"
  local logfile="$5"

  echo "Starting ${name}..."
  (cd "$workdir" && nohup bash -lc "$command" >>"$logfile" 2>&1 & echo $! >"$pidfile")
}

ensure_deps() {
  local dir="$1"
  if [[ ! -d "$dir/node_modules" ]]; then
    echo "Installing dependencies in ${dir}..."
    (cd "$dir" && npm install)
  fi
}

ensure_backend_env() {
  if [[ ! -f "$BACK_DIR/.env" ]]; then
    echo "Backend .env not found. Copying .env.example -> .env"
    cp "$BACK_DIR/.env.example" "$BACK_DIR/.env"
    echo "IMPORTANT: Edit $BACK_DIR/.env and set DATABASE_URI + JWT secrets before login will work."
  fi
}

ACTION="${1:-start}"
case "$ACTION" in
  -h|--help|help)
    usage
    exit 0
    ;;
  stop)
    stop_by_pidfile "$PID_DIR/frontend.pid" "frontend"
    stop_by_pidfile "$PID_DIR/backend.pid" "backend"
    echo "Stopped."
    exit 0
    ;;
  restart)
    stop_by_pidfile "$PID_DIR/frontend.pid" "frontend"
    stop_by_pidfile "$PID_DIR/backend.pid" "backend"
    ;;
  start|"")
    ;;
  *)
    echo "Unknown command: $ACTION"
    usage
    exit 1
    ;;
esac

if [[ ! -d "$FRONT_DIR" || ! -f "$FRONT_DIR/package.json" ]]; then
  echo "Frontend not found at: $FRONT_DIR"
  exit 1
fi
if [[ ! -d "$BACK_DIR" || ! -f "$BACK_DIR/package.json" ]]; then
  echo "Backend not found at: $BACK_DIR"
  echo "Expected backend at ../../Back/mehrsungold-backend relative to frontend."
  exit 1
fi

# Backend
if is_port_listening "$BACK_PORT"; then
  # If we started it earlier, keep it; otherwise warn but continue.
  if [[ -f "$PID_DIR/backend.pid" ]] && pid_is_running "$(cat "$PID_DIR/backend.pid")"; then
    echo "Backend already running on :$BACK_PORT (tracked by this script)."
  else
    echo "Backend port :$BACK_PORT is already in use (not started by this script)."
    port_owner "$BACK_PORT"
    echo "Continuing to start the frontend anyway. If login/API fails, restart backend via: ./run-local.sh restart"
  fi
else
  ensure_backend_env
  ensure_deps "$BACK_DIR"
  start_process "backend" "$BACK_DIR" "npm run -s dev" "$PID_DIR/backend.pid" "$LOG_DIR/backend.log"
fi

# Frontend
if is_port_listening "$FRONT_PORT"; then
  if [[ -f "$PID_DIR/frontend.pid" ]] && pid_is_running "$(cat "$PID_DIR/frontend.pid")"; then
    echo "Frontend already running on :$FRONT_PORT"
  else
    echo "Port :$FRONT_PORT is already in use (frontend)."
    port_owner "$FRONT_PORT"
    echo "Stop the process above or run './run-local.sh restart' if it was started by this script."
    exit 1
  fi
else
  ensure_deps "$FRONT_DIR"
  start_process "frontend" "$FRONT_DIR" "npm run -s dev" "$PID_DIR/frontend.pid" "$LOG_DIR/frontend.log"
fi

echo ""
echo "Local URLs:"
echo "- Frontend: http://localhost:$FRONT_PORT"
echo "- Backend:  http://localhost:$BACK_PORT"
echo ""
echo "Logs:"
echo "- $LOG_DIR/frontend.log"
echo "- $LOG_DIR/backend.log"
