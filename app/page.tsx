"use client"

import { gql, useQuery, useMutation } from "@apollo/client"
import { useState } from "react"
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

const GET_TODOS = gql`
  query {
    todos {
      id
      text
      completed
      suggestion
    }
  }
`
const ADD_TODO = gql`
  mutation ($text: String!) {
    addTodo(text: $text) {
      id
      text
    }
  }
`
const DELETE_TODO = gql`
  mutation ($id: Int!) {
    deleteTodo(id: $id)
  }
`
const TOGGLE_TODO = gql`
  mutation ($id: Int!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`
const ADD_SUGGESTION = gql`
  mutation ($id: Int!, $suggestion: [String]!) {
    addSuggestion(id: $id, suggestion: $suggestion) {
      id
      suggestion
    }
  }
`

export default function Page() {
  const { data, loading, error, refetch } = useQuery(GET_TODOS)
  const [addTodo] = useMutation(ADD_TODO)
  const [deleteTodo] = useMutation(DELETE_TODO)
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [addSuggestion] = useMutation(ADD_SUGGESTION)
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

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo({ variables: { id } })
      refetch()
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const handleToggle = async (id: number) => {
    const todo = data.todos.find((t: { id: number }) => t.id === id)
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

  const handleSuggestSubtasks = async (todoId: number) => {
    const todo = data.todos.find((t: { id: number }) => t.id === todoId)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 text-black"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading your tasks...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-center"
        >
          <p className="text-lg">Error: {error.message}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-black mb-2">Smart Todo</h1>
          <p className="text-gray-600 text-lg">AI-powered task management</p>
        </motion.div>

        {/* Add Todo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex gap-3">
            <input
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              placeholder="What needs to be done?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Todo List */}
        <div className="space-y-3">
          {data.todos.map((todo: any, index: number) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors duration-200"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {/* Complete Button - No Animation */}
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-100 ${
                      todo.completed
                        ? "bg-black border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {todo.completed && <Check className="h-3 w-3 text-white" />}
                  </button>

                  {/* Todo Text */}
                  <span
                    className={`flex-1 text-lg transition-all duration-200 ${
                      todo.completed
                        ? "line-through text-gray-500"
                        : "text-black"
                    }`}
                  >
                    {todo.text}
                  </span>

                  {/* AI Suggestions Button - Fixed Width */}
                  <button
                    onClick={() => handleSuggestSubtasks(todo.id)}
                    disabled={loadingSuggestions === todo.id}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-black px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-32 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {loadingSuggestions === todo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {todo.suggestion && todo.suggestion.length > 0
                          ? "View"
                          : "Suggest"}
                      </span>
                    </div>
                    {todo.suggestion && todo.suggestion.length > 0 && (
                      <div className="flex-shrink-0">
                        {expandedSuggestions === todo.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(todo.id)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 flex items-center justify-center transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Suggestions Panel - No Layout Shift */}
              {expandedSuggestions === todo.id &&
                todo.suggestion &&
                todo.suggestion.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-black" />
                        <span className="text-sm font-medium text-black">
                          AI Suggestions
                        </span>
                      </div>
                      <div className="space-y-2">
                        {todo.suggestion.map(
                          (suggestion: string, index: number) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-3 text-gray-700 text-sm hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="text-black font-medium mr-2">
                                •
                              </span>
                              {suggestion}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {data.todos.length === 0 && (
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
              className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="h-8 w-8 text-black" />
            </motion.div>
            <h3 className="text-xl font-medium text-black mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-600">
              Add your first task to get started with AI-powered suggestions
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
