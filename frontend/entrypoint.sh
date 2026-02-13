#!/bin/sh
set -e

# Generate runtime environment config from Docker env vars
cat <<EOF > /app/build/client/env-config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

echo "Starting frontend SSR server..."
exec npx react-router-serve ./build/server/index.js
