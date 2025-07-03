import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  try {
    const formData = await req.formData()
    const file = formData.get("image") as File
    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    const prompt = `You are an AI assistant. Extract a list of todo items from the following image. Only return the list of todos, one per line, no extra text.`

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64, mimeType: file.type } },
          ],
        },
      ],
    })
    const response = result.response
    const text = response.text()
    const todos = text
      .split(/\r?\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    return NextResponse.json({ todos })
  } catch (error) {
    console.error("Error extracting todos from image:", error)
    return NextResponse.json(
      { error: "Failed to extract todos from image." },
      { status: 500 }
    )
  }
}
