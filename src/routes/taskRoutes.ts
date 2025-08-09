import { FastifyInstance } from "fastify";
import { TaskController } from "../controllers/taskController";

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.post("/tasks", TaskController.create);
  fastify.get("/tasks", TaskController.findAll);
  fastify.get("/tasks/limits", TaskController.getLimits);
  fastify.get("/tasks/:id", TaskController.findById);
  fastify.put("/tasks/:id", TaskController.update);
  fastify.delete("/tasks/:id", TaskController.delete);
}
