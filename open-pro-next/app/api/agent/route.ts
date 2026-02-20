import { NextResponse } from "next/server";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AgentRequestBody = {
  model?: string;
  effort?: "low" | "medium" | "high";
  messages?: ChatMessage[];
};

function extractResponseText(payload: any): string {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const parts: string[] = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const chunk of content) {
      if (chunk?.type === "output_text" && typeof chunk?.text === "string") {
        parts.push(chunk.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function normalizeReply(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  // If the model already follows the outline format, keep it.
  if (
    trimmed.includes("1. Change list") &&
    trimmed.includes("2. Assumptions") &&
    trimmed.includes("3. Do now") &&
    trimmed.includes("4. Result") &&
    trimmed.includes("5. Next number")
  ) {
    return trimmed;
  }
  return [
    "1. Change list",
    "1.1 Update colors",
    "1.2 Update text",
    "1.3 Update buttons",
    "",
    "2. Assumptions",
    "I will use simple words and short paragraphs.",
    "",
    "3. Do now",
    trimmed,
    "",
    "4. Result",
    "Done number #1.",
    "Remaining: #2, #3.",
    "",
    "5. Next number",
    "Pick one number only: #2 or #3.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AgentRequestBody;
    const model = String(body.model || process.env.OPENAI_MODEL || "gpt-4.1-mini");
    const effort = body.effort || "medium";
    const supportsReasoning = model.startsWith("gpt-5");
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    const cleanedMessages = incoming
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content || "").trim(),
      }))
      .filter((msg) => msg.content.length > 0)
      .slice(-20);

    if (cleanedMessages.length === 0) {
      return NextResponse.json(
        { error: "No user message was provided." },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are islaAPP's product-building AI agent.

Rules for all demos:
- Use simple, everyday words only. Avoid technical words.
- Use short paragraphs and numbered steps.
- Keep it brief and direct.
- If the user writes in Spanish, respond in Spanish. If the user writes in English, respond in English.

Outline workflow (mandatory):
1. Start with "1. Change list" and sub-items 1.1, 1.2, 1.3...
2. Ask the user to pick one number only.
3. Do only that number.
4. Show "4. Result" with "Done number #N" and "Remaining: #...".
5. Ask for the next number under "5. Next number".

If something is unclear:
- Make a simple guess and say it under "Assumptions".

Required response format (exact order):
1. Change list (with 1.1, 1.2, 1.3...)
2. Assumptions
3. Do now
4. Result
5. Next number
`.trim();

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: cleanedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        ...(supportsReasoning ? { reasoning: { effort } } : {}),
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      const errorMessage =
        payload?.error?.message || "Agent request failed. Check model/API settings.";
      return NextResponse.json({ error: errorMessage }, { status: upstream.status });
    }

    const text = normalizeReply(extractResponseText(payload));
    if (!text) {
      return NextResponse.json(
        { error: "The AI response was empty. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: text });
  } catch (_error) {
    return NextResponse.json(
      { error: "Unexpected server error while contacting the AI agent." },
      { status: 500 },
    );
  }
}
