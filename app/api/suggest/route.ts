// app/api/suggest/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // 1. Get the API key from environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  try {
    // 2. Get the user's task from the request body
    const { task } = await req.json()

    if (!task) {
      return NextResponse.json(
        { error: "Task description is required." },
        { status: 400 }
      )
    }

    // 3. Craft a specific prompt for the AI
    const prompt = `
      Break down the following to-do item into a list of smaller, actionable sub-tasks.
      The main task is: "${task}".

      Provide the response as a simple list of tasks, with each sub-task on a new line.
      Do not include any introductory or concluding text, just the list of sub-tasks.
      For example, if the task is "Plan a birthday party", the output should be:
      - Send out invitations
      - Buy decorations
      - Order a cake
      - Plan the menu
      limit the suggestion to five steps
    `

    // 4. Call the Gemini API
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 5. Process the response and send it back to the client
    const suggestions = text
      .split("\n") // Split the text by new lines
      .map((s) => s.replace(/^- /, "").trim()) // Remove "- " prefix and trim whitespace
      .filter((s) => s.length > 0) // Filter out any empty lines

    console.log('suggestions', suggestions)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions." },
      { status: 500 }
    )
  }
}
