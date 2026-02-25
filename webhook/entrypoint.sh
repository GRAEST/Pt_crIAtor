#!/bin/sh
set -e

# Replace placeholder with actual secret from env var
sed 's|{{getenv \\"WEBHOOK_SECRET\\"}}|'"$WEBHOOK_SECRET"'|g' /etc/webhook/hooks.json > /tmp/hooks.json

exec webhook -hooks /tmp/hooks.json -verbose -hotreload
