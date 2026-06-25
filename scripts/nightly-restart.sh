#!/bin/bash

echo "[nightly] Restarting frontend..."
pm2 restart starbuck-frontend

echo "[nightly] Waiting 30s for Next.js to start..."
sleep 30

bash /root/starbuck-cups-frontend/scripts/prewarm.sh
