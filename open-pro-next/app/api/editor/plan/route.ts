import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { isLivePageSlug } from "@/app/live/live-slugs";
import { getProjectContent } from "@/lib/project-registry";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: string[];
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

async function loadTemplateContext(slug: string, projectId?: string) {
  if (!slug || !isLivePageSlug(slug)) return null;

  const relativePath = `app/live/${slug}/page.tsx`;

  // First: check if this project has saved (modified) content
  if (projectId) {
    const saved = await getProjectContent(projectId);
    if (saved) {
      return {
        filePath: relativePath,
        content: saved,
        truncated: false,
      };
    }
  }

  // Fallback: read the original template from filesystem
  const cwd = process.cwd();
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

function extractTailwindClassTokens(className: string | undefined) {
  const raw = String(className || "").trim();
  if (!raw) return [];

  const tokens = raw
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const prefixes = [
    "bg-",
    "from-",
    "to-",
    "via-",
    "text-",
    "border-",
    "ring-",
    "shadow-",
  ];

  const picked: string[] = [];
  for (const t of tokens) {
    const parts = t.split(":");
    const base = parts[parts.length - 1] || t;

    // Keep full token (including variants) if its base looks like a color/visual Tailwind utility.
    if (prefixes.some((p) => base.startsWith(p))) {
      picked.push(t);
    }
    if (picked.length >= 10) break;
  }

  return Array.from(new Set(picked));
}

function extractGenericClassTokens(className: string | undefined) {
  const raw = String(className || "").trim();
  if (!raw) return [];

  const tokens = raw
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Grab a few longer tokens as additional anchors (often component-level classes).
  const picked: string[] = [];
  for (const t of tokens) {
    if (t.length < 6) continue;
    if (t.includes("[")) continue; // avoid arbitrary-value classes exploding context targeting
    picked.push(t);
    if (picked.length >= 6) break;
  }

  return Array.from(new Set(picked));
}

function buildTargetedExcerpts(
  fileContent: string,
  queryText: string,
  selectionClassName?: string,
) {
  const content = String(fileContent || "");
  const baseline = [...extractQuotedPhrases(queryText), ...extractKeywords(queryText)];
  const classTokens = extractTailwindClassTokens(selectionClassName);
  const genericClassTokens = extractGenericClassTokens(selectionClassName);

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

  const queries = Array.from(
    new Set([...baseline, ...extra, ...classTokens, ...genericClassTokens]),
  ).filter(Boolean);

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

function findSourceForHint(
  fileContent: string | undefined,
  selectionHint: PlanRequestBody["selectionHint"],
): string {
  if (!fileContent || !selectionHint) return "";
  const lines = fileContent.split("\n");
  const results: { line: number; label: string }[] = [];

  // --- 1. Find the source line that best matches the className ---
  const className = String(selectionHint.className || "").trim();
  const classTokens = className.split(/\s+/).filter(Boolean);
  const anchors = classTokens
    .filter((t) => t.length >= 6 || t.includes("-"))
    .slice(0, 5);

  if (anchors.length > 0) {
    let bestScore = 0;
    const candidates: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      let score = 0;
      for (const a of anchors) { if (lines[i].includes(a)) score++; }
      if (score > bestScore) { bestScore = score; candidates.length = 0; candidates.push(i); }
      else if (score === bestScore && score > 0) { candidates.push(i); }
    }
    // Prefer the line inside a component definition (has {label}, {children}, {title}, props)
    const compLine = candidates.find((i) => {
      const line = lines[i];
      return line.includes("{label}") || line.includes("{children}") || line.includes("{title}") || line.includes("props.");
    });
    const bestLine = compLine ?? candidates[0] ?? -1;
    if (bestLine >= 0) results.push({ line: bestLine, label: "className match (source definition)" });
  }

  // --- 2. Find where the text content appears as a string literal ---
  const text = String(selectionHint.text || "").trim().slice(0, 60);
  if (text && text.length >= 2) {
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].includes(`"${text}"`) ||
        lines[i].includes(`'${text}'`) ||
        lines[i].includes(`label="${text}"`) ||
        lines[i].includes(`title="${text}"`)
      ) {
        // Avoid duplicate if same window as className match
        const isDup = results.some((r) => Math.abs(r.line - i) < 8);
        if (!isDup) results.push({ line: i, label: `text "${text}" usage` });
        break;
      }
    }
  }

  if (results.length === 0) return "";

  const blocks: string[] = [];
  for (const r of results.slice(0, 2)) {
    const start = Math.max(0, r.line - 4);
    const end = Math.min(lines.length, r.line + 5);
    const snippet = lines.slice(start, end).map((l, idx) => `${start + idx + 1}: ${l}`).join("\n");
    blocks.push(`[${r.label}]\n${snippet}`);
  }

  return [
    "--- ACTUAL SOURCE for the selected element (use ONLY this for match, NOT the rendered HTML) ---",
    ...blocks,
    "--- END SOURCE ---",
  ].join("\n");
}

function buildSelectionHintBlock(
  selectionHint: PlanRequestBody["selectionHint"],
  sourceSnippet: string,
) {
  if (!selectionHint) return "";
  const tag = selectionHint.tag ? String(selectionHint.tag) : "";
  const id = selectionHint.id ? String(selectionHint.id) : "";
  const className = selectionHint.className ? String(selectionHint.className) : "";
  const text = selectionHint.text ? String(selectionHint.text) : "";

  return [
    "Selected element (from Visual Edit, this is RENDERED HTML, not source code):",
    tag ? `  tag: ${tag}` : "",
    id ? `  id: ${id}` : "",
    className ? `  className: ${className}` : "",
    text ? `  text: ${text}` : "",
    "",
    sourceSnippet,
  ]
    .filter((l) => l !== undefined)
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
        images: Array.isArray(msg.images) ? msg.images : undefined,
      }))
      .filter((msg) => msg.content.length > 0 || (msg.images && msg.images.length > 0))
      .slice(-12);

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: "No user message was provided." }, { status: 400 });
    }

    const hasImages = cleanedMessages.some((m) => m.images && m.images.length > 0);

    const projectId = String(body.projectId || "").trim();
    const templateSlug = resolveTemplateSlug(projectId, body.templateSlug);
    const templateContext = await loadTemplateContext(templateSlug, projectId).catch(() => null);

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

    const sourceSnippet = findSourceForHint(
      templateContext?.content,
      body.selectionHint,
    );

    const contextBlock = (() => {
      if (!templateContext) return "";

      const header = [
        `Context file: ${templateContext.filePath}`,
        `Truncated: ${templateContext.truncated ? "yes" : "no"}`,
      ];

      // When no selection hint, always send the full file so the AI can find
      // the right code to modify based on the user's description alone.
      if (!body.selectionHint) {
        return [
          ...header,
          `--- FULL FILE (read carefully, find the relevant code for the user's request) ---`,
          templateContext.content,
          `--- END FILE ---`,
        ].join("\n");
      }

      // With a selection hint, use targeted excerpts for precision.
      const targeted = buildTargetedExcerpts(
        templateContext.content,
        [String(latestUserMessage || ""), selectionText].filter(Boolean).join("\n"),
        body.selectionHint?.className ? String(body.selectionHint.className) : undefined,
      );

      if (targeted.hasMatches) {
        return [...header, ...targeted.excerpts].join("\n");
      }

      // Fallback: include full file if we couldn't find relevant matches.
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
  - "match" must be an EXACT substring copied verbatim from the source file.
  - "content" should be the replacement for that exact substring.
  - Keep match blocks small and specific.
- CRITICAL: The "match" MUST come from the ACTUAL SOURCE code shown in the file content above.
- If a selection hint is provided, it shows RENDERED HTML (not source). Never copy from it — find the corresponding source code in the file.
- If NO selection hint is provided, read the full file and find the relevant code that matches the user's request.
- Every change MUST include a non-empty "description".
- Avoid full-file "replace" unless absolutely necessary.
- Prefer Tailwind utility updates over large rewrites.
- Avoid touching unrelated files.
- Do not include explanations; JSON only.

${contextBlock}

${buildSelectionHintBlock(body.selectionHint, sourceSnippet)}
`.trim();

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: hasImages ? "gpt-4.1" : model,
        instructions: systemPrompt,
        input: cleanedMessages.map((m) => {
          if (m.images && m.images.length > 0) {
            const contentParts: any[] = [];
            if (m.content) {
              contentParts.push({ type: "input_text", text: m.content });
            }
            for (const img of m.images) {
              contentParts.push({ type: "input_image", image_url: img });
            }
            return { role: m.role, content: contentParts };
          }
          return { role: m.role, content: m.content };
        }),
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
