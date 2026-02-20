"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const MODEL_OPTIONS = [
  { label: "GPT-5-mini", value: "gpt-5-mini" },
  { label: "GPT-4.1-mini", value: "gpt-4.1-mini" },
];

const EFFORT_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function AgentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [lang, setLang] = useState<"en" | "es">("en");

  const initialAssistantMessage = useMemo(() => {
    const isSpanish = lang === "es";
    if (selectedTemplate) {
      return isSpanish
        ? [
            `Plantilla seleccionada: ${selectedTemplate}.`,
            ``,
            `1. Dime un cambio por mensaje.`,
            `2. Yo lo aplico y te digo lo que cambie.`,
            `3. Tu revisas y seguimos con el siguiente cambio.`,
            ``,
            `Escribe el primer cambio cuando quieras.`,
          ].join("\n")
        : [
            `Template selected: ${selectedTemplate}.`,
            ``,
            `1. Tell me one change per message.`,
            `2. I apply it and tell you exactly what changed.`,
            `3. You review it and we continue with the next change.`,
            ``,
            `Send the first change when ready.`,
          ].join("\n");
    }

    return isSpanish
      ? [
          `Estoy listo para ayudarte con una plantilla.`,
          ``,
          `1. Elige una plantilla en la galeria.`,
          `2. Enviame un cambio claro y corto.`,
          `3. Yo lo aplico y seguimos paso a paso.`,
        ].join("\n")
      : [
          `I am ready to help you customize a template.`,
          ``,
          `1. Pick a template from the gallery.`,
          `2. Send one clear short change.`,
          `3. I apply it and we continue step by step.`,
        ].join("\n");
  }, [selectedTemplate, lang]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState("gpt-5-mini");
  const [effort, setEffort] = useState("medium");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [hasHydratedChat, setHasHydratedChat] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const template = String(params.get("template") || "").trim();
    setSelectedTemplate(template);

    const saved = String(window.localStorage.getItem("isla_lang") || "en").toLowerCase();
    setLang(saved === "es" ? "es" : "en");

    const onLang = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: string }>).detail;
      const next = String(detail?.lang || "en").toLowerCase();
      setLang(next === "es" ? "es" : "en");
    };

    window.addEventListener("isla-lang-change", onLang as EventListener);
    return () => window.removeEventListener("isla-lang-change", onLang as EventListener);
  }, []);

  const conversationKey = useMemo(
    () => `isla_agent_chat_${(selectedTemplate || "default").toLowerCase()}`,
    [selectedTemplate],
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(conversationKey);
    if (!raw) {
      setMessages([{ role: "assistant", content: initialAssistantMessage }]);
      setError("");
      setHasHydratedChat(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = Array.isArray(parsed)
        ? parsed
            .map((item) => ({
              role: item?.role === "assistant" ? "assistant" : "user",
              content: String(item?.content || "").trim(),
            }))
            .filter((item) => item.content.length > 0)
        : [];

      setMessages(
        normalized.length > 0
          ? (normalized as ChatMessage[])
          : [{ role: "assistant", content: initialAssistantMessage }],
      );
      setError("");
    } catch {
      setMessages([{ role: "assistant", content: initialAssistantMessage }]);
      setError("");
    } finally {
      setHasHydratedChat(true);
    }
  }, [conversationKey, initialAssistantMessage]);

  useEffect(() => {
    if (!hasHydratedChat || messages.length === 0) return;
    window.localStorage.setItem(conversationKey, JSON.stringify(messages));
  }, [hasHydratedChat, messages, conversationKey]);

  const canSend = useMemo(() => !isSending && draft.trim().length > 0, [isSending, draft]);
  const supportsReasoning = useMemo(() => model.startsWith("gpt-5"), [model]);
  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const onResetChat = () => {
    window.localStorage.removeItem(conversationKey);
    setMessages([{ role: "assistant", content: initialAssistantMessage }]);
    setError("");
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isSending) return;

    setError("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: userText.trim() }];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          ...(supportsReasoning ? { effort } : {}),
          messages: nextMessages,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload?.error || "Agent request failed."));
      }

      const reply = String(payload?.reply || "").trim();
      if (!reply) {
        throw new Error("Agent returned an empty response.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    const userText = draft.trim();
    setDraft("");
    await sendMessage(userText);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        {selectedTemplate ? (
          <div className="mb-4 flex items-center gap-3 text-sm text-gray-300">
            <div>
              {lang === "es" ? "Plantilla" : "Template"}: {selectedTemplate}
            </div>
            {hasUserMessages ? (
              <button
                type="button"
                onClick={onResetChat}
                className="text-gray-200 transition hover:text-white"
              >
                {lang === "es" ? "Nuevo chat" : "New chat"}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 max-h-[52vh] min-h-[280px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`mb-4 max-w-[92%] whitespace-pre-wrap leading-relaxed ${
                msg.role === "assistant" ? "text-gray-100" : "ml-auto text-indigo-200"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {isSending ? (
            <div className="text-sm text-gray-300">{lang === "es" ? "Pensando..." : "Thinking..."}</div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-blue-900/60 bg-blue-950/40 p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={lang === "es" ? "Pide cambios uno por uno" : "Ask for one change at a time"}
            className="mb-4 h-24 w-full resize-none border border-transparent bg-transparent px-1 py-1 text-xl text-gray-100 placeholder:text-blue-200/60 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <span>{lang === "es" ? "Modelo" : "Model"}</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-1 text-gray-100"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {supportsReasoning ? (
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{lang === "es" ? "Razonamiento" : "Reasoning"}</span>
                  <select
                    value={effort}
                    onChange={(e) => setEffort(e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-1 text-gray-100"
                  >
                    {EFFORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={lang === "es" ? "Enviar mensaje" : "Send message"}
            >
              ↑
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
