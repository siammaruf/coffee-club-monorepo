#!/bin/sh
set -e

# Generate runtime environment config from Dokploy/Docker env vars
cat <<EOF > /app/dist/env-config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

echo "Starting frontend application..."
exec bunx serve -s dist -l 3000
