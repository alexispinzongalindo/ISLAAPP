import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { isLivePageSlug } from "@/app/live/live-slugs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PlanRequestBody = {
  projectId?: string;
  templateSlug?: string;
  selectionHint?: {
    tag?: string;
    id?: string;
    className?: string;
    text?: string;
    outerHTML?: string;
  } | null;
  messages?: ChatMessage[];
};

function resolveTemplateSlug(projectId: string, templateSlug?: string) {
  const direct = String(templateSlug || "").trim();
  if (direct) return direct;

  const raw = String(projectId || "").trim();
  if (!raw) return "";
  return raw.includes("--") ? raw.split("--")[0] : raw;
}

async function loadTemplateContext(slug: string) {
  if (!slug || !isLivePageSlug(slug)) return null;

  const cwd = process.cwd();
  const relativePath = `app/live/${slug}/page.tsx`;
  const fullPath = path.resolve(cwd, relativePath);
  const raw = await fs.readFile(fullPath, "utf8");

  const maxChars = 14000;
  return {
    filePath: relativePath,
    content: raw.length > maxChars ? raw.slice(0, maxChars) : raw,
    truncated: raw.length > maxChars,
  };
}

function extractQuotedPhrases(text: string) {
  const phrases: string[] = [];
  const re = /"([^"]{4,120})"|'([^']{4,120})'/g;
  let match: RegExpExecArray | null = null;
  while ((match = re.exec(text))) {
    const value = String(match[1] || match[2] || "").trim();
    if (value) phrases.push(value);
  }
  return phrases;
}

function extractKeywords(text: string) {
  const cleaned = String(text || "")
    .replace(/[^a-zA-Z0-9\s\-_/]/g, " ")
    .toLowerCase();
  const rawTokens = cleaned.split(/\s+/).map((t) => t.trim()).filter(Boolean);

  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "make",
    "change",
    "update",
    "add",
    "remove",
    "set",
    "to",
    "a",
    "an",
    "in",
    "on",
    "of",
    "it",
    "is",
    "are",
    "be",
    "as",
    "at",
    "from",
    "into",
  ]);

  const tokens = rawTokens
    .filter((t) => t.length >= 4 && !stop.has(t))
    .slice(0, 12);

  return Array.from(new Set(tokens));
}

function buildTargetedExcerpts(fileContent: string, queryText: string) {
  const content = String(fileContent || "");
  const baseline = [...extractQuotedPhrases(queryText), ...extractKeywords(queryText)];

  // Heuristics: if the user talks about background/colors, include Tailwind anchors.
  const lowerQuery = String(queryText || "").toLowerCase();
  const extra: string[] = [];
  if (lowerQuery.includes("background") || lowerQuery.includes("bg ") || lowerQuery.includes("bg-")) {
    extra.push("bg-");
    extra.push("className=");
  }
  if (lowerQuery.includes("color") || lowerQuery.includes("theme")) {
    extra.push("className=");
  }

  const queries = Array.from(new Set([...baseline, ...extra])).filter(Boolean);

  const windows: { start: number; end: number; why: string }[] = [];
  const radius = 700;
  const lower = content.toLowerCase();

  for (const q of queries) {
    const needle = q.toLowerCase();
    const idx = lower.indexOf(needle);
    if (idx === -1) continue;

    const start = Math.max(0, idx - radius);
    const end = Math.min(content.length, idx + needle.length + radius);
    windows.push({ start, end, why: q });
  }

  windows.sort((a, b) => a.start - b.start);

  // Merge overlaps
  const merged: { start: number; end: number; whys: string[] }[] = [];
  for (const w of windows) {
    const last = merged[merged.length - 1];
    if (!last || w.start > last.end) {
      merged.push({ start: w.start, end: w.end, whys: [w.why] });
      continue;
    }
    last.end = Math.max(last.end, w.end);
    last.whys.push(w.why);
  }

  const excerpts = merged.slice(0, 4).map((m, i) => {
    const snippet = content.slice(m.start, m.end);
    return [
      `--- EXCERPT ${i + 1} (matched: ${Array.from(new Set(m.whys)).join(", ")}) ---`,
      snippet,
      `--- END EXCERPT ${i + 1} ---`,
    ].join("\n");
  });

  return { excerpts, hasMatches: excerpts.length > 0, queries };
}

function buildSelectionHintBlock(selectionHint: PlanRequestBody["selectionHint"]) {
  if (!selectionHint) return "";
  const tag = selectionHint.tag ? String(selectionHint.tag) : "";
  const id = selectionHint.id ? String(selectionHint.id) : "";
  const className = selectionHint.className ? String(selectionHint.className) : "";
  const text = selectionHint.text ? String(selectionHint.text) : "";
  const outerHTML = selectionHint.outerHTML ? String(selectionHint.outerHTML) : "";

  return [
    "Selected element hint (from Visual Edit):",
    tag ? `tag: ${tag}` : "",
    id ? `id: ${id}` : "",
    className ? `className: ${className}` : "",
    text ? `text: ${text}` : "",
    outerHTML ? `outerHTML (truncated): ${outerHTML}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

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
      return NextResponse.json({ error: "Server is missing OPENAI_API_KEY." }, { status: 500 });
    }

    const body = (await request.json()) as PlanRequestBody;
    const model = String(process.env.OPENAI_MODEL || "gpt-4.1-mini");

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const cleanedMessages = incoming
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content || "").trim(),
      }))
      .filter((msg) => msg.content.length > 0)
      .slice(-12);

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: "No user message was provided." }, { status: 400 });
    }

    const projectId = String(body.projectId || "").trim();
    const templateSlug = resolveTemplateSlug(projectId, body.templateSlug);
    const templateContext = await loadTemplateContext(templateSlug).catch(() => null);

    const latestUserMessage = [...cleanedMessages]
      .reverse()
      .find((m) => m.role === "user")?.content;

    const selectionText = [
      body.selectionHint?.text,
      body.selectionHint?.id,
      body.selectionHint?.className,
      body.selectionHint?.tag,
    ]
      .filter(Boolean)
      .join(" ");

    const contextBlock = (() => {
      if (!templateContext) return "";
      const targeted = buildTargetedExcerpts(
        templateContext.content,
        [String(latestUserMessage || ""), selectionText].filter(Boolean).join("\n"),
      );

      const header = [
        `Context file: ${templateContext.filePath}`,
        `Truncated: ${templateContext.truncated ? "yes" : "no"}`,
      ];

      if (targeted.hasMatches) {
        return [...header, ...targeted.excerpts].join("\n");
      }

      // Fallback: include head of file if we couldn't find relevant matches.
      return [
        ...header,
        `--- FILE START ---`,
        templateContext.content,
        `--- FILE END ---`,
      ].join("\n");
    })();

    const systemPrompt = `
You are islaAPP's AI editor.

You MUST return ONLY valid JSON (no markdown, no prose) with this shape:
{
  "changes": [
    {
      "filePath": "string (relative path)",
      "patchType": "replace-snippet" | "replace" | "insert" | "style-update",
      "description": "string",
      "match"?: "string (required for replace-snippet)",
      "content"?: "string (required for replace/insert)",
      "targetSelector"?: "string (required for style-update)",
      "cssProps"?: { "prop": "value" }
    }
  ]
}

Rules:
- Make minimal, targeted changes.
- Prefer patchType "replace-snippet" whenever possible.
- For "replace-snippet":
  - "match" must be an exact substring copied from the file.
  - "content" should be the replacement for that exact substring.
  - Keep match blocks small and specific.
- The "match" MUST be copied from the Context file content/excerpts above.
- Do NOT use selectionHint.outerHTML as the match source.
- Every change MUST include a non-empty "description".
- Avoid full-file "replace" unless absolutely necessary.
- Prefer Tailwind utility updates over large rewrites.
- Avoid touching unrelated files.
- Do not include explanations; JSON only.

${contextBlock}

${buildSelectionHintBlock(body.selectionHint)}
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
        input: cleanedMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      const errorMessage =
        payload?.error?.message || "Editor plan request failed. Check model/API settings.";
      return NextResponse.json({ error: errorMessage }, { status: upstream.status });
    }

    const text = extractResponseText(payload);
    if (!text) {
      return NextResponse.json({ error: "The AI response was empty. Try again." }, { status: 502 });
    }

    return NextResponse.json({ raw: text });
  } catch (_error) {
    return NextResponse.json(
      { error: "Unexpected server error while contacting the AI editor." },
      { status: 500 },
    );
  }
}
