#!/bin/sh
set -e

# Synchronise le schema Prisma avec la base au boot.
# - PRISMA_DB_PUSH=1  -> `prisma db push` (dev local : crée le schema depuis
#   schema.prisma, adapté à une DB neuve sans migrations complètes).
# - sinon              -> `prisma migrate deploy` (prod : applique les
#   migrations versionnées).
if [ -n "$POSTGRES_URL" ]; then
  if [ "$PRISMA_DB_PUSH" = "1" ]; then
    echo "Syncing Prisma schema (db push)..."
    node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss
  else
    echo "Applying Prisma migrations..."
    node node_modules/prisma/build/index.js migrate deploy
  fi

  # Seed idempotent : le script utilise `upsert`, safe à relancer.
  if [ "$PRISMA_SEED" = "1" ]; then
    echo "Seeding database..."
    node node_modules/prisma/build/index.js db seed
  fi
fi

exec "$@"
