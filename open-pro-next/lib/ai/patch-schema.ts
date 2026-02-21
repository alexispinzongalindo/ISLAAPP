export type PatchType = "replace" | "replace-snippet" | "insert" | "style-update";

export type StyleProps = Record<string, string | number | null>;

export type AiPatchChange = {
  filePath: string;
  patchType: PatchType;
  description: string;
  match?: string;
  content?: string;
  cssProps?: StyleProps;
  targetSelector?: string;
};

export type AiPatchPlan = {
  changes: AiPatchChange[];
};

export type ParsedAiPatchPlan =
  | { ok: true; plan: AiPatchPlan; warnings: string[] }
  | { ok: false; error: string };

const PATCH_TYPES: PatchType[] = ["replace", "replace-snippet", "insert", "style-update"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeRelativePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized || normalized.trim().length === 0) return false;
  if (normalized.startsWith("/")) return false;
  if (normalized.includes("..")) return false;
  return true;
}

function extractFirstJsonObject(text: string): string | null {
  const raw = String(text || "");
  const firstBrace = raw.indexOf("{");
  if (firstBrace === -1) return null;

  let depth = 0;
  for (let i = firstBrace; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) {
      return raw.slice(firstBrace, i + 1);
    }
  }

  return null;
}

export function parseAiPatchPlan(input: unknown): ParsedAiPatchPlan {
  let raw: unknown = input;

  if (typeof input === "string") {
    const extracted = extractFirstJsonObject(input);
    if (!extracted) {
      return { ok: false, error: "No JSON object found in AI response." };
    }

    try {
      raw = JSON.parse(extracted);
    } catch {
      return { ok: false, error: "AI response JSON could not be parsed." };
    }
  }

  if (!isRecord(raw)) {
    return { ok: false, error: "AI patch plan must be a JSON object." };
  }

  const changesRaw = raw.changes;
  if (!Array.isArray(changesRaw)) {
    return { ok: false, error: "AI patch plan must include an array 'changes'." };
  }

  const warnings: string[] = [];
  const changes: AiPatchChange[] = [];

  for (let index = 0; index < changesRaw.length; index += 1) {
    const item = changesRaw[index];
    if (!isRecord(item)) {
      return { ok: false, error: `Change at index ${index} must be an object.` };
    }

    const filePath = String(item.filePath || "").trim();
    if (!isSafeRelativePath(filePath)) {
      return { ok: false, error: `Change at index ${index} has unsafe filePath.` };
    }

    const patchType = String(item.patchType || "").trim() as PatchType;
    if (!PATCH_TYPES.includes(patchType)) {
      return { ok: false, error: `Change at index ${index} has invalid patchType.` };
    }

    const description = String(item.description || "").trim();
    if (!description) {
      warnings.push(`Change at index ${index} is missing a description.`);
    }

    const targetSelector =
      typeof item.targetSelector === "string" && item.targetSelector.trim().length > 0
        ? item.targetSelector.trim()
        : undefined;

    const match = typeof item.match === "string" ? item.match : undefined;
    const content = typeof item.content === "string" ? item.content : undefined;

    const cssProps = isRecord(item.cssProps)
      ? (item.cssProps as StyleProps)
      : undefined;

    if (patchType === "style-update") {
      if (!targetSelector) {
        return {
          ok: false,
          error: `style-update change at index ${index} requires targetSelector.`,
        };
      }
      if (!cssProps) {
        return {
          ok: false,
          error: `style-update change at index ${index} requires cssProps.`,
        };
      }
    } else if (patchType === "replace-snippet") {
      if (!match || match.trim().length === 0) {
        return {
          ok: false,
          error: `replace-snippet change at index ${index} requires match.`,
        };
      }
      if (!content) {
        return {
          ok: false,
          error: `replace-snippet change at index ${index} requires content.`,
        };
      }
    } else {
      if (!content) {
        return {
          ok: false,
          error: `${patchType} change at index ${index} requires content.`,
        };
      }
    }

    changes.push({
      filePath,
      patchType,
      description,
      match,
      content,
      cssProps,
      targetSelector,
    });
  }

  return { ok: true, plan: { changes }, warnings };
}
