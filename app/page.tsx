"use client"

import { gql, useQuery, useMutation } from "@apollo/client"
import { useState } from "react"

const GET_TODOS = gql`
  query {
    todos {
      id
      text
      completed
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

export default function Page() {
  const { data, loading, error, refetch } = useQuery(GET_TODOS)
  const [addTodo] = useMutation(ADD_TODO)
  const [deleteTodo] = useMutation(DELETE_TODO)
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [text, setText] = useState("")

  const handleAdd = async () => {
    if (!text.trim()) return
    await addTodo({ variables: { text } })
    setText("")
    refetch()
  }

  const handleDelete = async (id: number) => {
    await deleteTodo({ variables: { id } })
    refetch()
  }

  const handleToggle = async (id: Number) => {
    await toggleTodo({ variables: { id } })
    refetch()
  }

  const handleSuggestSubtasks = async (todoId: number) => {
    //setLoadingId(todoId) // Start loading animation
    const todo = data.todos.find((t: { id: number }) => t.id === todoId)

    if (!todo) {
      //setLoadingId(null)
      return
    }

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: todo.text }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions")
      }

      const data = await response.json()
      const { suggestions } = data

      console.log("suggestions", suggestions)

      // Update the specific todo with the new subtasks
      /* setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId
            ? { ...t, subtasks: [...t.subtasks, ...suggestions] }
            : t
        )
      ) */
    } catch (error) {
      console.error(error)
      alert("Could not get suggestions. Please try again.")
    } finally {
      //setLoadingId(null) // Stop loading animation
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="Add todo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {data.todos.map((todo: any) => (
          <li
            key={todo.id}
            className="flex justify-between items-center border p-2 mb-2 rounded"
          >
            <span
              className={todo.completed ? "line-through text-gray-500" : ""}
              onClick={() => handleToggle(todo.id)}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="text-red-500"
            >
              ✕
            </button>
            <button
              onClick={() => handleSuggestSubtasks(todo.id)}
              className="text-red-500"
            >
              suggest
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
