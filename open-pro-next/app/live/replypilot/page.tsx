"use client";

import { useMemo, useState } from "react";

type Mode = "sales" | "support" | "executive";
type Tone = "formal" | "friendly" | "brief";
type Vertical = "real-estate" | "recruiting" | "ecommerce";

type Draft = {
  id: string;
  to: string;
  subject: string;
  body: string;
  mode: Mode;
  tone: Tone;
  vertical: Vertical;
  scheduledAt: string;
  status: "draft" | "scheduled" | "sent" | "opened";
  openCount: number;
};

type FollowUp = {
  id: string;
  draftId: string;
  to: string;
  dueAt: string;
  state: "pending" | "sent";
};

type TimelineEvent = {
  id: string;
  text: string;
  stamp: string;
  type: "ai" | "send" | "open" | "follow-up";
};

const modeLabels: Record<Mode, string> = {
  sales: "Sales pipeline",
  support: "Support desk",
  executive: "Executive assistant",
};

const verticalLabels: Record<Vertical, string> = {
  "real-estate": "Real estate nurturing",
  recruiting: "Recruiting outreach",
  ecommerce: "E-commerce win-back",
};

function nowLocal() {
  return new Date().toISOString().slice(0, 16);
}

function stamp() {
  return new Date().toLocaleTimeString();
}

function createBody(mode: Mode, tone: Tone, vertical: Vertical, input: string) {
  const opener =
    tone === "formal"
      ? "Thank you for your message."
      : tone === "friendly"
        ? "Thanks for reaching out."
        : "Quick update:";
  const strategy =
    mode === "sales"
      ? "I have highlighted next pipeline steps and recommended a follow-up window."
      : mode === "support"
        ? "I categorized the issue and included a concise resolution path."
        : "I prepared scheduling options and a meeting-ready summary.";
  const verticalHook =
    vertical === "real-estate"
      ? "This sequence aligns with active listing and lead nurturing workflows."
      : vertical === "recruiting"
        ? "This sequence aligns with candidate outreach and response tracking."
        : "This sequence aligns with win-back and reactivation campaigns.";
  const close =
    tone === "formal"
      ? "Please confirm and I will proceed accordingly."
      : tone === "friendly"
        ? "If this works for you, I can send it now."
        : "Approve to schedule.";
  return `${opener}\n\n${strategy}\n${verticalHook}\n\nContext captured:\n${input}\n\n${close}`;
}

export default function ReplyPilotLivePage() {
  const [mode, setMode] = useState<Mode>("sales");
  const [tone, setTone] = useState<Tone>("friendly");
  const [vertical, setVertical] = useState<Vertical>("real-estate");
  const [to, setTo] = useState("lead@example.com");
  const [subject, setSubject] = useState("Follow-up from today’s conversation");
  const [inputContext, setInputContext] = useState("Customer asked about pricing options and next available timeline.");
  const [scheduledAt, setScheduledAt] = useState(nowLocal());
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const scheduled = drafts.filter((d) => d.status === "scheduled").length;
    const sent = drafts.filter((d) => d.status === "sent" || d.status === "opened").length;
    const opened = drafts.filter((d) => d.status === "opened").length;
    const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
    return { scheduled, sent, opened, openRate };
  }, [drafts]);

  const pushTimeline = (type: TimelineEvent["type"], text: string) => {
    setTimeline((prev) => [{ id: `ev-${Math.random().toString(36).slice(2, 9)}`, type, text, stamp: stamp() }, ...prev]);
  };

  const generateDraft = () => {
    if (!to.trim() || !subject.trim() || !inputContext.trim()) {
      setError("To, subject, and context are required.");
      return;
    }
    setError("");
    const body = createBody(mode, tone, vertical, inputContext);
    setPreview(body);
    pushTimeline("ai", `AI draft generated for ${modeLabels[mode]} in ${tone} tone.`);
  };

  const saveAndSchedule = () => {
    if (!preview.trim()) {
      setError("Generate a draft before scheduling.");
      return;
    }
    setError("");
    const id = `dr-${Math.random().toString(36).slice(2, 8)}`;
    const draft: Draft = {
      id,
      to: to.trim(),
      subject: subject.trim(),
      body: preview,
      mode,
      tone,
      vertical,
      scheduledAt,
      status: "scheduled",
      openCount: 0,
    };
    setDrafts((prev) => [draft, ...prev]);
    pushTimeline("send", `Email scheduled to ${draft.to} at ${draft.scheduledAt}.`);
  };

  const triggerSendNow = (id: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "sent" } : d)));
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    pushTimeline("send", `Email sent to ${draft.to} (Stripe/email layer mocked to screen).`);

    const follow: FollowUp = {
      id: `fu-${Math.random().toString(36).slice(2, 9)}`,
      draftId: id,
      to: draft.to,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      state: "pending",
    };
    setFollowUps((prev) => [follow, ...prev]);
    pushTimeline("follow-up", `Auto follow-up queued for ${draft.to} (24h).`);
  };

  const simulateOpen = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return { ...d, status: "opened", openCount: d.openCount + 1 };
      }),
    );
    const draft = drafts.find((d) => d.id === id);
    if (draft) pushTimeline("open", `Open tracked for ${draft.to}.`);
  };

  const sendFollowUp = (id: string) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, state: "sent" } : f)));
    const fu = followUps.find((f) => f.id === id);
    if (fu) pushTimeline("follow-up", `Follow-up sent to ${fu.to}.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eefcf4] via-[#fff4ec] to-[#f5efff] text-[#1f2a24]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-6 rounded-3xl border border-[#ebd6c2] bg-gradient-to-r from-[#d7f7e8] via-[#ffe1cf] to-[#e7dcff] p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2f6e52]">ReplyPilot</p>
          <h1 className="text-3xl font-semibold text-[#1f2a24]">Meeting Automation & AI Note-Taking Suite</h1>
          <p className="mt-2 text-[#4b6658]">
            Draft AI email responses, schedule sends, track opens, and automate follow-ups with sales/support/executive workflows.
          </p>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#c8e4d5] bg-[#f8fff9] p-4">
            <p className="text-xs uppercase text-[#4f7c68]">Scheduled</p>
            <p className="text-2xl font-semibold">{stats.scheduled}</p>
          </div>
          <div className="rounded-2xl border border-[#c8e4d5] bg-[#f8fff9] p-4">
            <p className="text-xs uppercase text-[#4f7c68]">Sent</p>
            <p className="text-2xl font-semibold">{stats.sent}</p>
          </div>
          <div className="rounded-2xl border border-[#c8e4d5] bg-[#f8fff9] p-4">
            <p className="text-xs uppercase text-[#4f7c68]">Opened</p>
            <p className="text-2xl font-semibold">{stats.opened}</p>
          </div>
          <div className="rounded-2xl border border-[#c8e4d5] bg-[#f8fff9] p-4">
            <p className="text-xs uppercase text-[#4f7c68]">Open rate</p>
            <p className="text-2xl font-semibold">{stats.openRate}%</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-[#c8e4d5] bg-[#fbfffc] p-5">
            <h2 className="text-xl font-semibold">AI Draft Composer</h2>
            <p className="mb-4 text-sm text-[#5d786a]">Build response drafts with mode, tone, and vertical presets.</p>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm">
                <option value="sales">Sales-focused</option>
                <option value="support">Support-focused</option>
                <option value="executive">Executive assistant</option>
              </select>
              <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm">
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="brief">Brief</option>
              </select>
              <select value={vertical} onChange={(e) => setVertical(e.target.value as Vertical)} className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm">
                <option value="real-estate">Real estate nurturing</option>
                <option value="recruiting">Recruiting outreach</option>
                <option value="ecommerce">E-commerce win-back</option>
              </select>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient email" className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm" />
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm" />
              <textarea value={inputContext} onChange={(e) => setInputContext(e.target.value)} placeholder="Context from notes/call" className="min-h-[120px] rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm md:col-span-2" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={generateDraft} className="rounded-xl bg-[#3cba7a] px-4 py-2 text-sm font-semibold text-white">Generate AI draft</button>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="rounded-xl border border-[#b8dcc8] bg-[#effaf3] px-3 py-2 text-sm" />
              <button onClick={saveAndSchedule} className="rounded-xl bg-[#ff7f50] px-4 py-2 text-sm font-semibold text-white">Schedule send</button>
            </div>

            {error && <p className="mb-3 rounded-lg border border-[#f2b7a1] bg-[#fff0ea] px-3 py-2 text-sm text-[#a34a2f]">{error}</p>}

            <div className="rounded-xl border border-[#bddcca] bg-[#eff9f4] p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#9a775f]">AI preview</p>
              <p className="whitespace-pre-line text-sm text-[#385247]">{preview || "Draft preview appears here after generation."}</p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[#c8e4d5] bg-[#fbfffc] p-5">
              <h2 className="text-xl font-semibold">Send Queue + Tracking</h2>
              <div className="mt-3 max-h-[280px] space-y-2 overflow-auto">
                {drafts.length === 0 && <p className="text-sm text-[#6a8578]">No drafts yet.</p>}
                {drafts.map((d) => (
                  <div key={d.id} className="rounded-xl border border-[#e6d6cb] bg-[#f1fbf6] p-3 text-sm">
                    <p className="font-semibold">{d.subject}</p>
                    <p className="text-[#5f7a6d]">{d.to} · {modeLabels[d.mode]} · {verticalLabels[d.vertical]}</p>
                    <p className="text-[#5f7a6d]">Tone: {d.tone} · Status: {d.status} · Opens: {d.openCount}</p>
                    <div className="mt-2 flex gap-2">
                      {(d.status === "scheduled" || d.status === "draft") && (
                        <button onClick={() => triggerSendNow(d.id)} className="rounded-lg bg-[#32b26e] px-3 py-1.5 text-xs font-semibold text-white">Send now</button>
                      )}
                      {(d.status === "sent" || d.status === "opened") && (
                        <button onClick={() => simulateOpen(d.id)} className="rounded-lg bg-[#7c6bd8] px-3 py-1.5 text-xs font-semibold text-white">Simulate open</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#c8e4d5] bg-[#fbfffc] p-5">
              <h2 className="text-xl font-semibold">Auto Follow-ups</h2>
              <div className="mt-3 max-h-[180px] space-y-2 overflow-auto">
                {followUps.length === 0 && <p className="text-sm text-[#6a8578]">No follow-ups yet.</p>}
                {followUps.map((f) => (
                  <div key={f.id} className="rounded-xl border border-[#e6d6cb] bg-[#f1fbf6] p-3 text-sm">
                    <p className="font-semibold">{f.to}</p>
                    <p className="text-[#5f7a6d]">Due: {f.dueAt} · {f.state}</p>
                    {f.state === "pending" && (
                      <button onClick={() => sendFollowUp(f.id)} className="mt-2 rounded-lg bg-[#f27d46] px-3 py-1.5 text-xs font-semibold text-white">Send follow-up</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#c8e4d5] bg-[#fbfffc] p-5">
          <h2 className="text-xl font-semibold">Automation Timeline</h2>
          <p className="mb-3 text-sm text-[#5d786a]">Printed-to-screen events for AI generation, scheduled sends, opens, and follow-ups.</p>
          <div className="max-h-[220px] space-y-2 overflow-auto">
            {timeline.length === 0 && <p className="text-sm text-[#6a8578]">No events yet.</p>}
            {timeline.map((e) => (
              <div key={e.id} className="rounded-lg border border-[#e6d6cb] bg-[#f1fbf6] px-3 py-2 text-sm">
                <p className="font-semibold capitalize">{e.type}</p>
                <p>{e.text}</p>
                <p className="text-xs text-[#6a8578]">{e.stamp}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

