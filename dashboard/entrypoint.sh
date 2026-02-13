#!/bin/sh
set -e

echo "Starting dashboard application..."
exec bunx serve -s build/client -l 3000
