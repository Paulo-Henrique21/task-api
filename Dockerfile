# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
# evita rodar postinstall (prisma generate) aqui
RUN npm ci --ignore-scripts

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
# deps já instaladas
COPY --from=deps /app/node_modules ./node_modules
# copia todo o projeto (inclui prisma/)
COPY . .

# prisma generate ANTES do tsc (precisa do schema para gerar tipos)
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npx prisma generate

# agora pode compilar Typescript
RUN npm run build

# ---------- run (prod) ----------
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# libs necessárias p/ Prisma e TLS no runtime
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# instala deps no runtime sem scripts; vamos gerar depois
COPY package*.json ./
RUN npm ci --ignore-scripts

# copia schema/migrations e gera o client no runtime
COPY prisma ./prisma
RUN npx prisma generate

# copia o build da app
COPY --from=build /app/dist ./dist

# healthcheck usa sua rota /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8000) + '/health').then(()=>process.exit(0)).catch(()=>process.exit(1))" || exit 1

ENV PORT=8000
EXPOSE 8000

# aplica migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
