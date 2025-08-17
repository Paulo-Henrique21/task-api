# Tasks API · Fastify + Prisma + PostgreSQL

API simples de tarefas com Fastify, Prisma e Postgres.  
✅ **Produção (API):** https://task-api-nxz7.onrender.com  
✅ **Frontend (UI):** https://task-ui.onrender.com

- Health: `GET /health` → `{"ok": true}`  
- Root: `GET /` → `{"message":"API de Tarefas está rodando!"}`

---

## 🧱 Stack
- Node.js · Fastify
- Prisma ORM · PostgreSQL
- Docker · Render

## 🔐 Variáveis de ambiente
Crie um `.env` (para uso local) e configure envs no Render (produção):

```env
# obrigatórias
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB   # em produção use a Internal Database URL do Render
CORS_ORIGIN=https://task-ui.onrender.com,http://localhost:3000

# opcionais
MAX_TASKS_LIMIT=10
NODE_ENV=production
```

> Em produção, o container roda `npx prisma migrate deploy` antes de iniciar.

## 🗄️ Prisma & Banco
- Criar/atualizar migrações (local):
```bash
npx prisma migrate dev -n init
```
- Gerar client:
```bash
npx prisma generate
```

## 🚦 Endpoints (exemplos)
_Ajuste se suas rotas diferirem:_
- `GET /tasks` → lista `{ tasks: [...], meta: {...} }`
- `POST /tasks` → cria (`{ title, description?, done? }`)
- `PUT /tasks/:id` ou `PATCH /tasks/:id` → atualiza
- `DELETE /tasks/:id` → remove

### Exemplos
```bash
# listar
curl https://task-api-nxz7.onrender.com/tasks

# criar
curl -X POST https://task-api-nxz7.onrender.com/tasks   -H "Content-Type: application/json"   -d '{"title":"Primeira task","description":"deploy ok","done":false}'

# deletar
curl -X DELETE https://task-api-nxz7.onrender.com/tasks/<ID>
```

## ▶️ Rodando localmente
### Sem Docker
```bash
npm ci
npx prisma migrate dev
npm run dev
```

### Com Docker
```bash
docker build -t tasks-api .
docker run --rm -p 8000:8000   -e DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB"   -e CORS_ORIGIN="http://localhost:3000"   tasks-api
```

## ☁️ Deploy (Render)
1. **Postgres** (Free) → copie a **Internal Database URL**.  
2. **Web Service** (Docker) → selecione o repositório/branch da API.  
3. **Environment**: `DATABASE_URL`, `CORS_ORIGIN`, `MAX_TASKS_LIMIT` (opcional).  
4. **Health Check Path**: `/health`.  
5. O Dockerfile aplica `migrate deploy` no start.

---
