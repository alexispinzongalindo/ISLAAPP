"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

function buildProjectBrief(messages: ChatMessage[], template: string, lang: "en" | "es"): string {
  const userInputs = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter((content) => content.length > 0);

  const timestamp = new Date().toISOString();
  const title = lang === "es" ? "Resumen del Proyecto" : "Project Brief";
  const noData =
    lang === "es"
      ? "No hay suficientes detalles del cliente todavia."
      : "There are not enough client details yet.";

  if (userInputs.length === 0) {
    return `# ${title}\n\nGenerated: ${timestamp}\nTemplate: ${template || "default"}\n\n${noData}\n`;
  }

  const topNeeds = userInputs.slice(0, 6).map((item) => `- ${item}`).join("\n");
  const nextStepsEn = [
    "- Confirm target users and first launch platform.",
    "- Lock top 3 MVP features.",
    "- Approve data model and screens.",
    "- Start implementation sprint 1.",
  ].join("\n");
  const nextStepsEs = [
    "- Confirmar usuarios objetivo y primera plataforma.",
    "- Definir las 3 funciones clave del MVP.",
    "- Aprobar modelo de datos y pantallas.",
    "- Iniciar sprint 1 de implementacion.",
  ].join("\n");

  if (lang === "es") {
    return `# ${title}\n\nGenerado: ${timestamp}\nPlantilla: ${template || "default"}\n\n## Objetivo principal\nConstruir una app en fases usando los requisitos del cliente.\n\n## Necesidades detectadas\n${topNeeds}\n\n## Alcance MVP inicial\n- Autenticacion (segun decision del cliente)\n- Flujo principal para el caso de uso\n- Notificaciones y seguimiento basico\n- Historial y panel operativo basico\n\n## Proximos pasos\n${nextStepsEs}\n`;
  }

  return `# ${title}\n\nGenerated: ${timestamp}\nTemplate: ${template || "default"}\n\n## Primary objective\nBuild an app in phases using the captured client requirements.\n\n## Captured needs\n${topNeeds}\n\n## Initial MVP scope\n- Authentication (based on client decision)\n- Core workflow for the use case\n- Notifications and basic tracking\n- History and basic operations panel\n\n## Next steps\n${nextStepsEn}\n`;
}

const MODEL_OPTIONS = [
  { label: "GPT-5.3-Codex", value: "gpt-5.3-codex" },
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
        ? `Excelente eleccion. Seleccionaste la plantilla ${selectedTemplate}. Soy tu agente IA de islaAPP. Dime que quieres cambiar primero.`
        : `Great choice. You selected the ${selectedTemplate} template. I am your islaAPP AI agent. Tell me what you want to change first.`;
    }
    return isSpanish
      ? "Hola, soy tu agente IA de islaAPP. Como te puedo ayudar hoy?"
      : "Hi, I am your islaAPP AI agent. How can I help you today?";
  }, [selectedTemplate, lang]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState("gpt-5.3-codex");
  const [effort, setEffort] = useState("medium");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [hasHydratedChat, setHasHydratedChat] = useState(false);
  const [briefText, setBriefText] = useState("");

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

  const canSend = useMemo(
    () => !isSending && draft.trim().length > 0,
    [isSending, draft],
  );
  const supportsReasoning = useMemo(() => model.startsWith("gpt-5"), [model]);
  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const onResetChat = () => {
    window.localStorage.removeItem(conversationKey);
    setMessages([{ role: "assistant", content: initialAssistantMessage }]);
    setError("");
    setBriefText("");
  };

  const onGenerateBrief = () => {
    const brief = buildProjectBrief(messages, selectedTemplate, lang);
    setBriefText(brief);
  };

  const onCopyBrief = async () => {
    if (!briefText) return;
    try {
      await navigator.clipboard.writeText(briefText);
    } catch {
      setError(lang === "es" ? "No se pudo copiar el resumen." : "Could not copy the brief.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    setError("");
    const userText = draft.trim();
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(nextMessages);
    setDraft("");
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mx-auto max-w-5xl rounded-4xl border border-gray-800 bg-gray-950/80 p-4 shadow-xl md:p-6">
        {selectedTemplate ? (
          <div className="mb-3 flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
              {lang === "es" ? "Plantilla" : "Template"}: {selectedTemplate}
            </div>
            {hasUserMessages ? (
              <button
                type="button"
                onClick={onResetChat}
                className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-200 transition hover:border-gray-500 hover:text-white"
              >
                {lang === "es" ? "Nuevo chat" : "New chat"}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="mb-4 max-h-[48vh] min-h-[260px] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`mb-3 max-w-[90%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                msg.role === "assistant"
                  ? "bg-gray-800 text-gray-100"
                  : "ml-auto bg-indigo-600 text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isSending ? (
            <div className="max-w-[90%] rounded-2xl bg-gray-800 px-4 py-3 text-sm text-gray-300">
              {lang === "es" ? "Pensando..." : "Thinking..."}
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-gray-800 bg-gray-950 p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={lang === "es" ? "Pide cambios o nuevas funciones" : "Ask for follow-up changes"}
            className="mb-4 h-24 w-full resize-none rounded-2xl border border-transparent bg-transparent px-2 py-1 text-xl text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-3">
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

        <div className="mt-4 rounded-3xl border border-gray-800 bg-gray-950 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-200">
              {lang === "es" ? "Resumen del proyecto" : "Project brief"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGenerateBrief}
                className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-100 transition hover:border-gray-500"
              >
                {lang === "es" ? "Generar resumen" : "Generate brief"}
              </button>
              <button
                type="button"
                onClick={onCopyBrief}
                disabled={!briefText}
                className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-100 transition hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {lang === "es" ? "Copiar" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            placeholder={lang === "es" ? "Aun no hay resumen generado." : "No brief generated yet."}
            className="h-44 w-full resize-y rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      </div>
    </section>
  );
}
