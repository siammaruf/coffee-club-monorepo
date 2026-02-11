#!/bin/sh
set -e

echo "==> Running database seed (admin user)..."
node dist/seeds/admin-user.seed.js

echo "==> Starting application..."
exec node dist/main.js
