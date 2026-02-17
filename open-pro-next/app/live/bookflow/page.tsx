"use client";

import { useMemo, useState } from "react";

type HabitStatus = "pending" | "progress" | "done";
type Habit = {
  name: string;
  icon: string;
  target: string;
  status: HabitStatus;
  xp: number;
  best: string;
  progress?: number;
};

const habitsSeed: Habit[] = [
  { name: "Morning Run", icon: "🏃", target: "30 minutes", status: "done", xp: 50, best: "Best time: 6-7 AM (92%)" },
  { name: "Read 20 Pages", icon: "📚", target: "20 pages", status: "progress", xp: 40, best: "8-10 PM (85%)", progress: 12 },
  { name: "Drink 8 Glasses", icon: "💧", target: "8 glasses", status: "progress", xp: 30, best: "Every 2 hrs", progress: 6 },
  { name: "Meditate", icon: "🧘", target: "10 minutes", status: "pending", xp: 40, best: "After coffee" },
  { name: "Healthy Lunch", icon: "🥗", target: "Log meal", status: "done", xp: 35, best: "Consistent 7-day streak" },
  { name: "Sleep by 10:30", icon: "😴", target: "Bedtime", status: "pending", xp: 45, best: "Improves next day +20%" },
];

const insights = [
  "You complete meditation 85% more often right after coffee.",
  "Workout success drops 40% on rainy days — queue an indoor HIIT.",
  "You're 3x more likely to finish all habits when you start before 7 AM.",
  "Reading is your strongest habit this week — perfect 7-day streak!",
];

const badges = [
  { name: "Weekly Warrior", rarity: "Rare", unlocked: true, progress: 100 },
  { name: "Century Club", rarity: "Epic", unlocked: true, progress: 100 },
  { name: "Early Bird", rarity: "Rare", unlocked: true, progress: 100 },
  { name: "Perfect Week", rarity: "Epic", unlocked: false, progress: 60 },
  { name: "Comeback King", rarity: "Legendary", unlocked: false, progress: 25 },
  { name: "Iron Will", rarity: "Legendary", unlocked: false, progress: 10 },
];

const challenges = [
  { title: "Complete 4/5 habits today", reward: "+100 XP", progress: 3, total: 5, type: "Daily" },
  { title: "Finish all habits before 6 PM", reward: "Special badge", progress: 2, total: 6, type: "Daily" },
  { title: "90% completion this week", reward: "Streak Freeze", progress: 62, total: 100, type: "Weekly" },
];

export default function BookflowHabitsDemo() {
  const [habits, setHabits] = useState(habitsSeed);
  const [xp, setXp] = useState(2340);
  const [level, setLevel] = useState(7);
  const [streak, setStreak] = useState(23);
  const xpToNext = 3000;
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));

  const heatmap = useMemo(
    () => [
      { day: "Mon", value: 83 },
      { day: "Tue", value: 100 },
      { day: "Wed", value: 83 },
      { day: "Thu", value: 100 },
      { day: "Fri", value: 67 },
      { day: "Sat", value: 50 },
      { day: "Sun", value: 0 },
    ],
    []
  );

  const toggleHabit = (name: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.name === name
          ? {
              ...h,
              status: h.status === "done" ? "pending" : "done",
              progress: h.status === "done" ? 0 : h.progress ?? h.target.includes("pages") ? 20 : h.target.includes("glasses") ? 8 : undefined,
            }
          : h
      )
    );
    setXp((v) => Math.min(xpToNext, v + 50));
  };

  const simulateLevelUp = () => {
    if (xp >= xpToNext) {
      setLevel((l) => l + 1);
      setXp(200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f2a] via-[#0f183d] to-[#0a122f] text-slate-50">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">NovaHabit · AI + Gamification</p>
            <h1 className="text-3xl font-semibold">AI-driven behavioral insights with rewarding play</h1>
            <p className="text-sm text-slate-200/80">Mobile-first demo · simulated data · no backend.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 font-semibold text-indigo-100">Level {level}: Habit Enthusiast</span>
            <button onClick={simulateLevelUp} className="rounded-full bg-emerald-400 px-3 py-1 font-semibold text-slate-900 hover:bg-emerald-300">
              Simulate level up
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* Hero stats */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200/80">Good evening, Alex</p>
                <h2 className="text-4xl font-semibold">🔥 {streak}-day streak</h2>
                <p className="text-sm text-emerald-200/90">Member 3 months · Total completions: 247</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-indigo-200">XP {xp} / {xpToNext}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-300" style={{ width: `${xpPct}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {habits.map((h) => (
                <button
                  key={h.name}
                  onClick={() => toggleHabit(h.name)}
                  className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                    h.status === "done" ? "border-emerald-300/70 bg-emerald-500/10" : h.status === "progress" ? "border-indigo-300/60 bg-indigo-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <p className="text-base font-semibold text-white">{h.name}</p>
                        <p className="text-sm text-slate-200/80">{h.target}</p>
                        <p className="text-xs text-indigo-200/80">{h.best}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-200/80">
                      <p>{h.status === "done" ? "Completed ✓" : h.status === "progress" ? "In progress" : "Not started"}</p>
                      <p className="font-semibold text-emerald-200">+{h.xp} XP</p>
                    </div>
                  </div>
                  {h.progress !== undefined && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${Math.min(100, (h.progress / (h.target.includes("pages") ? 20 : 8)) * 100)}%` }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card title="Quick stats">
              <Stat label="Weekly completion" value="82%" />
              <Stat label="Best habit" value="Reading (100%)" />
              <Stat label="Risk" value="Meditation on Wed" />
              <Stat label="Next milestone" value="Level 8 in 28 days" />
            </Card>
            <Card title="This week">
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {heatmap.map((d) => (
                  <div key={d.day} className="space-y-1">
                    <div className="mx-auto h-8 w-8 rounded-md" style={{ background: `linear-gradient(135deg, #a855f7 ${d.value}%, #1f2937 ${d.value}%)` }} />
                    <p className="text-slate-300">{d.day}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* AI insights */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-900/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">AI insights</h3>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">Success likelihood: 78%</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {insights.map((insight) => (
                <div key={insight} className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-4 text-sm text-indigo-50">
                  {insight}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-200">
              <p>Risk warning: You often skip habits on Friday evenings — schedule lighter goals.</p>
              <p>Optimal suggestion: Move yoga to 7 AM for +65% completion probability.</p>
            </div>
          </div>
          <Card title="AI weekly summary">
            <p className="text-sm text-slate-200">Grade: A</p>
            <p className="text-sm text-emerald-200">Strong: Reading (perfect streak)</p>
            <p className="text-sm text-amber-200">Improve: Meditation (62%)</p>
            <p className="text-sm text-indigo-200">Motivation: “You’re on track for Level 10 in 28 days.”</p>
          </Card>
        </section>

        {/* Badges & challenges */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-900/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Badges</h3>
              <span className="text-sm text-slate-200">8 / 25 earned</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {badges.map((b) => (
                <div key={b.name} className={`rounded-xl border p-3 text-left text-sm transition ${b.unlocked ? "border-emerald-300/60 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                  <p className="font-semibold text-white">{b.name}</p>
                  <p className="text-xs text-slate-200/80">{b.rarity}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${b.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card title="Challenges">
            <div className="space-y-3">
              {challenges.map((c) => (
                <div key={c.title} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{c.title}</p>
                    <span className="text-xs text-indigo-200">{c.type}</span>
                  </div>
                  <p className="text-xs text-slate-300">Reward: {c.reward}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${(c.progress / c.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Coach + premium + metrics */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card title="Coach Nova">
            <p className="text-sm text-slate-200">“Only 2 habits left today! You’re close to a Perfect Week badge.”</p>
            <p className="text-sm text-indigo-200">Tip: Stack meditation after your run to hit 90% success.</p>
            <p className="text-sm text-emerald-200">Nudge: “It’s 6:30 AM — optimal time for your run.”</p>
          </Card>
          <Card title="Premium preview">
            <ul className="space-y-2 text-sm text-slate-200">
              <li>🔒 Advanced AI insights</li>
              <li>🔒 Unlimited habits & streak protection</li>
              <li>🔒 Exportable analytics & premium themes</li>
            </ul>
            <p className="mt-3 text-sm font-semibold text-indigo-200">$9.99/mo · $79.99/yr</p>
          </Card>
          <Card title="Success metrics">
            <Stat label="Overall success" value="78% (↑12%)" />
            <Stat label="Total XP" value="12,450" />
            <Stat label="Ranking" value="Top 15%" />
          </Card>
        </section>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-indigo-900/20">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-200/70">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

