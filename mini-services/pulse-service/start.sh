#!/bin/bash
# Pulse Service startup wrapper
# Keeps the service running in the background

cd "$(dirname "$0")"

# Kill any existing process on port 3003
if command -v lsof &>/dev/null; then
  EXISTING_PID=$(lsof -t -i :3003 2>/dev/null)
  if [ -n "$EXISTING_PID" ]; then
    echo "Killing existing pulse-service (PID: $EXISTING_PID)"
    kill $EXISTING_PID 2>/dev/null || true
    sleep 1
  fi
fi

echo "Starting ZCC Pulse Service..."
exec bun index.ts
