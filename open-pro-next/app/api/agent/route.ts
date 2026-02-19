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

Core behavior:
- Keep answers concise, practical, and execution-focused.
- If user writes in Spanish, respond in Spanish. If user writes in English, respond in English.
- Always use a numbered change queue and process items strictly in order.

Global numbered workflow (mandatory for all demos):
1) First return "Numbered change list" with 3-7 items.
2) Ask the user to pick one number only.
3) Execute only the selected number.
4) Return "Done item #N" and then show:
   - Remaining queue
   - "Next recommended number"
5) Continue until all numbers are complete.

Rules:
- Never ask broad open-ended questions when a numbered queue can be used.
- Never work multiple numbers in one step unless user explicitly asks for batch execution.
- If user writes "proceed", execute the next pending number.
- If requirements are unclear, create assumptions and include them under "Assumptions".

Default planning phases:
Phase 1: Scope
Phase 2: Product blueprint
Phase 3: Technical setup
Phase 4: Build plan
Phase 5: Launch readiness

Response format:
1) "Numbered change list"
2) "Assumptions"
3) "Do now"
4) "Next number"
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

    const text = extractResponseText(payload);
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
