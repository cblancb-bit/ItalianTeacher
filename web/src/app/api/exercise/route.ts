import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/claude";
import {
  LISTENING_PROMPT,
  READING_PROMPT,
  GRAMMAR_PROMPT,
  WRITING_PROMPT_1,
  WRITING_PROMPT_2,
  TUTOR_PERSONA,
} from "@/lib/cils-prompts";

const SECTION_PROMPTS: Record<string, string> = {
  listening: LISTENING_PROMPT,
  reading: READING_PROMPT,
  grammar: GRAMMAR_PROMPT,
  writing1: WRITING_PROMPT_1,
  writing2: WRITING_PROMPT_2,
};

export async function POST(req: NextRequest) {
  try {
    const { section } = await req.json();
    const prompt = SECTION_PROMPTS[section];
    if (!prompt) {
      return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }

    const raw = await askClaude(
      TUTOR_PERSONA,
      prompt + "\n\nGenera un nuovo esercizio ora."
    );

    // Extract JSON from response (Claude sometimes wraps in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate exercise" }, { status: 500 });
  }
}
