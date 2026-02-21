"use client";

import { useMemo, useState } from "react";

type Habit = {
  name: string;
  icon: string;
  target: string;
  status: "pending" | "progress" | "done";
  xp: number;
  best: string;
};

const starterHabits: Habit[] = [
  { name: "Morning Run", icon: "🏃", target: "30 minutes", status: "done", xp: 50, best: "6-7 AM · 92%" },
  { name: "Read 20 Pages", icon: "📚", target: "20 pages", status: "progress", xp: 40, best: "8-10 PM · 85%" },
  { name: "Drink Water", icon: "💧", target: "8 glasses", status: "progress", xp: 30, best: "Every 2 hrs" },
  { name: "Meditate", icon: "🧘", target: "10 minutes", status: "pending", xp: 40, best: "After coffee" },
  { name: "Healthy Lunch", icon: "🥗", target: "Log meal", status: "done", xp: 35, best: "12-1 PM" },
  { name: "Sleep by 10:30", icon: "😴", target: "Bedtime", status: "pending", xp: 45, best: "10-10:30 PM" },
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
  { title: "Complete 4/5 habits today", reward: "+100 XP", type: "Daily", progress: 3, total: 5 },
  { title: "Finish all habits before 6 PM", reward: "Special badge", type: "Daily", progress: 2, total: 6 },
  { title: "Achieve 90% completion this week", reward: "Streak Freeze", type: "Weekly", progress: 62, total: 100 },
];

const insights = [
  "You complete meditation 85% more often right after coffee.",
  "Workout success drops 40% on rainy days — schedule indoor HIIT.",
  "You’re 3x more likely to finish all habits when you start before 7 AM.",
  "Reading is your strongest habit this week — perfect 7-day streak!",
];

export default function HabitsLive() {
  const [habits, setHabits] = useState(starterHabits);
  const [xp, setXp] = useState(2340);
  const [streak, setStreak] = useState(23);
  const [level, setLevel] = useState(7);
  const [selectedBadge, setSelectedBadge] = useState(badges[0]);

  const weeklyCompletion = 82;
  const successRate = 78;

  const xpNeeded = 3000;
  const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));

  const toggleHabit = (name: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.name === name
          ? { ...h, status: h.status === "done" ? "pending" : "done" }
          : h
      )
    );
    setXp((x) => Math.min(x + 50, xpNeeded));
  };

  const levelUp = () => {
    if (xp >= xpNeeded) {
      setLevel((l) => l + 1);
      setXp(200); // carryover demo
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500/80">NovaHabit · AI + Gamification</p>
            <h1 className="text-2xl font-semibold">AI-driven behavioral insights with rewarding play</h1>
            <p className="text-sm text-slate-500">Mobile-first demo, simulated data, no backend required.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700">Level {level}: Habit Enthusiast</span>
            <button onClick={levelUp} className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-500">Simulate level-up</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        {/* Dashboard */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Good evening, Alex</p>
                <h2 className="text-3xl font-semibold">🔥 {streak}-day streak</h2>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-indigo-600">XP: {xp} / {xpNeeded}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" style={{ width: `${xpPct}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {habits.map((h) => (
                <button
                  key={h.name}
                  onClick={() => toggleHabit(h.name)}
                  className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                    h.status === "done"
                      ? "border-emerald-200 bg-emerald-50"
                      : h.status === "progress"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <p className="text-base font-semibold">{h.name}</p>
                        <p className="text-sm text-slate-500">{h.target}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{h.best}</p>
                      <p className="font-semibold text-indigo-600">+{h.xp} XP</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card title="Quick stats">
              <Stat label="Weekly completion" value={`${weeklyCompletion}%`} />
              <Stat label="Habits completed (mo)" value="247" />
              <Stat label="Community rank" value="Top 15%" />
              <Stat label="Next milestone" value="Level 8 in 28 days" />
            </Card>
            <Card title="This week">
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {heatmap.map((d) => (
                  <div key={d.day} className="space-y-1">
                    <div className="mx-auto h-8 w-8 rounded-md" style={{ background: `linear-gradient(135deg, #7c3aed ${d.value}%, #e5e7eb ${d.value}%)` }} />
                    <p className="text-slate-500">{d.day}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* AI insights */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">AI insights</h3>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Success likelihood: 78%</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {insights.map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {i}
                </div>
              ))}
            </div>
          </div>
          <Card title="AI summary">
            <p className="text-sm text-slate-600">Grade: A</p>
            <p className="text-sm text-emerald-600">Strong: Reading (100% this week)</p>
            <p className="text-sm text-amber-600">Improve: Meditation (62%)</p>
            <p className="text-sm text-slate-600">Motivation: “You’re on track for Level 10 in 28 days.”</p>
          </Card>
        </section>

        {/* Badges & challenges */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Badges</h3>
              <span className="text-sm text-slate-500">8 / 25 earned</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {badges.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBadge(b)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    b.unlocked ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.rarity}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${b.progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">Selected: {selectedBadge.name}</p>
          </div>

          <Card title="Challenges">
            <div className="space-y-3">
              {challenges.map((c) => (
                <div key={c.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{c.title}</p>
                    <span className="text-xs text-indigo-600">{c.type}</span>
                  </div>
                  <p className="text-xs text-slate-500">Reward: {c.reward}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500" style={{ width: `${(c.progress / c.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Coach + premium */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card title="Coach Nova">
            <p className="text-sm text-slate-600">“Only 2 habits left today! You’re close to a Perfect Week badge.”</p>
            <p className="mt-2 text-sm text-slate-600">Tip: Stack meditation after your run to hit 90% success.</p>
          </Card>
          <Card title="Premium preview">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>🔒 Advanced AI insights</li>
              <li>🔒 Unlimited habits & streak protection</li>
              <li>🔒 Exportable analytics & premium themes</li>
            </ul>
            <p className="mt-3 text-sm font-semibold text-indigo-600">$9.99/mo · $79.99/yr</p>
          </Card>
          <Card title="Success metrics">
            <Stat label="Overall success" value={`${successRate}% (+12%)`} />
            <Stat label="Best habit" value="Morning Run (95%)" />
            <Stat label="Needs work" value="Meditation (62%)" />
          </Card>
        </section>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

