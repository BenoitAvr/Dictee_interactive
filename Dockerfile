# syntax=docker/dockerfile:1.7

# ---------- deps : install des dépendances ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ---------- builder : build de Next.js + Prisma ----------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables nécessaires au build (auth.ts throw sinon).
# Passées depuis docker-compose.yml -> build.args.
ARG GOOGLE_ID
ARG GOOGLE_SECRET
ARG SECRET
ARG AUTH_SECRET
ENV GOOGLE_ID=$GOOGLE_ID \
    GOOGLE_SECRET=$GOOGLE_SECRET \
    SECRET=$SECRET \
    AUTH_SECRET=$AUTH_SECRET \
    NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# ---------- runner : image finale minimale ----------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Sortie standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma : schéma, migrations, CLI et engines (pour migrate deploy au boot).
# On copie tout node_modules du builder pour avoir aussi les deps transitives
# de la CLI Prisma (effect, etc.). Ce dossier est utilisé UNIQUEMENT par
# l'entrypoint pour `prisma migrate deploy` ; le runtime Next tourne sur son
# .next/standalone qui embarque ses propres deps.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
