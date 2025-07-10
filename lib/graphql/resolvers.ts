
import { PrismaClient, Todo, FeatureUsage } from "@prisma/client"
const prisma = new PrismaClient()

function isAnonymousUser(userId: string, isAnonymous?: boolean): boolean {
  //TODO:  If isAnonymous passed from frontend, use it directly
  // Otherwise, implement logic to check userId pattern or fetch user metadata
  return !!isAnonymous
}

export const resolvers = {
  Query: {
    todos: async (_: unknown, { userId }: { userId: string }): Promise<Todo[]> =>
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    featureUsage: async (
      _: unknown,
      { userId }: { userId: string }
    ): Promise<FeatureUsage[]> =>
      prisma.featureUsage.findMany({
        where: { userId },
        orderBy: { usedAt: "desc" },
      }),
  },
  Mutation: {
    addTodo: async (
      _: unknown,
      {
        text,
        userId,
        isAnonymous,
      }: { text: string; userId: string; isAnonymous?: boolean }
    ): Promise<Todo> => {
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
      _: unknown,
      { id, userId }: { id: number; userId: string }
    ): Promise<boolean> => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      await prisma.todo.delete({ where: { id } })
      return true
    },
    toggleTodo: async (
      _: unknown,
      { id, userId }: { id: number; userId: string }
    ): Promise<Todo> => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
      })
    },
    addSuggestion: async (
      _: unknown,
      {
        id,
        suggestion,
        userId,
      }: {
        id: number
        suggestion: string[]
        userId: string
        isAnonymous?: boolean
      }
    ): Promise<Todo> => {
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo || todo.userId !== userId) throw new Error("Not authorized")
      return prisma.todo.update({
        where: { id },
        data: { suggestion },
      })
    },
    reorderTodos: async (
      _: unknown,
      {
        todoIds,
        userId,
      }: { todoIds: number[]; userId: string; isAnonymous?: boolean }
    ): Promise<Todo[]> => {
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
    recordFeatureUsage: async (
      _: unknown,
      { userId, feature }: { userId: string; feature: string }
    ): Promise<FeatureUsage | null> => {
      // Always record the usage, regardless of user type
      try {
        return await prisma.featureUsage.create({ data: { userId, feature } })
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code: string }).code === "P2002"
        ) {
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
