// import Fastify from "fastify";
// import cors from "@fastify/cors";
// import taskRoutes from "./routes/taskRoutes";

// const server = Fastify({ logger: true });

// // Habilitar CORS
// server.register(cors, {
//   // origin: ["http://localhost:3000"], // endereço do teu front
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE"], // quais métodos liberar
// });

// // Rotas
// server.register(taskRoutes);

// server.get("/", async (request, reply) => {
//   return reply.send({ message: "API de Tarefas está rodando!" });
// });

// const start = async () => {
//   try {
//     await server.listen({ port: 8000, host: "0.0.0.0" });
//     console.log("🚀 Servidor rodando em http://localhost:8000");
//   } catch (err) {
//     server.log.error(err);
//     process.exit(1);
//   }
// };

// start();

import Fastify from "fastify";
import cors from "@fastify/cors";
import taskRoutes from "./routes/taskRoutes";

const server = Fastify({ logger: true });

// CORS: defina CORS_ORIGIN nas envs do Render (ex.: https://tasks-ui-xxxx.onrender.com)
// Pode ser múltiplos, separados por vírgula
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);

server.register(cors, {
  origin: allowedOrigins.length ? allowedOrigins : false, // false = bloqueia tudo se não configurar
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

// Rotas
server.register(taskRoutes);

// Healthcheck (para Render)
server.get("/health", async () => ({ ok: true }));

server.get("/", async (_req, reply) => {
  return reply.send({ message: "API de Tarefas está rodando!" });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT || 8000);   // Render injeta PORT
    const host = "0.0.0.0";                           // precisa ouvir fora do container
    await server.listen({ port, host });
    server.log.info(`🚀 Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
