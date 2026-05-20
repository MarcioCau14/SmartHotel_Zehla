#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -z "${REDIS_URL:-}" ]; then
  if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
  fi
fi

REDIS_CLI="redis-cli"
if [ -n "${REDIS_URL:-}" ]; then
  REDIS_CLI="$REDIS_CLI -u $REDIS_URL"
fi

mkdir -p "$BACKUP_DIR"

echo "[INFO] Triggering BGSAVE..."
if ! $REDIS_CLI BGSAVE; then
  echo "[FAILURE] BGSAVE command failed" >&2
  exit 1
fi

echo "[INFO] Waiting for BGSAVE to complete..."
sleep 2

RDB_PATH=$($REDIS_CLI CONFIG GET dir | tail -1)
RDB_FILE="$RDB_PATH/dump.rdb"

if [ ! -f "$RDB_FILE" ]; then
  echo "[FAILURE] Could not locate dump.rdb at $RDB_PATH" >&2
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/redis_dump_$TIMESTAMP.rdb"
cp "$RDB_FILE" "$BACKUP_FILE"

echo "[SUCCESS] Redis backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
