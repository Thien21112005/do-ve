#!/bin/sh
# ==============================================================================
# PostgreSQL Disaster Recovery / Restore Script for DoVe
# ==============================================================================

set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-dump-file>"
  echo "Example: $0 /backups/dove_backup_20261114_020000.dump"
  exit 1
fi

BACKUP_FILE="$1"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-dove}"
POSTGRES_USER="${POSTGRES_USER:-dove}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file '${BACKUP_FILE}' does not exist!" >&2
  exit 1
fi

echo "[$(date -Iseconds)] WARNING: Restoring '${BACKUP_FILE}' will overwrite existing data in '${POSTGRES_DB}'."
echo "[$(date -Iseconds)] Starting restore operation..."

PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD environment variable must be set}" \
pg_restore \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"

echo "[$(date -Iseconds)] Database restoration completed successfully!"
