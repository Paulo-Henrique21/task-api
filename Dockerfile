# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
# instala deps (inclui dev) para garantir prisma CLI no build
RUN npm ci

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# compila para ./dist (ajuste seu script "build" se necessário)
RUN npm run build

# ---------- run (prod) ----------
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# libs necessárias p/ Prisma e TLS
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# mantenha devDependencies para ter o prisma CLI no runtime
# (se mover "prisma" para dependencies, pode usar --omit=dev)
COPY package*.json ./
RUN npm ci

# traz schema e migrations do Prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

# copia o build da aplicação
COPY --from=build /app/dist ./dist

# healthcheck bate no /health (sua rota já existe)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8000) + '/health').then(()=>process.exit(0)).catch(()=>process.exit(1))" || exit 1

# o Render injeta PORT em runtime; EXPOSE é informativo
ENV PORT=8000
EXPOSE 8000

# aplica migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
