import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/claude";
import { WRITING_FEEDBACK_PROMPT, SPEAKING_FEEDBACK_PROMPT, TUTOR_PERSONA } from "@/lib/cils-prompts";

export async function POST(req: NextRequest) {
  try {
    const { type, task, answer, topic, transcript } = await req.json();

    let prompt: string;
    if (type === "writing") {
      prompt = WRITING_FEEDBACK_PROMPT(task, answer, "120-140");
    } else if (type === "speaking") {
      prompt = SPEAKING_FEEDBACK_PROMPT(topic, transcript);
    } else {
      return NextResponse.json({ error: "Unknown feedback type" }, { status: 400 });
    }

    const raw = await askClaude(TUTOR_PERSONA, prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get feedback" }, { status: 500 });
  }
}
