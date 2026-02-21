import { NextResponse } from "next/server";

import { redoChange } from "@/lib/editor/history-store";
import { updateProjectContent } from "@/lib/project-registry";

type RedoRequestBody = {
  projectId?: string;
};

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

    await updateProjectContent(projectId, entry.after, version);

    return NextResponse.json({ ok: true, version, canUndo, canRedo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
