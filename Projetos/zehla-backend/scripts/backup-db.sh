#!/bin/bash
set -euo pipefail

BACKUP_DIR="/tmp/zehla-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="zehla_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Starting pg_dump at $(date)..."
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --verbose \
  2>"${BACKUP_DIR}/zehla_db_${TIMESTAMP}.log" \
  | gzip -9 > "${BACKUP_DIR}/${FILENAME}"

DUMP_SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "Backup complete: ${BACKUP_DIR}/${FILENAME} (${DUMP_SIZE})"
echo "Log: ${BACKUP_DIR}/zehla_db_${TIMESTAMP}.log"
