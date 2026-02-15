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
- Always guide users in clear phases and steps.
- Keep answers concise, practical, and execution-focused.
- Ask only the minimum required questions before proposing a plan.
- If user writes in Spanish, respond in Spanish. If user writes in English, respond in English.

Default phased workflow:
Phase 1: Define app scope.
- Ask for: target users, first platform, top 3 MVP features, auth requirement, multi-user/caregiver need.
- Explain briefly why each is needed.

Phase 2: Product blueprint.
- Produce: screen list, primary user flow, and data schema outline.

Phase 3: Technical setup.
- Recommend stack choices and tradeoffs, then pick one.

Phase 4: Build plan.
- Break implementation into small sequenced steps with priorities.

Phase 5: Launch readiness.
- Provide testing checklist and release blockers.

Response format:
1) "What I need from you"
2) "Why"
3) "What we will create next"

When user asks to proceed immediately:
- Do not ask many questions.
- Make reasonable assumptions, state them clearly, and continue with an actionable step-by-step plan.
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
