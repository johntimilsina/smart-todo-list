"use client"

import type React from "react"
import { useState } from "react"
import {
  Plus,
  Sparkles,
  Loader2,
  ArrowUpIcon as ClockArrowUp,
  ScanSearch,
  DumbbellIcon as BicepsFlexed,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import SortableList from "react-easy-sort"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/header"
import { TodoItem } from "@/components/TodoItem"
import { PepTalkDialog } from "@/components/pep-talk-dialog"
import { CreateFromImageDialog } from "@/components/create-from-image-dialog"

import {
  useGetTodosQuery,
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useAddSuggestionMutation,
  useReorderTodosMutation,
} from "@/lib/graphql/generated/graphql"

export default function Page() {
  const { data, loading, error, refetch } = useGetTodosQuery()
  const [addTodo] = useAddTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [toggleTodo] = useToggleTodoMutation()
  const [addSuggestion] = useAddSuggestionMutation()
  const [reorderTodos] = useReorderTodosMutation()

  const [text, setText] = useState("")
  const [loadingSuggestions, setLoadingSuggestions] = useState<number | null>(
    null
  )
  const [expandedSuggestions, setExpandedSuggestions] = useState<number | null>(
    null
  )
  const [isReordering, setIsReordering] = useState(false)
  const [optimisticTodos, setOptimisticTodos] = useState<any[]>([])
  const [prioritizing, setPrioritizing] = useState(false)
  const [prioritizedResult, setPrioritizedResult] = useState<string | null>(
    null
  )
  const [pepTalkOpen, setPepTalkOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return

    try {
      await addTodo({ variables: { text } })
      setText("")
      refetch()
      toast.success("Task added successfully")
    } catch (error) {
      toast.error("Failed to add task")
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteTodo({ variables: { id } })
      refetch()
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const handleToggle = async (id: number) => {
    const todo = data?.todos.find((t: { id: number }) => t.id === id)
    try {
      await toggleTodo({ variables: { id } })
      refetch()
      if (todo?.completed) {
        toast.success("Task marked as incomplete")
      } else {
        toast.success("Task completed! 🎉")
      }
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const handleSuggestSubtasks = async (todoId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const todo = data?.todos.find((t: { id: number }) => t.id === todoId)
    if (!todo) return

    if (todo.suggestion && todo.suggestion.length > 0) {
      setExpandedSuggestions(expandedSuggestions === todoId ? null : todoId)
      return
    }

    setLoadingSuggestions(todoId)
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: todo.text }),
      })

      if (!response.ok) throw new Error("Failed to fetch suggestions")

      const dataRes = await response.json()
      const { suggestions } = dataRes

      await addSuggestion({
        variables: { id: todoId, suggestion: suggestions },
      })

      refetch()
      setExpandedSuggestions(todoId)
      toast.success("AI suggestions generated!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate suggestions")
    } finally {
      setLoadingSuggestions(null)
    }
  }

  const onSortEnd = async (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return

    const todos = data?.todos || []
    const sortedTodos = [...todos].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return a.id - b.id
    })

    const reorderedTodos = [...sortedTodos]
    const [removed] = reorderedTodos.splice(oldIndex, 1)
    reorderedTodos.splice(newIndex, 0, removed)

    setOptimisticTodos(reorderedTodos)
    setIsReordering(true)

    try {
      const todoIds = reorderedTodos.map((todo) => todo.id)
      await reorderTodos({ variables: { todoIds } })
      toast.success("Tasks reordered successfully")
    } catch (error) {
      toast.error("Failed to reorder tasks")
      setOptimisticTodos([])
      refetch()
    } finally {
      setIsReordering(false)
      setTimeout(() => setOptimisticTodos([]), 100)
    }
  }

  const handlePrioritize = async () => {
    if (!data?.todos || data.todos.length < 3) return

    setPrioritizing(true)
    setPrioritizedResult(null)

    try {
      const todosText = data.todos.map((t: any) => t.text)
      const response = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos: todosText }),
      })

      if (!response.ok) throw new Error("Failed to prioritize tasks")

      const result = await response.json()
      setPrioritizedResult(result.prioritized)

      if (
        result.ordered &&
        Array.isArray(result.ordered) &&
        result.ordered.length > 0
      ) {
        const todosCopy = [...data.todos]
        const orderedTodos = result.ordered
          .map((orderedText: string) => {
            let bestMatch = null
            let bestScore = 0

            for (const todo of todosCopy) {
              const orderedWords = orderedText.toLowerCase().split(/\s+/)
              const todoWords = todo.text.toLowerCase().split(/\s+/)
              const matchCount = orderedWords.filter((w) =>
                todoWords.includes(w)
              ).length

              if (matchCount > bestScore) {
                bestScore = matchCount
                bestMatch = todo
              }
            }

            if (bestMatch) {
              todosCopy.splice(todosCopy.indexOf(bestMatch), 1)
              return bestMatch
            }
            return null
          })
          .filter(Boolean)

        const finalOrder = [...orderedTodos, ...todosCopy]
        setOptimisticTodos(finalOrder)
        setIsReordering(true)

        try {
          const todoIds = finalOrder.map((todo) => todo.id)
          await reorderTodos({ variables: { todoIds } })
          toast.success("Tasks reordered successfully")
        } catch (error) {
          toast.error("Failed to reorder tasks")
          setOptimisticTodos([])
          refetch()
        } finally {
          setIsReordering(false)
          setTimeout(() => setOptimisticTodos([]), 100)
        }
      }

      toast.success("Tasks prioritized!")
    } catch (error) {
      toast.error("Failed to prioritize tasks")
    } finally {
      setPrioritizing(false)
    }
  }

  const handleAddTodosFromImage = async (todos: string[]) => {
    await Promise.all(todos.map((text) => addTodo({ variables: { text } })))
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading your tasks...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-center"
        >
          <p className="text-lg">Error: {error.message}</p>
        </motion.div>
      </div>
    )
  }

  const todosToDisplay =
    isReordering && optimisticTodos.length > 0
      ? optimisticTodos
      : data?.todos
      ? [...data.todos].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          return a.id - b.id
        })
      : []

  return (
    <ScrollArea className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-6">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 space-x-2"
          >
            <Button
              size="lg"
              variant="secondary"
              disabled={
                loading || (data?.todos?.length ?? 0) < 3 || prioritizing
              }
              onClick={handlePrioritize}
              className="my-3"
            >
              {prioritizing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Prioritizing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ClockArrowUp className="h-5 w-5 text-primary" />
                  Prioritize My Day
                </span>
              )}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={loading}
              className="my-3"
              onClick={() => setImageDialogOpen(true)}
            >
              <span className="flex items-center gap-2">
                <ScanSearch className="h-5 w-5 text-primary" />
                Create from image
              </span>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={loading || !data?.todos.length}
              className="my-3"
              onClick={() => setPepTalkOpen(true)}
            >
              <span className="flex items-center gap-2">
                <BicepsFlexed className="h-5 w-5 text-primary" />
                Pep Talk
              </span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div>
              <div className="flex gap-4">
                <Input
                  placeholder="What needs to be done?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1 h-12 text-lg border-2 focus-visible:border-primary shadow"
                />
                <Button
                  onClick={handleAdd}
                  size="lg"
                  className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-6 w-6" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>

          {prioritizedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-muted border rounded-lg p-4 mb-8 shadow"
            >
              <h4 className="font-semibold mb-2 flex items-center justify-between">
                <span>Prioritized List</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setPrioritizedResult(null)}
                >
                  <XCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </span>
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                {prioritizedResult}
              </pre>
            </motion.div>
          )}

          <div className="relative">
            <AnimatePresence>
              {isReordering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg"
                >
                  <div className="bg-background border rounded-lg p-4 shadow-lg flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      Reordering tasks...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {todosToDisplay.length > 0 && (
              <motion.div layout>
                <SortableList
                  onSortEnd={onSortEnd}
                  className="space-y-4"
                  draggedItemClassName="opacity-50 scale-105"
                >
                  {todosToDisplay.map((todo: any, index: number) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      index={index}
                      handleToggle={handleToggle}
                      handleSuggestSubtasks={handleSuggestSubtasks}
                      handleDelete={handleDelete}
                      loadingSuggestions={loadingSuggestions}
                      expandedSuggestions={expandedSuggestions}
                      isReordering={isReordering}
                    />
                  ))}
                </SortableList>
              </motion.div>
            )}

            {todosToDisplay.length === 0 && !isReordering && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Add your first task to get started with AI-powered suggestions
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <PepTalkDialog
        open={pepTalkOpen}
        onOpenChange={setPepTalkOpen}
        todos={data?.todos || []}
      />

      <CreateFromImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onAddTodos={handleAddTodosFromImage}
      />
    </ScrollArea>
  )
}
