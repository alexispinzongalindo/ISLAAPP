"use client";

import { useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  durationMins: number;
  price: number;
  depositType: "percent" | "fixed";
  depositValue: number;
};

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  startHour: number;
  durationMins: number;
  paymentMode: "deposit" | "full";
  amountPaid: number;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  createdAt: string;
};

type Message = {
  id: string;
  channel: "email" | "sms" | "whatsapp";
  to: string;
  text: string;
  kind: "confirmation" | "reminder_24h" | "reminder_2h";
  stamp: string;
};

const servicesSeed: Service[] = [
  { id: "s1", name: "Classic Cut", durationMins: 30, price: 35, depositType: "percent", depositValue: 30 },
  { id: "s2", name: "Skin Fade", durationMins: 45, price: 45, depositType: "percent", depositValue: 30 },
  { id: "s3", name: "Beard Sculpt", durationMins: 25, price: 28, depositType: "fixed", depositValue: 10 },
  { id: "s4", name: "Cut + Beard Combo", durationMins: 60, price: 60, depositType: "percent", depositValue: 35 },
];

const openingHour = 9;
const closingHour = 19;
const defaultDate = new Date().toISOString().slice(0, 10);

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function serviceDeposit(service: Service) {
  if (service.depositType === "fixed") return service.depositValue;
  return (service.price * service.depositValue) / 100;
}

function serviceById(services: Service[], id: string) {
  return services.find((s) => s.id === id) ?? services[0];
}

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number) {
  const aEnd = aStart * 60 + aDur;
  const aStartMin = aStart * 60;
  const bStartMin = bStart * 60;
  const bEnd = bStartMin + bDur;
  return aStartMin < bEnd && bStart < aEnd / 60;
}

export default function ChairLockLivePage() {
  const [services] = useState<Service[]>(servicesSeed);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "bk1",
      customerName: "Luis Rivera",
      customerEmail: "luis@example.com",
      customerPhone: "+1 787 555 0149",
      serviceId: "s2",
      date: defaultDate,
      startHour: 11,
      durationMins: 45,
      paymentMode: "deposit",
      amountPaid: 13.5,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "bk2",
      customerName: "Andre Collins",
      customerEmail: "andre@example.com",
      customerPhone: "+1 787 555 0118",
      serviceId: "s4",
      date: defaultDate,
      startHour: 15,
      durationMins: 60,
      paymentMode: "full",
      amountPaid: 60,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: servicesSeed[0].id,
    date: defaultDate,
    startHour: 10,
    paymentMode: "deposit" as "deposit" | "full",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [stripeReceipt, setStripeReceipt] = useState("");

  const chosenService = useMemo(() => serviceById(services, form.serviceId), [services, form.serviceId]);

  const paidNow = form.paymentMode === "full" ? chosenService.price : serviceDeposit(chosenService);

  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === form.date).sort((a, b) => a.startHour - b.startHour),
    [bookings, form.date],
  );

  const dayHours = useMemo(() => Array.from({ length: closingHour - openingHour }, (_, i) => openingHour + i), []);

  const scheduleMessage = (channel: Message["channel"], to: string, text: string, kind: Message["kind"]) => {
    setMessages((prev) => [
      {
        id: `msg-${Math.random().toString(36).slice(2, 8)}`,
        channel,
        to,
        text,
        kind,
        stamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const createBooking = () => {
    if (!form.customerName.trim() || !form.customerEmail.trim() || !form.customerPhone.trim()) {
      setError("Customer name, email, and phone are required.");
      return;
    }
    if (!form.acceptTerms) {
      setError("Customer must accept terms and deposit policy.");
      return;
    }

    const conflict = bookings.some(
      (b) =>
        b.date === form.date &&
        b.status !== "cancelled" &&
        overlaps(form.startHour, chosenService.durationMins, b.startHour, b.durationMins),
    );
    if (conflict) {
      setError("This time slot is unavailable. Choose another slot.");
      return;
    }

    setError("");
    const newId = `bk-${Math.random().toString(36).slice(2, 8)}`;
    const paymentId = `pi_${Math.random().toString(36).slice(2, 10)}`;
    setStripeReceipt(`Stripe mock: ${paymentId} · Charged ${money(paidNow)} (${form.paymentMode})`);

    const newBooking: Booking = {
      id: newId,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      serviceId: form.serviceId,
      date: form.date,
      startHour: form.startHour,
      durationMins: chosenService.durationMins,
      paymentMode: form.paymentMode,
      amountPaid: paidNow,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    const summary = `${chosenService.name} on ${form.date} at ${String(form.startHour).padStart(2, "0")}:00`;
    if (emailEnabled) {
      scheduleMessage("email", newBooking.customerEmail, `Booking confirmed: ${summary}.`, "confirmation");
      scheduleMessage("email", newBooking.customerEmail, `Reminder 24h: ${summary}.`, "reminder_24h");
      scheduleMessage("email", newBooking.customerEmail, `Reminder 2h: ${summary}.`, "reminder_2h");
    }
    if (smsEnabled) {
      scheduleMessage("sms", newBooking.customerPhone, `SMS reminder 24h for ${summary}.`, "reminder_24h");
      scheduleMessage("sms", newBooking.customerPhone, `SMS reminder 2h for ${summary}.`, "reminder_2h");
    }
    if (whatsAppEnabled) {
      scheduleMessage("whatsapp", newBooking.customerPhone, `WhatsApp reminder 24h for ${summary}.`, "reminder_24h");
      scheduleMessage("whatsapp", newBooking.customerPhone, `WhatsApp reminder 2h for ${summary}.`, "reminder_2h");
    }

    setForm((prev) => ({
      ...prev,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      acceptTerms: false,
    }));
  };

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
    return {
      total: active.length,
      noShows: bookings.filter((b) => b.status === "no_show").length,
      paid: active.reduce((sum, b) => sum + b.amountPaid, 0),
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#050913] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">ChairLock</p>
          <h1 className="text-3xl font-semibold text-white">Booking + Deposits for Barbers</h1>
          <p className="mt-2 max-w-4xl text-slate-300">
            Stop no-shows and missed calls with online booking, deposit prepay, automated email/SMS/WhatsApp reminders, and an admin calendar that blocks conflicts.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Today bookings</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">No-shows</p>
            <p className="text-2xl font-semibold">{stats.noShows}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Collected now</p>
            <p className="text-2xl font-semibold">{money(stats.paid)}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Integrations</p>
            <p className="text-lg font-semibold">Stripe · Email · SMS · WhatsApp</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
          <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-xl font-semibold">Online Booking Page</h2>
            <p className="mb-4 text-sm text-slate-400">Customer-facing flow with service durations, deposit/full prepay, and terms acceptance.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Customer name</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.customerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.customerEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Phone</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.customerPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Service menu</span>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.serviceId}
                  onChange={(e) => setForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.durationMins} min · {money(s.price)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Date</span>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-300">Start time</span>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  value={form.startHour}
                  onChange={(e) => setForm((prev) => ({ ...prev, startHour: Number(e.target.value) }))}
                >
                  {dayHours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-sm">
              <p className="font-semibold text-cyan-200">Service summary</p>
              <p className="text-slate-200">
                {chosenService.name} · {chosenService.durationMins} min · Full {money(chosenService.price)}
              </p>
              <p className="text-slate-300">
                Deposit due now: {money(serviceDeposit(chosenService))} ({chosenService.depositType === "percent" ? `${chosenService.depositValue}%` : "fixed"})
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={form.paymentMode === "deposit"}
                    onChange={() => setForm((prev) => ({ ...prev, paymentMode: "deposit" }))}
                  />
                  Pay deposit now ({money(serviceDeposit(chosenService))})
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={form.paymentMode === "full"}
                    onChange={() => setForm((prev) => ({ ...prev, paymentMode: "full" }))}
                  />
                  Prepay full ({money(chosenService.price)})
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                Email reminders
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
                SMS reminders
              </label>
              <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={whatsAppEnabled} onChange={(e) => setWhatsAppEnabled(e.target.checked)} />
                WhatsApp reminders
              </label>
              <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => setForm((prev) => ({ ...prev, acceptTerms: e.target.checked }))}
                />
                Customer accepts cancellation/deposit terms
              </label>
            </div>

            {error && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-100">{error}</p>}
            {stripeReceipt && (
              <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-100">
                {stripeReceipt}
              </p>
            )}

            <button
              type="button"
              className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
              onClick={createBooking}
            >
              Confirm booking + charge {money(paidNow)}
            </button>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="text-xl font-semibold">Admin Calendar View</h2>
              <p className="mb-3 text-sm text-slate-400">Day slots lock automatically when occupied.</p>
              <div className="space-y-2">
                {dayHours.map((hour) => {
                  const booking = todayBookings.find((b) => overlaps(hour, 60, b.startHour, b.durationMins));
                  const svc = booking ? serviceById(services, booking.serviceId) : null;
                  return (
                    <div key={hour} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2">
                      <span className="text-sm text-slate-300">{String(hour).padStart(2, "0")}:00</span>
                      {booking && svc ? (
                        <span className="rounded-lg bg-amber-500/20 px-2 py-1 text-xs text-amber-200">
                          {booking.customerName} · {svc.name} ({svc.durationMins}m)
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="text-xl font-semibold">Automated Reminder Outbox</h2>
              <p className="mb-3 text-sm text-slate-400">Integration output printed to screen: Email, SMS, WhatsApp.</p>
              <div className="max-h-[330px] space-y-2 overflow-auto pr-1">
                {messages.length === 0 && <p className="text-sm text-slate-500">No reminder events yet.</p>}
                {messages.map((m) => (
                  <div key={m.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                    <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                      <span>{m.channel}</span>
                      <span>{m.kind.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-slate-400">{m.to}</p>
                    <p className="text-sm text-slate-100">{m.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{m.stamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
