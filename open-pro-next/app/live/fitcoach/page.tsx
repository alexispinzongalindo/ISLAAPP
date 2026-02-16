"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type ThemeKey = "energetic" | "calm" | "bold" | "ocean";

const themes: Record<
  ThemeKey,
  { primary: string; secondary: string; accent: string; background: string; text: string; name: string }
> = {
  energetic: {
    primary: "#FF6B35",
    secondary: "#F7931E",
    accent: "#FFD23F",
    background: "#FFF8F0",
    text: "#1A1A1A",
    name: "Energetic Orange",
  },
  calm: {
    primary: "#06D6A0",
    secondary: "#1B9AAA",
    accent: "#EF476F",
    background: "#F8FFF4",
    text: "#2D3142",
    name: "Calm Mint",
  },
  bold: {
    primary: "#7C3AED",
    secondary: "#9333EA",
    accent: "#C084FC",
    background: "#F7F2FF",
    text: "#1A1024",
    name: "Bold Purple",
  },
  ocean: {
    primary: "#0EA5E9",
    secondary: "#0284C7",
    accent: "#38BDF8",
    background: "#F2FBFF",
    text: "#0B1B2C",
    name: "Ocean Blue",
  },
};

type CheckIn = {
  week: number;
  mood: number;
  wins: string;
  challenges: string;
  weightChange?: string;
};

const initialCheckins: CheckIn[] = [
  { week: 7, mood: 5, wins: "Great energy, lost 2lbs, completed all workouts", challenges: "None", weightChange: "-2 lbs" },
  { week: 6, mood: 3, wins: "Stayed on nutrition", challenges: "Missed 1 workout", weightChange: "-1 lb" },
  { week: 5, mood: 4, wins: "New personal record, feeling strong", challenges: "Sleep was short", weightChange: "-1 lb" },
];

const progressData = {
  weight: [185, 183, 181, 179, 178, 177, 176, 175],
  energy: [3, 3, 4, 4, 4, 5, 5, 5],
  workouts: { done: 32, total: 36 },
  habits: 85,
};

const billingHistory = [
  { month: "Jan 2026", amount: "$79", plan: "Pro Plan" },
  { month: "Dec 2025", amount: "$79", plan: "Pro Plan" },
  { month: "Nov 2025", amount: "$79", plan: "Pro Plan" },
];

export default function FitCoachPage() {
  const [theme, setTheme] = useState<ThemeKey>("energetic");
  const [checkins, setCheckins] = useState<CheckIn[]>(initialCheckins);
  const [form, setForm] = useState({ mood: 4, wins: "", challenges: "", weight: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currentWeek = 8;

  useEffect(() => {
    const saved = localStorage.getItem("fitcoach-theme");
    if (saved && themes[saved as ThemeKey]) setTheme(saved as ThemeKey);
  }, []);
  useEffect(() => {
    localStorage.setItem("fitcoach-theme", theme);
  }, [theme]);

  const coachMessage = useMemo(() => {
    const messages = [
      "Great momentum, Jordan! Let's nail sleep hygiene this week.",
      "You're 8/12 weeks into Transform 90 — finish strong.",
      "Coach Alex: proud of your consistency. Keep protein high and hydration steady.",
    ];
    return messages[currentWeek % messages.length];
  }, [currentWeek]);

  const handleSubmit = () => {
    if (!form.wins.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newEntry: CheckIn = {
        week: currentWeek,
        mood: form.mood,
        wins: form.wins,
        challenges: form.challenges,
        weightChange: form.weight ? form.weight : undefined,
      };
      setCheckins([newEntry, ...checkins]);
      setSubmitting(false);
      setSubmitted(true);
      setForm({ mood: 4, wins: "", challenges: "", weight: "" });
      setTimeout(() => setSubmitted(false), 1500);
    }, 900);
  };

  const palette = themes[theme];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: palette.background, color: palette.text }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.secondary }}>
              FitCoach Demo
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl" style={{ color: palette.text }}>
              Coaching that adapts to your brand
            </h1>
            <p className="text-sm opacity-80">
              Themeable dashboard, weekly check-ins, progress tracking, and billing in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ThemeSwitcher value={theme} onChange={setTheme} />
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition"
              style={{ background: palette.primary, color: "#fff" }}
              onClick={() => (window.location.href = "/agent?template=fitcoach&source=live_demo")}
            >
              Customize with AI
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="Dashboard" palette={palette} className="md:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Current Plan" value="Transform 90" sub="Week 8 / 12" palette={palette} />
              <Stat label="Coach" value="Alex Rivera" sub="Next check-in: Fri 7pm" palette={palette} />
              <Stat label="Streak" value="6 weeks" sub="Consistent check-ins" palette={palette} />
              <Stat label="Workouts" value="32 / 36" sub="89% complete" palette={palette} />
            </div>
            <div className="mt-4 rounded-2xl p-4" style={{ background: "#fff", color: "#111" }}>
              <p className="text-sm font-semibold" style={{ color: palette.primary }}>
                Coach message
              </p>
              <p className="text-sm">{coachMessage}</p>
            </div>
          </Card>

          <Card title="Billing" palette={palette}>
            <BillingWidget palette={palette} />
          </Card>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Card title="Weekly check-in" palette={palette} className="md:col-span-2">
            <CheckInForm
              palette={palette}
              form={form}
              setForm={setForm}
              submitting={submitting}
              submitted={submitted}
              onSubmit={handleSubmit}
            />
          </Card>
          <Card title="Check-in history" palette={palette}>
            <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
              {checkins.map((c) => (
                <div key={c.week} className="rounded-xl border p-3" style={{ borderColor: palette.secondary, background: "#fff" }}>
                  <p className="text-sm font-semibold" style={{ color: palette.primary }}>
                    Week {c.week}
                  </p>
                  <p className="text-xs opacity-70">Mood: {c.mood}/5 {c.weightChange ? `· ${c.weightChange}` : ""}</p>
                  <p className="text-sm mt-1">Wins: {c.wins}</p>
                  <p className="text-sm opacity-80">Challenges: {c.challenges || "—"}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card title="Progress" palette={palette} className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              <ProgressCard
                title="Weight trend"
                palette={palette}
                values={progressData.weight}
                formatter={(v) => `${v} lbs`}
                footer="Start 185 → Current 175"
              />
              <ProgressCard
                title="Energy levels"
                palette={palette}
                values={progressData.energy}
                formatter={(v) => `W${progressData.energy.indexOf(v) + 1}: ${v}`}
                footer="High the last 3 weeks"
              />
              <div className="rounded-2xl border p-3" style={{ borderColor: palette.secondary, background: "#fff" }}>
                <p className="text-sm font-semibold" style={{ color: palette.primary }}>
                  Habits & badges
                </p>
                <p className="text-sm mt-2">Habits: 85% consistency</p>
                <p className="text-sm">Goals achieved: 7</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {["Momentum", "Hydration", "Consistency"].map((b) => (
                    <span
                      key={b}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: palette.accent, color: palette.text }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Plan overview" palette={palette}>
            <PlanOverview palette={palette} />
          </Card>
        </section>
      </div>
    </div>
  );
}

function ThemeSwitcher({ value, onChange }: { value: ThemeKey; onChange: (v: ThemeKey) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold opacity-70">Theme</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(themes) as ThemeKey[]).map((k) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="rounded-full px-3 py-2 text-xs font-semibold shadow transition"
            style={{
              background: themes[k].primary,
              color: "#fff",
              opacity: value === k ? 1 : 0.8,
              border: value === k ? "2px solid #fff" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {themes[k].name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  palette,
  className,
}: {
  title: string;
  children: React.ReactNode;
  palette: (typeof themes)[ThemeKey];
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-xl transition-colors duration-300 ${className ?? ""}`}
      style={{ borderColor: palette.secondary, background: "#fff" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, palette }: { label: string; value: string; sub?: string; palette: any }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: palette.secondary, background: "#fff" }}
    >
      <p className="text-xs font-semibold" style={{ color: palette.secondary }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: palette.text }}>
        {value}
      </p>
      {sub && <p className="text-xs opacity-70">{sub}</p>}
    </div>
  );
}

function CheckInForm({
  palette,
  form,
  setForm,
  submitting,
  submitted,
  onSubmit,
}: {
  palette: any;
  form: { mood: number; wins: string; challenges: string; weight: string };
  setForm: (f: any) => void;
  submitting: boolean;
  submitted: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold" style={{ color: palette.text }}>
        Mood / energy
        <div className="mt-1 flex gap-2">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              onClick={() => setForm({ ...form, mood: m })}
              className="h-9 w-9 rounded-full text-sm font-semibold"
              style={{
                background: form.mood === m ? palette.primary : "#f3f4f6",
                color: form.mood === m ? "#fff" : "#111",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </label>
      <Input
        label="Weekly wins"
        value={form.wins}
        onChange={(v) => setForm({ ...form, wins: v })}
        palette={palette}
        required
      />
      <Input
        label="Challenges"
        value={form.challenges}
        onChange={(v) => setForm({ ...form, challenges: v })}
        palette={palette}
      />
      <Input
        label="Weight change (e.g., -1 lb)"
        value={form.weight}
        onChange={(v) => setForm({ ...form, weight: v })}
        palette={palette}
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={submitting || !form.wins.trim()}
          className="rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition disabled:opacity-60"
          style={{ background: palette.primary, color: "#fff" }}
        >
          {submitting ? "Submitting..." : "Complete This Week's Check-In"}
        </button>
        <AnimatePresence>
          {submitted && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm font-semibold"
              style={{ color: palette.secondary }}
            >
              Saved ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  palette,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: any;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold" style={{ color: palette.text }}>
      {label} {required && <span className="text-red-500">*</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={label === "Weekly wins" || label === "Challenges" ? 2 : 1}
        className="mt-1 w-full rounded-2xl border px-3 py-2 text-sm"
        style={{ borderColor: palette.secondary, background: "#fff", color: palette.text }}
      />
    </label>
  );
}

function ProgressCard({
  title,
  values,
  palette,
  formatter,
  footer,
}: {
  title: string;
  values: number[];
  palette: any;
  formatter: (v: number) => string;
  footer?: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: palette.secondary, background: "#fff" }}>
      <p className="text-sm font-semibold" style={{ color: palette.primary }}>
        {title}
      </p>
      <div className="mt-3 h-28 flex items-end gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${((v - min) / (max - min || 1)) * 90 + 20}px`,
                background: palette.secondary,
                transition: "height 0.3s ease",
              }}
              title={formatter(v)}
            />
            <span className="text-[10px] opacity-70">W{i + 1}</span>
          </div>
        ))}
      </div>
      {footer && <p className="text-xs mt-2 opacity-70">{footer}</p>}
    </div>
  );
}

function BillingWidget({ palette }: { palette: any }) {
  const [annual, setAnnual] = useState(false);
  const price = annual ? "$790/yr" : "$79/mo";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: palette.primary }}>
            Pro Plan
          </p>
          <p className="text-xs opacity-70">Next billing: Mar 15, 2026 · Card ···· 4242</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          Monthly
          <input type="checkbox" checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
          Annual
        </label>
      </div>
      <p className="text-3xl font-bold" style={{ color: palette.text }}>
        {price}
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-full px-3 py-2 text-xs font-semibold shadow"
          style={{ background: palette.primary, color: "#fff" }}
        >
          Upgrade
        </button>
        <button
          className="rounded-full px-3 py-2 text-xs font-semibold border"
          style={{ borderColor: palette.secondary, color: palette.text }}
        >
          Downgrade
        </button>
      </div>
      <div className="rounded-2xl border p-3" style={{ borderColor: palette.secondary, background: "#fff" }}>
        <p className="text-xs font-semibold" style={{ color: palette.primary }}>
          Billing history
        </p>
        <div className="mt-2 space-y-1 text-xs opacity-80">
          {billingHistory.map((b) => (
            <div key={b.month} className="flex justify-between">
              <span>{b.month}</span>
              <span>{b.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanOverview({ palette }: { palette: any }) {
  const habits = ["Water 3L", "Sleep 7-8h", "Protein 160g", "Walk 8k steps"];
  const workouts = ["Mon: Push", "Tue: Pull", "Thu: Legs", "Sat: Conditioning"];
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold" style={{ color: palette.primary }}>
        Transform 90 · Week 8/12
      </p>
      <div className="space-y-1 text-sm opacity-80">
        <p>Nutrition: 40/30/30, whole foods, high protein</p>
        <p>Focus: Strength + conditioning</p>
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: palette.secondary }}>
          Workouts
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {workouts.map((w) => (
            <span key={w} className="rounded-full px-3 py-1 text-xs border" style={{ borderColor: palette.secondary }}>
              {w}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: palette.secondary }}>
          Habits
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {habits.map((h) => (
            <label
              key={h}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs border"
              style={{ borderColor: palette.secondary }}
            >
              <input type="checkbox" defaultChecked /> {h}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: palette.secondary }}>
          Milestones
        </p>
        <div className="mt-1 flex gap-2">
          {["Week 4", "Week 8", "Week 12"].map((m, i) => (
            <div
              key={m}
              className="flex-1 rounded-xl border px-2 py-2 text-center text-xs font-semibold"
              style={{
                borderColor: palette.secondary,
                background: i < 2 ? palette.accent : "#f3f4f6",
                color: i < 2 ? palette.text : "#555",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
