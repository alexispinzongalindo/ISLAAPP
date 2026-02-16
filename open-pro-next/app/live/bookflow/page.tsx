"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay } from "date-fns";

type Service = {
  id: string;
  name: string;
  desc: string;
  duration: number;
  price: number;
  category: string;
  tags?: string[];
};

type Provider = {
  id: string;
  name: string;
  title: string;
  bio: string;
  rating: number;
  reviews: number;
  avatar: string;
  specialties: string[];
};

type Slot = {
  time: string;
  available: boolean;
};

const services: Service[] = [
  { id: "svc1", name: "Deep Tissue Massage", desc: "Restore balance with firm, focused pressure.", duration: 60, price: 120, category: "Wellness", tags: ["Massage", "Body"] },
  { id: "svc2", name: "Express Facial", desc: "A glow-up in half an hour.", duration: 30, price: 65, category: "Facial", tags: ["Skin", "Glow"] },
  { id: "svc3", name: "Balayage & Tone", desc: "Hand-painted dimension with custom toning.", duration: 150, price: 260, category: "Hair", tags: ["Color", "Style"] },
  { id: "svc4", name: "Strategy Session", desc: "90-minute planning sprint for your business.", duration: 90, price: 225, category: "Consulting", tags: ["Business", "Coaching"] },
  { id: "svc5", name: "Hot Stone Therapy", desc: "Melt tension with warm basalt stones.", duration: 90, price: 150, category: "Wellness", tags: ["Relax", "Heat"] },
  { id: "svc6", name: "Cut & Finish", desc: "Precision cut with luxe finish.", duration: 60, price: 85, category: "Hair", tags: ["Cut", "Style"] },
];

const providers: Provider[] = [
  { id: "pro1", name: "Ava Linden", title: "Lead Therapist", bio: "Specializes in deep tissue + hot stone with a calming presence.", rating: 4.9, reviews: 182, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80", specialties: ["Wellness", "Massage"] },
  { id: "pro2", name: "Nova Chen", title: "Color Director", bio: "Balayage perfectionist with a love for bold tones.", rating: 4.8, reviews: 141, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&q=80", specialties: ["Hair", "Color"] },
  { id: "pro3", name: "Mara Patel", title: "Skin Specialist", bio: "Results-driven facials and post-care coaching.", rating: 4.9, reviews: 203, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&q=80", specialties: ["Facial", "Glow"] },
  { id: "pro4", name: "Leo Hart", title: "Consultant", bio: "Strategy sprints for founders and teams.", rating: 4.7, reviews: 89, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&q=80", specialties: ["Consulting"] },
];

const generateSlots = (): { date: Date; slots: Slot[] }[] => {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  return days.map((d, idx) => ({
    date: d,
    slots: ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"].map((t, i2) => ({
      time: t,
      available: (i2 + idx) % 3 !== 0, // some blocked for realism
    })),
  }));
};

const StepBadge = ({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) => (
  <div className="flex items-center gap-3">
    <div
      className={`h-9 w-9 rounded-full border flex items-center justify-center text-sm font-semibold transition-all ${
        active ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30" : done ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-white/10 text-emerald-100 border-white/20"
      }`}
    >
      {done ? "✓" : step}
    </div>
    <span className={`text-sm ${active ? "text-white" : "text-emerald-100/70"}`}>{label}</span>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl shadow-emerald-950/20 p-5">{children}</div>
);

const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 ${
      props.className ?? "bg-emerald-500 text-white hover:bg-emerald-400"
    }`}
  >
    {children}
  </button>
);

export default function BookFlowDemo() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [slots] = useState(generateSlots());
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const daySlots = useMemo(() => {
    const base = selectedDate
      ? slots.find((d) => isSameDay(d.date, selectedDate))?.slots ?? []
      : slots.length > 0
        ? slots[0].slots ?? []
        : [];
    return base;
  }, [selectedDate, slots]);

  const filteredServices = useMemo(() => {
    return services.filter((s) =>
      (filter === "All" || s.category === filter) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
    );
  }, [filter, search]);

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const confirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setStep(4);
    }, 900);
  };

  const reset = () => {
    setService(null);
    setProvider(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: "", email: "", phone: "", notes: "" });
    setDone(false);
    setStep(1);
  };

  useEffect(() => {
    if (step === 2 && !service) setStep(1);
    if (step === 3 && (!service || !provider)) setStep(1);
    if (step === 4 && (!service || !provider || !selectedDate || !selectedTime)) setStep(1);
  }, [step, service, provider, selectedDate, selectedTime]);

  const accent = "from-emerald-500 via-emerald-400 to-emerald-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-emerald-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/70">BookFlow Demo</p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Service Booking in 4 Steps</h1>
            <p className="mt-2 text-emerald-100/70">Luxury spa-inspired UI, powered by mock data and a full booking flow.</p>
          </div>
          <Button onClick={() => (window.location.href = "/agent?template=bookflow&source=live_demo")}>Customize with AI</Button>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StepBadge step={1} label="Service" active={step === 1} done={step > 1} />
          <StepBadge step={2} label="Provider" active={step === 2} done={step > 2} />
          <StepBadge step={3} label="Date & Time" active={step === 3} done={step > 3} />
          <StepBadge step={4} label="Confirm" active={step === 4} done={done} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex gap-2 text-sm text-emerald-100/80">
                    {"Categories:"}
                    {["All", "Wellness", "Hair", "Facial", "Consulting"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`rounded-full px-3 py-1 border ${filter === c ? "border-emerald-400 bg-emerald-500/20" : "border-white/10"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredServices.map((s) => (
                    <div
                      key={s.id}
                      className={`rounded-2xl border bg-white/5 p-4 transition hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-white/10 ${
                        service?.id === s.id ? "border-emerald-400/80 bg-white/10" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{s.category}</p>
                          <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                          <p className="text-sm text-emerald-100/70">{s.desc}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-emerald-100/70">
                            <span>{s.duration} min</span>
                            <span className="h-1 w-1 rounded-full bg-emerald-200/50" />
                            <span>${s.price}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            {s.tags?.map((t) => (
                              <span key={t} className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-100 border border-emerald-400/30">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button onClick={() => { setService(s); goNext(); }}>Select</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100/70">Selected service</p>
                    <h3 className="text-lg font-semibold text-white">{service?.name}</h3>
                  </div>
                  <Button className="bg-white/10 text-emerald-50" onClick={goBack}>Change</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-2xl border bg-white/5 p-4 transition hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-white/10 ${
                        provider?.id === p.id ? "border-emerald-400/80 bg-white/10" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <img src={p.avatar} alt={p.name} className="h-14 w-14 rounded-full object-cover border border-white/10" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                              <p className="text-sm text-emerald-100/70">{p.title}</p>
                            </div>
                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100 border border-emerald-400/30">⭐ {p.rating} ({p.reviews})</span>
                          </div>
                          <p className="mt-2 text-sm text-emerald-100/80">{p.bio}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            {p.specialties.map((s) => (
                              <span key={s} className="rounded-full bg-white/10 px-2 py-1 text-emerald-100 border border-white/10">
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button onClick={() => { setProvider(p); goNext(); }}>Select</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100/70">Provider</p>
                    <h3 className="text-lg font-semibold text-white">{provider?.name}</h3>
                  </div>
                  <Button className="bg-white/10 text-emerald-50" onClick={goBack}>Change</Button>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-emerald-100/70">Pick a day</p>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {slots.map(({ date }) => {
                        const selected = selectedDate && isSameDay(date, selectedDate);
                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                            className={`rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-0.5 ${selected ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}
                          >
                            <div className="text-sm text-emerald-100/80">{format(date, "EEE")}</div>
                            <div className="text-lg font-semibold text-white">{format(date, "MMM d")}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-emerald-100/70 mb-2">Select a time</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {(selectedDate ? slots.find((d) => isSameDay(d.date, selectedDate))?.slots : slots[0].slots).map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setSelectedTime(s.time)}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${
                            !s.available
                              ? "border-white/10 text-emerald-100/30 cursor-not-allowed"
                              : selectedTime === s.time
                                ? "border-emerald-400 bg-emerald-500/10 text-white"
                                : "border-white/10 bg-white/5 text-emerald-50 hover:-translate-y-0.5"
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button className="bg-white/10 text-emerald-50" onClick={goBack}>Back</Button>
                      <Button
                        disabled={!selectedDate || !selectedTime}
                        onClick={goNext}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-100/70">Booking summary</p>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex justify-between text-sm text-emerald-100/80"><span>Service</span><span>{service?.name}</span></div>
                      <div className="flex justify-between text-sm text-emerald-100/80"><span>Provider</span><span>{provider?.name}</span></div>
                      <div className="flex justify-between text-sm text-emerald-100/80"><span>Date</span><span>{selectedDate ? format(selectedDate, "PPP") : ""}</span></div>
                      <div className="flex justify-between text-sm text-emerald-100/80"><span>Time</span><span>{selectedTime}</span></div>
                      <div className="flex justify-between text-sm text-emerald-100/80"><span>Duration</span><span>{service?.duration} min</span></div>
                      <div className="mt-3 flex justify-between text-base font-semibold text-white"><span>Total</span><span>${service?.price}</span></div>
                    </div>
                    <div className="flex gap-3 text-sm text-emerald-100/70">
                      <Button className="bg-white/10 text-emerald-50" onClick={goBack}>Back</Button>
                      <Button className="bg-white/10 text-emerald-50" onClick={reset}>Start over</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-100/70">Your details</p>
                    <div className="space-y-2">
                      {["name", "email", "phone"].map((field) => (
                        <input
                          key={field}
                          required
                          value={(form as any)[field]}
                          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                          placeholder={field === "name" ? "Full name" : field === "email" ? "Email" : "Phone"}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
                        />
                      ))}
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Special requests"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
                        rows={3}
                      />
                    </div>
                    <Button
                      disabled={loading || !form.name || !form.email || !form.phone}
                      onClick={confirm}
                    >
                      {loading ? "Booking..." : "Confirm booking"}
                    </Button>
                    {done && (
                      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-emerald-50">
                        <p className="text-sm font-semibold">Booking confirmed!</p>
                        <p className="text-sm text-emerald-100/80">A mock receipt has been sent. Add to calendar and prep your space.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
