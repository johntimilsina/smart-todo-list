import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const resolvers = {
  Query: {
    todos: async (_: any, { userId }: { userId: string }) =>
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
  },
  Mutation: {
    addTodo: (_: any, { text, userId }: { text: string; userId: string }) =>
      prisma.todo.create({ data: { text, userId } }),
    deleteTodo: async (_: any, { id, userId }: { id: number; userId: string }) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      await prisma.todo.delete({ where: { id } })
      return true
    },
    toggleTodo: async (_: any, { id, userId }: { id: number; userId: string }) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
      })
    },
    addSuggestion: async (
      _: any,
      { id, suggestion, userId }: { id: number; suggestion: string[]; userId: string }
    ) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { suggestion },
      })
    },
    reorderTodos: async (_: any, { todoIds, userId }: { todoIds: number[]; userId: string }) => {
      // Update each todo with its new order position, only for this user
      const updatePromises = todoIds.map((id, index) =>
        prisma.todo.update({
          where: { id },
          data: { order: index },
        })
      )
      // After updating, filter to only return todos for this user
      await Promise.all(updatePromises)
      return prisma.todo.findMany({
        where: { userId },
        orderBy: { order: "asc" },
      })
    },
  },
}
