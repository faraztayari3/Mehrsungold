#!/usr/bin/env bash
set -euo pipefail

# One-click local fix for Mehrsungold (macOS)
# - Stops existing local processes
# - Clears broken Next.js build cache (.next)
# - Frees ports 3000/3003
# - Restarts using ./run-local.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

FRONT_PORT=3000
BACK_PORT=3003
BACK_DIR="$SCRIPT_DIR/../../Back/mehrsungold-backend"

log() { printf '%s\n' "$*"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    log "Install it and try again."
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

log "== Mehrsungold local fix =="

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

# Stop tracked processes (best-effort)
log "Stopping any tracked local processes..."
./run-local.sh stop >/dev/null 2>&1 || true

# Ensure ports are free (handles non-tracked stuck processes)
kill_port "$FRONT_PORT"
kill_port "$BACK_PORT"

# Fix the most common Next.js local failure:
# "Cannot find module './chunks/vendor-chunks/next.js'" coming from a corrupted .next cache.
if [[ -d "./.next" ]]; then
  log "Removing corrupted Next.js cache: .next"
  rm -rf "./.next"
fi

# Also clear common caches that can keep bad artifacts around
if [[ -d "./node_modules/.cache" ]]; then
  log "Clearing frontend cache: node_modules/.cache"
  rm -rf "./node_modules/.cache"
fi

# Ensure dependencies exist (don’t always reinstall; keep it fast)
if [[ ! -d "./node_modules" ]]; then
  log "Installing frontend dependencies..."
  npm install
fi

if [[ -d "$BACK_DIR" ]]; then
  if [[ ! -d "$BACK_DIR/node_modules" ]]; then
    log "Installing backend dependencies..."
    (cd "$BACK_DIR" && npm install)
  fi
fi

log "Starting local services..."
./run-local.sh restart

log ""
log "Done. If the page still errors, check logs:"
log "- ${SCRIPT_DIR}/.logs/frontend.log"
log "- ${SCRIPT_DIR}/.logs/backend.log"

# Keep Terminal open when double-clicked
read -r -p "Press Enter to close..." _
