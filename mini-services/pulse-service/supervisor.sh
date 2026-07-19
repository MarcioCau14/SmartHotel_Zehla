#!/bin/bash
# Pulse Service Supervisor - keeps the service alive

SERVICE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/home/z/my-project/.zscripts/pulse-service-stdout.log"
PID_FILE="/home/z/my-project/.zscripts/pulse-service.pid"

cd "$SERVICE_DIR"

while true; do
  echo "[$(date)] Starting pulse-service..." >> "$LOG_FILE"
  bun index.ts >> "$LOG_FILE" 2>&1 &
  PID=$!
  echo $PID > "$PID_FILE"
  wait $PID
  EXIT_CODE=$?
  echo "[$(date)] pulse-service exited with code $EXIT_CODE. Restarting in 3s..." >> "$LOG_FILE"
  sleep 3
done
