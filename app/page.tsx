"use client"

import type React from "react"
import { useState } from "react"
import {
  useGetTodosQuery,
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useAddSuggestionMutation,
  useReorderTodosMutation,
} from "@/lib/graphql/generated/graphql"
import {
  Plus,
  Trash2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  GripVertical,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Header } from "@/components/header"

function SortableTodoItem({
  todo,
  index,
  handleToggle,
  handleSuggestSubtasks,
  handleDelete,
  loadingSuggestions,
  expandedSuggestions,
  isOver,
  isDragging,
}: {
  todo: any
  index: number
  handleToggle: (id: number) => void
  handleSuggestSubtasks: (id: number, e: React.MouseEvent) => void
  handleDelete: (id: number, e: React.MouseEvent) => void
  loadingSuggestions: number | null
  expandedSuggestions: number | null
  isOver: boolean
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: todo.id.toString(),
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease-in-out",
  }

  return (
    <div className="relative">
      {isOver && !isDragging && (
        <motion.div
          layoutId="drop-indicator"
          className="absolute inset-x-0 top-0 h-1 bg-primary rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={isDragging ? "z-50" : "z-0"}
      >
        <Card
          className={`transition-all duration-200 ${
            isDragging
              ? "shadow-2xl scale-105 border-primary/50"
              : "hover:shadow-md"
          } `}
        >
          <CardContent className="p-0">
            <div className="p-4 transition-colors duration-150">
              <div className="flex items-center gap-3">
                <div
                  {...attributes}
                  {...listeners}
                  className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing hover:bg-muted rounded-md transition-colors touch-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                </div>

                <div
                  className={`cursor-pointer flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  }`}
                  onClick={() => {
                    if (expandedSuggestions !== todo.id) {
                      handleToggle(todo.id)
                    }
                  }}
                >
                  {todo.completed && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>

                <span
                  className={`flex-1 text-base select-none transition-all ${
                    todo.completed ? "line-through text-muted-foreground" : ""
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
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(todo.id, e)}
                  className="flex-shrink-0 w-8 h-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedSuggestions === todo.id &&
                todo.suggestion &&
                todo.suggestion.length > 0 && (
                  <motion.div
                    key="suggestions"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t bg-muted/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          AI Suggestions
                        </span>
                      </div>
                      <div className="space-y-2">
                        {todo.suggestion.map(
                          (suggestion: string, index: number) => (
                            <Card key={index} className="bg-background/50">
                              <CardContent className="p-3">
                                <div className="text-sm">
                                  <span className="font-medium mr-2">•</span>
                                  {suggestion}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? over.id.toString() : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over || active.id === over.id) {
      return
    }

    const todos = data?.todos || []
    const oldIndex = todos.findIndex((todo) => todo.id.toString() === active.id)
    const newIndex = todos.findIndex((todo) => todo.id.toString() === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTodos = arrayMove(todos, oldIndex, newIndex)
      try {
        const todoIds = newTodos.map((todo) => todo.id)
        await reorderTodos({ variables: { todoIds } })
        toast.success("Tasks reordered successfully")
        refetch()
      } catch (error) {
        toast.error("Failed to reorder tasks")
        refetch()
      }
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

  const todos = data?.todos
    ? [...data.todos].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        return a.id - b.id
      })
    : []

  const activeTodo = todos.find((todo) => todo.id.toString() === activeId)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
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
                  className="flex-1 h-12 text-lg border-2 focus-visible:border-primary"
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

          {todos.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((todo) => todo.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {todos.map((todo: any, index: number) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      index={index}
                      handleToggle={handleToggle}
                      handleSuggestSubtasks={handleSuggestSubtasks}
                      handleDelete={handleDelete}
                      loadingSuggestions={loadingSuggestions}
                      expandedSuggestions={expandedSuggestions}
                      isOver={overId === todo.id.toString()}
                      isDragging={activeId === todo.id.toString()}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId && activeTodo ? (
                  <Card className="shadow-2xl border-primary/50 opacity-95 rotate-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            activeTodo.completed
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {activeTodo.completed && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span
                          className={`flex-1 text-base ${
                            activeTodo.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {activeTodo.text}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {todos.length === 0 && (
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
      </main>
    </div>
  )
}
