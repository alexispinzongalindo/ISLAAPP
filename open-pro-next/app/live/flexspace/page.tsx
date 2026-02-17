"use client";

import { useMemo, useState } from "react";

type Role = "customer" | "admin" | "staff";
type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Room = {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
  dailyRate: number;
};

type Equipment = {
  id: string;
  name: string;
  hourlyRate: number;
  dailyRate: number;
  quantityActive: number;
};

type Booking = {
  id: string;
  customerName: string;
  roomId: string;
  startAt: string;
  endAt: string;
  equipment: { id: string; qty: number }[];
  status: BookingStatus;
  total: number;
  paymentMode: "deposit" | "full";
  createdAt: string;
  cancellationDeadline: string;
  agreementAccepted: boolean;
  idUploaded: boolean;
  staffAssigned: string | null;
};

type Maintenance = {
  id: string;
  resourceType: "room" | "equipment";
  resourceId: string;
  startAt: string;
  endAt: string;
  reason: string;
};

const rooms: Room[] = [
  { id: "r1", name: "Studio A", category: "Music Recording", hourlyRate: 95, dailyRate: 680 },
  { id: "r2", name: "Podcast Room 2", category: "Podcast", hourlyRate: 60, dailyRate: 420 },
  { id: "r3", name: "Kitchen Bay", category: "Commercial Kitchen", hourlyRate: 110, dailyRate: 760 },
  { id: "r4", name: "Photo Stage", category: "Photography/Video", hourlyRate: 85, dailyRate: 590 },
];

const equipmentSeed: Equipment[] = [
  { id: "e1", name: "4K Camera Kit", hourlyRate: 35, dailyRate: 220, quantityActive: 2 },
  { id: "e2", name: "Podcast Mic Set", hourlyRate: 20, dailyRate: 120, quantityActive: 4 },
  { id: "e3", name: "Lighting Pack", hourlyRate: 25, dailyRate: 160, quantityActive: 3 },
  { id: "e4", name: "PA System", hourlyRate: 30, dailyRate: 200, quantityActive: 1 },
];

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400";

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function fmtMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function FlexSpacePage() {
  const [role, setRole] = useState<Role>("customer");
  const [approvalMode, setApprovalMode] = useState<"auto" | "manual">("manual");
  const [requireId, setRequireId] = useState(true);
  const [requireDeposit, setRequireDeposit] = useState(true);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [cancelHours, setCancelHours] = useState(24);
  const [damageHold, setDamageHold] = useState(150);
  const [depositPercent, setDepositPercent] = useState(30);
  const [lateFee, setLateFee] = useState(45);

  const [equipments, setEquipments] = useState<Equipment[]>(equipmentSeed);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chatLog, setChatLog] = useState<string[]>([]);

  const [customerName, setCustomerName] = useState("Alex Rivera");
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [startAt, setStartAt] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [equipmentQty, setEquipmentQty] = useState<Record<string, number>>({});
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"deposit" | "full">("deposit");
  const [recurringWeeks, setRecurringWeeks] = useState(1);
  const [emailPreview, setEmailPreview] = useState("");
  const [smsPreview, setSmsPreview] = useState("");
  const [error, setError] = useState("");

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) ?? rooms[0], [roomId]);

  const totals = useMemo(() => {
    const roomCost = selectedRoom.hourlyRate * durationHours;
    const equipmentCost = Object.entries(equipmentQty).reduce((acc, [id, qty]) => {
      const eq = equipments.find((e) => e.id === id);
      if (!eq || qty <= 0) return acc;
      return acc + eq.hourlyRate * durationHours * qty;
    }, 0);
    const subtotal = roomCost + equipmentCost;
    const deposit = requireDeposit ? (subtotal * depositPercent) / 100 : 0;
    const dueNow = paymentMode === "full" ? subtotal : deposit;
    return { roomCost, equipmentCost, subtotal, deposit, dueNow };
  }, [selectedRoom, durationHours, equipmentQty, equipments, requireDeposit, depositPercent, paymentMode]);

  const createBooking = () => {
    setError("");
    if (!startAt) return setError("Select date and time.");
    if (!agreementAccepted) return setError("Rental agreement must be accepted.");
    if (requireId && !idUploaded) return setError("ID upload is required.");
    if (durationHours < 1) return setError("Minimum duration is 1 hour.");

    const baseStart = new Date(startAt);
    const created: Booking[] = [];

    for (let i = 0; i < recurringWeeks; i++) {
      const slotStart = new Date(baseStart);
      slotStart.setDate(slotStart.getDate() + i * 7);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + durationHours);

      const blocked = maintenance.some((m) => {
        const ms = new Date(m.startAt);
        const me = new Date(m.endAt);
        if (m.resourceType === "room" && m.resourceId === roomId) return overlap(slotStart, slotEnd, ms, me);
        if (m.resourceType === "equipment") {
          const reqQty = equipmentQty[m.resourceId] ?? 0;
          return reqQty > 0 && overlap(slotStart, slotEnd, ms, me);
        }
        return false;
      });
      if (blocked) return setError("Maintenance conflict found in selected slot.");

      const conflictRoom = bookings.some((b) => {
        if (b.roomId !== roomId || b.status === "cancelled") return false;
        const bs = new Date(b.startAt);
        bs.setMinutes(bs.getMinutes() - bufferMinutes);
        const be = new Date(b.endAt);
        be.setMinutes(be.getMinutes() + bufferMinutes);
        return overlap(slotStart, slotEnd, bs, be);
      });
      if (conflictRoom) return setError("Room is already booked for this time (buffer applied).");

      for (const [eqId, qty] of Object.entries(equipmentQty)) {
        if (qty <= 0) continue;
        const eq = equipments.find((e) => e.id === eqId);
        if (!eq) continue;
        const reserved = bookings
          .filter((b) => b.status !== "cancelled")
          .filter((b) => overlap(slotStart, slotEnd, new Date(b.startAt), new Date(b.endAt)))
          .reduce((acc, b) => acc + (b.equipment.find((x) => x.id === eqId)?.qty ?? 0), 0);
        if (reserved + qty > eq.quantityActive) return setError(`Not enough ${eq.name} available.`);
      }

      const id = `FX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const deadline = new Date(slotStart);
      deadline.setHours(deadline.getHours() - cancelHours);
      created.push({
        id,
        customerName,
        roomId,
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        equipment: Object.entries(equipmentQty)
          .filter(([, qty]) => qty > 0)
          .map(([id, qty]) => ({ id, qty })),
        status: approvalMode === "auto" ? "confirmed" : "pending",
        total: totals.subtotal,
        paymentMode,
        createdAt: new Date().toISOString(),
        cancellationDeadline: deadline.toISOString(),
        agreementAccepted,
        idUploaded,
        staffAssigned: null,
      });
    }

    setBookings((prev) => [...created, ...prev]);

    const first = created[0];
    const firstRoom = rooms.find((r) => r.id === first.roomId)?.name ?? "Room";
    setEmailPreview(
      [
        `Subject: FlexSpace booking ${first.id}`,
        `Customer: ${first.customerName}`,
        `Status: ${first.status}`,
        `Room: ${firstRoom}`,
        `Start: ${new Date(first.startAt).toLocaleString()}`,
        `End: ${new Date(first.endAt).toLocaleString()}`,
        `Subtotal: ${fmtMoney(totals.subtotal)}`,
        `Paid now: ${fmtMoney(totals.dueNow)}`,
        `Damage hold: ${fmtMoney(damageHold)} (authorization)`,
        `Late fee rule: ${fmtMoney(lateFee)}`,
      ].join("\n")
    );
    setSmsPreview(
      `FlexSpace ${first.id}: ${firstRoom} ${new Date(first.startAt).toLocaleString()} - ${new Date(first.endAt).toLocaleString()}. Status ${first.status}.`
    );
  };

  const cancelBooking = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    if (new Date() > new Date(b.cancellationDeadline)) {
      setError("Cancellation window has passed.");
      return;
    }
    setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
  };

  const approveBooking = (id: string) => {
    setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "confirmed" } : x)));
  };

  const markCompleted = (id: string) => {
    setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "completed" } : x)));
  };

  const usage = useMemo(() => {
    const active = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
    const roomUsage = rooms.map((r) => active.filter((b) => b.roomId === r.id).length);
    const roomUsageRate = Math.round((roomUsage.reduce((a, b) => a + b, 0) / Math.max(1, rooms.length * 5)) * 100);
    const equipmentUsageRate = Math.round(
      (active.reduce((acc, b) => acc + b.equipment.reduce((a, e) => a + e.qty, 0), 0) / Math.max(1, equipments.reduce((a, e) => a + e.quantityActive, 0) * 3)) *
        100
    );
    const revenue = active.reduce((a, b) => a + b.total, 0);
    return { roomUsageRate, equipmentUsageRate, revenue };
  }, [bookings, rooms, equipments]);

  const todayCount = bookings.filter((b) => new Date(b.startAt).toDateString() === new Date().toDateString()).length;
  const upcomingCount = bookings.filter((b) => new Date(b.startAt) > new Date() && b.status !== "cancelled").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">FlexSpace Rentals</h1>
            <p className="text-sm text-slate-300">Functional room + equipment rental app with hour-based conflict-safe booking.</p>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-700 bg-slate-900 p-1">
            {(["customer", "admin", "staff"] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`rounded-lg px-3 py-2 text-sm capitalize ${role === r ? "bg-indigo-600 text-white" : "text-slate-200"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

        {role === "customer" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold">Create booking</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Customer name">
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Room">
                  <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={inputClass}>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {fmtMoney(r.hourlyRate)}/hr
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Start date/time">
                  <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Duration (hours)">
                  <input type="number" min={1} value={durationHours} onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
                </Field>
                <Field label="Recurring weekly bookings">
                  <input type="number" min={1} max={8} value={recurringWeeks} onChange={(e) => setRecurringWeeks(Math.min(8, Math.max(1, Number(e.target.value) || 1)))} className={inputClass} />
                </Field>
                <Field label="Payment">
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as "deposit" | "full")} className={inputClass}>
                    <option value="deposit">Deposit</option>
                    <option value="full">Full payment</option>
                  </select>
                </Field>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-200">Equipment add-ons</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {equipments.map((e) => (
                    <div key={e.id} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>{e.name}</span>
                        <span className="text-slate-300">{fmtMoney(e.hourlyRate)}/hr · avail {e.quantityActive}</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={e.quantityActive}
                        value={equipmentQty[e.id] ?? 0}
                        onChange={(ev) => setEquipmentQty((prev) => ({ ...prev, [e.id]: Math.max(0, Number(ev.target.value) || 0) }))}
                        className={`${inputClass} mt-2`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={agreementAccepted} onChange={(e) => setAgreementAccepted(e.target.checked)} />
                  Accept rental agreement
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={idUploaded} onChange={(e) => setIdUploaded(e.target.checked)} />
                  ID uploaded
                </label>
              </div>

              <button onClick={createBooking} className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
                Book now
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold">Price summary</h2>
              <Line label="Room" value={fmtMoney(totals.roomCost)} />
              <Line label="Equipment" value={fmtMoney(totals.equipmentCost)} />
              <Line label="Subtotal" value={fmtMoney(totals.subtotal)} />
              <Line label="Deposit" value={fmtMoney(totals.deposit)} />
              <Line label="Pay now" value={fmtMoney(totals.dueNow)} />
              <Line label="Damage hold" value={fmtMoney(damageHold)} />
              <Line label="Cancellation window" value={`${cancelHours}h`} />
            </div>

            <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 lg:col-span-3">
              <h3 className="text-sm font-semibold text-emerald-100">Email to screen</h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-emerald-100">{emailPreview || "No confirmation email yet."}</pre>
              <h3 className="text-sm font-semibold text-emerald-100">SMS to screen</h3>
              <p className="rounded-lg bg-slate-900 p-3 text-xs text-emerald-100">{smsPreview || "No SMS yet."}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-3">
              <h2 className="text-lg font-semibold">My bookings</h2>
              {bookings.filter((b) => b.customerName === customerName).length === 0 && <p className="text-sm text-slate-300">No bookings yet.</p>}
              {bookings
                .filter((b) => b.customerName === customerName)
                .map((b) => (
                  <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm">
                        <p className="font-semibold">
                          {b.id} · {rooms.find((r) => r.id === b.roomId)?.name}
                        </p>
                        <p className="text-slate-300">
                          {new Date(b.startAt).toLocaleString()} - {new Date(b.endAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase">{b.status}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {b.status !== "cancelled" && (
                        <button onClick={() => cancelBooking(b.id)} className="rounded-lg border border-slate-600 px-3 py-1 text-xs hover:border-red-400">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {role === "admin" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold">Policy controls</h2>
              <Toggle label="Auto approve bookings" value={approvalMode === "auto"} onChange={(v) => setApprovalMode(v ? "auto" : "manual")} />
              <Toggle label="Require ID upload" value={requireId} onChange={setRequireId} />
              <Toggle label="Require deposit" value={requireDeposit} onChange={setRequireDeposit} />
              <Field label="Buffer minutes">
                <input type="number" value={bufferMinutes} onChange={(e) => setBufferMinutes(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              </Field>
              <Field label="Cancellation window (hours)">
                <input type="number" value={cancelHours} onChange={(e) => setCancelHours(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
              </Field>
              <Field label="Deposit %">
                <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              </Field>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Stat label="Today's bookings" value={String(todayCount)} />
                <Stat label="Upcoming bookings" value={String(upcomingCount)} />
                <Stat label="Room usage rate" value={`${usage.roomUsageRate}%`} />
                <Stat label="Equipment usage rate" value={`${usage.equipmentUsageRate}%`} />
                <Stat label="Revenue (booked)" value={fmtMoney(usage.revenue)} />
                <Stat label="Late fee rule" value={fmtMoney(lateFee)} />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold">Approvals + assignments</h2>
              {bookings.length === 0 && <p className="text-sm text-slate-300">No bookings yet.</p>}
              {bookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm">
                      <p className="font-semibold">
                        {b.id} · {b.customerName}
                      </p>
                      <p className="text-slate-300">
                        {rooms.find((r) => r.id === b.roomId)?.name} · {new Date(b.startAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase">{b.status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.status === "pending" && (
                      <button onClick={() => approveBooking(b.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold hover:bg-emerald-500">
                        Approve
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <button onClick={() => markCompleted(b.id)} className="rounded-lg border border-slate-600 px-3 py-1 text-xs hover:border-emerald-400">
                        Mark completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold">Maintenance + availability</h2>
              <Field label="Mark equipment unavailable">
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setEquipments((prev) =>
                      prev.map((x) => (x.id === e.target.value ? { ...x, quantityActive: Math.max(0, x.quantityActive - 1) } : x))
                    )
                  }
                >
                  <option value="">Select equipment</option>
                  {equipments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                onClick={() => {
                  if (!roomId || !startAt) return;
                  const s = new Date(startAt);
                  const e = new Date(s);
                  e.setHours(e.getHours() + 2);
                  setMaintenance((prev) => [
                    {
                      id: `m-${Math.random().toString(36).slice(2, 7)}`,
                      resourceType: "room",
                      resourceId: roomId,
                      startAt: s.toISOString(),
                      endAt: e.toISOString(),
                      reason: "Cleaning / setup",
                    },
                    ...prev,
                  ]);
                }}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:border-indigo-400"
              >
                Add maintenance block for selected room
              </button>
              <div className="space-y-2">
                {maintenance.map((m) => (
                  <div key={m.id} className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs">
                    {m.resourceType} {m.resourceId} · {new Date(m.startAt).toLocaleString()} - {new Date(m.endAt).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {role === "staff" && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold">Assigned / active bookings</h2>
              <div className="mt-3 space-y-2">
                {bookings.filter((b) => b.status === "confirmed").length === 0 && <p className="text-sm text-slate-300">No active bookings.</p>}
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .map((b) => (
                    <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm">
                      <p className="font-semibold">
                        {b.id} · {rooms.find((r) => r.id === b.roomId)?.name}
                      </p>
                      <p className="text-slate-300">{new Date(b.startAt).toLocaleString()}</p>
                      <button onClick={() => markCompleted(b.id)} className="mt-2 rounded-lg border border-slate-600 px-3 py-1 text-xs hover:border-emerald-400">
                        Complete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold">Chat with location</h2>
              <div className="mt-3 space-y-2">
                {chatLog.map((m, i) => (
                  <div key={`${m}-${i}`} className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm">
                    {m}
                  </div>
                ))}
                <button
                  onClick={() => setChatLog((prev) => [...prev, `Staff update ${new Date().toLocaleTimeString()}: Setup complete for next session.`])}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold hover:bg-indigo-500"
                >
                  Send status message
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
