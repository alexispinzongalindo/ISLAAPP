import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { parseAiPatchPlan } from "@/lib/ai/patch-schema";
import { recordChange } from "@/lib/editor/history-store";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplyRequestBody;
    const projectId = String(body.projectId || "").trim();
    const rawPlan = String(body.rawPlan || "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
    }

    const parsed = parseAiPatchPlan(rawPlan);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    let lastState: { version: number; canUndo: boolean; canRedo: boolean } | null = null;

    for (const change of parsed.plan.changes) {
      if (change.patchType === "style-update") {
        return NextResponse.json(
          { error: "style-update is not supported yet. Use replace/insert for now." },
          { status: 400 },
        );
      }

      const fullPath = resolveSafePath(change.filePath);

      let before = "";
      try {
        before = await fs.readFile(fullPath, "utf8");
      } catch {
        before = "";
      }

      let after = before;
      if (change.patchType === "replace-snippet") {
        const match = String(change.match || "");
        const replacement = String(change.content || "");

        if (!match.trim()) {
          return NextResponse.json(
            { error: `replace-snippet requires match for ${change.filePath}.` },
            { status: 400 },
          );
        }

        const firstIndex = before.indexOf(match);
        if (firstIndex === -1) {
          return NextResponse.json(
            { error: `Match not found in ${change.filePath}.` },
            { status: 400 },
          );
        }

        const secondIndex = before.indexOf(match, firstIndex + match.length);
        if (secondIndex !== -1) {
          return NextResponse.json(
            { error: `Match is ambiguous (multiple occurrences) in ${change.filePath}.` },
            { status: 400 },
          );
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

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, after, "utf8");

      lastState = recordChange(projectId, {
        filePath: change.filePath,
        before,
        after,
      });
    }

    return NextResponse.json({
      ok: true,
      ...(lastState ?? { version: 0, canUndo: false, canRedo: false }),
      appliedChanges: parsed.plan.changes.map((c) => ({
        patchType: c.patchType,
        match: (c as any).match || "",
        content: c.content || "",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
