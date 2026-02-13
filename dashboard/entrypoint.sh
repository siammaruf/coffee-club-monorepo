#!/bin/sh
set -e

# Generate runtime environment config from Dokploy/Docker env vars
cat <<EOF > /app/build/client/env-config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

echo "Starting dashboard application..."
exec bunx serve -s build/client -l 3000
