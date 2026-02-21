import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

type ContextRequestBody = {
  filePath?: string;
  maxChars?: number;
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
    const body = (await request.json()) as ContextRequestBody;
    const filePath = String(body.filePath || "").trim();
    const maxChars = Math.min(Math.max(Number(body.maxChars || 12000), 1000), 40000);

    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath." }, { status: 400 });
    }

    const fullPath = resolveSafePath(filePath);
    const raw = await fs.readFile(fullPath, "utf8");

    const content = raw.length > maxChars ? raw.slice(0, maxChars) : raw;

    return NextResponse.json({ filePath, content, truncated: raw.length > maxChars });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
