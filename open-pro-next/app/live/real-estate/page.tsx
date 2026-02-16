"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  interest: string[];
  message: string;
};

const amenities = ["Schools", "Transit", "Shopping", "Healthcare", "Parks"];

const campaigns = [
  { name: "Luxury Buyer Campaign", leads: 24, status: "ACTIVE", url: "/1200-market-st/luxury" },
  { name: "Investor Focused", leads: 12, status: "ACTIVE", url: "/1200-market-st/investor" },
  { name: "First-Time Buyers", leads: 8, status: "PAUSED", url: "/1200-market-st/first-timer" },
];

const galleryImages = [
  "/images/carousel-01.png",
  "/images/carousel-02.png",
  "/images/carousel-03.png",
];

export default function RealEstateDemoPage() {
  const [coverName, setCoverName] = useState("downtown-penthouse.jpg");
  const [leadForm, setLeadForm] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    interest: [],
    message: "",
  });
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [leadSuccess, setLeadSuccess] = useState(false);

  const [bookingStep, setBookingStep] = useState(0);
  const [tourDate, setTourDate] = useState<string>("");
  const [tourTime, setTourTime] = useState<string>("");
  const [tourType, setTourType] = useState<"in-person" | "virtual">("in-person");
  const [tourDetails, setTourDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  const [tourDone, setTourDone] = useState(false);

  const [selectedGallery, setSelectedGallery] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const times = useMemo(() => {
    const base = ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];
    return base;
  }, []);

  const validateLead = () => {
    const errs: Record<string, string> = {};
    if (!leadForm.name.trim()) errs.name = "Name is required";
    if (!leadForm.email.match(/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/)) errs.email = "Enter a valid email";
    if (!leadForm.phone.match(/\\d{7,}/)) errs.phone = "Phone is required";
    setLeadErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitLead = () => {
    if (!validateLead()) return;
    setLeadSuccess(true);
    setTimeout(() => setLeadSuccess(false), 4000);
  };

  const validateBooking = () => {
    if (bookingStep === 0) return tourDate && tourTime;
    if (bookingStep === 1) return tourDetails.name && tourDetails.email && tourDetails.phone;
    return true;
  };

  const nextBooking = () => {
    if (!validateBooking()) return;
    if (bookingStep === 2) {
      setTourDone(true);
      return;
    }
    setBookingStep((s) => s + 1);
  };

  const resetBooking = () => {
    setBookingStep(0);
    setTourDone(false);
  };

  const toggleInterest = (value: string) => {
    setLeadForm((prev) => {
      const exists = prev.interest.includes(value);
      return { ...prev, interest: exists ? prev.interest.filter((v) => v !== value) : [...prev.interest, value] };
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100">
      <header className="border-b border-white/5 bg-[#0f1f2f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/80">EstateGo · Real Estate</p>
            <h1 className="text-2xl font-semibold">Campaign-ready property pages</h1>
            <p className="text-slate-300/80 text-sm">Swap cover per campaign; lead form stays wired and tagged.</p>
          </div>
          <a href="#lead" className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
            Request info
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* Hero + cover swap */}
        <section className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#102742] via-[#0d1f35] to-[#0b1628] shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <div className="h-full w-full bg-slate-900/60">
                <div className="aspect-[4/3] w-full bg-cover bg-center" style={{ backgroundImage: `url(${galleryImages[selectedGallery]})` }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute left-4 top-4 space-y-2">
                <p className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">Campaign cover</p>
                <p className="rounded-full bg-teal-500/90 px-3 py-1 text-xs font-semibold text-slate-900">Lead form stays wired</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-teal-400/20 text-teal-200 flex items-center justify-center font-bold">EG</div>
                <div>
                  <h2 className="text-xl font-semibold">1200 Market St · Penthouse 23B</h2>
                  <p className="text-slate-300/80">$1,950,000 · San Francisco, CA</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge>🛏️ 3 Beds</Badge>
                <Badge>🛁 3 Baths</Badge>
                <Badge>📏 2,150 sqft</Badge>
                <Badge>🚗 2 Parking</Badge>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-teal-100">Swap cover per campaign</p>
                <p className="text-slate-200/80 text-sm">Upload/drag-drop a new hero image. Gallery and lead form remain connected.</p>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <label className="rounded-full border border-white/15 bg-white/5 px-3 py-2 cursor-pointer hover:border-teal-300">
                    <input type="file" className="hidden" accept=\"image/png,image/jpeg,image/webp\" onChange={(e) => setCoverName(e.target.files?.[0]?.name || coverName)} />
                    Swap photo
                  </label>
                  <span className="text-xs text-teal-100/80">Current: {coverName}</span>
                </div>
              </div>
              <button onClick={() => setShowLightbox(true)} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
                View full gallery
              </button>
            </div>
          </div>
        </section>

        {/* Gallery lightbox mock */}
        {showLightbox && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-200">Swipeable gallery (demo)</p>
                <button onClick={() => setShowLightbox(false)} className="text-sm text-teal-200 hover:text-white">Close</button>
              </div>
              <div className="aspect-video rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${galleryImages[selectedGallery]})` }} />
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {galleryImages.map((src, i) => (
                  <button key={src} onClick={() => setSelectedGallery(i)} className={`h-16 w-24 flex-shrink-0 rounded-lg border ${selectedGallery === i ? "border-teal-300" : "border-white/10"}`} style={{ backgroundImage: `url(${src})`, backgroundSize: "cover" }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map + controls (mock) */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Interactive map</p>
              <h3 className="text-2xl font-semibold">Amenities & commute overlays</h3>
              <p className="text-slate-200/80 text-sm">Hook to Google Maps / Mapbox. Amenities toggles and commute calculator demoed here.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-[#0f253e] to-[#0b1b30] p-6">
              <p className="text-sm text-teal-100 mb-2">Map placeholder</p>
              <div className="h-64 rounded-lg border border-white/10 bg-slate-900/60 flex items-center justify-center text-slate-400">Embed Mapbox/Google map here</div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-sm font-semibold text-teal-100">Commute time</p>
                <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white" placeholder="Work address" />
                <div className="mt-2 flex gap-2 text-xs">
                  <Badge>Drive 25m</Badge>
                  <Badge>Transit 35m</Badge>
                  <Badge>Walk 12m</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm">
                <p className="text-teal-100 font-semibold">Nearby</p>
                <ul className="mt-2 space-y-1 text-slate-200/80">
                  <li>2 parks within 0.5 mi</li>
                  <li>3 schools within 1.2 mi</li>
                  <li>BART station 0.3 mi</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tour booking flow */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Tour booking</p>
              <h3 className="text-2xl font-semibold">Real-time tour scheduling</h3>
              <p className="text-slate-200/80 text-sm">Three steps with validation. Attach Twilio/SendGrid hooks in production.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {["Time", "Details", "Confirm"].map((label, idx) => (
                <span key={label} className={`rounded-full border px-3 py-1 ${idx === bookingStep ? "border-teal-300 bg-teal-300/20 text-teal-100" : "border-white/10 text-slate-200"}`}>
                  {idx + 1}. {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {bookingStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-100">Select date</label>
                    <input type="date" className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white" value={tourDate} onChange={(e) => setTourDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-100">Pick a time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {times.map((t) => (
                        <button key={t} onClick={() => setTourTime(t)} className={`rounded-lg border px-3 py-2 text-sm ${tourTime === t ? "border-teal-300 bg-teal-300/20" : "border-white/10 bg-white/5"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-100 mb-2">Tour type</p>
                    <div className="flex gap-2 text-sm">
                      {["in-person", "virtual"].map((type) => (
                        <button key={type} onClick={() => setTourType(type as "in-person" | "virtual")} className={`rounded-full border px-3 py-2 capitalize ${tourType === type ? "border-teal-300 bg-teal-300/20" : "border-white/10 bg-white/5"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {["name", "email", "phone"].map((field) => (
                    <div key={field}>
                      <label className="text-sm font-semibold text-teal-100 capitalize">{field}</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                        value={(tourDetails as any)[field]}
                        onChange={(e) => setTourDetails({ ...tourDetails, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-teal-100">Special requests (optional)</label>
                    <textarea
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                      rows={3}
                      value={tourDetails.notes}
                      onChange={(e) => setTourDetails({ ...tourDetails, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-3 text-sm text-slate-200">
                  <p className="text-base font-semibold text-teal-100">Confirm tour</p>
                  <Summary label="Date" value={tourDate ? format(new Date(tourDate), "PPP") : "—"} />
                  <Summary label="Time" value={tourTime || "—"} />
                  <Summary label="Type" value={tourType} />
                  <Summary label="Name" value={tourDetails.name || "—"} />
                  <Summary label="Email" value={tourDetails.email || "—"} />
                  <Summary label="Phone" value={tourDetails.phone || "—"} />
                  {tourDone && (
                    <div className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 p-3 text-emerald-100">
                      Tour booked. Attach Twilio/SendGrid + calendar hooks in production.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-teal-100">Selected</p>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <p>Date: {tourDate || "Pick a date"}</p>
                <p>Time: {tourTime || "Pick a time"}</p>
                <p>Type: {tourType}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {bookingStep > 0 && (
                  <button onClick={() => setBookingStep((s) => Math.max(0, s - 1))} className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-teal-300">
                    Back
                  </button>
                )}
                <button onClick={nextBooking} className="flex-1 rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
                  {bookingStep === 2 ? "Confirm" : "Continue"}
                </button>
              </div>
              {tourDone && (
                <button onClick={resetBooking} className="mt-3 w-full rounded-lg border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 hover:border-emerald-200">
                  Book another tour
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Persistent lead form */}
        <section id="lead" className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Lead form</p>
              <h3 className="text-2xl font-semibold">One form, all campaigns</h3>
              <p className="text-slate-200/80 text-sm">Configured per property, auto-tags campaign_source. Webhook-ready.</p>
            </div>
            <div className="rounded-full border border-teal-300/50 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-100">
              ✅ Lead form connected
            </div>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Full name"
                  value={leadForm.name}
                  onChange={(v) => setLeadForm({ ...leadForm, name: v })}
                  error={leadErrors.name}
                />
                <Field
                  label="Email address"
                  value={leadForm.email}
                  onChange={(v) => setLeadForm({ ...leadForm, email: v })}
                  error={leadErrors.email}
                />
                <Field
                  label="Phone number"
                  value={leadForm.phone}
                  onChange={(v) => setLeadForm({ ...leadForm, phone: v })}
                  error={leadErrors.phone}
                  placeholder="(555) 123-4567"
                />
                <div>
                  <p className="text-sm font-semibold text-teal-100">I'm interested in</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {["Buying", "Renting", "Investing"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleInterest(opt)}
                        className={`rounded-full border px-3 py-2 ${leadForm.interest.includes(opt) ? "border-teal-300 bg-teal-300/20 text-teal-50" : "border-white/10 text-slate-200"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-100">Message (optional)</p>
                <textarea
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                  rows={3}
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={submitLead} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
                  Submit inquiry
                </button>
                <div className="text-xs text-slate-300/80">Tagged with campaign_source and posted to webhook/CRM.</div>
              </div>
              {leadSuccess && (
                <div className="rounded-lg border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  Lead captured. Persisting to property leads table + syncing to CRM.
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Campaign tracking</p>
                <p className="text-xs text-slate-300/80">Hidden field campaign_source auto-populates from URL (?campaign=luxury).</p>
                <p className="mt-2 text-xs text-teal-100">Persistent across campaigns.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-teal-100">Anti-spam & limits</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-300/80">
                  <li>reCAPTCHA v3 ready</li>
                  <li>Rate limit 3 per IP / hr</li>
                  <li>Webhook retries via queue</li>
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
            <button className="rounded-full border border-teal-300 px-3 py-2 text-xs font-semibold text-teal-100 hover:border-teal-200">
              + Create new campaign
            </button>
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

        {/* Analytics widgets */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Analytics</p>
              <h3 className="text-2xl font-semibold">Campaign performance snapshot</h3>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge>Export CSV</Badge>
              <Badge>Schedule weekly digest</Badge>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Stat label="Leads this month" value="44" />
            <Stat label="Lead conversion rate" value="6.8%" />
            <Stat label="Tour bookings" value="18" />
            <Stat label="Top campaign" value="Luxury Buyer (38% CVR)" />
          </div>
          <p className="mt-2 text-xs text-slate-400">Wire to Chart.js/Recharts with real data; include date range filters.</p>
        </section>
      </main>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{children}</span>;
}

function Field({ label, value, onChange, error, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold text-teal-100">{label}</label>
      <input
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
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

