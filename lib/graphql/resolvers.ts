import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

function isAnonymousUser(userId: string, isAnonymous?: boolean) {
  //TODO:  If isAnonymous passed from frontend, use it directly
  // Otherwise, implement logic to check userId pattern or fetch user metadata
  return !!isAnonymous
}

export const resolvers = {
  Query: {
    todos: async (_: any, { userId }: { userId: string }) =>
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    featureUsage: async (_: any, { userId }: { userId: string }) =>
      prisma.featureUsage.findMany({
        where: { userId },
        orderBy: { usedAt: "desc" },
      }),
  },
  Mutation: {
    addTodo: async (
      _: any,
      {
        text,
        userId,
        isAnonymous,
      }: { text: string; userId: string; isAnonymous?: boolean }
    ) => {
      if (isAnonymousUser(userId, isAnonymous)) {
        const count = await prisma.todo.count({ where: { userId } })
        if (count >= 3)
          throw new Error(
            "Anonymous users can only add 3 todos. Please log in to add more."
          )
      }
      return prisma.todo.create({ data: { text, userId } })
    },
    deleteTodo: async (
      _: any,
      { id, userId }: { id: number; userId: string }
    ) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      await prisma.todo.delete({ where: { id } })
      return true
    },
    toggleTodo: async (
      _: any,
      { id, userId }: { id: number; userId: string }
    ) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
      })
    },
    addSuggestion: async (
      _: any,
      {
        id,
        suggestion,
        userId,
        isAnonymous,
      }: {
        id: number
        suggestion: string[]
        userId: string
        isAnonymous?: boolean
      }
    ) => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { suggestion },
      })
    },
    reorderTodos: async (
      _: any,
      {
        todoIds,
        userId,
        isAnonymous,
      }: { todoIds: number[]; userId: string; isAnonymous?: boolean }
    ) => {
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
    useFeature: async (_: any, { userId, feature }: { userId: string; feature: string }) => {
      // Always record the usage, regardless of user type
      try {
        return await prisma.featureUsage.create({ data: { userId, feature } })
      } catch (err: any) {
        // If already exists, return the existing record
        if (err.code === 'P2002') {
          // Unique constraint failed, fetch and return existing
          return await prisma.featureUsage.findUnique({
            where: { userId_feature: { userId, feature } },
          })
        }
        throw err
      }
    },
  },
}
