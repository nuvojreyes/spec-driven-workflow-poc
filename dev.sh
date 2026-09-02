#!/usr/bin/env bash
#
# Start the backend and the frontend together, on the host.
#
#   ./dev.sh
#   BACKEND_PORT=8001 FRONTEND_PORT=4201 ./dev.sh
#
# Ctrl-C stops both. For the containerised equivalent, run
# `docker compose up --build`.
#
# Written for bash 3.2, the version macOS ships: no `wait -n`, no associative
# arrays.

set -euo pipefail

# Job control, so each service becomes its own process group and can be taken
# down with its children rather than orphaning a node process.
set -m

cd "$(dirname "$0")"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-4200}"

# Keep the dev-server proxy pointed at whichever port the backend is on.
export API_TARGET="${API_TARGET:-http://127.0.0.1:$BACKEND_PORT}"

# --- Fail early and loudly on a busy port ----------------------------------
# Django's runserver can exit without a message when the port is taken, which
# reads as "nothing happened" rather than "something else is already there".
check_port() {
	port="$1"
	label="$2"
	if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
		echo "Port $port ($label) is already in use:" >&2
		lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2
		echo >&2
		echo "Stop that process, or run with other ports:" >&2
		echo "  BACKEND_PORT=8001 FRONTEND_PORT=4201 ./dev.sh" >&2
		echo >&2
		echo "An IDE port forward will hold a port while never answering a" >&2
		echo "request, which looks exactly like a dead backend." >&2
		return 1
	fi
}

check_port "$BACKEND_PORT" backend
check_port "$FRONTEND_PORT" frontend

# --- Pick an interpreter ---------------------------------------------------
if [ -x backend/.venv/bin/python ]; then
	PYTHON=backend/.venv/bin/python
elif command -v python3 >/dev/null 2>&1; then
	PYTHON=python3
	echo "No backend/.venv found; using system python3." >&2
else
	echo "No Python interpreter found." >&2
	exit 1
fi

if [ ! -d frontend/node_modules ]; then
	echo "Installing frontend dependencies (first run)..."
	(cd frontend && npm install)
fi

# --- Run both, and take both down together ---------------------------------
BACKEND_PID=""
FRONTEND_PID=""

stop_group() {
	pid="$1"
	[ -n "$pid" ] || return 0
	# Negative pid targets the process group, so the dev server's own children
	# go with it. Fall back to the single process if that fails.
	kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
}

shutdown() {
	trap - INT TERM EXIT
	echo
	echo "Stopping..."
	stop_group "$FRONTEND_PID"
	stop_group "$BACKEND_PID"
	wait 2>/dev/null || true
}
trap shutdown INT TERM EXIT

echo "backend   http://127.0.0.1:$BACKEND_PORT/api/"
echo "frontend  http://127.0.0.1:$FRONTEND_PORT/"
echo "proxy     /api -> $API_TARGET"
echo
echo "State levers, appended to either URL:  ?delay=<seconds>   ?fail=1"
echo "Empty state:                          /api/forecast/nowhere/"
echo

"$PYTHON" backend/manage.py runserver "127.0.0.1:$BACKEND_PORT" &
BACKEND_PID="$!"

(cd frontend && exec npx ng serve --host 127.0.0.1 --port "$FRONTEND_PORT") &
FRONTEND_PID="$!"

# Exit as soon as either service dies, rather than leaving half a stack up.
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
	sleep 1
done

echo "One of the services exited." >&2
