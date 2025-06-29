import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const resolvers = {
  Query: {
    todos: () => prisma.todo.findMany({ orderBy: { createdAt: "desc" } }),
  },
  Mutation: {
    addTodo: (_: any, { text }: { text: string }) =>
      prisma.todo.create({ data: { text } }),
    deleteTodo: async (_: any, { id }: { id: number }) => {
      await prisma.todo.delete({ where: { id } })
      return true
    },
    toggleTodo: async (_: any, { id }: { id: number }) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      return prisma.todo.update({
        where: { id },
        data: { completed: !todo?.completed },
      })
    },
    addSuggestion: async (
      _: any,
      { id, suggestion }: { id: number; suggestion: string[] }
    ) => {
      return prisma.todo.update({
        where: { id },
        data: { suggestion },
      })
    },
    reorderTodos: async (_: any, { todoIds }: { todoIds: number[] }) => {
      // Update each todo with its new order position
      const updatePromises = todoIds.map((id, index) =>
        prisma.todo.update({
          where: { id },
          data: { order: index },
        })
      )

      await Promise.all(updatePromises)

      // Return all todos in the new order
      return prisma.todo.findMany({
        orderBy: { order: "asc" },
      })
    },
  },
}
