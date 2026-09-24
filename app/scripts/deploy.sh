#!/usr/bin/env bash
# Build the app, upload it to a Bunny Storage zone and purge the Pull Zone cache.
#
# Usage: pnpm deploy:bunny [--dry-run]
#
# Reads credentials from app/.env.deploy (see .env.deploy.example) or the environment:
#   BUNNY_STORAGE_ZONE      Storage zone name
#   BUNNY_STORAGE_PASSWORD  Storage zone password (Storage zone → FTP & API Access)
#   BUNNY_STORAGE_HOST      Storage API hostname for the zone's main region
#                           (default storage.bunnycdn.com; e.g. uk.storage.bunnycdn.com)
#   BUNNY_API_KEY           Account API key (Account settings → API key)
#   BUNNY_PULL_ZONE_ID      Numeric Pull Zone ID (shown in the Pull Zone's URL in the dashboard)
set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

if [[ -f .env.deploy ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

: "${BUNNY_STORAGE_ZONE:?Set BUNNY_STORAGE_ZONE (see .env.deploy.example)}"
: "${BUNNY_STORAGE_PASSWORD:?Set BUNNY_STORAGE_PASSWORD (see .env.deploy.example)}"
: "${BUNNY_API_KEY:?Set BUNNY_API_KEY (see .env.deploy.example)}"
: "${BUNNY_PULL_ZONE_ID:?Set BUNNY_PULL_ZONE_ID (see .env.deploy.example)}"
BUNNY_STORAGE_HOST="${BUNNY_STORAGE_HOST:-storage.bunnycdn.com}"

echo "Building…"
pnpm build

upload() {
  local file="$1"
  local path="${file#dist/}"
  echo "  ↑ $path"
  $DRY_RUN && return
  curl --fail --silent --show-error --output /dev/null \
    --request PUT "https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${path}" \
    --header "AccessKey: ${BUNNY_STORAGE_PASSWORD}" \
    --header "Content-Type: application/octet-stream" \
    --data-binary "@${file}"
}

# Upload assets before index.html, so the new index.html never references
# files that aren't there yet. Old hashed assets are left in place: they're
# harmless, and keep tabs still running the previous version working.
echo "Uploading to ${BUNNY_STORAGE_ZONE}…"
while IFS= read -r file; do
  upload "$file"
done < <(find dist -type f ! -name index.html | sort)
upload dist/index.html

echo "Purging Pull Zone ${BUNNY_PULL_ZONE_ID} cache…"
if ! $DRY_RUN; then
  curl --fail --silent --show-error --output /dev/null \
    --request POST "https://api.bunny.net/pullzone/${BUNNY_PULL_ZONE_ID}/purgeCache" \
    --header "AccessKey: ${BUNNY_API_KEY}" \
    --header "Content-Type: application/json" \
    --data '{}'
fi

if $DRY_RUN; then
  echo "Dry run: nothing was uploaded or purged."
else
  echo "Deployed."
fi
