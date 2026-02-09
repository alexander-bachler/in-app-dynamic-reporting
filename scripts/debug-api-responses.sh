#!/bin/bash
# Debug script to inspect LineMetrics API response structures.
# Usage: ./scripts/debug-api-responses.sh
# Requires: .env with REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_BASE_URL

set -e
cd "$(dirname "$0")/.."
source apps/global/kirchen-analytics/.env 2>/dev/null || source .env 2>/dev/null

BASE="${REACT_APP_BASE_URL:-https://rest-api.linemetrics.com}"
echo "Getting token..."
TOKEN=$(curl -s -X POST "${BASE}/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d "{\"client_id\":\"${REACT_APP_CLIENT_ID}\",\"client_secret\":\"${REACT_APP_CLIENT_SECRET}\",\"grant_type\":\"client_credentials\"}" \
  | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to get token"
  exit 1
fi

# Church object ID from logs (a7ebc3c05d844f2aa4a10c056cf8bc63)
CHURCH_ID="${1:-a7ebc3c05d844f2aa4a10c056cf8bc63}"
echo ""
echo "=== 1. Children (attributes) for church $CHURCH_ID with load_input_ref=1 ==="
curl -s "${BASE}/v2/children/${CHURCH_ID}?object_type=attribute&limit=5&load_input_ref=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.[0:2]'

echo ""
echo "=== 2. Device inputs (first device from all) ==="
DEVICE_ID=$(curl -s "${BASE}/v2/devices/all" -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
echo "Using device: $DEVICE_ID"
curl -s "${BASE}/v2/devices?id=${DEVICE_ID}" -H "Authorization: Bearer $TOKEN" | jq '.included[0:2]'
