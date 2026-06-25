#!/bin/bash

SITE="https://hasron.vn"
API="https://api.hasron.vn/api"
LOCALES=("vi" "en" "zh")

echo "[prewarm] Starting cache warm-up..."

# Core pages
for locale in "${LOCALES[@]}"; do
  curl -s -o /dev/null "$SITE/$locale"
  echo "[prewarm] $SITE/$locale"

  curl -s -o /dev/null "$SITE/$locale/products"
  echo "[prewarm] $SITE/$locale/products"
done

# Category pages
echo "[prewarm] Fetching categories..."
CATEGORIES=$(curl -s "$API/categories/public/" | grep -o '"slug":"[^"]*"' | cut -d'"' -f4)

for slug in $CATEGORIES; do
  for locale in "${LOCALES[@]}"; do
    curl -s -o /dev/null "$SITE/$locale/category/$slug"
    echo "[prewarm] $SITE/$locale/category/$slug"
  done
done

echo "[prewarm] Done!"
