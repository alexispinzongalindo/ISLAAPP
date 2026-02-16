"use client";

import { useMemo, useState } from "react";

type Treatment = {
  name: string;
  category: string;
  desc: string;
  duration: string;
  cost: string;
};

const treatments: Treatment[] = [
  { name: "Preventive Care", category: "Preventive", desc: "Cleanings, exams, fluoride to keep smiles healthy.", duration: "45-60 min", cost: "$90 - $160" },
  { name: "Cosmetic Dentistry", category: "Cosmetic", desc: "Whitening, veneers, bonding for brighter smiles.", duration: "60-120 min", cost: "$250 - $1200" },
  { name: "Restorative", category: "Restorative", desc: "Crowns, bridges, implants to restore function.", duration: "75-150 min", cost: "$900 - $3500" },
  { name: "Orthodontics", category: "Ortho", desc: "Braces & Invisalign® with flexible plans.", duration: "30-90 min", cost: "$150/month+" },
];

const insuranceLogos = ["Aetna", "Cigna", "Delta", "MetLife", "United"];

export default function DentalPage() {
  const [expanded, setExpanded] = useState<string | null>("Preventive Care");
  const [payment, setPayment] = useState(1200);
  const [months, setMonths] = useState(12);
  const [appt, setAppt] = useState({ name: "", phone: "", email: "", type: "Cleaning", time: "Morning" });
  const [confirm, setConfirm] = useState<string | null>(null);

  const monthly = useMemo(() => (months ? (payment / months).toFixed(0) : "0"), [payment, months]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#4A90E2]" />
            <div>
              <div className="text-xl font-semibold text-slate-900">SmileSet Dental</div>
              <div className="text-xs text-slate-500">Preventive • Cosmetic • Ortho</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <span className="rounded-full bg-[#50C878]/10 px-3 py-1 text-[#2C3E50]">Emergency: (555) 123-4444</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Call (555) 123-2222</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-[#F8F9FA] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4A90E2]">SmileSet Demo</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Modern dental care made affordable.</h1>
            <p className="mt-3 text-slate-600">Explore treatments, check financing, and book a visit in minutes.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-xl bg-[#4A90E2] px-4 py-3 text-sm font-semibold text-white" href="#booking">
                Book an appointment
              </a>
              <a className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800" href="#financing">
                See financing
              </a>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div className="rounded-xl bg-white p-3 shadow-sm">✔️ Insurance verification</div>
              <div className="rounded-xl bg-white p-3 shadow-sm">✔️ Secure & HIPAA-friendly</div>
              <div className="rounded-xl bg-white p-3 shadow-sm">✔️ Same-week appointments</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-gradient-to-br from-[#4A90E2] to-[#50C878] p-6 text-white">
              <div className="text-sm font-semibold">Financing Spotlight</div>
              <div className="text-2xl font-bold">$0 down on whitening & Invisalign®</div>
              <p className="mt-2 text-sm text-white/85">Check payments instantly—no impact on credit score.</p>
            </div>
            <div className="space-y-4 bg-white p-6 text-sm text-slate-700" id="financing">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-[#4A90E2] px-3 py-2 text-white">Apply for CareCredit</button>
                <button className="rounded-lg border border-slate-300 px-3 py-2">Explore Payment Plans</button>
                <button className="rounded-lg border border-slate-300 px-3 py-2">Verify Insurance</button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
                <div className="text-xs font-semibold text-slate-600">Monthly payment calculator</div>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <label className="text-xs text-slate-600">
                    Treatment cost
                    <input
                      type="range"
                      min={300}
                      max={5000}
                      step={50}
                      value={payment}
                      onChange={(e) => setPayment(parseInt(e.target.value))}
                      className="w-48"
                    />
                    <span className="ml-2 font-semibold text-slate-800">${payment}</span>
                  </label>
                  <label className="text-xs text-slate-600">
                    Months
                    <input
                      type="range"
                      min={3}
                      max={24}
                      step={1}
                      value={months}
                      onChange={(e) => setMonths(parseInt(e.target.value))}
                      className="w-40"
                    />
                    <span className="ml-2 font-semibold text-slate-800">{months} mo</span>
                  </label>
                  <div className="text-right text-sm">
                    <div className="text-slate-500">Estimated monthly</div>
                    <div className="text-xl font-bold text-[#4A90E2]">${monthly}/mo</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {insuranceLogos.map((i) => (
                  <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                    {i}
                  </span>
                ))}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                No insurance? We've got you covered. Flexible plans and in-house membership.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr] items-start" id="treatments">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Treatments</h2>
              <span className="text-xs text-slate-500">Hover or expand to see details</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {treatments.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.duration}</div>
                    </div>
                    <button
                      className="rounded-full bg-[#50C878] px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => setExpanded(expanded === t.name ? null : t.name)}
                    >
                      {expanded === t.name ? "Hide" : "Learn More"}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">{t.desc}</div>
                  <div className="mt-3 text-sm font-semibold text-[#4A90E2]">{t.cost}</div>
                  {expanded === t.name && (
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600">
                      Before/after gallery placeholder • Benefits • FAQs.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            id="booking"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">Book a visit</h2>
            <p className="text-sm text-slate-600">Pick a time and tell us why you're visiting. We'll confirm ASAP.</p>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex flex-col gap-1">
                Full name
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={appt.name}
                  onChange={(e) => setAppt({ ...appt, name: e.target.value })}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  Phone
                  <input
                    className="rounded border border-slate-300 px-3 py-2"
                    value={appt.phone}
                    onChange={(e) => setAppt({ ...appt, phone: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Email
                  <input
                    className="rounded border border-slate-300 px-3 py-2"
                    value={appt.email}
                    onChange={(e) => setAppt({ ...appt, email: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  Appointment type
                  <select
                    className="rounded border border-slate-300 px-3 py-2"
                    value={appt.type}
                    onChange={(e) => setAppt({ ...appt, type: e.target.value })}
                  >
                    <option>Cleaning</option>
                    <option>Exam</option>
                    <option>Emergency</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Time of day
                  <select
                    className="rounded border border-slate-300 px-3 py-2"
                    value={appt.time}
                    onChange={(e) => setAppt({ ...appt, time: e.target.value })}
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1">
                Reason for visit
                <textarea className="rounded border border-slate-300 px-3 py-2" rows={2} />
              </label>
              <button
                className="mt-2 w-full rounded-xl bg-[#4A90E2] px-4 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setConfirm("Thanks! Your request was sent securely. We'll text you shortly.")}
              >
                Submit request
              </button>
              {confirm && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  {confirm}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
