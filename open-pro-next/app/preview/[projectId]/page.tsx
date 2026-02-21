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

// ---------------------------------------------------------------------------
// Live DOM patching — apply class-level changes directly in the inner iframe
// so the user sees the result immediately even in production builds.
// ---------------------------------------------------------------------------

function extractArbitraryColor(token: string): string | null {
  const m = token.match(/\[([^\]]+)\]/);
  return m ? m[1] : null;
}

function applyInlineOverrides(el: HTMLElement, token: string) {
  const color = extractArbitraryColor(token);
  if (!color) return;

  const parts = token.split(":");
  const base = parts[parts.length - 1] || token;

  if (base.startsWith("from-")) {
    el.style.setProperty("--tw-gradient-from", color);
  } else if (base.startsWith("via-")) {
    el.style.setProperty("--tw-gradient-via", color);
    el.style.setProperty(
      "--tw-gradient-stops",
      "var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to)",
    );
  } else if (base.startsWith("to-")) {
    el.style.setProperty("--tw-gradient-to", color);
  } else if (base.startsWith("bg-")) {
    el.style.backgroundColor = color;
  } else if (base.startsWith("text-")) {
    el.style.color = color;
  } else if (base.startsWith("border-")) {
    el.style.borderColor = color;
  } else if (base.startsWith("ring-")) {
    el.style.setProperty("--tw-ring-color", color);
  } else if (base.startsWith("shadow-")) {
    el.style.setProperty("--tw-shadow-color", color);
  }
}

function applyDomPatches(
  frame: HTMLIFrameElement | null,
  changes: Array<{ patchType: string; match: string; content: string }>,
) {
  if (!frame) return;
  const doc = frame.contentDocument;
  if (!doc) return;

  for (const change of changes) {
    if (change.patchType !== "replace-snippet") continue;

    const oldTokens = (change.match || "").split(/\s+/).filter(Boolean);
    const newTokens = (change.content || "").split(/\s+/).filter(Boolean);

    if (oldTokens.length === 0 || newTokens.length === 0) continue;

    // Build sets for diffing
    const oldSet = new Set(oldTokens);
    const newSet = new Set(newTokens);
    const removed = oldTokens.filter((t) => !newSet.has(t));
    const added = newTokens.filter((t) => !oldSet.has(t));

    if (removed.length === 0 && added.length === 0) continue;

    // Find candidate elements: must have ALL old tokens in their className
    const allElements = Array.from(doc.querySelectorAll("*")) as HTMLElement[];
    const matches = allElements.filter((el) => {
      if (typeof el.className !== "string") return false;
      const cls = el.className;
      return oldTokens.every((t) => cls.includes(t));
    });

    for (const el of matches) {
      // Remove old tokens, add new tokens
      for (const t of removed) {
        el.classList.remove(t);
      }
      for (const t of added) {
        el.classList.add(t);
        // For arbitrary-value classes, also inject inline style overrides
        applyInlineOverrides(el, t);
      }
    }
  }
}

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
  const lockedSelectionRef = useRef<HTMLElement | null>(null);

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
      const data = event.data as any;
      if (!data || typeof data !== "object") return;

      if (data.type === "ISLA_VISUAL_EDIT") {
        setVisualEditEnabled(Boolean(data.enabled));
        const msg: InnerPreviewMessage = { type: "ISLA_VISUAL_EDIT", enabled: Boolean(data.enabled) };
        innerFrameRef.current?.contentWindow?.postMessage(msg, "*");
      }

      if (data.type === "ISLA_APPLY_PATCH" && Array.isArray(data.changes)) {
        applyDomPatches(innerFrameRef.current, data.changes);
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

      if (lockedSelectionRef.current) {
        lockedSelectionRef.current.style.outline = "";
        lockedSelectionRef.current.style.outlineOffset = "";
        lockedSelectionRef.current = null;
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
        if (lockedSelectionRef.current) return;
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

        // Lock selection on click so it doesn't follow the cursor.
        if (lastOutlinedRef.current && lastOutlinedRef.current !== el) {
          lastOutlinedRef.current.style.outline = "";
          lastOutlinedRef.current.style.outlineOffset = "";
        }

        if (lockedSelectionRef.current && lockedSelectionRef.current !== el) {
          lockedSelectionRef.current.style.outline = "";
          lockedSelectionRef.current.style.outlineOffset = "";
        }

        lockedSelectionRef.current = el;
        lastOutlinedRef.current = null;
        el.style.outline = "2px solid rgba(16, 185, 129, 0.95)";
        el.style.outlineOffset = "2px";

        let outerHTML: string | undefined;
        try {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.style.outline = "";
          clone.style.outlineOffset = "";
          // If style becomes empty, remove attribute to better match source markup.
          if (!clone.getAttribute("style")?.trim()) {
            clone.removeAttribute("style");
          }
          outerHTML = clone.outerHTML ? clone.outerHTML.slice(0, 1200) : undefined;
        } catch {
          outerHTML = el.outerHTML ? el.outerHTML.slice(0, 1200) : undefined;
        }
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

      const clearLocked = () => {
        const locked = lockedSelectionRef.current;
        if (!locked) return;
        locked.style.outline = "";
        locked.style.outlineOffset = "";
        lockedSelectionRef.current = null;
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        clearLocked();
      };

      doc.addEventListener("mousemove", onMove, { passive: true });
      doc.addEventListener("click", onClick, true);
      doc.addEventListener("keydown", onKeyDown);

      detach = () => {
        doc.removeEventListener("mousemove", onMove as EventListener);
        doc.removeEventListener("click", onClick as EventListener, true);
        doc.removeEventListener("keydown", onKeyDown as EventListener);
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
