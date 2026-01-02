#!/usr/bin/env bash
set -euo pipefail

# One command to FIX + RUN Mehrsungold locally (frontend + backend)
# - Frees ports 3000/3003
# - Clears common broken Next.js caches
# - Installs deps if missing
# - Starts backend (port 3003) and frontend (port 3000)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

FRONT_PORT=3000
BACK_PORT=3003

log() { printf '%s\n' "$*"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    exit 1
  fi
}

kill_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    log "Freeing port :${port} (killing PIDs: ${pids})"
    # shellcheck disable=SC2086
    kill ${pids} >/dev/null 2>&1 || true
    sleep 0.4
    # shellcheck disable=SC2086
    kill -9 ${pids} >/dev/null 2>&1 || true
  fi
}

require_cmd node
require_cmd npm
require_cmd lsof

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [[ "${NODE_MAJOR}" -lt 18 ]]; then
  log "Your Node.js version is too old: $(node -v)"
  log "Next.js 14 needs Node.js 18+. Update Node, then run again."
  exit 1
fi

if [[ ! -f "./run-local.sh" ]]; then
  log "Cannot find ./run-local.sh in: ${SCRIPT_DIR}"
  exit 1
fi

log "== Mehrsungold dev =="

# Stop tracked processes (best-effort)
./run-local.sh stop >/dev/null 2>&1 || true

# Free ports (handles non-tracked stuck processes)
kill_port "$FRONT_PORT"
kill_port "$BACK_PORT"

# Clear broken Next.js cache (common local issue)
if [[ -d "./.next" ]]; then
  log "Removing Next.js cache: .next"
  rm -rf "./.next"
fi

if [[ -d "./node_modules/.cache" ]]; then
  log "Clearing frontend cache: node_modules/.cache"
  rm -rf "./node_modules/.cache"
fi

# Start both services (this also ensures backend .env and installs deps if missing)
./run-local.sh restart

log ""
log "Local URLs:"
log "- Frontend: http://localhost:${FRONT_PORT}"
log "- Backend:  http://localhost:${BACK_PORT}"
log ""
log "Logs:"
log "- ${SCRIPT_DIR}/.logs/frontend.log"
log "- ${SCRIPT_DIR}/.logs/backend.log"
