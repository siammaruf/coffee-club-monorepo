#!/bin/sh
set -e

echo "🚀 Starting frontend application..."
exec bunx serve -s dist -l 3000
