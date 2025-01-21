import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Securely set in .env.local
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided for summarization." },
        { status: 400 }
      );
    }

    // For ChatGPT-style summaries (model: gpt-3.5-turbo or gpt-4)
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful summarization assistant." },
        { role: "user", content: `Summarize this article:\n\n${text}` },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const summary = chatResponse.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}