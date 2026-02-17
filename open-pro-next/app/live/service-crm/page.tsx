"use client";

import { useMemo, useState } from "react";

type Vertical = "dog-walking" | "personal-chef" | "mobile-service";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  lat: number;
  lng: number;
  points: number;
  visits: number;
  spend: number;
};

type Booking = {
  id: string;
  customerId: string;
  vertical: Vertical;
  staff: string;
  date: string;
  start: string;
  hours: number;
  rate: number;
  status: "confirmed" | "completed" | "cancelled";
};

type Outbox = {
  id: string;
  channel: "email" | "sms";
  to: string;
  subject: string;
  body: string;
  stamp: string;
};

type ChatMessage = { id: string; author: "customer" | "location"; text: string; stamp: string };

const staff = ["Mia", "Jordan", "Alex"];

const customersSeed: Customer[] = [
  { id: "c1", name: "Riley Gomez", email: "riley@example.com", phone: "(415) 555-0121", area: "Mission", lat: 37.7599, lng: -122.4148, points: 180, visits: 9, spend: 720 },
  { id: "c2", name: "Noah Patel", email: "noah@example.com", phone: "(415) 555-0174", area: "SoMa", lat: 37.7786, lng: -122.4057, points: 320, visits: 14, spend: 1460 },
  { id: "c3", name: "Avery Chen", email: "avery@example.com", phone: "(415) 555-0103", area: "Sunset", lat: 37.7544, lng: -122.4944, points: 90, visits: 5, spend: 380 },
  { id: "c4", name: "Mateo Ruiz", email: "mateo@example.com", phone: "(415) 555-0146", area: "Marina", lat: 37.8037, lng: -122.4368, points: 260, visits: 11, spend: 990 },
];

const today = new Date().toISOString().slice(0, 10);

const bookingSeed: Booking[] = [
  { id: "b1", customerId: "c1", vertical: "dog-walking", staff: "Mia", date: today, start: "08:00", hours: 1, rate: 45, status: "confirmed" },
  { id: "b2", customerId: "c2", vertical: "personal-chef", staff: "Jordan", date: today, start: "11:00", hours: 2, rate: 85, status: "confirmed" },
  { id: "b3", customerId: "c4", vertical: "mobile-service", staff: "Alex", date: today, start: "14:00", hours: 1, rate: 70, status: "confirmed" },
];

const defaultChat: ChatMessage[] = [
  { id: "ch1", author: "location", text: "Dispatch online. Share updates here.", stamp: new Date().toLocaleTimeString() },
];

function verticalLabel(v: Vertical) {
  if (v === "dog-walking") return "Dog Walking";
  if (v === "personal-chef") return "Personal Chef";
  return "Mobile Service";
}

function tier(points: number) {
  if (points >= 300) return "Gold";
  if (points >= 150) return "Silver";
  return "Bronze";
}

function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const r = 3958.8;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const p =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * r * Math.atan2(Math.sqrt(p), Math.sqrt(1 - p));
}

export default function ServiceCrmLive() {
  const [vertical, setVertical] = useState<Vertical>("dog-walking");
  const [customers, setCustomers] = useState<Customer[]>(customersSeed);
  const [bookings, setBookings] = useState<Booking[]>(bookingSeed);
  const [routeDate, setRouteDate] = useState(today);
  const [outbox, setOutbox] = useState<Outbox[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>(defaultChat);
  const [chatDraft, setChatDraft] = useState("");

  const [form, setForm] = useState({
    customerId: customersSeed[0].id,
    staff: staff[0],
    date: today,
    start: "09:00",
    hours: 1,
    rate: 45,
  });
  const [formError, setFormError] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    area: "Mission",
  });
  const [customerError, setCustomerError] = useState("");

  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  const routeStops = useMemo(() => {
    return bookings
      .filter((b) => b.date === routeDate && b.status !== "cancelled")
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [bookings, routeDate]);

  const routeMetrics = useMemo(() => {
    if (routeStops.length <= 1) return { miles: 0, minutes: 0 };
    let miles = 0;
    for (let i = 1; i < routeStops.length; i += 1) {
      const prev = customerById[routeStops[i - 1].customerId];
      const next = customerById[routeStops[i].customerId];
      if (!prev || !next) continue;
      miles += milesBetween(prev.lat, prev.lng, next.lat, next.lng);
    }
    return { miles, minutes: Math.round(miles * 4.5) };
  }, [routeStops, customerById]);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");
    const revenue = active.reduce((sum, b) => sum + b.hours * b.rate, 0);
    const completed = active.filter((b) => b.status === "completed").length;
    return { active: active.length, revenue, completed };
  }, [bookings]);

  const pushOutbox = (message: Omit<Outbox, "id" | "stamp">) => {
    setOutbox((prev) => [
      {
        id: `m-${Math.random().toString(36).slice(2, 8)}`,
        stamp: new Date().toLocaleTimeString(),
        ...message,
      },
      ...prev,
    ]);
  };

  const addBooking = () => {
    const selected = customerById[form.customerId];
    if (!selected || !form.date || !form.start || form.hours < 1 || form.rate <= 0) {
      setFormError("Complete all booking fields with valid values.");
      return;
    }
    setFormError("");
    const id = `b-${Math.random().toString(36).slice(2, 8)}`;
    const booking: Booking = {
      id,
      customerId: form.customerId,
      vertical,
      staff: form.staff,
      date: form.date,
      start: form.start,
      hours: form.hours,
      rate: form.rate,
      status: "confirmed",
    };
    setBookings((prev) => [booking, ...prev]);
    pushOutbox({
      channel: "email",
      to: selected.email,
      subject: "Booking Confirmed",
      body: `${verticalLabel(vertical)} booked on ${form.date} at ${form.start} with ${form.staff}.`,
    });
    pushOutbox({
      channel: "sms",
      to: selected.phone,
      subject: "Service Reminder",
      body: `You're confirmed for ${form.start} on ${form.date}. Reply HELP for dispatch.`,
    });
  };

  const addCustomer = () => {
    const name = customerForm.name.trim();
    const email = customerForm.email.trim().toLowerCase();
    const phone = customerForm.phone.trim();
    const area = customerForm.area.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || !phone || !area) {
      setCustomerError("Name, valid email, phone, and area are required.");
      return;
    }
    if (customers.some((c) => c.email.toLowerCase() === email)) {
      setCustomerError("This email already exists.");
      return;
    }

    const areaCoords: Record<string, { lat: number; lng: number }> = {
      Mission: { lat: 37.7599, lng: -122.4148 },
      SoMa: { lat: 37.7786, lng: -122.4057 },
      Sunset: { lat: 37.7544, lng: -122.4944 },
      Marina: { lat: 37.8037, lng: -122.4368 },
      Downtown: { lat: 37.7898, lng: -122.401 },
      Richmond: { lat: 37.7808, lng: -122.4702 },
    };
    const coord = areaCoords[area] || { lat: 37.7749, lng: -122.4194 };

    const newCustomer: Customer = {
      id: `c-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      area,
      lat: coord.lat,
      lng: coord.lng,
      points: 0,
      visits: 0,
      spend: 0,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setForm((prev) => ({ ...prev, customerId: newCustomer.id }));
    setCustomerForm({ name: "", email: "", phone: "", area: "Mission" });
    setCustomerError("");

    pushOutbox({
      channel: "email",
      to: newCustomer.email,
      subject: "Customer Profile Created",
      body: `Welcome ${newCustomer.name}. Profile is active for ${newCustomer.area} bookings.`,
    });
  };

  const completeBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status !== "confirmed") return;
    const customer = customerById[booking.customerId];
    if (!customer) return;

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)));
    const points = booking.vertical === "personal-chef" ? 35 : 25;
    const bill = booking.hours * booking.rate;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? { ...c, points: c.points + points, visits: c.visits + 1, spend: c.spend + bill }
          : c,
      ),
    );

    pushOutbox({
      channel: "email",
      to: customer.email,
      subject: "Service Completed Receipt",
      body: `Receipt: ${verticalLabel(booking.vertical)} · ${booking.hours} hr · $${bill}. Loyalty +${points} points.`,
    });
  };

  const moveStop = (index: number, dir: -1 | 1) => {
    const reordered = routeStops.slice();
    const target = index + dir;
    if (target < 0 || target >= reordered.length) return;
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const starts = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
    setBookings((prev) =>
      prev.map((b) => {
        const at = reordered.findIndex((r) => r.id === b.id);
        if (at === -1 || b.date !== routeDate || b.status === "cancelled") return b;
        return { ...b, start: starts[Math.min(at, starts.length - 1)] };
      }),
    );
  };

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const text = chatDraft.trim();
    setChat((prev) => [
      ...prev,
      { id: `ch-${Math.random().toString(36).slice(2, 8)}`, author: "customer", text, stamp: new Date().toLocaleTimeString() },
      {
        id: `ch-${Math.random().toString(36).slice(2, 8)}`,
        author: "location",
        text: "Received. Dispatch updated your route note.",
        stamp: new Date().toLocaleTimeString(),
      },
    ]);
    setChatDraft("");
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#102040] via-[#0f1c36] to-[#0b1328] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Service Provider CRM</p>
              <h1 className="mt-1 text-3xl font-semibold">Route-first operations for mobile service teams</h1>
              <p className="mt-2 max-w-3xl text-slate-300/80">
                Built for dog walkers, personal chefs, and field services with booking, route sequencing, loyalty tracking, and customer chat.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {(["dog-walking", "personal-chef", "mobile-service"] as Vertical[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVertical(v)}
                    className={`rounded-full border px-3 py-1.5 ${
                      vertical === v ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/15 bg-white/5 text-slate-200"
                    }`}
                  >
                    {verticalLabel(v)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <Stat label="Active Jobs" value={String(stats.active)} />
              <Stat label="Completed" value={String(stats.completed)} />
              <Stat label="Projected $" value={`$${stats.revenue}`} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-6">
            <Panel title="New Customer">
              <div className="grid gap-3">
                <Input
                  label="Full name"
                  value={customerForm.name}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, name: v }))}
                  placeholder="Jamie Walker"
                />
                <Input
                  label="Email"
                  type="email"
                  value={customerForm.email}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, email: v }))}
                  placeholder="jamie@example.com"
                />
                <Input
                  label="Phone"
                  value={customerForm.phone}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, phone: v }))}
                  placeholder="(415) 555-0199"
                />
                <Select
                  label="Service area"
                  value={customerForm.area}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, area: v }))}
                >
                  <option value="Mission">Mission</option>
                  <option value="SoMa">SoMa</option>
                  <option value="Sunset">Sunset</option>
                  <option value="Marina">Marina</option>
                  <option value="Downtown">Downtown</option>
                  <option value="Richmond">Richmond</option>
                </Select>
                {customerError && <p className="text-sm text-rose-300">{customerError}</p>}
                <button onClick={addCustomer} className="rounded-lg bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-400">
                  Save customer
                </button>
              </div>
            </Panel>

            <Panel title="New Booking">
              <div className="grid gap-3">
                <Select label="Customer" value={form.customerId} onChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.area}
                    </option>
                  ))}
                </Select>
                <Select label="Staff" value={form.staff} onChange={(v) => setForm((f) => ({ ...f, staff: v }))}>
                  {staff.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Input label="Date" type="date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
                <Input label="Start time" type="time" value={form.start} onChange={(v) => setForm((f) => ({ ...f, start: v }))} />
                <Input
                  label="Hours"
                  type="number"
                  min={1}
                  value={String(form.hours)}
                  onChange={(v) => setForm((f) => ({ ...f, hours: Number(v) || 1 }))}
                />
                <Input
                  label="Rate per hour"
                  type="number"
                  min={1}
                  value={String(form.rate)}
                  onChange={(v) => setForm((f) => ({ ...f, rate: Number(v) || 1 }))}
                />
                {formError && <p className="text-sm text-rose-300">{formError}</p>}
                <button onClick={addBooking} className="rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-900 hover:bg-cyan-300">
                  Create booking
                </button>
              </div>
            </Panel>

            <Panel title="Customer Loyalty">
              <div className="space-y-2">
                {customers
                  .slice()
                  .sort((a, b) => b.points - a.points)
                  .map((c) => (
                    <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{c.name}</p>
                        <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-100">{tier(c.points)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300/80">{c.visits} visits · ${c.spend} lifetime</p>
                      <p className="mt-1 text-sm text-cyan-100">{c.points} points</p>
                    </div>
                  ))}
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <Panel title="Daily Route Planner">
              <div className="flex items-end gap-3">
                <Input label="Route date" type="date" value={routeDate} onChange={setRouteDate} />
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  {routeStops.length} stops · {routeMetrics.miles.toFixed(1)} mi · {routeMetrics.minutes} min travel
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {routeStops.map((b, i) => {
                  const c = customerById[b.customerId];
                  if (!c) return null;
                  return (
                    <div key={b.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{b.start} · {c.name}</p>
                          <p className="text-xs text-slate-300/80">{verticalLabel(b.vertical)} · {c.area} · {b.staff}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => moveStop(i, -1)} className="rounded border border-white/20 px-2 py-1 text-xs">Up</button>
                          <button onClick={() => moveStop(i, 1)} className="rounded border border-white/20 px-2 py-1 text-xs">Down</button>
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => completeBooking(b.id)}
                              className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-900"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {routeStops.length === 0 && <p className="text-sm text-slate-300/80">No bookings on this day.</p>}
              </div>
            </Panel>

            <Panel title="On-screen Email / SMS Output">
              <div className="max-h-80 space-y-2 overflow-auto pr-1">
                {outbox.map((m) => (
                  <div key={m.id} className="rounded-lg border border-white/10 bg-[#0b1631] p-3">
                    <div className="flex items-center justify-between text-xs text-slate-300/80">
                      <span className="uppercase tracking-[0.2em]">{m.channel}</span>
                      <span>{m.stamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-cyan-100">To: {m.to}</p>
                    <p className="text-sm font-medium">{m.subject}</p>
                    <p className="text-xs text-slate-200/90">{m.body}</p>
                  </div>
                ))}
                {outbox.length === 0 && <p className="text-sm text-slate-300/80">No messages yet. Create or complete a booking.</p>}
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <Panel title="Booking Board">
              <div className="space-y-2">
                {bookings.slice().sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).map((b) => {
                  const c = customerById[b.customerId];
                  if (!c) return null;
                  return (
                    <div key={b.id} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-slate-300/80">{b.date} · {b.start} · {b.hours}h · ${b.rate}/h</p>
                      <p className="mt-1 text-xs">
                        <span className={`rounded-full px-2 py-0.5 ${b.status === "completed" ? "bg-emerald-500/20 text-emerald-100" : b.status === "cancelled" ? "bg-rose-500/20 text-rose-100" : "bg-cyan-500/20 text-cyan-100"}`}>
                          {b.status}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Location Chat">
              <div className="max-h-56 space-y-2 overflow-auto pr-1">
                {chat.map((m) => (
                  <div key={m.id} className={`rounded-lg p-2 text-sm ${m.author === "customer" ? "bg-cyan-500/20" : "bg-slate-800/90"}`}>
                    <p className="text-xs text-slate-300/80">{m.author} · {m.stamp}</p>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Send note to dispatch..."
                />
                <button onClick={sendChat} className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-900">
                  Send
                </button>
              </div>
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111a30] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200/80">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[90px] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-xs text-slate-300/80">{label}</p>
      <p className="text-base font-semibold text-cyan-100">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  min,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300/90">{label}</span>
      <input
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        min={min}
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300/90">{label}</span>
      <select
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
