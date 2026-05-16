#!/bin/sh
# Container start script. Runs prisma db push to sync any additive schema
# changes (new columns / tables with defaults), then boots Next.js. A push
# failure does NOT prevent server start — the failure surfaces in logs.

set +e
echo "→ Running prisma db push (idempotent schema sync)…"
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss
PUSH_EXIT=$?
if [ "$PUSH_EXIT" -ne 0 ]; then
  echo "⚠  prisma db push exited with $PUSH_EXIT — continuing to start the server anyway."
fi

echo "→ Starting Next.js standalone server…"
exec node server.js
