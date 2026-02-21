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

const TW_COLORS: Record<string, string> = {
  "slate-50":"#f8fafc","slate-100":"#f1f5f9","slate-200":"#e2e8f0","slate-300":"#cbd5e1","slate-400":"#94a3b8","slate-500":"#64748b","slate-600":"#475569","slate-700":"#334155","slate-800":"#1e293b","slate-900":"#0f172a","slate-950":"#020617",
  "gray-50":"#f9fafb","gray-100":"#f3f4f6","gray-200":"#e5e7eb","gray-300":"#d1d5db","gray-400":"#9ca3af","gray-500":"#6b7280","gray-600":"#4b5563","gray-700":"#374151","gray-800":"#1f2937","gray-900":"#111827","gray-950":"#030712",
  "red-50":"#fef2f2","red-100":"#fee2e2","red-200":"#fecaca","red-300":"#fca5a5","red-400":"#f87171","red-500":"#ef4444","red-600":"#dc2626","red-700":"#b91c1c","red-800":"#991b1b","red-900":"#7f1d1d","red-950":"#450a0a",
  "orange-50":"#fff7ed","orange-100":"#ffedd5","orange-200":"#fed7aa","orange-300":"#fdba74","orange-400":"#fb923c","orange-500":"#f97316","orange-600":"#ea580c","orange-700":"#c2410c","orange-800":"#9a3412","orange-900":"#7c2d12",
  "amber-50":"#fffbeb","amber-100":"#fef3c7","amber-200":"#fde68a","amber-300":"#fcd34d","amber-400":"#fbbf24","amber-500":"#f59e0b","amber-600":"#d97706","amber-700":"#b45309","amber-800":"#92400e","amber-900":"#78350f",
  "yellow-50":"#fefce8","yellow-100":"#fef9c3","yellow-200":"#fef08a","yellow-300":"#fde047","yellow-400":"#facc15","yellow-500":"#eab308","yellow-600":"#ca8a04","yellow-700":"#a16207","yellow-800":"#854d0e","yellow-900":"#713f12",
  "green-50":"#f0fdf4","green-100":"#dcfce7","green-200":"#bbf7d0","green-300":"#86efac","green-400":"#4ade80","green-500":"#22c55e","green-600":"#16a34a","green-700":"#15803d","green-800":"#166534","green-900":"#14532d",
  "emerald-50":"#ecfdf5","emerald-100":"#d1fae5","emerald-200":"#a7f3d0","emerald-300":"#6ee7b7","emerald-400":"#34d399","emerald-500":"#10b981","emerald-600":"#059669","emerald-700":"#047857","emerald-800":"#065f46","emerald-900":"#064e3b",
  "teal-50":"#f0fdfa","teal-100":"#ccfbf1","teal-200":"#99f6e4","teal-300":"#5eead4","teal-400":"#2dd4bf","teal-500":"#14b8a6","teal-600":"#0d9488","teal-700":"#0f766e","teal-800":"#115e59","teal-900":"#134e4a",
  "cyan-50":"#ecfeff","cyan-100":"#cffafe","cyan-200":"#a5f3fc","cyan-300":"#67e8f9","cyan-400":"#22d3ee","cyan-500":"#06b6d4","cyan-600":"#0891b2","cyan-700":"#0e7490","cyan-800":"#155e75","cyan-900":"#164e63",
  "sky-50":"#f0f9ff","sky-100":"#e0f2fe","sky-200":"#bae6fd","sky-300":"#7dd3fc","sky-400":"#38bdf8","sky-500":"#0ea5e9","sky-600":"#0284c7","sky-700":"#0369a1","sky-800":"#075985","sky-900":"#0c4a6e",
  "blue-50":"#eff6ff","blue-100":"#dbeafe","blue-200":"#bfdbfe","blue-300":"#93c5fd","blue-400":"#60a5fa","blue-500":"#3b82f6","blue-600":"#2563eb","blue-700":"#1d4ed8","blue-800":"#1e40af","blue-900":"#1e3a8a",
  "indigo-50":"#eef2ff","indigo-100":"#e0e7ff","indigo-200":"#c7d2fe","indigo-300":"#a5b4fc","indigo-400":"#818cf8","indigo-500":"#6366f1","indigo-600":"#4f46e5","indigo-700":"#4338ca","indigo-800":"#3730a3","indigo-900":"#312e81",
  "violet-50":"#f5f3ff","violet-100":"#ede9fe","violet-200":"#ddd6fe","violet-300":"#c4b5fd","violet-400":"#a78bfa","violet-500":"#8b5cf6","violet-600":"#7c3aed","violet-700":"#6d28d9","violet-800":"#5b21b6","violet-900":"#4c1d95",
  "purple-50":"#faf5ff","purple-100":"#f3e8ff","purple-200":"#e9d5ff","purple-300":"#d8b4fe","purple-400":"#c084fc","purple-500":"#a855f7","purple-600":"#9333ea","purple-700":"#7e22ce","purple-800":"#6b21a8","purple-900":"#581c87",
  "fuchsia-50":"#fdf4ff","fuchsia-100":"#fae8ff","fuchsia-200":"#f5d0fe","fuchsia-300":"#f0abfc","fuchsia-400":"#e879f9","fuchsia-500":"#d946ef","fuchsia-600":"#c026d3","fuchsia-700":"#a21caf","fuchsia-800":"#86198f","fuchsia-900":"#701a75",
  "pink-50":"#fdf2f8","pink-100":"#fce7f3","pink-200":"#fbcfe8","pink-300":"#f9a8d4","pink-400":"#f472b6","pink-500":"#ec4899","pink-600":"#db2777","pink-700":"#be185d","pink-800":"#9d174d","pink-900":"#831843",
  "rose-50":"#fff1f2","rose-100":"#ffe4e6","rose-200":"#fecdd3","rose-300":"#fda4af","rose-400":"#fb7185","rose-500":"#f43f5e","rose-600":"#e11d48","rose-700":"#be123c","rose-800":"#9f1239","rose-900":"#881337",
  "white":"#ffffff","black":"#000000",
};

function resolveColor(token: string): string | null {
  // Arbitrary value: from-[#abc123]
  const arb = token.match(/\[([^\]]+)\]/);
  if (arb) return arb[1];

  // Named: from-red-500, bg-emerald-600, text-indigo-700
  const prefixes = ["from-","to-","via-","bg-","text-","border-","ring-","shadow-"];
  for (const p of prefixes) {
    if (token.startsWith(p)) {
      const colorName = token.slice(p.length);
      if (TW_COLORS[colorName]) return TW_COLORS[colorName];
    }
  }

  // Handle opacity suffix like bg-white/90 → white
  const slashIdx = token.indexOf("/");
  if (slashIdx > 0) {
    const withoutOpacity = token.slice(0, slashIdx);
    return resolveColor(withoutOpacity);
  }

  return null;
}

function applyInlineOverrides(el: HTMLElement, token: string) {
  // Strip responsive/state variants: md:bg-red-500 → bg-red-500
  const parts = token.split(":");
  const base = parts[parts.length - 1] || token;

  const color = resolveColor(base);
  if (!color) return;

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

function cleanTokens(raw: string): string[] {
  let s = raw.trim();
  // Strip className=" wrapper and trailing quote if present
  s = s.replace(/className\s*=\s*["'`{]/g, "");
  s = s.replace(/["'`}]\s*$/g, "");
  // Remove template-literal expressions like ${...}
  s = s.replace(/\$\{[^}]*\}/g, " ");
  return s.split(/\s+/).filter((t) => t.length > 0 && !t.includes('"') && !t.includes("'"));
}

function applyDomPatches(
  lockedEl: HTMLElement | null,
  frame: HTMLIFrameElement | null,
  changes: Array<{ patchType: string; match: string; content: string }>,
) {
  console.log("[ISLA] applyDomPatches called, lockedEl:", !!lockedEl, "frame:", !!frame, "changes:", changes.length);

  for (const change of changes) {
    if (change.patchType !== "replace-snippet") {
      console.log("[ISLA] skipping patchType:", change.patchType);
      continue;
    }

    const oldTokens = cleanTokens(change.match);
    const newTokens = cleanTokens(change.content);

    console.log("[ISLA] old:", oldTokens.join(" "));
    console.log("[ISLA] new:", newTokens.join(" "));

    if (oldTokens.length === 0 || newTokens.length === 0) continue;

    const oldSet = new Set(oldTokens);
    const newSet = new Set(newTokens);
    const removed = oldTokens.filter((t) => !newSet.has(t));
    const added = newTokens.filter((t) => !oldSet.has(t));

    console.log("[ISLA] removed:", removed, "added:", added);
    if (removed.length === 0 && added.length === 0) continue;

    // --- Strategy 1: Apply directly to the locked (selected) element ---
    if (lockedEl) {
      for (const t of removed) lockedEl.classList.remove(t);
      for (const t of added) {
        lockedEl.classList.add(t);
        applyInlineOverrides(lockedEl, t);
      }
      console.log("[ISLA] ✓ patched locked element:", lockedEl.tagName, lockedEl.className.slice(0, 80));
      continue; // done with this change
    }

    // --- Strategy 2: Fallback — scan inner iframe DOM ---
    const doc = frame?.contentDocument;
    if (!doc) { console.warn("[ISLA] no lockedEl and no contentDocument"); continue; }

    const allElements = Array.from(doc.querySelectorAll("*")) as HTMLElement[];
    let matched = allElements.filter((el) => {
      if (typeof el.className !== "string") return false;
      return oldTokens.every((t) => el.className.includes(t));
    });

    if (matched.length === 0 && removed.length > 0) {
      matched = allElements.filter((el) => {
        if (typeof el.className !== "string") return false;
        return removed.every((t) => el.className.includes(t));
      });
    }

    console.log("[ISLA] DOM scan matched:", matched.length, "of", allElements.length);

    for (const el of matched) {
      for (const t of removed) el.classList.remove(t);
      for (const t of added) {
        el.classList.add(t);
        applyInlineOverrides(el, t);
      }
      console.log("[ISLA] ✓ patched scanned element:", el.tagName, el.className.slice(0, 80));
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

  const [previewVersion, setPreviewVersion] = useState(0);

  const liveHref = useMemo(() => {
    if (!isLivePageSlug(templateSlug)) return "";
    // Use dynamic renderer that reads from Supabase (works in production)
    return `/api/editor/preview-html?projectId=${encodeURIComponent(projectId)}&v=${previewVersion}`;
  }, [templateSlug, projectId, previewVersion]);

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
        console.log("[ISLA] ISLA_APPLY_PATCH received, changes:", data.changes.length);
        // Reload the dynamic preview to show updated content from Supabase
        setPreviewVersion((v) => v + 1);
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
