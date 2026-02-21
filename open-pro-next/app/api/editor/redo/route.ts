import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { redoChange } from "@/lib/editor/history-store";

type RedoRequestBody = {
  projectId?: string;
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
    const body = (await request.json()) as RedoRequestBody;
    const projectId = String(body.projectId || "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
    }

    const { entry, version, canUndo, canRedo } = redoChange(projectId);
    if (!entry) {
      return NextResponse.json({ ok: true, version, canUndo, canRedo });
    }

    const fullPath = resolveSafePath(entry.filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, entry.after, "utf8");

    return NextResponse.json({ ok: true, version, canUndo, canRedo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
