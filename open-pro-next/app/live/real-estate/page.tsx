"use client";

import { useState } from "react";

const gallery = ["/images/carousel-01.png", "/images/carousel-02.png", "/images/carousel-03.png"];
const campaigns = [
  { name: "Luxury Buyer Campaign", leads: 24, status: "ACTIVE", url: "/1200-market-st/luxury" },
  { name: "Investor Focused", leads: 12, status: "ACTIVE", url: "/1200-market-st/investor" },
  { name: "First-Time Buyers", leads: 8, status: "PAUSED", url: "/1200-market-st/first-timer" },
];

export default function RealEstateLive() {
  const [coverName, setCoverName] = useState("cover-photo.jpg");
  const [lead, setLead] = useState({ name: "", email: "", phone: "", message: "" });
  const [leadError, setLeadError] = useState("");
  const [leadOk, setLeadOk] = useState(false);

  const [tourStep, setTourStep] = useState(0);
  const [tour, setTour] = useState({ date: "", time: "", type: "in-person", name: "", email: "", phone: "" });
  const [tourOk, setTourOk] = useState(false);

  const validateLead = () => {
    if (!lead.name || !lead.email || !lead.phone) {
      setLeadError("Name, email, and phone are required.");
      return false;
    }
    setLeadError("");
    return true;
  };

  const submitLead = () => {
    if (!validateLead()) return;
    setLeadOk(true);
    setTimeout(() => setLeadOk(false), 3000);
  };

  const nextTour = () => {
    if (tourStep === 0 && (!tour.date || !tour.time)) return;
    if (tourStep === 1 && (!tour.name || !tour.email || !tour.phone)) return;
    if (tourStep === 2) {
      setTourOk(true);
      return;
    }
    setTourStep((s) => s + 1);
  };

  const resetTour = () => {
    setTourStep(0);
    setTourOk(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100">
      <header className="border-b border-white/5 bg-[#0f1f2f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/80">EstateGo · Real Estate</p>
            <h1 className="text-2xl font-semibold">Swap covers per campaign — lead form stays wired</h1>
          </div>
          <a href="#lead" className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
            Request info
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* Hero / cover swap */}
        <section className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#102742] via-[#0d1f35] to-[#0b1628] shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-r-xl border-r border-white/10 bg-slate-900/40 p-5">
                <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-teal-300/40 bg-[#0b1b30]/70 text-center">
                  <div>
                    <p className="text-sm font-semibold text-teal-100">House Photo Placeholder</p>
                    <p className="mt-1 text-xs text-slate-300/80">Upload campaign-specific property hero image</p>
                    <p className="mt-2 text-[11px] text-slate-400">Recommended: 1600x1200 JPG/PNG/WebP</p>
                  </div>
                </div>
              </div>
              <div className="absolute left-4 top-4 space-y-2">
                <p className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">Campaign cover</p>
                <p className="rounded-full bg-teal-500/90 px-3 py-1 text-xs font-semibold text-slate-900">Lead form persists</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">1200 Market St · Penthouse 23B</h2>
                <p className="text-slate-300/80">$1,950,000 · San Francisco, CA</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Badge>🛏️ 3 Beds</Badge>
                  <Badge>🛁 3 Baths</Badge>
                  <Badge>📏 2,150 sqft</Badge>
                  <Badge>🚗 2 Parking</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-teal-100">Swap cover photo</p>
                <p className="text-slate-200/80 text-sm">Upload or drag a new hero image; form stays connected to CRM/webhook.</p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:border-teal-300">
                  <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCoverName(e.target.files?.[0]?.name || coverName)} />
                  📷 Swap photo
                  <span className="text-xs text-teal-100/80">Current: {coverName}</span>
                </label>
              </div>
              <button className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">View full gallery</button>
            </div>
          </div>
        </section>

        {/* Map + amenities (mock) */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Interactive map</p>
              <h3 className="text-2xl font-semibold">Amenities & commute overlays</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge>Schools</Badge>
              <Badge>Transit</Badge>
              <Badge>Shopping</Badge>
              <Badge>Healthcare</Badge>
              <Badge>Parks</Badge>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-[#0f253e] to-[#0b1b30] p-6">
              <div className="h-64 rounded-lg border-2 border-dashed border-teal-300/35 bg-slate-900/60 p-4">
                <div className="flex h-full items-center justify-center rounded-md border border-white/10 bg-[#0b1b30]/70 text-center">
                  <div>
                    <p className="text-sm font-semibold text-teal-100">Map Placeholder</p>
                    <p className="mt-1 text-xs text-slate-300/80">Embed Google Maps or Mapbox with property pin + amenity layers</p>
                    <p className="mt-2 text-[11px] text-slate-400">Schools, Transit, Shopping, Healthcare, Parks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Commute time</p>
                <p className="text-xs text-slate-300/80">Add calculator + overlays here.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Nearby</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-300/80">
                  <li>2 parks within 0.5 mi</li>
                  <li>3 schools within 1.2 mi</li>
                  <li>Transit stop 0.3 mi</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tour booking (3-step) */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Tour booking</p>
              <h3 className="text-2xl font-semibold">Validated 3-step scheduling</h3>
            </div>
            <div className="flex gap-2 text-xs">
              {["Time", "Details", "Confirm"].map((s, i) => (
                <span key={s} className={`rounded-full border px-3 py-1 ${i === tourStep ? "border-teal-300 bg-teal-300/20 text-teal-100" : "border-white/10 text-slate-200"}`}>
                  {i + 1}. {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              {tourStep === 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Date" type="date" value={tour.date} onChange={(v) => setTour({ ...tour, date: v })} />
                  <Input label="Time" placeholder="2:00 PM" value={tour.time} onChange={(v) => setTour({ ...tour, time: v })} />
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-teal-100 mb-2">Tour type</p>
                    <div className="flex gap-2 text-sm">
                      {["in-person", "virtual"].map((t) => (
                        <button key={t} onClick={() => setTour({ ...tour, type: t })} className={`rounded-full border px-3 py-2 capitalize ${tour.type === t ? "border-teal-300 bg-teal-300/20" : "border-white/10 bg-white/5"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {tourStep === 1 && (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Full name" value={tour.name} onChange={(v) => setTour({ ...tour, name: v })} />
                  <Input label="Email" value={tour.email} onChange={(v) => setTour({ ...tour, email: v })} />
                  <Input label="Phone" value={tour.phone} onChange={(v) => setTour({ ...tour, phone: v })} />
                </div>
              )}
              {tourStep === 2 && (
                <div className="space-y-2 text-sm text-slate-200">
                  <Summary label="Date" value={tour.date || "—"} />
                  <Summary label="Time" value={tour.time || "—"} />
                  <Summary label="Type" value={tour.type} />
                  <Summary label="Name" value={tour.name || "—"} />
                  <Summary label="Email" value={tour.email || "—"} />
                  <Summary label="Phone" value={tour.phone || "—"} />
                  {tourOk && <div className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 p-3 text-emerald-100">Tour booked. Attach Twilio/SendGrid hooks.</div>}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-teal-100">Selection</p>
              <p className="text-xs text-slate-300/80">Date: {tour.date || "Pick a date"}</p>
              <p className="text-xs text-slate-300/80">Time: {tour.time || "Pick a time"}</p>
              <p className="text-xs text-slate-300/80">Type: {tour.type}</p>
              <div className="mt-3 flex gap-2">
                {tourStep > 0 && (
                  <button onClick={() => setTourStep((s) => Math.max(0, s - 1))} className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:border-teal-300">
                    Back
                  </button>
                )}
                <button onClick={nextTour} className="flex-1 rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
                  {tourStep === 2 ? "Confirm" : "Continue"}
                </button>
              </div>
              {tourOk && (
                <button onClick={resetTour} className="mt-3 w-full rounded-lg border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 hover:border-emerald-200">
                  Book another tour
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Lead form */}
        <section id="lead" className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Lead capture</p>
              <h3 className="text-2xl font-semibold">Persistent form across campaigns</h3>
              <p className="text-slate-200/80 text-sm">Tag campaign_source via URL. One webhook per property.</p>
            </div>
            <div className="rounded-full border border-teal-300/60 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-100">✅ Lead form connected</div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Full name" value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} />
                <Input label="Email address" value={lead.email} onChange={(v) => setLead({ ...lead, email: v })} />
                <Input label="Phone number" value={lead.phone} onChange={(v) => setLead({ ...lead, phone: v })} placeholder="(555) 123-4567" />
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-teal-100">Message (optional)</p>
                  <textarea className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white" rows={3} value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={submitLead} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">Submit inquiry</button>
                <p className="text-xs text-slate-300/80">Rate limit, reCAPTCHA, and webhook retries in production.</p>
              </div>
              {leadError && <p className="text-xs text-red-300">{leadError}</p>}
              {leadOk && <p className="text-sm text-emerald-200">Lead captured. Sync to CRM/webhook.</p>}
            </div>
            <div className="space-y-2 text-sm text-slate-200">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Campaign tracking</p>
                <p className="text-xs text-slate-300/80">Hidden field campaign_source auto-fills from ?campaign=luxury.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Anti-spam</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-300/80">
                  <li>reCAPTCHA v3 ready</li>
                  <li>3 submissions/IP/hour</li>
                  <li>Queue for CRM retries</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign management */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Campaigns</p>
              <h3 className="text-2xl font-semibold">Swap cover · form stays wired</h3>
            </div>
            <button className="rounded-full border border-teal-300 px-3 py-2 text-xs font-semibold text-teal-100 hover:border-teal-200">+ Create new campaign</button>
          </div>
          <div className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <div key={c.name} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-300/80">estatego.com{c.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-teal-300/15 px-3 py-1 text-teal-100">{c.leads} leads</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">{c.status}</span>
                  <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 hover:border-teal-300">📷 Swap photo</button>
                  <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 hover:border-teal-300">📊 View stats</button>
                  <span className="rounded-full border border-teal-300/60 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-100">✅ Lead form connected</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics snapshot */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Analytics</p>
              <h3 className="text-2xl font-semibold">Performance at a glance</h3>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge>Export CSV</Badge>
              <Badge>Schedule weekly digest</Badge>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <Stat label="Leads this month" value="44" />
            <Stat label="Lead conversion" value="6.8%" />
            <Stat label="Tour bookings" value="18" />
            <Stat label="Top campaign" value="Luxury Buyer" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{children}</span>;
}

function Input({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold text-teal-100">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-teal-200">{label}</p>
      <p className="text-sm text-slate-100">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-200">
      <p className="text-xs uppercase tracking-[0.2em] text-teal-200">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
