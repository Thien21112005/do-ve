#!/bin/sh
# ==============================================================================
# Automated PostgreSQL Backup Script for DoVe
# Retention: 7 days | Format: Compressed custom (-Fc)
# ==============================================================================

set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-dove}"
POSTGRES_USER="${POSTGRES_USER:-dove}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="dove_backup_${TIMESTAMP}.dump"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -Iseconds)] Starting PostgreSQL database backup for '${POSTGRES_DB}'..."

# Execute pg_dump with custom compressed archive format
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD environment variable must be set}" \
pg_dump \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  -Fc \
  -f "${FILEPATH}"

# Verify backup file was created and has non-zero size
if [ ! -s "${FILEPATH}" ]; then
  echo "[$(date -Iseconds)] ERROR: Backup failed, output file is empty or missing!" >&2
  exit 1
fi

FILESIZE=$(du -h "${FILEPATH}" | cut -f1)
echo "[$(date -Iseconds)] Backup completed successfully: ${FILEPATH} (${FILESIZE})"

# Prune backups older than retention policy
echo "[$(date -Iseconds)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "dove_backup_*.dump" -type f -mtime "+${RETENTION_DAYS}" -delete
echo "[$(date -Iseconds)] Backup maintenance finished."
