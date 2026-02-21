import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { getProjectContent } from "@/lib/project-registry";

/**
 * Dynamic preview renderer.
 * Returns a full HTML page that uses Tailwind CDN + React + Babel standalone
 * to render the current project source (from Supabase) in real-time.
 * This ensures customers always see their latest changes in the preview,
 * even in production where Next.js pages are pre-compiled.
 */

function resolveTemplateSlug(projectId: string): string {
  const raw = String(projectId || "").trim();
  return raw.includes("--") ? raw.split("--")[0] : raw;
}

function stripImportsAndExports(source: string): {
  body: string;
  componentName: string;
} {
  const lines = source.split("\n");
  const cleaned: string[] = [];
  let componentName = "App";

  for (const line of lines) {
    // Skip import statements
    if (/^\s*import\s+/.test(line)) continue;

    // Capture and strip "export default function Name"
    const exportMatch = line.match(
      /^\s*export\s+default\s+function\s+(\w+)/,
    );
    if (exportMatch) {
      componentName = exportMatch[1];
      cleaned.push(line.replace(/export\s+default\s+/, ""));
      continue;
    }

    // Skip standalone "export default Name;"
    if (/^\s*export\s+default\s+\w+\s*;?\s*$/.test(line)) continue;

    cleaned.push(line);
  }

  return { body: cleaned.join("\n"), componentName };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") || "";

    if (!projectId) {
      return new NextResponse("Missing projectId", { status: 400 });
    }

    const templateSlug = resolveTemplateSlug(projectId);

    // 1. Try Supabase (customer's modified content)
    let source: string | null = null;
    try {
      source = await getProjectContent(projectId);
    } catch {
      // ignore
    }

    // 2. Fallback to filesystem (original template)
    if (!source) {
      const filePath = path.resolve(
        process.cwd(),
        `app/live/${templateSlug}/page.tsx`,
      );
      try {
        source = await fs.readFile(filePath, "utf8");
      } catch {
        return new NextResponse("Template not found", { status: 404 });
      }
    }

    const { body, componentName } = stripImportsAndExports(source);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
  <style>
    body { margin: 0; }
    /* Suppress Babel standalone dev warning */
    .babel-warning { display: none !important; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment } = React;

    ${body}

    const rootEl = document.getElementById("root");
    ReactDOM.createRoot(rootEl).render(React.createElement(${componentName}));
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      { status: 500 },
    );
  }
}
