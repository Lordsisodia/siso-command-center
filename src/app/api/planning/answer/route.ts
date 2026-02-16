import { NextResponse } from "next/server";

const SAMPLE_QUESTIONS = [
  {
    question: "Who is the target audience for this?",
    options: [
      { id: "a", label: "Internal team members" },
      { id: "b", label: "External customers" },
      { id: "c", label: "Developers/Technical users" },
      { id: "d", label: "General users" },
      { id: "other", label: "Other" },
    ],
  },
  {
    question: "What's the expected timeline?",
    options: [
      { id: "a", label: "ASAP (urgent)" },
      { id: "b", label: "This week" },
      { id: "c", label: "This month" },
      { id: "d", label: "No specific deadline" },
      { id: "other", label: "Other" },
    ],
  },
];

const SAMPLE_SPEC = {
  title: "",
  summary: "",
  deliverables: [
    "Research report with key findings",
    "Implementation plan",
    "Code changes (if applicable)",
    "Documentation updates",
  ],
  success_criteria: [
    "Meets all requirements",
    "Passes existing tests",
    "Code review approved",
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, messages, answer } = body;

    if (!title || !answer) {
      return NextResponse.json({ error: "Title and answer are required" }, { status: 400 });
    }

    const messageCount = messages?.length || 0;
    
    if (messageCount >= SAMPLE_QUESTIONS.length * 2) {
      SAMPLE_SPEC.title = title;
      SAMPLE_SPEC.summary = `${title}: ${description || "Task completed through AI planning process."}`;
      
      return NextResponse.json({
        complete: true,
        spec: SAMPLE_SPEC,
        agents: [
          { name: "Research Agent", role: "Gathers information", avatar_emoji: "🔍" },
          { name: "Builder Agent", role: "Implements changes", avatar_emoji: "🔨" },
        ],
        messages: [
          ...messages,
          { role: "assistant", content: "I have enough information. Creating your plan...", timestamp: Date.now() },
        ],
      });
    }

    const questionIndex = Math.floor((messageCount + 1) / 2) % SAMPLE_QUESTIONS.length;
    const nextQuestion = SAMPLE_QUESTIONS[questionIndex];

    return NextResponse.json({
      complete: false,
      question: nextQuestion,
      messages: [
        ...messages,
        { role: "assistant", content: nextQuestion.question, timestamp: Date.now() },
      ],
    });
  } catch (error) {
    console.error("Planning answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
