"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { parseAiPatchPlan } from "@/lib/ai/patch-schema";

type DeviceMode = "desktop" | "tablet" | "mobile";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type VisualHint = {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  outerHTML?: string;
};

function safeId() {
  try {
    const c = (globalThis as any)?.crypto;
    if (c && typeof c.randomUUID === "function") {
      return String(c.randomUUID());
    }
  } catch {
    // ignore
  }

  return `id_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function deviceWidth(mode: DeviceMode) {
  switch (mode) {
    case "mobile":
      return 390;
    case "tablet":
      return 820;
    default:
      return null;
  }
}

export default function EditorPage({
  params,
}: {
  params: any;
}) {
  const [projectId, setProjectId] = useState(() => {
    const raw = (params as any)?.projectId;
    return raw ? String(raw) : "";
  });

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

  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [visualEdit, setVisualEdit] = useState(false);
  const [dark, setDark] = useState(true);

  const storageKey = useMemo(() => `isla_editor_chat_${projectId}`, [projectId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [lastValidPlan, setLastValidPlan] = useState<string>("");
  const [version, setVersion] = useState(0);

  const [selectedHint, setSelectedHint] = useState<VisualHint | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Prevent hydration mismatch: only read/write localStorage after hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  const ready = hydrated && Boolean(projectId);

  useEffect(() => {
    if (!hydrated || !projectId) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setMessages(
        parsed
          .map((m: unknown) => {
            const item = m as { id?: unknown; role?: unknown; content?: unknown };
            const role: ChatMessage["role"] =
              item?.role === "assistant" ? "assistant" : "user";

            const next: ChatMessage = {
              id: String(item?.id || safeId()),
              role,
              content: String(item?.content || ""),
            };

            return next;
          })
          .filter((m: ChatMessage) => m.content.trim().length > 0),
      );
    } catch {
      // ignore
    }
  }, [storageKey, hydrated]);

  useEffect(() => {
    if (!hydrated || !projectId) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, storageKey, hydrated]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "ISLA_PREVIEW_READY") {
        // Placeholder for a future handshake (element selection, hover, etc.)
      }

      if (data.type === "ISLA_ELEMENT_SELECTED") {
        const hint = (data as any)?.hint;
        if (!hint || typeof hint !== "object") return;
        setSelectedHint({
          tag: String(hint.tag || ""),
          id: hint.id ? String(hint.id) : undefined,
          className: hint.className ? String(hint.className) : undefined,
          text: hint.text ? String(hint.text) : undefined,
          outerHTML: hint.outerHTML ? String(hint.outerHTML) : undefined,
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const submitChat = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    if (isSending) return;
    setSendError("");
    setDraft("");
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: safeId(),
      role: "user",
      content: text,
    };

    setMessages((prev: ChatMessage[]) => [
      ...prev,
      userMessage,
    ]);

    try {
      const requestMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/editor/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          selectionHint: selectedHint
            ? {
                tag: selectedHint.tag,
                id: selectedHint.id,
                className: selectedHint.className,
                text: selectedHint.text,
                outerHTML: selectedHint.outerHTML,
              }
            : null,
          messages: requestMessages,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload?.error || "Planning request failed."));
      }

      const raw = String(payload?.raw || "").trim();
      if (!raw) {
        throw new Error("AI returned an empty plan.");
      }

      const parsed = parseAiPatchPlan(raw);
      const validationMessage = parsed.ok
        ? `Valid patch plan. Changes: ${parsed.plan.changes.length}${parsed.warnings.length ? ` (warnings: ${parsed.warnings.join("; ")})` : ""}`
        : `Invalid patch plan: ${parsed.error}`;

      if (parsed.ok) {
        setLastValidPlan(raw);
      }

      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: safeId(), role: "assistant", content: raw },
        { id: safeId(), role: "assistant", content: validationMessage },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setSendError(message);
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: safeId(), role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const applyLastPlan = async () => {
    if (!lastValidPlan.trim()) return;

    try {
      const response = await fetch("/api/editor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, rawPlan: lastValidPlan }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload?.error || "Apply failed."));
      }

      setCanUndo(Boolean(payload?.canUndo));
      setCanRedo(Boolean(payload?.canRedo));

      // Forward applied changes to preview iframe for live DOM patching.
      // IMPORTANT: Do NOT call setVersion() here — that reloads the iframe
      // and destroys the preview page before the postMessage arrives.
      const appliedChanges = payload?.appliedChanges;
      if (Array.isArray(appliedChanges) && appliedChanges.length > 0) {
        // Small delay so the current React render cycle finishes first
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "ISLA_APPLY_PATCH", changes: appliedChanges },
            "*",
          );
        }, 100);
      } else {
        // No DOM patches — fall back to iframe reload
        setVersion(Number(payload?.version || 0));
      }

      // Clear the plan so the user can't re-apply the same patch (the old
      // match no longer exists in the source file after a successful apply).
      setLastValidPlan("");

      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: safeId(),
          role: "assistant",
          content: "Applied changes. Preview refreshed.",
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: safeId(), role: "assistant", content: `Apply error: ${message}` },
      ]);
    }
  };

  const runUndo = async () => {
    try {
      const response = await fetch("/api/editor/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload?.error || "Undo failed."));
      }

      setVersion(Number(payload?.version || 0));
      setCanUndo(Boolean(payload?.canUndo));
      setCanRedo(Boolean(payload?.canRedo));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: safeId(), role: "assistant", content: `Undo error: ${message}` },
      ]);
    }
  };

  const runRedo = async () => {
    try {
      const response = await fetch("/api/editor/redo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload?.error || "Redo failed."));
      }

      setVersion(Number(payload?.version || 0));
      setCanUndo(Boolean(payload?.canUndo));
      setCanRedo(Boolean(payload?.canRedo));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: safeId(), role: "assistant", content: `Redo error: ${message}` },
      ]);
    }
  };

  const previewWidth = deviceWidth(device);

  return (
    <div className={dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}>
      {!ready ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-gray-100">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center">
            <p className="text-sm text-indigo-200/70">Loading editor…</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
        <div className="sticky top-[72px] z-40 mb-4 rounded-2xl border border-gray-800/80 bg-gray-900/70 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-gray-800 bg-gray-950/40 px-3 py-1.5 text-sm text-indigo-200/80">
                Project
                <span className="ml-2 font-semibold text-gray-100">{projectId}</span>
              </div>
              <div className="hidden text-xs text-indigo-200/60 md:block">
                Preview + AI chat (skeleton)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-sm border border-gray-800 bg-gray-900/50 text-gray-100 hover:bg-gray-800 disabled:opacity-50"
                disabled={!canUndo}
                onClick={runUndo}
              >
                Undo
              </button>
              <button
                type="button"
                className="btn-sm border border-gray-800 bg-gray-900/50 text-gray-100 hover:bg-gray-800 disabled:opacity-50"
                disabled={!canRedo}
                onClick={runRedo}
              >
                Redo
              </button>

              <div className="h-6 w-px bg-gray-800" />

              <div className="flex items-center rounded-xl border border-gray-800 bg-gray-900/50 p-1">
                <button
                  type="button"
                  className={`btn-sm px-3 ${device === "desktop" ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
                  onClick={() => setDevice("desktop")}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={`btn-sm px-3 ${device === "tablet" ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
                  onClick={() => setDevice("tablet")}
                >
                  Tablet
                </button>
                <button
                  type="button"
                  className={`btn-sm px-3 ${device === "mobile" ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
                  onClick={() => setDevice("mobile")}
                >
                  Mobile
                </button>
              </div>

              <button
                type="button"
                className={`btn-sm border ${visualEdit ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200" : "border-gray-800 bg-gray-900/50 text-gray-100 hover:bg-gray-800"}`}
                onClick={() => {
                  setVisualEdit((v: boolean) => !v);
                  iframeRef.current?.contentWindow?.postMessage(
                    {
                      type: "ISLA_VISUAL_EDIT",
                      enabled: !visualEdit,
                    },
                    "*",
                  );
                }}
              >
                Visual Edit
              </button>

              <button
                type="button"
                className="btn-sm border border-gray-800 bg-gray-900/50 text-gray-100 hover:bg-gray-800"
                onClick={() => setDark((d: boolean) => !d)}
              >
                {dark ? "Dark" : "Light"}
              </button>

              <a
                href="https://builder.io/app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sm border border-indigo-500/60 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20"
              >
                Builder.io Editor
              </a>

              <button
                type="button"
                disabled={!lastValidPlan.trim()}
                className="btn-sm bg-emerald-600 text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={applyLastPlan}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,420px]">
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/30 px-4 py-3">
              <div className="text-sm font-semibold text-gray-100">Live Preview</div>
              <div className="text-xs text-indigo-200/60">
                Auto-refresh will be wired after patches
              </div>
            </div>

            <div className="flex justify-center bg-gray-950/40 p-4">
              <div
                className="relative overflow-hidden rounded-xl border border-gray-800 bg-black shadow-2xl shadow-black/30"
                style={
                  previewWidth
                    ? { width: previewWidth, height: "72vh" }
                    : { width: "100%", height: "72vh" }
                }
              >
                <iframe
                  ref={iframeRef}
                  title="Project preview"
                  src={`/preview/${encodeURIComponent(projectId)}?v=${encodeURIComponent(String(version))}`}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 shadow-lg shadow-black/20">
            <div className="border-b border-gray-800 bg-gray-950/30 px-4 py-3">
              <div className="text-sm font-semibold text-gray-100">AI Chat</div>
              <div className="mt-1 text-xs text-indigo-200/60">
                Just describe what you want changed — no need to select anything.
              </div>
            </div>

            <div className="flex h-[72vh] flex-col">
              {selectedHint ? (
                <div className="border-b border-gray-800 bg-gray-950/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/70">
                        Selected element
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-gray-100">
                        {selectedHint.tag}
                        {selectedHint.id ? `#${selectedHint.id}` : ""}
                      </div>
                      {selectedHint.text ? (
                        <div className="mt-1 line-clamp-2 text-xs text-indigo-200/70">
                          {selectedHint.text}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn-sm border border-gray-800 bg-gray-900/40 text-gray-100 hover:bg-gray-800"
                      onClick={() => setSelectedHint(null)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 text-sm text-indigo-200/70">
                    Just type what you want:
                    <div className="mt-2 space-y-1 text-indigo-200/60">
                      <div>"Make the header background blue"</div>
                      <div>"Change all buttons to rounded"</div>
                      <div>"Add a timestamp to each sale"</div>
                      <div>"Make the title text bigger and bold"</div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {messages.map((m: ChatMessage) => (
                    <div
                      key={m.id}
                      className={`max-w-[92%] rounded-2xl border px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto border-indigo-900/60 bg-indigo-950/40 text-indigo-100"
                          : "border-gray-800 bg-gray-950/30 text-gray-100"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={submitChat} className="border-t border-gray-800 p-4">
                <textarea
                  value={draft}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
                  placeholder={visualEdit ? "Describe a change for the selected element…" : "Ask the AI to change something…"}
                  className="mb-3 h-20 w-full resize-none rounded-xl border border-gray-800 bg-gray-950/40 px-3 py-2 text-sm text-gray-100 placeholder:text-indigo-200/40 focus:outline-none"
                />
                {sendError ? (
                  <div className="mb-3 rounded-xl border border-red-900/60 bg-red-950/20 px-3 py-2 text-xs text-red-200">
                    {sendError}
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-indigo-200/60">
                    Output: structured JSON patches (next)
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Planning…" : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
      )}
    </div>
  );
}
