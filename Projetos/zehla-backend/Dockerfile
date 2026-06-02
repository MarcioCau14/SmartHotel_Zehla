# ============================================================
# ZEHLA PRIME SB30 — Cápsula Imutável Multi-Stage
# Estágio 1: deps — Instala dependências totais para build
# Estágio 2: runner — Alpine enxuto sem lixo de dev
# ============================================================

# ---- Estágio 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat && corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate && \
    NEXT_TELEMETRY_DISABLED=1 pnpm run build && \
    pnpm prune --prod



# ---- Estágio 2: Runner (Produção Enxuta) ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Apenas o necessário para rodar
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
