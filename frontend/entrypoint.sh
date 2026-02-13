#!/bin/sh
set -e

# Generate runtime environment config from Dokploy/Docker env vars
cat <<EOF > /app/dist/client/env-config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

echo "Starting SSR server..."
export NODE_ENV=production
exec bun run server.ts
