#!/bin/sh
set -eu

cd /app/apps/api
node --import tsx src/core/db/migrate.ts
exec node --import tsx src/main.ts
