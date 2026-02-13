#!/bin/sh
set -e

echo "Checking database connectivity..."
if pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USERNAME" -t 5 2>/dev/null; then
  echo "Database is ready"
else
  echo "Database not ready, waiting 5s..."
  sleep 5
fi

echo "Starting application..."
exec node dist/main
