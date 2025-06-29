"use client"

import type React from "react"
import { useState } from "react"

import {
  useGetTodosQuery,
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useAddSuggestionMutation,
} from "@/lib/graphql/generated/graphql"

import {
  Plus,
  Trash2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"

import { motion } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {
  const { data, loading, error, refetch } = useGetTodosQuery()
  const [addTodo] = useAddTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [toggleTodo] = useToggleTodoMutation()
  const [addSuggestion] = useAddSuggestionMutation()
  const [text, setText] = useState("")
  const [loadingSuggestions, setLoadingSuggestions] = useState<number | null>(
    null
  )
  const [expandedSuggestions, setExpandedSuggestions] = useState<number | null>(
    null
  )

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

  return (
    <div className="min-h-screen bg-background">
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
          <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-r from-background to-muted/30">
            <CardContent className="p-8">
              <div className="flex gap-4">
                <Input
                  placeholder="What needs to be done?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1 h-12 text-lg border-2 focus:border-primary"
                />
                <Button
                  onClick={handleAdd}
                  size="lg"
                  className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {data?.todos.map((todo: any, index: number) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/20 transition-colors duration-150"
                    onClick={() => handleToggle(todo.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          todo.completed
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {todo.completed && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>

                      <span
                        className={`flex-1 text-base select-none ${
                          todo.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {todo.text}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSuggestSubtasks(todo.id, e)}
                        disabled={loadingSuggestions === todo.id}
                        className="min-w-[110px] justify-between h-8"
                      >
                        <div className="flex items-center gap-2">
                          {loadingSuggestions === todo.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span className="text-xs">
                            {todo.suggestion && todo.suggestion.length > 0
                              ? "View"
                              : "Suggest"}
                          </span>
                        </div>
                        {todo.suggestion && todo.suggestion.length > 0 && (
                          <div className="flex-shrink-0 ml-1">
                            {expandedSuggestions === todo.id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => handleDelete(todo.id, e)}
                        className="flex-shrink-0 w-8 h-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedSuggestions === todo.id &&
                    todo.suggestion &&
                    todo.suggestion.length > 0 && (
                      <div className="border-t bg-muted/30">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              AI Suggestions
                            </span>
                          </div>
                          <div className="space-y-2">
                            {todo.suggestion.map(
                              (suggestion: string, index: number) => (
                                <Card key={index} className="bg-background">
                                  <CardContent className="p-3">
                                    <div className="text-sm">
                                      <span className="font-medium mr-2">
                                        •
                                      </span>
                                      {suggestion}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {data?.todos.length === 0 && (
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
  )
}
