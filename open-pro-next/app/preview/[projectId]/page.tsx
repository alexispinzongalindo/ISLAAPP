"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isLivePageSlug } from "@/app/live/live-slugs";

type PreviewMessage =
  | { type: "ISLA_PREVIEW_READY" }
  | { type: "ISLA_VISUAL_EDIT"; enabled: boolean };

type InnerPreviewMessage =
  | { type: "ISLA_VISUAL_EDIT"; enabled: boolean }
  | { type: "ISLA_PING" };

type ElementHintMessage =
  | {
      type: "ISLA_ELEMENT_HOVER";
      hint: {
        tag: string;
        id?: string;
        className?: string;
        text?: string;
      };
    }
  | {
      type: "ISLA_ELEMENT_SELECTED";
      hint: {
        tag: string;
        id?: string;
        className?: string;
        text?: string;
        outerHTML?: string;
      };
    };

function resolveTemplateSlug(projectId: string) {
  const raw = String(projectId || "").trim();
  const slug = raw.includes("--") ? raw.split("--")[0] : raw;
  return slug;
}

export default function PreviewPage({
  params,
}: {
  params: any;
}) {
  const [projectId, setProjectId] = useState(() => {
    const raw = (params as any)?.projectId;
    return raw ? String(raw) : "";
  });
  const templateSlug = useMemo(() => resolveTemplateSlug(projectId), [projectId]);

  const [visualEditEnabled, setVisualEditEnabled] = useState(false);
  const innerFrameRef = useRef<HTMLIFrameElement | null>(null);
  const lastOutlinedRef = useRef<HTMLElement | null>(null);

  const liveHref = useMemo(() => {
    if (!isLivePageSlug(templateSlug)) return "";
    return `/live/${templateSlug}?embed=1`;
  }, [templateSlug]);

  useEffect(() => {
    const maybeThen = (params as any)?.then;
    if (typeof maybeThen !== "function") return;

    let cancelled = false;
    Promise.resolve(params)
      .then((p: any) => {
        if (cancelled) return;
        const raw = p?.projectId;
        if (raw) setProjectId(String(raw));
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    const ready: PreviewMessage = { type: "ISLA_PREVIEW_READY" };
    window.parent?.postMessage(ready, "*");
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as PreviewMessage | undefined;
      if (!data || typeof data !== "object") return;

      if (data.type === "ISLA_VISUAL_EDIT") {
        setVisualEditEnabled(Boolean(data.enabled));
        const msg: InnerPreviewMessage = { type: "ISLA_VISUAL_EDIT", enabled: Boolean(data.enabled) };
        innerFrameRef.current?.contentWindow?.postMessage(msg, "*");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const frame = innerFrameRef.current;
    if (!frame) return;

    const cleanup = () => {
      if (lastOutlinedRef.current) {
        lastOutlinedRef.current.style.outline = "";
        lastOutlinedRef.current.style.outlineOffset = "";
        lastOutlinedRef.current = null;
      }
    };

    if (!visualEditEnabled) {
      cleanup();
      return;
    }

    let detach: (() => void) | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) return;

      const onMove = (e: MouseEvent) => {
        const el = doc.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (!el) return;

        if (lastOutlinedRef.current && lastOutlinedRef.current !== el) {
          lastOutlinedRef.current.style.outline = "";
          lastOutlinedRef.current.style.outlineOffset = "";
        }

        lastOutlinedRef.current = el;
        el.style.outline = "2px solid rgba(16, 185, 129, 0.9)";
        el.style.outlineOffset = "2px";

        const hint: ElementHintMessage = {
          type: "ISLA_ELEMENT_HOVER",
          hint: {
            tag: String(el.tagName || "").toLowerCase(),
            id: el.id || undefined,
            className: typeof el.className === "string" ? el.className : undefined,
            text: (el.textContent || "").trim().slice(0, 120) || undefined,
          },
        };

        window.parent?.postMessage(hint, "*");
      };

      const onClick = (e: MouseEvent) => {
        const el = doc.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (!el) return;

        e.preventDefault();
        e.stopPropagation();

        const outerHTML = el.outerHTML ? el.outerHTML.slice(0, 1200) : undefined;
        const hint: ElementHintMessage = {
          type: "ISLA_ELEMENT_SELECTED",
          hint: {
            tag: String(el.tagName || "").toLowerCase(),
            id: el.id || undefined,
            className: typeof el.className === "string" ? el.className : undefined,
            text: (el.textContent || "").trim().slice(0, 200) || undefined,
            outerHTML,
          },
        };

        window.parent?.postMessage(hint, "*");
      };

      doc.addEventListener("mousemove", onMove, { passive: true });
      doc.addEventListener("click", onClick, true);

      detach = () => {
        doc.removeEventListener("mousemove", onMove as EventListener);
        doc.removeEventListener("click", onClick as EventListener, true);
      };
    };

    const onLoad = () => attach();
    frame.addEventListener("load", onLoad);
    attach();

    return () => {
      cancelled = true;
      frame.removeEventListener("load", onLoad);
      detach?.();
      cleanup();
    };
  }, [visualEditEnabled]);

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-gray-100">
        <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <p className="text-sm text-indigo-200/70">Loading preview…</p>
        </div>
      </div>
    );
  }

  if (!liveHref) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-gray-100">
        <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <p className="text-sm text-indigo-200/70">Preview not available</p>
          <p className="mt-2 text-lg font-semibold">Unknown template</p>
          <p className="mt-3 text-sm text-indigo-200/60">
            Project: <span className="font-mono">{projectId}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-950">
      <iframe ref={innerFrameRef} title="Live template" src={liveHref} className="h-full w-full" />

      {visualEditEnabled ? (
        <div className="pointer-events-none fixed inset-0 border-2 border-emerald-400/50" />
      ) : null}
    </div>
  );
}
