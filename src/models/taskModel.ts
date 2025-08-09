import prisma from "../prisma";

export const TaskModel = {
  create: (title: string) => prisma.task.create({ data: { title } }),

  findAll: () => prisma.task.findMany(),

  findById: (id: string) => prisma.task.findUnique({ where: { id } }), // <- string

  update: (id: string, data: { title?: string; completed?: boolean }) =>
    prisma.task.update({ where: { id }, data }), // <- string

  delete: (id: string) => prisma.task.delete({ where: { id } }), // <- string

  count: () => prisma.task.count(),
};
