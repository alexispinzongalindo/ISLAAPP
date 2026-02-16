"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { format, addMinutes, isBefore, isAfter, isSameDay, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Dose = {
  id: string;
  time: string; // HH:mm
  withFood?: boolean;
};

type Medication = {
  id: string;
  name: string;
  dosage: string;
  form: "pill" | "capsule" | "liquid" | "injection";
  color: string;
  schedule: Dose[];
  stock: number;
  refillDate: string;
  pharmacy: string;
  personaId: string;
  adherence: { date: string; taken: number; expected: number }[];
};

type Persona = { id: string; name: string; theme: string };

type HistoryItem = {
  medId: string;
  doseId: string;
  ts: number;
  status: "taken" | "missed" | "snoozed";
};

const personas: Persona[] = [
  { id: "p1", name: "Mom", theme: "from-sky-500 via-sky-400 to-cyan-300" },
  { id: "p2", name: "Dad", theme: "from-indigo-500 via-indigo-400 to-purple-300" },
  { id: "p3", name: "John", theme: "from-emerald-500 via-emerald-400 to-teal-300" },
];

const medsSeed: Medication[] = [
  {
    id: "m1",
    name: "Lisinopril",
    dosage: "10 mg",
    form: "pill",
    color: "#1d4ed8",
    schedule: [{ id: "d1", time: "08:00" }],
    stock: 18,
    refillDate: "2026-02-20",
    pharmacy: "WellCare Pharmacy",
    personaId: "p1",
    adherence: [],
  },
  {
    id: "m2",
    name: "Metformin",
    dosage: "500 mg",
    form: "pill",
    color: "#0ea5e9",
    schedule: [
      { id: "d1", time: "08:00", withFood: true },
      { id: "d2", time: "18:00", withFood: true },
    ],
    stock: 32,
    refillDate: "2026-02-28",
    pharmacy: "City Health Rx",
    personaId: "p1",
    adherence: [],
  },
  {
    id: "m3",
    name: "Vitamin D",
    dosage: "2000 IU",
    form: "pill",
    color: "#f59e0b",
    schedule: [{ id: "d1", time: "09:00" }],
    stock: 8,
    refillDate: "2026-02-17",
    pharmacy: "Sunrise Pharmacy",
    personaId: "p2",
    adherence: [],
  },
  {
    id: "m4",
    name: "Atorvastatin",
    dosage: "20 mg",
    form: "pill",
    color: "#7c3aed",
    schedule: [{ id: "d1", time: "21:00" }],
    stock: 25,
    refillDate: "2026-02-27",
    pharmacy: "Prime Rx",
    personaId: "p3",
    adherence: [],
  },
];

type Action =
  | { type: "TAKE_DOSE"; medId: string; doseId: string; ts: number }
  | { type: "SNOOZE_DOSE"; medId: string; doseId: string; ts: number }
  | { type: "MISS_DOSE"; medId: string; doseId: string; ts: number }
  | { type: "SET"; history: HistoryItem[] };

function historyReducer(state: HistoryItem[], action: Action): HistoryItem[] {
  switch (action.type) {
    case "SET":
      return action.history;
    case "TAKE_DOSE":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "taken" }];
    case "SNOOZE_DOSE":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "snoozed" }];
    case "MISS_DOSE":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "missed" }];
    default:
      return state;
  }
}

const Pill = ({ color, form }: { color: string; form: Medication["form"] }) => (
  <div
    className={`h-6 w-10 rounded-full border border-white/20 shadow-inner shadow-black/30 flex items-center justify-center text-[10px] uppercase text-white/80`}
    style={{ background: color }}
  >
    {form}
  </div>
);

const Badge = ({ label }: { label: string }) => (
  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-sky-50 border border-white/10">{label}</span>
);

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}

export default function MedTrackLive() {
  const [personaId, setPersonaId] = useState<Persona["id"]>("p1");
  const [history, dispatch] = useReducer(historyReducer, []);
  const [meds, setMeds] = useState<Medication[]>(medsSeed);
  const now = useNow(5000);

  // hydrate history
  useEffect(() => {
    const raw = localStorage.getItem("medtrack-history");
    if (raw) {
      try {
        dispatch({ type: "SET", history: JSON.parse(raw) });
      } catch (_) {
        dispatch({ type: "SET", history: [] });
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("medtrack-history", JSON.stringify(history));
  }, [history]);

  const persona = personas.find((p) => p.id === personaId) ?? personas[0];
  const personaMeds = meds.filter((m) => m.personaId === personaId);

  const todayHistory = useMemo(() => {
    const start = startOfDay(now).getTime();
    return history.filter((h) => h.ts >= start);
  }, [history, now]);

  const schedule = useMemo(() => {
    const items: {
      med: Medication;
      dose: Dose;
      ts: Date;
      status: "past" | "now" | "upcoming";
      history?: HistoryItem;
    }[] = [];
    personaMeds.forEach((med) => {
      med.schedule.forEach((dose) => {
        const [h, m] = dose.time.split(":").map(Number);
        const ts = new Date(now);
        ts.setHours(h, m, 0, 0);
        const taken = todayHistory.find((h) => h.medId === med.id && h.doseId === dose.id);
        const status = isBefore(ts, now)
          ? "past"
          : Math.abs(ts.getTime() - now.getTime()) < 45 * 60 * 1000
            ? "now"
            : "upcoming";
        items.push({ med, dose, ts, status, history: taken });
      });
    });
    return items.sort((a, b) => a.ts.getTime() - b.ts.getTime());
  }, [personaMeds, now, todayHistory]);

  const nextDose = schedule.find((s) => s.status !== "past");

  const adherence = useMemo(() => {
    const total = schedule.length;
    const taken = schedule.filter((s) => s.history?.status === "taken").length;
    const rate = total === 0 ? 0 : Math.round((taken / total) * 100);
    return { taken, total, rate };
  }, [schedule]);

  const mark = (medId: string, doseId: string, status: HistoryItem["status"]) => {
    const ts = Date.now();
    if (status === "taken") dispatch({ type: "TAKE_DOSE", medId, doseId, ts });
    if (status === "snoozed") dispatch({ type: "SNOOZE_DOSE", medId, doseId, ts });
    if (status === "missed") dispatch({ type: "MISS_DOSE", medId, doseId, ts });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">MedTrack Live Demo</p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Medication Manager, live</h1>
            <p className="text-sky-100/70 mt-1">Clinical & trustworthy UI with mock data, adherence, and refills.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 hover:bg-sky-400"
              onClick={() => (window.location.href = "/agent?template=medtrack&source=live_demo")}
            >
              Customize with AI
            </button>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card title="Today's schedule" accent={persona.theme}>
              <div className="flex items-center justify-between text-sm text-sky-100/80 mb-3">
                <span>Current time: {format(now, "p")}</span>
                <span>Adherence today: {adherence.rate}% ({adherence.taken}/{adherence.total})</span>
              </div>
              <div className="space-y-3">
                {schedule.map((item) => (
                  <motion.div
                    key={`${item.med.id}-${item.dose.id}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-md ${
                      item.status === "now"
                        ? "border-sky-400/60 bg-sky-500/10"
                        : item.status === "past"
                          ? "border-white/5 bg-white/5"
                          : "border-white/10 bg-white/5"
                    }`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <Pill color={item.med.color} form={item.med.form} />
                      <div>
                        <p className="text-sm text-slate-200">{item.med.name} · {item.med.dosage}</p>
                        <p className="text-xs text-sky-100/70">
                          {format(item.ts, "p")} {item.dose.withFood ? "· with food" : ""} — {item.status === "past" ? "Past" : item.status === "now" ? "Due now" : "Upcoming"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.history?.status === "taken" && <Badge label="Taken" />}
                      {item.history?.status === "snoozed" && <Badge label="Snoozed" />}
                      {!item.history && (
                        <>
                          <ActionButton label="Take" onClick={() => mark(item.med.id, item.dose.id, "taken")} />
                          <ActionButton label="Snooze" variant="ghost" onClick={() => mark(item.med.id, item.dose.id, "snoozed")} />
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card title="Medications" accent={persona.theme}>
              <div className="grid gap-3 md:grid-cols-2">
                {personaMeds.map((m) => {
                  const low = m.stock <= 10;
                  const next = m.schedule[0];
                  return (
                    <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Pill color={m.color} form={m.form} />
                          <div>
                            <p className="text-base font-semibold text-white">{m.name}</p>
                            <p className="text-sm text-sky-100/70">{m.dosage}</p>
                          </div>
                        </div>
                        {low && <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200 border border-amber-400/40">Low stock</span>}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-sky-100/70">
                        <Badge label={`${m.schedule.length}x/day`} />
                        {next && <Badge label={`Next: ${next.time}`} />}
                        <Badge label={`Stock: ${m.stock}`} />
                      </div>
                      <div className="mt-3 text-xs text-sky-100/70">Pharmacy: {m.pharmacy} · Refill: {m.refillDate}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Next dose" accent={persona.theme}>
              {nextDose ? (
                <div className="space-y-2">
                  <p className="text-sm text-sky-100/80">Due {format(nextDose.ts, "p")}</p>
                  <p className="text-lg font-semibold text-white">{nextDose.med.name} · {nextDose.med.dosage}</p>
                  <div className="flex gap-2">
                    <ActionButton label="Take now" onClick={() => mark(nextDose.med.id, nextDose.dose.id, "taken")} />
                    <ActionButton label="Snooze 10m" variant="ghost" onClick={() => mark(nextDose.med.id, nextDose.dose.id, "snoozed")} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-sky-100/70">All caught up today. 🎉</p>
              )}
            </Card>

            <Card title="Adherence" accent={persona.theme}>
              <p className="text-3xl font-semibold text-white">{adherence.rate}%</p>
              <p className="text-sm text-sky-100/70 mb-3">Today adherence</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                  const date = addMinutes(startOfDay(now), d * 1440);
                  const dayTotal = schedule.filter((s) => isSameDay(s.ts, date)).length || 1;
                  const dayTaken = schedule.filter((s) => isSameDay(s.ts, date) && s.history?.status === "taken").length;
                  const pct = Math.round((dayTaken / dayTotal) * 100);
                  return (
                    <div key={d} className="flex-1 rounded-xl bg-white/5 p-2 text-center border border-white/10">
                      <p className="text-xs text-sky-100/60">{format(date, "EEE")}</p>
                      <p className="text-sm text-white">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, variant }: { label: string; onClick: () => void; variant?: "ghost" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
        variant === "ghost"
          ? "border border-white/10 bg-white/5 text-sky-50 hover:border-sky-300/50"
          : "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-900/30"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-xl shadow-sky-950/30">
      <div className="mb-3 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-2xl bg-gradient-to-br ${accent ?? "from-sky-500 to-cyan-400"} opacity-90`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
