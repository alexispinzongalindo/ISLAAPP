"use client";

import { useMemo, useState } from "react";

type Dept = "Primary Care" | "Pediatrics" | "Urgent Care" | "Specialist";
type Provider = { name: string; title: string; dept: Dept; photo: string };

const providers: Provider[] = [
  { name: "Dr. Sarah Chen", title: "MD - Primary Care", dept: "Primary Care", photo: "https://images.unsplash.com/photo-1527610276290-f1a1f4c67af1?auto=format&fit=crop&w=320&q=80" },
  { name: "Dr. Michael Torres", title: "MD - Pediatrics", dept: "Pediatrics", photo: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=320&q=80" },
  { name: "Dr. Emily Rodriguez", title: "DO - Urgent Care", dept: "Urgent Care", photo: "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=320&q=80" },
];

const heroImages = [
  { label: "Waiting Room", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80" },
  { label: "Doctor & Patient", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80&sat=-30" },
  { label: "Medical Team", url: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1600&q=80" },
  { label: "Clinic Exterior", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80" },
];

const slots = ["9:00", "9:30", "10:15", "11:00", "1:30", "2:00", "3:15", "4:00"];

export default function CareLine() {
  const [clinicName, setClinicName] = useState("CareLine Clinic");
  const [accent, setAccent] = useState("#2B6CB0");
  const [hero, setHero] = useState(heroImages[0].url);
  const [selectedDept, setSelectedDept] = useState<Dept>("Primary Care");
  const [provider, setProvider] = useState<Provider | null>(providers[0]);
  const [slot, setSlot] = useState<string | null>("2:00");
  const [apptType, setApptType] = useState("In-Person Visit");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [contactMethod, setContactMethod] = useState("SMS");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const hipaaBadge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
      <span>🔒</span> HIPAA Compliant
    </span>
  );

  const bookingSummary = useMemo(() => {
    if (!provider || !slot) return "Select provider & time";
    return `${provider.name} — ${slot} • ${apptType}`;
  }, [provider, slot, apptType]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl" style={{ background: accent }} />
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none"
              />
            </div>
            <div className="text-sm text-slate-600">Secure patient intake, booking, and reminders.</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 items-center">
            {hipaaBadge}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">SSL Enabled</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">Data encrypted</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(560px,1fr),1fr]">
          <DesktopPreview
            clinicName={clinicName}
            accent={accent}
            hero={hero}
            provider={provider}
            slot={slot}
            apptType={apptType}
            smsOptIn={smsOptIn}
            contactMethod={contactMethod}
          />

          <div className="space-y-6">
            {confirmMsg && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {confirmMsg}
              </div>
            )}

            <BrandPanel
              accent={accent}
              setAccent={setAccent}
              hero={hero}
              setHero={setHero}
              clinicName={clinicName}
              setClinicName={setClinicName}
            />

            <IntakePanel accent={accent} />

            <BookingPanel
              accent={accent}
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              provider={provider}
              setProvider={setProvider}
              slot={slot}
              setSlot={setSlot}
              apptType={apptType}
              setApptType={setApptType}
            />

            <ReminderPanel
              accent={accent}
              smsOptIn={smsOptIn}
              setSmsOptIn={setSmsOptIn}
              contactMethod={contactMethod}
              setContactMethod={setContactMethod}
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Confirmation</div>
              <div className="mt-2 text-sm text-slate-600">{bookingSummary}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-2 py-1">Calendar export</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Encrypted submission</span>
              </div>
              <button
                className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-95"
                style={{ background: accent }}
                onClick={() => setConfirmMsg("Submitted securely (demo)")}
              >
                Submit intake & booking (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopPreview({
  clinicName,
  accent,
  hero,
  provider,
  slot,
  apptType,
  smsOptIn,
  contactMethod,
}: {
  clinicName: string;
  accent: string;
  hero: string;
  provider: Provider | null;
  slot: string | null;
  apptType: string;
  smsOptIn: boolean;
  contactMethod: string;
}) {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
        <span>CareLine Desktop Preview</span>
        <span style={{ color: accent }}>Desktop</span>
      </div>
      <div>
        <div
          className="h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.45)), url(${hero})` }}
        >
          <div className="h-full w-full p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-8 w-8 rounded-lg bg-white/20" />
              <span>{clinicName}</span>
            </div>
            <div className="mt-3 text-2xl font-semibold">New Patient Registration</div>
            <div className="text-sm opacity-90">Secure, HIPAA-friendly onboarding and booking.</div>
            <button
              className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              Start Intake
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span>🔒</span> HIPAA Compliant
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800">Patient Intake</div>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              <li>• Personal & emergency contact</li>
              <li>• Insurance + card upload</li>
              <li>• Medical history & allergies</li>
              <li>• HIPAA consent with e-sign</li>
            </ul>
            <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
              SSL ✓ • Data encrypted ✓ • Privacy policy linked ✓
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Appointment booking</div>
            <div className="mt-2 text-xs text-slate-600">{provider ? provider.name : "Select provider"}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1">{slot || "Select time"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{apptType}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>Reminder preview</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{contactMethod}</span>
            </div>
            <div className="mt-2 space-y-2 text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 px-3 py-2">24h: Reminder: Your appointment with Dr. Chen tomorrow at 2:00 PM. Reply C to confirm.</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">2h: Your appointment is in 2 hours at CareLine Clinic.</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">Post: Thank you for visiting CareLine! Please rate your experience.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Patient portal preview</div>
            <div className="mt-2 text-xs text-slate-600">Records, refills, waitlist notifications.</div>
            <div className="mt-3 flex gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-2 py-1">Prescriptions</span>
              <span className="rounded-full bg-white px-2 py-1">Records</span>
              <span className="rounded-full bg-white px-2 py-1">Messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandPanel({
  accent,
  setAccent,
  hero,
  setHero,
  clinicName,
  setClinicName,
}: {
  accent: string;
  setAccent: (v: string) => void;
  hero: string;
  setHero: (v: string) => void;
  clinicName: string;
  setClinicName: (v: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Branding (live preview)</h3>
        <span className="text-xs text-slate-500">Updates hero, logo, colors</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3 text-sm text-slate-700">
          <label className="flex items-center justify-between gap-3">
            <span>Accent color</span>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-slate-200"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs">Clinic name</span>
            <input
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="rounded border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="text-xs text-slate-500">Logo upload coming soon (demo)</div>
        </div>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Hero image</div>
          <div className="grid grid-cols-2 gap-2">
            {heroImages.map((h) => (
              <button
                key={h.label}
                onClick={() => setHero(h.url)}
                className={`rounded-lg border p-2 text-left text-xs ${hero === h.url ? "ring-2" : ""}`}
                style={{ borderColor: hero === h.url ? accent : "#e5e7eb" }}
              >
                <div className="h-16 w-full rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${h.url})` }} />
                <div className="mt-1 text-slate-700">{h.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntakePanel({ accent }: { accent: string }) {
  const steps = ["Personal", "Emergency", "Insurance", "History", "Consent"];
  const [step, setStep] = useState(1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Patient intake</h3>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-1">Step {step}/5</span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Encrypted</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Full name" />
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Date of birth" />
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Contact" />
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Emergency contact" />
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Insurance provider" />
        <input className="rounded border border-slate-200 px-3 py-2 text-sm" placeholder="Policy number" />
        <textarea className="col-span-2 rounded border border-slate-200 px-3 py-2 text-sm" rows={2} placeholder="Allergies & conditions" />
        <textarea className="col-span-2 rounded border border-slate-200 px-3 py-2 text-sm" rows={2} placeholder="Current medications" />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
        <span>🔒 HIPAA consent & e-sign</span>
        <span>🔒 Upload insurance card</span>
      </div>
      <div className="mt-4 flex gap-2 text-sm font-semibold">
        <button
          className="rounded-lg px-3 py-2 text-slate-700"
          onClick={() => setStep(Math.max(1, step - 1))}
        >
          Back
        </button>
        <button
          className="rounded-lg px-3 py-2 text-white"
          style={{ background: accent }}
          onClick={() => setStep(Math.min(5, step + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function BookingPanel({
  accent,
  selectedDept,
  setSelectedDept,
  provider,
  setProvider,
  slot,
  setSlot,
  apptType,
  setApptType,
}: {
  accent: string;
  selectedDept: Dept;
  setSelectedDept: (d: Dept) => void;
  provider: Provider | null;
  setProvider: (p: Provider | null) => void;
  slot: string | null;
  setSlot: (s: string | null) => void;
  apptType: string;
  setApptType: (s: string) => void;
}) {
  const filteredProviders = providers.filter((p) => p.dept === selectedDept);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Appointment booking</h3>
        <span className="text-xs text-slate-500">Department → provider → time</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {["Primary Care", "Pediatrics", "Urgent Care", "Specialist"].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDept(d as Dept)}
            className="rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{
              borderColor: selectedDept === d ? accent : "#e5e7eb",
              background: selectedDept === d ? `${accent}12` : "#f8fafc",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {filteredProviders.map((p) => (
          <button
            key={p.name}
            onClick={() => setProvider(p)}
            className="flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm"
            style={{ borderColor: provider?.name === p.name ? accent : "#e5e7eb" }}
          >
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${p.photo})` }} />
            <div>
              <div className="text-sm font-semibold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-600">{p.title}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm font-semibold text-slate-800">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className="rounded-xl border bg-white px-3 py-2 shadow-sm"
            style={{
              borderColor: slot === s ? accent : "#e5e7eb",
              background: slot === s ? `${accent}12` : "white",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
        {["In-Person Visit", "Telehealth (Video)", "Phone Consultation"].map((t) => (
          <button
            key={t}
            onClick={() => setApptType(t)}
            className="rounded-full border px-3 py-1"
            style={{
              borderColor: apptType === t ? accent : "#e5e7eb",
              background: apptType === t ? accent : "white",
              color: apptType === t ? "white" : "#0f172a",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReminderPanel({
  accent,
  smsOptIn,
  setSmsOptIn,
  contactMethod,
  setContactMethod,
}: {
  accent: string;
  smsOptIn: boolean;
  setSmsOptIn: (v: boolean) => void;
  contactMethod: string;
  setContactMethod: (v: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">SMS reminders</h3>
        <span className="text-xs text-slate-500">Opt-in & preview</span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-800">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} />
          <span>Opt-in to SMS</span>
        </label>
        <select
          className="rounded border border-slate-200 px-2 py-1 text-sm"
          value={contactMethod}
          onChange={(e) => setContactMethod(e.target.value)}
        >
          <option>SMS</option>
          <option>Email</option>
          <option>Both</option>
        </select>
      </div>
      <div className="mt-3 space-y-2 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 px-3 py-2">24h: "Reminder: Your appointment with Dr. Chen tomorrow at 2:00 PM. Reply C to confirm."</div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">2h: "Your appointment is in 2 hours at CareLine Clinic. See you soon!"</div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">Post: "Thank you for visiting CareLine! Please rate your experience."</div>
      </div>
    </div>
  );
}
