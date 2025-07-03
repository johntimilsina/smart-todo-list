import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  try {
    const { text } = await req.json()
    if (!text) {
      return NextResponse.json({ error: "Missing todo text" }, { status: 400 })
    }

    const prompt = `Give me a short, highly encouraging and motivating pep talk for the following task. Be positive, energetic, and supportive.\n\nTask: "${text}"\n\nPep Talk:`

    const result = await model.generateContent(prompt)
    const response = result.response
    const pepTalk = response
      .text()
      .replace(/\*+/g, "")
      .replace(/\n{2,}/g, "\n\n")

    return NextResponse.json({ pepTalk })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json(
      { error: "Failed to generate pep talk" },
      { status: 500 }
    )
  }
}
