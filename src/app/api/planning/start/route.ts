import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const firstQuestion = {
      question: "What's the primary goal of this task?",
      options: [
        { id: "a", label: "Research and gather information" },
        { id: "b", label: "Build or create something new" },
        { id: "c", label: "Fix an existing problem" },
        { id: "d", label: "Improve or optimize an existing feature" },
        { id: "other", label: "Other" },
      ],
    };

    return NextResponse.json({
      question: firstQuestion,
      messages: [],
      sessionKey: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Planning start error:", error);
    return NextResponse.json({ error: "Failed to start planning" }, { status: 500 });
  }
}
