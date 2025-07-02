"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Sparkles, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import SortableList from "react-easy-sort"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/header"
import { TodoItem } from "@/components/TodoItem"

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
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-2">Smart Todo</h1>
            <p className="text-muted-foreground text-lg">
              AI-powered task management
            </p>
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
    </ScrollArea>
  )
}
