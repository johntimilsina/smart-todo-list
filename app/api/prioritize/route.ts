// app/api/suggest/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // 1. Get the API key from environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  try {
    // 2. Get the user's todo list from the request body
    const { todos } = await req.json()

    if (!todos || !Array.isArray(todos) || todos.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of todo items is required as 'todos'." },
        { status: 400 }
      )
    }

    // 3. Craft a specific prompt for the AI
    const prompt = `Here is my todo list for today. 
    Reorder it from most to least important. 
    Consider urgency (words like 'urgent', 'asap'), dependencies, and effort. 
    Provide a brief one-sentence reason for the top 3 items.\n\nMy List:\n${todos
      .map((t) => `- ${t}`)
      .join("\n")}\n\nPrioritized List:`

    // 4. Call the Gemini API
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 5. Clean up the response: remove asterisks and markdown formatting
    let cleanText = text.replace(/\*+/g, "")
    // Optionally remove extra blank lines
    cleanText = cleanText.replace(/\n{2,}/g, "\n\n")

    // Try to extract the ordered todo items from the response
    // Match lines like: 1. Task description
    const orderRegex = /^\s*\d+\.\s*(.+)$/gm
    let match
    const orderedItems: string[] = []
    while ((match = orderRegex.exec(cleanText)) !== null) {
      // Remove any trailing explanation after the first sentence (optional)
      orderedItems.push(match[1].split(/[.!?]/)[0].trim())
    }

    return NextResponse.json({ prioritized: cleanText, ordered: orderedItems })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json(
      { error: "Failed to prioritize todos." },
      { status: 500 }
    )
  }
}
