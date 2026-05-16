FROM node:24-alpine AS base
# openssl + libc6-compat so Prisma's query engine can resolve libssl at runtime
# and `prisma generate` correctly detects the OpenSSL 3.x available on Alpine
# (without this, Prisma falls back to the openssl-1.1 binary which fails to load).
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Next.js standalone output excludes prisma-generated binaries from
# node_modules tracing in some setups — copy the full prisma client tree
# explicitly so the runtime can load the query engine.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Ship the prisma schema + CLI so start.sh can run `db push` on boot
# (idempotent — only diffs missing columns/tables).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# Explicit startup script: runs prisma db push, then exec's node server.js.
# Inline shell chaining inside a startCommand was swallowing the server
# launch silently — a real script with `set +e` + `exec` is reliable.
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3000
ENV PORT=3000

CMD ["./start.sh"]
