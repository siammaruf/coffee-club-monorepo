#!/bin/sh
set -e

echo "🔄 Running database migrations..."
if bun run migration:run 2>&1; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed or no migrations to run"
fi

echo ""
echo "🚀 Starting application..."
exec bun run dist/main.js