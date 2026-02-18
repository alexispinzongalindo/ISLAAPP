"use client";

import { useEffect, useMemo, useState } from "react";

type IndustryTemplate = "sales" | "client-intake" | "medical";
type Language = "English" | "Spanish" | "French";
type Crm = "None" | "Salesforce" | "HubSpot";

type ActionItem = {
  id: string;
  text: string;
  owner: string;
  done: boolean;
};

type FollowUp = {
  id: string;
  title: string;
  when: string;
  channel: "Email" | "SMS" | "Calendar";
};

type LogItem = {
  id: string;
  type: "CRM" | "Compliance" | "Reminder";
  text: string;
  stamp: string;
};

const templateScripts: Record<IndustryTemplate, string[]> = {
  sales: [
    "Prospect asked for enterprise pricing and onboarding timeline.",
    "Team requested custom SSO support and security questionnaire.",
    "Decision expected after legal review next Tuesday.",
  ],
  "client-intake": [
    "Client shared project goals, delivery date, and budget range.",
    "Scope includes design handoff, QA, and weekly check-ins.",
    "Next step is proposal approval and kickoff session.",
  ],
  medical: [
    "Patient discussed symptoms timeline and prior medications.",
    "Provider recommended follow-up lab and care-plan update.",
    "Next consultation scheduled pending consent confirmation.",
  ],
};

const templateActionSeeds: Record<IndustryTemplate, Omit<ActionItem, "id" | "done">[]> = {
  sales: [
    { text: "Send enterprise pricing sheet", owner: "Account Exec" },
    { text: "Share security questionnaire packet", owner: "Solutions Engineer" },
    { text: "Book legal review follow-up call", owner: "Customer Success" },
  ],
  "client-intake": [
    { text: "Draft scope proposal with milestones", owner: "Project Lead" },
    { text: "Confirm budget approval path", owner: "Account Manager" },
    { text: "Schedule kickoff workshop", owner: "Operations" },
  ],
  medical: [
    { text: "Issue lab referral order", owner: "Provider" },
    { text: "Send care-plan instructions", owner: "Nurse" },
    { text: "Confirm follow-up consultation", owner: "Front Desk" },
  ],
};

function nowStamp() {
  return new Date().toLocaleTimeString();
}

function readoutLabel(language: Language) {
  if (language === "Spanish") return "Transcripcion en vivo";
  if (language === "French") return "Transcription en direct";
  return "Live transcript";
}

export default function MeetFlowLivePage() {
  const [template, setTemplate] = useState<IndustryTemplate>("sales");
  const [language, setLanguage] = useState<Language>("English");
  const [crm, setCrm] = useState<Crm>("None");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [consentRecording, setConsentRecording] = useState(false);
  const [consentPolicy, setConsentPolicy] = useState(false);
  const [consentMode, setConsentMode] = useState<"Standard" | "HIPAA" | "GDPR">("Standard");
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [nextLineIdx, setNextLineIdx] = useState(0);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10));
  const [followUpTime, setFollowUpTime] = useState("10:00");
  const [followUpTitle, setFollowUpTitle] = useState("Meeting follow-up");
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  const script = templateScripts[template];

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setTranscriptLines((prev) => {
        if (nextLineIdx >= script.length) return prev;
        return [...prev, script[nextLineIdx]];
      });
      setNextLineIdx((v) => Math.min(script.length, v + 1));
    }, 3500);
    return () => clearInterval(t);
  }, [recording, nextLineIdx, script]);

  const transcriptText = useMemo(() => transcriptLines.join(" "), [transcriptLines]);

  const bookingSummary = () => {
    if (!transcriptText.trim()) return "";
    if (template === "sales") {
      return "Sales call summary: Pricing and security requirements were confirmed, with procurement/legal review pending before final decision. Team requested SSO details and implementation timeline.";
    }
    if (template === "client-intake") {
      return "Client intake summary: Goals, budget, and delivery expectations were captured. Team aligned on proposal scope, milestones, and kickoff dependency.";
    }
    return "Medical consultation summary: Symptoms and prior treatment notes were documented. Follow-up labs and updated care plan were identified as next steps.";
  };

  const pushLog = (type: LogItem["type"], text: string) => {
    setLogs((prev) => [{ id: `log-${Math.random().toString(36).slice(2, 9)}`, type, text, stamp: nowStamp() }, ...prev]);
  };

  const startRecording = () => {
    if (!consentRecording || !consentPolicy) {
      setError("Recording consent and policy acceptance are required.");
      return;
    }
    setError("");
    setRecording(true);
    pushLog("Compliance", `Recording started under ${consentMode} consent mode.`);
  };

  const stopRecording = () => {
    setRecording(false);
    pushLog("Compliance", "Recording stopped and transcript finalized.");
  };

  const regenerateAi = () => {
    const nextSummary = bookingSummary();
    setSummary(nextSummary);
    const items = templateActionSeeds[template].map((item) => ({
      id: `ai-${Math.random().toString(36).slice(2, 8)}`,
      text: item.text,
      owner: item.owner,
      done: false,
    }));
    setActionItems(items);
    if (crm !== "None") {
      pushLog("CRM", `Auto-logged summary and action items to ${crm}.`);
    }
  };

  const toggleAction = (id: string) => {
    setActionItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const scheduleFollowUp = (channel: FollowUp["channel"]) => {
    const when = `${followUpDate} ${followUpTime}`;
    const item: FollowUp = {
      id: `fu-${Math.random().toString(36).slice(2, 8)}`,
      title: followUpTitle || "Follow-up",
      when,
      channel,
    };
    setFollowUps((prev) => [item, ...prev]);
    pushLog("Reminder", `${channel} follow-up scheduled for ${when}.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ef] via-[#fef8f2] to-[#f8f3ff] text-[#2f2430]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-6 rounded-3xl border border-[#e6d8c4] bg-gradient-to-r from-[#ffe9d2] via-[#ffd7cd] to-[#eedff7] p-6 shadow-[0_12px_35px_rgba(157,118,95,0.18)]">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8f4f3e]">Meeting Automation Suite</p>
          <h1 className="text-3xl font-semibold text-[#442f2f]">MeetFlow AI Notes</h1>
          <p className="mt-2 text-[#6d5a5a]">
            Record, transcribe, summarize, extract action items, and auto-schedule follow-ups with CRM logging and compliance controls.
          </p>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#e8d7ca] bg-[#fffaf4] p-4">
            <p className="text-xs uppercase text-[#9f7b60]">Template</p>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as IndustryTemplate)}
              className="mt-2 w-full rounded-xl border border-[#e2cdb9] bg-[#fff2e6] px-3 py-2 text-sm"
            >
              <option value="sales">Sales calls</option>
              <option value="client-intake">Client intake</option>
              <option value="medical">Medical consultation</option>
            </select>
          </div>
          <div className="rounded-2xl border border-[#e8d7ca] bg-[#fffaf4] p-4">
            <p className="text-xs uppercase text-[#9f7b60]">Language</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="mt-2 w-full rounded-xl border border-[#e2cdb9] bg-[#fff2e6] px-3 py-2 text-sm"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div className="rounded-2xl border border-[#e8d7ca] bg-[#fffaf4] p-4">
            <p className="text-xs uppercase text-[#9f7b60]">CRM Integration</p>
            <select
              value={crm}
              onChange={(e) => setCrm(e.target.value as Crm)}
              className="mt-2 w-full rounded-xl border border-[#e2cdb9] bg-[#fff2e6] px-3 py-2 text-sm"
            >
              <option>None</option>
              <option>Salesforce</option>
              <option>HubSpot</option>
            </select>
          </div>
          <div className="rounded-2xl border border-[#e8d7ca] bg-[#fffaf4] p-4">
            <p className="text-xs uppercase text-[#9f7b60]">Session timer</p>
            <p className="mt-2 text-2xl font-semibold">{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-[#e5d6cb] bg-[#fffaf6] p-5">
            <h2 className="text-xl font-semibold text-[#4b3633]">Recorder + Transcript</h2>
            <p className="mb-4 text-sm text-[#7b6660]">Functional simulation with compliance gating and live transcript feed.</p>

            <div className="mb-4 grid gap-2 text-sm md:grid-cols-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#e4d2c1] bg-[#fff0e2] px-3 py-2">
                <input type="checkbox" checked={consentRecording} onChange={(e) => setConsentRecording(e.target.checked)} />
                Recording consent
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#e4d2c1] bg-[#fff0e2] px-3 py-2">
                <input type="checkbox" checked={consentPolicy} onChange={(e) => setConsentPolicy(e.target.checked)} />
                Policy accepted
              </label>
              <select
                value={consentMode}
                onChange={(e) => setConsentMode(e.target.value as "Standard" | "HIPAA" | "GDPR")}
                className="rounded-lg border border-[#e4d2c1] bg-[#fff0e2] px-3 py-2"
              >
                <option>Standard</option>
                <option>HIPAA</option>
                <option>GDPR</option>
              </select>
            </div>

            {error && <p className="mb-3 rounded-lg border border-[#f3b9b5] bg-[#ffe8e5] px-3 py-2 text-sm text-[#9c2e25]">{error}</p>}

            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startRecording}
                disabled={recording}
                className="rounded-xl bg-[#f48a6a] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Start recording
              </button>
              <button
                type="button"
                onClick={stopRecording}
                disabled={!recording}
                className="rounded-xl bg-[#7e5a68] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Stop recording
              </button>
              <button
                type="button"
                onClick={regenerateAi}
                className="rounded-xl bg-[#8d7f5f] px-4 py-2 font-semibold text-white"
              >
                Generate summary + actions
              </button>
            </div>

            <div className="rounded-2xl border border-[#e4d4ca] bg-[#fff4ea] p-4">
              <p className="mb-2 text-sm font-semibold text-[#7a5147]">{readoutLabel(language)}</p>
              <div className="max-h-[170px] overflow-auto text-sm text-[#5d4b48]">
                {transcriptLines.length === 0 ? "No transcript yet. Start recording to capture notes." : transcriptLines.map((line, i) => <p key={`${line}-${i}`} className="mb-2">• {line}</p>)}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[#e5d6cb] bg-[#fffaf6] p-5">
              <h2 className="text-xl font-semibold text-[#4b3633]">AI Summary + Action Items</h2>
              <p className="mb-3 text-sm text-[#7b6660]">Action items are interactive and can be completed.</p>
              <div className="rounded-xl border border-[#e6d6ca] bg-[#fff0e4] p-3 text-sm text-[#5f4a44]">
                {summary || "No summary yet. Click “Generate summary + actions” after recording."}
              </div>
              <div className="mt-3 space-y-2">
                {actionItems.length === 0 && <p className="text-sm text-[#8d7771]">No action items yet.</p>}
                {actionItems.map((item) => (
                  <label key={item.id} className="flex items-center justify-between rounded-lg border border-[#e8d7c9] bg-[#fff6ee] px-3 py-2 text-sm">
                    <span className={item.done ? "line-through text-[#9b8880]" : ""}>{item.text}</span>
                    <span className="ml-3 inline-flex items-center gap-2">
                      <span className="rounded-full bg-[#f2e6da] px-2 py-1 text-xs">{item.owner}</span>
                      <input type="checkbox" checked={item.done} onChange={() => toggleAction(item.id)} />
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e5d6cb] bg-[#fffaf6] p-5">
              <h2 className="text-xl font-semibold text-[#4b3633]">Auto Follow-up Scheduler</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  className="rounded-lg border border-[#e2cdb9] bg-[#fff0e2] px-3 py-2 text-sm sm:col-span-2"
                  placeholder="Follow-up title"
                />
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="rounded-lg border border-[#e2cdb9] bg-[#fff0e2] px-3 py-2 text-sm" />
                <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className="rounded-lg border border-[#e2cdb9] bg-[#fff0e2] px-3 py-2 text-sm" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => scheduleFollowUp("Email")} className="rounded-lg bg-[#e88972] px-3 py-2 text-sm font-semibold text-white">Schedule email</button>
                <button onClick={() => scheduleFollowUp("SMS")} className="rounded-lg bg-[#ae8872] px-3 py-2 text-sm font-semibold text-white">Schedule SMS</button>
                <button onClick={() => scheduleFollowUp("Calendar")} className="rounded-lg bg-[#7f6477] px-3 py-2 text-sm font-semibold text-white">Schedule calendar</button>
              </div>
              <div className="mt-3 max-h-[130px] space-y-2 overflow-auto">
                {followUps.length === 0 && <p className="text-sm text-[#8d7771]">No follow-ups scheduled yet.</p>}
                {followUps.map((f) => (
                  <div key={f.id} className="rounded-lg border border-[#e8d7c9] bg-[#fff6ee] px-3 py-2 text-sm">
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-[#7c6662]">{f.channel} · {f.when}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#e5d6cb] bg-[#fffaf6] p-5">
          <h2 className="text-xl font-semibold text-[#4b3633]">Automation Log</h2>
          <p className="mb-3 text-sm text-[#7b6660]">Printed-to-screen integration events (CRM, compliance, reminder scheduling).</p>
          <div className="max-h-[220px] space-y-2 overflow-auto">
            {logs.length === 0 && <p className="text-sm text-[#8d7771]">No events logged yet.</p>}
            {logs.map((l) => (
              <div key={l.id} className="rounded-lg border border-[#e8d7c9] bg-[#fff3e8] px-3 py-2 text-sm">
                <p className="font-semibold">{l.type}</p>
                <p>{l.text}</p>
                <p className="text-xs text-[#8b7268]">{l.stamp}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

