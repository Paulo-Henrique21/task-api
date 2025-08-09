# # Etapa 1: builder
# FROM node:20 AS builder

# WORKDIR /app

# # Adiciona dependências do Prisma
# RUN apt-get update -y && apt-get install -y openssl

# COPY . .

# RUN npm install
# RUN npm run build

# # Etapa 2: imagem final
# FROM node:20-slim

# WORKDIR /app

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/node_modules ./node_modules

# CMD ["node", "dist/server.js"]

# --- deps
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- build
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- run (prod)
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
# Prisma precisa de openssl no runtime; também bom ter ca-certs
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# se usar Prisma, descomente:
# COPY prisma ./prisma
# RUN npx prisma generate

ENV PORT=8000
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:' + process.env.PORT + '/health').then(()=>process.exit(0)).catch(()=>process.exit(1))" || exit 1
CMD ["node", "dist/server.js"]
