"use client";

import {
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Dose = { id: string; time: string; withFood?: boolean };
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
};
type Persona = { id: string; name: string; theme: string };
type HistoryItem = { medId: string; doseId: string; ts: number; status: "taken" | "missed" | "snoozed" };

const personas: Persona[] = [
  { id: "p1", name: "Mom", theme: "from-sky-500 via-sky-400 to-cyan-300" },
  { id: "p2", name: "Dad", theme: "from-indigo-500 via-indigo-400 to-purple-300" },
  { id: "p3", name: "John", theme: "from-emerald-500 via-emerald-400 to-teal-300" },
];

const seedMeds: Medication[] = [
  { id: "m1", name: "Lisinopril", dosage: "10 mg", form: "pill", color: "#1d4ed8", schedule: [{ id: "d1", time: "08:00" }], stock: 18, refillDate: "2026-02-20", pharmacy: "WellCare Pharmacy", personaId: "p1" },
  { id: "m2", name: "Metformin", dosage: "500 mg", form: "pill", color: "#0ea5e9", schedule: [{ id: "d1", time: "08:00", withFood: true }, { id: "d2", time: "18:00", withFood: true }], stock: 32, refillDate: "2026-02-28", pharmacy: "City Health Rx", personaId: "p1" },
  { id: "m3", name: "Vitamin D", dosage: "2000 IU", form: "pill", color: "#f59e0b", schedule: [{ id: "d1", time: "09:00" }], stock: 8, refillDate: "2026-02-17", pharmacy: "Sunrise Pharmacy", personaId: "p2" },
  { id: "m4", name: "Atorvastatin", dosage: "20 mg", form: "pill", color: "#7c3aed", schedule: [{ id: "d1", time: "21:00" }], stock: 25, refillDate: "2026-02-27", pharmacy: "Prime Rx", personaId: "p3" },
];

type HistoryAction =
  | { type: "SET"; history: HistoryItem[] }
  | { type: "TAKE"; medId: string; doseId: string; ts: number }
  | { type: "SNOOZE"; medId: string; doseId: string; ts: number }
  | { type: "MISS"; medId: string; doseId: string; ts: number };

function historyReducer(state: HistoryItem[], action: HistoryAction): HistoryItem[] {
  switch (action.type) {
    case "SET":
      return action.history;
    case "TAKE":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "taken" }];
    case "SNOOZE":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "snoozed" }];
    case "MISS":
      return [...state, { medId: action.medId, doseId: action.doseId, ts: action.ts, status: "missed" }];
    default:
      return state;
  }
}

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}

export default function MedTrackPage() {
  const [personaId, setPersonaId] = useState<Persona["id"]>("p1");
  const [history, dispatch] = useReducer(historyReducer, []);
  const [meds, setMeds] = useState<Medication[]>(seedMeds);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", form: "pill", color: "#0ea5e9", times: "08:00", stock: 30, refillDate: "2026-02-28", pharmacy: "" });
  const now = useNow(5000);

  // hydrate localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("medtrack-meds");
    if (saved) {
      try { setMeds(JSON.parse(saved)); } catch (_) { /* noop */ }
    }
    const rawHist = localStorage.getItem("medtrack-history");
    if (rawHist) {
      try { dispatch({ type: "SET", history: JSON.parse(rawHist) }); } catch (_) { /* noop */ }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("medtrack-meds", JSON.stringify(meds));
  }, [meds]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("medtrack-history", JSON.stringify(history));
  }, [history]);

  const persona = personas.find((p) => p.id === personaId) ?? personas[0];
  const personaMeds = useMemo(() => meds.filter((m) => m.personaId === personaId), [meds, personaId]);

  const schedule = useMemo(() => {
    const items: { med: Medication; dose: Dose; ts: Date; status: "past" | "now" | "upcoming"; hist?: HistoryItem }[] = [];
    personaMeds.forEach((med) => {
      med.schedule.forEach((dose) => {
        const [h, m] = dose.time.split(":").map(Number);
        const ts = new Date(now);
        ts.setHours(h, m ?? 0, 0, 0);
        const hist = history.find((h) => isSameDay(new Date(h.ts), ts) && h.medId === med.id && h.doseId === dose.id);
        const status = ts.getTime() < now.getTime() ? "past" : Math.abs(ts.getTime() - now.getTime()) <= 45 * 60 * 1000 ? "now" : "upcoming";
        items.push({ med, dose, ts, status, hist });
      });
    });
    return items.sort((a, b) => a.ts.getTime() - b.ts.getTime());
  }, [personaMeds, history, now]);

  const nextDose = schedule.find((s) => s.status !== "past");
  const nextCountdown = nextDose ? Math.max(0, differenceInMinutes(nextDose.ts, now)) : null;

  const adherence = useMemo(() => {
    const total = schedule.length;
    const taken = schedule.filter((s) => s.hist?.status === "taken").length;
    const rate = total === 0 ? 0 : Math.round((taken / total) * 100);
    // streak: consecutive days with 100% adherence (last 14 days)
    const days = eachDayOfInterval({ start: addDays(startOfDay(now), -13), end: startOfDay(now) }).reverse();
    let streak = 0;
    for (const day of days) {
      const dayTotal = schedule.filter((s) => isSameDay(s.ts, day)).length || 1;
      const dayTaken = schedule.filter((s) => isSameDay(s.ts, day) && s.hist?.status === "taken").length;
      if (dayTaken === dayTotal) streak += 1;
      else break;
    }
    return { rate, taken, total, streak };
  }, [schedule, now]);

  const refillList = useMemo(() => personaMeds.map((m) => {
    const daysLeft = Math.max(0, differenceInMinutes(new Date(m.refillDate), now) / 1440);
    return { med: m, daysLeft: Math.round(daysLeft) };
  }), [personaMeds, now]);

  const handleAction = (medId: string, doseId: string, status: HistoryItem["status"]) => {
    const ts = Date.now();
    if (status === "taken") dispatch({ type: "TAKE", medId, doseId, ts });
    if (status === "snoozed") dispatch({ type: "SNOOZE", medId, doseId, ts });
    if (status === "missed") dispatch({ type: "MISS", medId, doseId, ts });
  };

  const addMedication = () => {
    const times = form.times.split(",").map((t, idx) => ({ id: `d${idx + 1}`, time: t.trim() })).filter((t) => t.time);
    const newMed: Medication = {
      id: `m${Date.now()}`,
      name: form.name || "New medication",
      dosage: form.dosage || "N/A",
      form: form.form as Medication["form"],
      color: form.color || "#0ea5e9",
      schedule: times.length ? times : [{ id: "d1", time: "08:00" }],
      stock: form.stock || 30,
      refillDate: form.refillDate || format(addDays(now, 14), "yyyy-MM-dd"),
      pharmacy: form.pharmacy || "Preferred pharmacy",
      personaId,
    };
    setMeds((prev) => [...prev, newMed]);
    setFormOpen(false);
  };

  const removeMed = (id: string) => setMeds((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">MedTrack Demo</p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Medication Manager that feels trustworthy</h1>
            <p className="text-sky-100/70 mt-1">Clinical aesthetic, adherence tools, refill tracking, multi‑persona.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
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
            <Card title="Today’s schedule" accent={persona.theme}>
              <div className="flex items-center justify-between text-sm text-sky-100/80 mb-3">
                <span>Current time: {format(now, "p")}</span>
                <span>Adherence: {adherence.rate}% · Streak {adherence.streak}d</span>
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
                      {item.hist?.status === "taken" && <Badge label="Taken" />}
                      {item.hist?.status === "snoozed" && <Badge label="Snoozed" />}
                      {!item.hist && (
                        <>
                          <ActionButton label="Take" onClick={() => handleAction(item.med.id, item.dose.id, "taken")} />
                          <ActionButton label="Snooze" variant="ghost" onClick={() => handleAction(item.med.id, item.dose.id, "snoozed")} />
                          <ActionButton label="Miss" variant="ghost" onClick={() => handleAction(item.med.id, item.dose.id, "missed")} />
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card title="Medications" accent={persona.theme}>
              <div className="mb-3 flex justify-between">
                <button
                  className="rounded-full bg-white/10 px-3 py-2 text-xs text-white border border-white/10 hover:border-sky-300/60"
                  onClick={() => setFormOpen(true)}
                >
                  + Add medication
                </button>
              </div>
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
                        <button className="text-xs text-red-200 hover:text-red-100" onClick={() => removeMed(m.id)}>Delete</button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-sky-100/70">
                        <Badge label={`${m.schedule.length}x/day`} />
                        {next && <Badge label={`Next: ${next.time}`} />}
                        <Badge label={`Stock: ${m.stock}`} />
                        {low && <Badge label="Low stock" />}
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
                  <p className="text-sm text-sky-100/80">Due {format(nextDose.ts, "p")} (in {nextCountdown} min)</p>
                  <p className="text-lg font-semibold text-white">{nextDose.med.name} · {nextDose.med.dosage}</p>
                  <div className="flex gap-2">
                    <ActionButton label="Take now" onClick={() => handleAction(nextDose.med.id, nextDose.dose.id, "taken")} />
                    <ActionButton label="Snooze 10m" variant="ghost" onClick={() => handleAction(nextDose.med.id, nextDose.dose.id, "snoozed")} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-sky-100/70">All doses complete today. 🎉</p>
              )}
            </Card>

            <Card title="Refill tracker" accent={persona.theme}>
              <div className="space-y-2">
                {refillList.map(({ med, daysLeft }) => (
                  <div key={med.id} className="flex items-center justify-between text-sm text-sky-100/80">
                    <span>{med.name}</span>
                    <span className={daysLeft <= 3 ? "text-amber-200" : "text-white"}>{daysLeft} days</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Adherence calendar" accent={persona.theme}>
              <div className="grid grid-cols-7 gap-1 text-center">
                {eachDayOfInterval({ start: addDays(startOfDay(now), -13), end: startOfDay(now) }).map((day) => {
                  const dayTotal = schedule.filter((s) => isSameDay(s.ts, day)).length || 1;
                  const dayTaken = schedule.filter((s) => isSameDay(s.ts, day) && s.hist?.status === "taken").length;
                  const pct = Math.round((dayTaken / dayTotal) * 100);
                  const tone = pct === 100 ? "bg-emerald-500/70" : pct >= 70 ? "bg-sky-500/50" : "bg-amber-500/50";
                  return (
                    <div key={day.toISOString()} className={`rounded-lg px-2 py-3 text-xs text-white ${tone}`}>
                      <div className="text-[10px] opacity-80">{format(day, "EEE")}</div>
                      <div className="font-semibold">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add medication</h3>
                <button className="text-slate-200 hover:text-white" onClick={() => setFormOpen(false)}>✕</button>
              </div>
              <div className="space-y-3 text-sm text-white">
                <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input label="Dosage" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Form" value={form.form} onChange={(v) => setForm({ ...form, form: v })} />
                  <Input label="Color" type="color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
                </div>
                <Input label="Times (comma separated)" value={form.times} onChange={(v) => setForm({ ...form, times: v })} />
                <Input label="Stock" type="number" value={String(form.stock)} onChange={(v) => setForm({ ...form, stock: Number(v) })} />
                <Input label="Refill date" type="date" value={form.refillDate} onChange={(v) => setForm({ ...form, refillDate: v })} />
                <Input label="Pharmacy" value={form.pharmacy} onChange={(v) => setForm({ ...form, pharmacy: v })} />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <ActionButton label="Cancel" variant="ghost" onClick={() => setFormOpen(false)} />
                <ActionButton label="Save" onClick={addMedication} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ color, form }: { color: string; form: Medication["form"] }) {
  return (
    <div
      className="h-6 w-12 rounded-full border border-white/20 shadow-inner shadow-black/30 flex items-center justify-center text-[10px] uppercase text-white/80"
      style={{ background: color }}
    >
      {form}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-sky-50 border border-white/10">{label}</span>;
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

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm text-slate-100">
      <span className="mb-1 block text-sky-100/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:outline-none"
      />
    </label>
  );
}
