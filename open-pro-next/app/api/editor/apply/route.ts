import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { parseAiPatchPlan } from "@/lib/ai/patch-schema";
import { recordChange } from "@/lib/editor/history-store";
import { ensureProject, getProjectContent, updateProjectContent } from "@/lib/project-registry";

type ApplyRequestBody = {
  projectId?: string;
  rawPlan?: string;
};

function resolveSafePath(relativePath: string) {
  const cwd = process.cwd();
  const normalized = relativePath.replace(/\\/g, "/");
  const fullPath = path.resolve(cwd, normalized);
  if (!fullPath.startsWith(cwd)) {
    throw new Error("Unsafe file path.");
  }
  return fullPath;
}

// Read file content: first check project's saved content in DB, then fall back to filesystem
async function readContent(projectId: string, filePath: string): Promise<string> {
  const saved = await getProjectContent(projectId);
  if (saved) return saved;

  const fullPath = resolveSafePath(filePath);
  try {
    return await fs.readFile(fullPath, "utf8");
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplyRequestBody;
    const projectId = String(body.projectId || "").trim();
    const rawPlan = String(body.rawPlan || "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
    }

    await ensureProject(projectId);

    const parsed = parseAiPatchPlan(rawPlan);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    let lastState: { version: number; canUndo: boolean; canRedo: boolean } | null = null;
    const applied: typeof parsed.plan.changes = [];
    const skipped: { filePath: string; reason: string }[] = [];

    for (const change of parsed.plan.changes) {
      if (change.patchType === "style-update") {
        return NextResponse.json(
          { error: "style-update is not supported yet. Use replace/insert for now." },
          { status: 400 },
        );
      }

      const before = await readContent(projectId, change.filePath);

      let after = before;
      if (change.patchType === "replace-snippet") {
        const match = String(change.match || "");
        const replacement = String(change.content || "");

        if (!match.trim()) {
          skipped.push({ filePath: change.filePath, reason: "Empty match string." });
          continue;
        }

        // Try exact match first
        let firstIndex = before.indexOf(match);

        // Fallback: normalize whitespace (collapse runs of whitespace to single space)
        if (firstIndex === -1) {
          const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
          const normalizedBefore = normalize(before);
          const normalizedMatch = normalize(match);
          const normIndex = normalizedBefore.indexOf(normalizedMatch);

          if (normIndex !== -1) {
            // Find the real start/end in original source by mapping through normalized positions
            let realStart = -1;
            let srcPos = 0;
            let normPos = 0;
            const src = before;
            // Walk through source to find where normalized position starts
            while (srcPos < src.length && normPos < normIndex) {
              if (/\s/.test(src[srcPos])) {
                // skip extra whitespace in source
                while (srcPos < src.length - 1 && /\s/.test(src[srcPos + 1])) srcPos++;
              }
              srcPos++;
              normPos++;
            }
            // Skip leading whitespace at match start
            while (srcPos < src.length && /\s/.test(src[srcPos]) && realStart === -1) srcPos++;
            realStart = srcPos;

            // Find real end
            let matchNormLen = normalizedMatch.length;
            let consumed = 0;
            let realEnd = realStart;
            while (realEnd < src.length && consumed < matchNormLen) {
              if (/\s/.test(src[realEnd])) {
                while (realEnd < src.length - 1 && /\s/.test(src[realEnd + 1])) realEnd++;
                consumed++; // counts as one space in normalized
              } else {
                consumed++;
              }
              realEnd++;
            }

            if (consumed === matchNormLen) {
              after = `${src.slice(0, realStart)}${replacement}${src.slice(realEnd)}`;
              // Skip the rest of replace-snippet logic
              if (after === before) continue;
              lastState = recordChange(projectId, { filePath: change.filePath, before, after });
              await updateProjectContent(projectId, after, lastState.version);
              applied.push(change);
              continue;
            }
          }

          // Still not found — skip this change instead of failing the whole batch
          skipped.push({ filePath: change.filePath, reason: "Match not found." });
          continue;
        }

        const secondIndex = before.indexOf(match, firstIndex + match.length);
        if (secondIndex !== -1) {
          skipped.push({ filePath: change.filePath, reason: "Ambiguous match (multiple occurrences)." });
          continue;
        }

        after = `${before.slice(0, firstIndex)}${replacement}${before.slice(firstIndex + match.length)}`;
      }
      if (change.patchType === "replace") {
        after = String(change.content || "");
      }

      if (change.patchType === "insert") {
        const insert = String(change.content || "");
        after = before.length > 0 ? `${before}\n${insert}` : insert;
      }

      if (after === before) {
        continue;
      }

      // Write to filesystem (for live preview)
      const fullPath = resolveSafePath(change.filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, after, "utf8");

      // Save to Supabase (for persistence across restarts)
      lastState = recordChange(projectId, {
        filePath: change.filePath,
        before,
        after,
      });

      await updateProjectContent(projectId, after, lastState.version);
      applied.push(change);
    }

    return NextResponse.json({
      ok: true,
      ...(lastState ?? { version: 0, canUndo: false, canRedo: false }),
      appliedChanges: applied.map((c) => ({
        patchType: c.patchType,
        match: (c as any).match || "",
        content: c.content || "",
      })),
      skipped,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
