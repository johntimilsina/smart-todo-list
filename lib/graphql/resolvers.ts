import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

function isAnonymousUser(userId: string, isAnonymous?: boolean) {
  //TODO:  If isAnonymous passed from frontend, use it directly
  // Otherwise, implement logic to check userId pattern or fetch user metadata
  return !!isAnonymous
}

async function checkFeatureUsage({
  userId,
  feature,
}: {
  userId: string
  feature: string
}) {
  const usage = await prisma.featureUsage.findUnique({
    where: { userId_feature: { userId, feature } },
  })
  if (usage)
    throw new Error(
      "Anonymous users can only use this feature once. Please log in."
    )
  await prisma.featureUsage.create({ data: { userId, feature } })
}

export const resolvers = {
  Query: {
    todos: async (_: any, { userId }: { userId: string }) =>
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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
      if (isAnonymousUser(userId, isAnonymous)) {
        await checkFeatureUsage({ userId, feature: "add_suggestion" })
      }
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
      if (isAnonymousUser(userId, isAnonymous)) {
        await checkFeatureUsage({ userId, feature: "prioritize" })
      }
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
    // Add similar logic for create-from-image and pep-talk features as needed
  },
}
