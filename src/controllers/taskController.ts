import { FastifyReply, FastifyRequest } from "fastify";
import { TaskModel } from "../models/taskModel";

// Limite máximo de tasks permitidas (configurável via environment variable)
const MAX_TASKS_LIMIT = parseInt(process.env.MAX_TASKS_LIMIT || "10", 10);

export const TaskController = {
  // Criar uma task
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const { title } = request.body as { title: string };

    // Verificar se já atingiu o limite de tasks
    const currentTasksCount = await TaskModel.count();
    if (currentTasksCount >= MAX_TASKS_LIMIT) {
      return reply.code(400).send({
        message: `Limite máximo de ${MAX_TASKS_LIMIT} tasks atingido. Delete algumas tasks para criar novas.`,
        error: "TASK_LIMIT_EXCEEDED",
        maxLimit: MAX_TASKS_LIMIT,
        currentCount: currentTasksCount,
      });
    }

    const task = await TaskModel.create(title);
    return reply.code(201).send(task);
  },

  // Listar todas as tasks
  findAll: async (_: FastifyRequest, reply: FastifyReply) => {
    const tasks = await TaskModel.findAll();
    const currentCount = await TaskModel.count();

    return reply.send({
      tasks,
      meta: {
        currentCount,
        maxLimit: MAX_TASKS_LIMIT,
        canCreateMore: currentCount < MAX_TASKS_LIMIT,
        remainingSlots: MAX_TASKS_LIMIT - currentCount,
      },
    });
  },

  // Buscar uma task por ID
  findById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const task = await TaskModel.findById(id); // <- agora é string
    if (!task) return reply.code(404).send({ message: "Task not found" });
    return reply.send(task);
  },

  // Atualizar uma task por ID
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { title, completed } = request.body as {
      title?: string;
      completed?: boolean;
    };

    try {
      const task = await TaskModel.update(id, { title, completed }); // <- string
      return reply.send(task);
    } catch {
      return reply.code(404).send({ message: "Task not found" });
    }
  },

  // Deletar uma task por ID
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      await TaskModel.delete(id); // <- string
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ message: "Task not found" });
    }
  },

  // Obter informações sobre o limite de tasks
  getLimits: async (_: FastifyRequest, reply: FastifyReply) => {
    const currentCount = await TaskModel.count();

    return reply.send({
      currentCount,
      maxLimit: MAX_TASKS_LIMIT,
      canCreateMore: currentCount < MAX_TASKS_LIMIT,
      remainingSlots: MAX_TASKS_LIMIT - currentCount,
    });
  },
};
