"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const practiceAreas = [
  {
    title: "Personal Injury",
    desc: "Car accidents, slip & fall, workplace injuries, premises liability.",
    duration: "1-2 hr discovery",
    cost: "$0 retainer · contingency available",
  },
  {
    title: "Family Law",
    desc: "Divorce, custody, adoption, prenuptial agreements, support matters.",
    duration: "60-90 min consult",
    cost: "Flat + installment options",
  },
  {
    title: "Criminal Defense",
    desc: "DUI, misdemeanors, felonies, record sealing, expungements.",
    duration: "Urgent same-day slots",
    cost: "Fixed + payment plan",
  },
  {
    title: "Business Law",
    desc: "Contracts, formations, disputes, employment, compliance reviews.",
    duration: "45-60 min consult",
    cost: "GC subscription or hourly",
  },
  {
    title: "Estate Planning",
    desc: "Wills, trusts, probate guidance, beneficiary reviews, special needs.",
    duration: "60 min design session",
    cost: "Bundled family plans",
  },
  {
    title: "Real Estate",
    desc: "Transactions, lease reviews, landlord/tenant, boundary disputes.",
    duration: "30-60 min review",
    cost: "Flat review + add-ons",
  },
];

const paymentPlans = [
  { label: "Apply for CareCredit", href: "#financing" },
  { label: "Explore Payment Plans", href: "#financing" },
  { label: "Verify Insurance", href: "#financing" },
];

const steps = ["Case Type", "Case Details", "Contact", "Confirmation"];

export default function LawDemoPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    caseType: "",
    description: "",
    incidentDate: "",
    legalAction: "no",
    urgency: "Within a week",
    name: "",
    phone: "",
    email: "",
    contactMethod: "phone",
    bestTime: "Morning",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculator = useMemo(() => {
    const amount = 6000;
    const term = 18;
    const apr = 7.9 / 100 / 12;
    const monthly = (amount * apr) / (1 - Math.pow(1 + apr, -term));
    return { amount, term, apr: 7.9, monthly: Math.round(monthly) };
  }, []);

  const validate = (currentStep: number) => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 0 && !form.caseType) nextErrors.caseType = "Pick a practice area";
    if (currentStep === 1) {
      if (!form.description.trim()) nextErrors.description = "Add a brief case summary";
      if (!form.incidentDate) nextErrors.incidentDate = "Select a date";
    }
    if (currentStep === 2) {
      if (!form.name.trim()) nextErrors.name = "Name is required";
      if (!form.phone.trim()) nextErrors.phone = "Phone is required";
      if (!form.email.trim()) nextErrors.email = "Email is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate(step)) return;
    if (step === steps.length - 1) {
      setSubmitted(true);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const field = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-[#0b1626] text-slate-100 min-h-screen">
      <header className="border-b border-white/5 bg-[#0f1f37]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Briefly · Law</p>
            <h1 className="text-2xl font-semibold">Results-first law firm website</h1>
          </div>
          <div className="flex gap-2">
            <a href="#consult" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">Book consultation</a>
            <Link href="/templates/law" className="rounded-full border border-white/10 px-4 py-2 text-sm hover:border-amber-300/70">Template detail</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#11294a] via-[#0f1f37] to-[#0a1424] p-8 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300/90">Hero & Trust</p>
              <h2 className="text-3xl font-semibold leading-tight">Your rights. Our fight. Your victory.</h2>
              <p className="text-slate-200/80">Modular hero with proof points, awards, and bar badges. Swap imagery and accent colors without breaking the consultation flow.</p>
              <div className="flex flex-wrap gap-3 text-sm text-amber-100/90">
                <span className="rounded-full border border-amber-300/50 px-3 py-1">15+ years / 1,200+ cases</span>
                <span className="rounded-full border border-amber-300/50 px-3 py-1">4.9★ client reviews</span>
                <span className="rounded-full border border-amber-300/50 px-3 py-1">Free consultation</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-amber-200">Financing Preview</h3>
              <p className="text-slate-200/80 text-sm">Monthly payment calculator with insurance verification. Customize copy and accepted plans.</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-amber-200/80">Estimated case value</p>
                  <p className="text-xl font-semibold">${calculator.amount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-amber-200/80">Monthly (sample)</p>
                  <p className="text-xl font-semibold">${calculator.monthly}/mo</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-amber-200/80">Term</p>
                  <p className="text-lg font-semibold">{calculator.term} months</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-amber-200/80">APR</p>
                  <p className="text-lg font-semibold">{calculator.apr}%</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {paymentPlans.map((p) => (
                  <a key={p.label} href={p.href} className="rounded-full border border-amber-300/40 px-3 py-2 text-xs font-semibold text-amber-100 hover:border-amber-200">
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="practice" className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Practice areas</p>
              <h3 className="text-2xl font-semibold">Swap or reorder without breaking layout</h3>
            </div>
            <div className="text-sm text-amber-100">Hover to view details</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {practiceAreas.map((area) => (
              <div key={area.title} className="group rounded-xl border border-white/10 bg-slate-900/40 p-4 transition hover:-translate-y-1 hover:border-amber-300/70">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-amber-100">{area.title}</h4>
                    <p className="text-sm text-slate-200/75">{area.desc}</p>
                  </div>
                  <span className="rounded-full bg-amber-300/20 px-3 py-1 text-center text-xs font-semibold leading-tight text-amber-100">
                    {area.duration}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-amber-100/90">
                  <span className="rounded-full bg-amber-300/15 px-2 py-1">{area.cost}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">Learn more</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="financing" className="rounded-2xl border border-amber-200/30 bg-[#101d33] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Financing & Insurance</p>
              <h3 className="text-2xl font-semibold">No insurance? We have options.</h3>
              <p className="text-slate-200/80">CareCredit, payment plans, and insurance verification built-in. Badge your accepted providers here.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">Apply for CareCredit</button>
              <button className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-100 hover:border-amber-100">Verify Insurance</button>
            </div>
          </div>
        </section>

        <section id="consult" className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Consultation Flow</p>
              <h3 className="text-2xl font-semibold">Keep the intake intact even when you swap content.</h3>
              <p className="text-slate-200/80">Four steps with validation. Data stays structured for backend handoff.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-100">
              {steps.map((label, idx) => (
                <span key={label} className={`rounded-full border px-3 py-1 ${idx === step ? "border-amber-300 bg-amber-300/20" : "border-white/10"}`}>
                  {idx + 1}. {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {step === 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {practiceAreas.slice(0, 6).map((area) => (
                    <button
                      key={area.title}
                      onClick={() => field("caseType", area.title)}
                      className={`rounded-xl border p-4 text-left transition ${form.caseType === area.title ? "border-amber-300 bg-amber-300/15" : "border-white/10 bg-white/5 hover:border-amber-200"}`}
                    >
                      <p className="text-sm font-semibold text-amber-100">{area.title}</p>
                      <p className="text-xs text-slate-200/80">{area.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-amber-100">Case summary</label>
                  <textarea
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                    rows={4}
                    placeholder="Describe what happened and your goal."
                    value={form.description}
                    onChange={(e) => field("description", e.target.value)}
                  />
                  {errors.description && <p className="text-xs text-red-300">{errors.description}</p>}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-semibold text-amber-100">When did it occur?</label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.incidentDate}
                        onChange={(e) => field("incidentDate", e.target.value)}
                      />
                      {errors.incidentDate && <p className="text-xs text-red-300">{errors.incidentDate}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Legal action taken?</label>
                      <select
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.legalAction}
                        onChange={(e) => field("legalAction", e.target.value)}
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                        <option value="unsure">Unsure</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Urgency</label>
                      <select
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.urgency}
                        onChange={(e) => field("urgency", e.target.value)}
                      >
                        <option>Immediate</option>
                        <option>Within a week</option>
                        <option>Within a month</option>
                        <option>Just exploring options</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Full name</label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.name}
                        onChange={(e) => field("name", e.target.value)}
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-xs text-red-300">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Phone</label>
                      <input
                        type="tel"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.phone}
                        onChange={(e) => field("phone", e.target.value)}
                        placeholder="(555) 000-0000"
                      />
                      {errors.phone && <p className="text-xs text-red-300">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.email}
                        onChange={(e) => field("email", e.target.value)}
                        placeholder="you@email.com"
                      />
                      {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-100">Preferred contact</label>
                      <select
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={form.contactMethod}
                        onChange={(e) => field("contactMethod", e.target.value)}
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-amber-100">Best time to reach you</label>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {["Morning", "Afternoon", "Evening"].map((time) => (
                        <button
                          key={time}
                          onClick={() => field("bestTime", time)}
                          className={`rounded-full border px-3 py-2 ${form.bestTime === time ? "border-amber-300 bg-amber-300/20 text-amber-50" : "border-white/10 text-slate-200"}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm text-slate-100">
                  <p className="text-base font-semibold text-amber-100">Confirm details</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Summary label="Case type" value={form.caseType || "—"} />
                    <Summary label="Incident date" value={form.incidentDate || "—"} />
                    <Summary label="Urgency" value={form.urgency} />
                    <Summary label="Legal action" value={form.legalAction} />
                    <Summary label="Name" value={form.name || "—"} />
                    <Summary label="Phone" value={form.phone || "—"} />
                    <Summary label="Email" value={form.email || "—"} />
                    <Summary label="Contact" value={form.contactMethod} />
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-200/90">
                    {form.description || "Case summary will appear here."}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
              <p className="text-sm font-semibold text-amber-100">Intake actions</p>
              <p className="text-xs text-slate-200/80">Validate each step; data stays structured for CRM/API handoff.</p>
              <div className="mt-4 flex gap-3">
                {step > 0 && (
                  <button onClick={handleBack} className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-amber-200">
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                >
                  {step === steps.length - 1 ? "Submit" : "Continue"}
                </button>
              </div>

              {errors.caseType && <p className="mt-3 text-xs text-red-300">{errors.caseType}</p>}

              {submitted && (
                <div className="mt-4 rounded-lg border border-emerald-400/50 bg-emerald-500/15 p-3 text-sm text-emerald-100">
                  <p className="font-semibold">Submission ready</p>
                  <p>Structured payload captured; connect to CRM, email, or webhooks.</p>
                </div>
              )}

              <div className="mt-6 space-y-2 text-xs text-slate-200/80">
                <p className="font-semibold text-amber-200">What happens next</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Intake is routed to the right practice lead.</li>
                  <li>Client receives confirmation with expected response time.</li>
                  <li>Attach optional documents in your production flow.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Attorneys</p>
              <h3 className="text-xl font-semibold">Bios with proof points</h3>
              <p className="text-slate-200/80 text-sm">Swap headshots and metrics while keeping CTA intact.</p>
            </div>
            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              {["Alex Torres", "Mia Patel", "Jordan Lee", "Camila Brooks"].map((name) => (
                <div key={name} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-amber-100">{name}</p>
                      <p className="text-xs text-slate-200/70">Trial attorney · 12 yrs</p>
                    </div>
                    <span className="rounded-full bg-amber-300/20 px-3 py-1 text-[11px] font-semibold text-amber-50">Book</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-200/75">Specializes in high-stakes litigation, negotiations, and client advocacy. Bar admissions and results go here.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-amber-200">{label}</p>
      <p className="text-sm text-slate-100">{value}</p>
    </div>
  );
}
