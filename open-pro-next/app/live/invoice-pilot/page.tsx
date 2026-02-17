"use client";

import { useMemo, useState } from "react";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type BillingMode = "hourly" | "fixed";

type Client = {
  id: string;
  name: string;
  email: string;
  portalCode: string;
};

type Proposal = {
  id: string;
  clientId: string;
  title: string;
  amount: number;
  accepted: boolean;
};

type InvoiceItem = {
  id: string;
  desc: string;
  qty: number;
  rate: number;
};

type Invoice = {
  id: string;
  number: string;
  clientId: string;
  mode: BillingMode;
  status: InvoiceStatus;
  currency: string;
  taxPct: number;
  recurring: boolean;
  lateFees: boolean;
  notes: string;
  items: InvoiceItem[];
  proposalId?: string;
  createdAt: string;
};

type Payment = {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  method: string;
  at: string;
};

type Outbox = {
  id: string;
  to: string;
  subject: string;
  body: string;
  at: string;
};

const clientSeed: Client[] = [{ id: "cl-1", name: "Northline Studio", email: "ap@northline.com", portalCode: "NORTH-842" }];
const proposalSeed: Proposal[] = [{ id: "pr-1", clientId: "cl-1", title: "Monthly Retainer Design Support", amount: 1800, accepted: false }];
const nowIso = new Date().toISOString().slice(0, 10);

function money(currency: string, value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function InvoicePilotLive() {
  const [clients, setClients] = useState<Client[]>(clientSeed);
  const [proposals, setProposals] = useState<Proposal[]>(proposalSeed);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [outbox, setOutbox] = useState<Outbox[]>([]);

  const [settings, setSettings] = useState({
    brandName: "InvoicePilot",
    logoText: "IP",
    prefix: "INV",
    nextNumber: 1001,
  });

  const [clientForm, setClientForm] = useState({ name: "", email: "" });
  const [clientError, setClientError] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(clientSeed[0].id);

  const [itemDraft, setItemDraft] = useState({ desc: "", qty: 1, rate: 100 });
  const [invoiceDraft, setInvoiceDraft] = useState({
    mode: "hourly" as BillingMode,
    currency: "USD",
    taxPct: 8.5,
    recurring: false,
    lateFees: true,
    notes: "Payment due in 7 days.",
    items: [{ id: "it-1", desc: "Design sprint support", qty: 8, rate: 120 }] as InvoiceItem[],
    proposalId: "",
  });
  const [invoiceError, setInvoiceError] = useState("");
  const [portalClientId, setPortalClientId] = useState(clientSeed[0].id);

  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients]);

  const pushOut = (to: string, subject: string, body: string) => {
    setOutbox((prev) => [
      { id: `o-${Math.random().toString(36).slice(2, 8)}`, to, subject, body, at: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const addClient = () => {
    const name = clientForm.name.trim();
    const email = clientForm.email.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk) {
      setClientError("Name and valid email are required.");
      return;
    }
    if (clients.some((c) => c.email.toLowerCase() === email)) {
      setClientError("Client email already exists.");
      return;
    }
    const newClient: Client = {
      id: `cl-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      portalCode: `PORT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };
    setClients((prev) => [newClient, ...prev]);
    setSelectedClientId(newClient.id);
    setPortalClientId(newClient.id);
    setClientForm({ name: "", email: "" });
    setClientError("");
    pushOut(newClient.email, "Client Portal Activated", `Portal code: ${newClient.portalCode}. You can review invoices and receipts.`);
  };

  const addProposal = () => {
    const p: Proposal = {
      id: `pr-${Math.random().toString(36).slice(2, 8)}`,
      clientId: selectedClientId,
      title: "New Service Proposal",
      amount: 1200,
      accepted: false,
    };
    setProposals((prev) => [p, ...prev]);
  };

  const acceptProposal = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.accepted) return;
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, accepted: true } : p)));
    setInvoiceDraft((d) => ({ ...d, proposalId }));
    const client = clientById[proposal.clientId];
    if (client) {
      pushOut(client.email, "Proposal Accepted", `Proposal "${proposal.title}" accepted. Ready to generate invoice.`);
    }
  };

  const addItem = () => {
    if (!itemDraft.desc.trim() || itemDraft.qty < 1 || itemDraft.rate <= 0) return;
    setInvoiceDraft((d) => ({
      ...d,
      items: [...d.items, { id: `it-${Math.random().toString(36).slice(2, 8)}`, desc: itemDraft.desc.trim(), qty: itemDraft.qty, rate: itemDraft.rate }],
    }));
    setItemDraft({ desc: "", qty: 1, rate: 100 });
  };

  const removeItem = (id: string) => setInvoiceDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const subtotalDraft = useMemo(() => invoiceDraft.items.reduce((s, i) => s + i.qty * i.rate, 0), [invoiceDraft.items]);
  const taxDraft = subtotalDraft * (invoiceDraft.taxPct / 100);
  const totalDraft = subtotalDraft + taxDraft;

  const createInvoice = () => {
    if (!selectedClientId || invoiceDraft.items.length === 0) {
      setInvoiceError("Select a client and add at least one line item.");
      return;
    }
    setInvoiceError("");
    const number = `${settings.prefix}-${settings.nextNumber}`;
    setSettings((s) => ({ ...s, nextNumber: s.nextNumber + 1 }));
    const inv: Invoice = {
      id: `in-${Math.random().toString(36).slice(2, 8)}`,
      number,
      clientId: selectedClientId,
      mode: invoiceDraft.mode,
      status: "draft",
      currency: invoiceDraft.currency,
      taxPct: invoiceDraft.taxPct,
      recurring: invoiceDraft.recurring,
      lateFees: invoiceDraft.lateFees,
      notes: invoiceDraft.notes,
      items: invoiceDraft.items,
      proposalId: invoiceDraft.proposalId || undefined,
      createdAt: nowIso,
    };
    setInvoices((prev) => [inv, ...prev]);
    const c = clientById[selectedClientId];
    if (c) pushOut(c.email, "Invoice Draft Created", `Invoice ${number} created for ${money(inv.currency, totalDraft)}.`);
  };

  const invoiceTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
    return subtotal + subtotal * (inv.taxPct / 100);
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id && inv.status === "draft" ? { ...inv, status: "sent" } : inv)));
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    const c = clientById[inv.clientId];
    if (!c) return;
    const link = `https://pay.mock.stripe/${inv.number}`;
    pushOut(c.email, "Payment Link", `Invoice ${inv.number} is ready: ${link}`);
  };

  const markOverdue = (id: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id && inv.status === "sent" ? { ...inv, status: "overdue" } : inv)));
  };

  const payInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === "paid") return;
    const amount = invoiceTotal(inv);
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: "paid" } : i)));
    const payment: Payment = {
      id: `pm-${Math.random().toString(36).slice(2, 8)}`,
      invoiceId,
      clientId: inv.clientId,
      amount,
      method: "Stripe Mock",
      at: new Date().toLocaleString(),
    };
    setPayments((prev) => [payment, ...prev]);
    const c = clientById[inv.clientId];
    if (c) pushOut(c.email, "Payment Received", `Invoice ${inv.number} paid: ${money(inv.currency, amount)}.`);
  };

  const downloadReceipt = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const c = clientById[inv.clientId];
    pushOut(c?.email || "client", "Receipt Download", `Receipt generated for ${inv.number}.`);
  };

  const portalInvoices = invoices.filter((i) => i.clientId === portalClientId);
  const portalPayments = payments.filter((p) => p.clientId === portalClientId);

  return (
    <div className="min-h-screen bg-[#141414] text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#102a2b] via-[#102225] to-[#0c171c] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">InvoicePilot · Freelancer Billing</p>
          <h1 className="mt-1 text-3xl font-semibold">Invoicing + Client Portal</h1>
          <p className="mt-2 text-slate-300/80">Create clients, accept proposals, generate invoices, and collect payments faster.</p>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-6">
            <Panel title="Create Client">
              <div className="grid gap-3">
                <Input label="Client name" value={clientForm.name} onChange={(v) => setClientForm((f) => ({ ...f, name: v }))} />
                <Input label="Email" value={clientForm.email} onChange={(v) => setClientForm((f) => ({ ...f, email: v }))} />
                {clientError && <p className="text-sm text-rose-300">{clientError}</p>}
                <button onClick={addClient} className="rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-900 hover:bg-emerald-400">
                  Save client
                </button>
              </div>
            </Panel>

            <Panel title="Proposal Flow">
              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-300/90">Client</span>
                  <select className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <button onClick={addProposal} className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm">New proposal</button>
                <div className="space-y-2">
                  {proposals.map((p) => (
                    <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-slate-300/80">{clientById[p.clientId]?.name} · {money("USD", p.amount)}</p>
                      <div className="mt-2">
                        {p.accepted ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-100">accepted</span>
                        ) : (
                          <button onClick={() => acceptProposal(p.id)} className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-900">Accept</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <Panel title="Invoice Editor">
              <div className="grid gap-3 md:grid-cols-2">
                <Select label="Billing mode" value={invoiceDraft.mode} onChange={(v) => setInvoiceDraft((d) => ({ ...d, mode: v as BillingMode }))}>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed project</option>
                </Select>
                <Select label="Currency" value={invoiceDraft.currency} onChange={(v) => setInvoiceDraft((d) => ({ ...d, currency: v }))}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </Select>
                <Input label="Tax %" type="number" min={0} value={String(invoiceDraft.taxPct)} onChange={(v) => setInvoiceDraft((d) => ({ ...d, taxPct: Number(v) || 0 }))} />
                <Select label="Proposal link" value={invoiceDraft.proposalId} onChange={(v) => setInvoiceDraft((d) => ({ ...d, proposalId: v }))}>
                  <option value="">No linked proposal</option>
                  {proposals.filter((p) => p.accepted).map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </Select>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <Input label="Description" value={itemDraft.desc} onChange={(v) => setItemDraft((d) => ({ ...d, desc: v }))} />
                <Input label="Qty" type="number" min={1} value={String(itemDraft.qty)} onChange={(v) => setItemDraft((d) => ({ ...d, qty: Number(v) || 1 }))} />
                <Input label="Rate" type="number" min={1} value={String(itemDraft.rate)} onChange={(v) => setItemDraft((d) => ({ ...d, rate: Number(v) || 1 }))} />
                <button onClick={addItem} className="mt-6 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm">Add line</button>
              </div>
              <div className="mt-3 space-y-2">
                {invoiceDraft.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <span>{it.desc} · {it.qty} x {money(invoiceDraft.currency, it.rate)}</span>
                    <button onClick={() => removeItem(it.id)} className="rounded border border-white/20 px-2 py-1 text-xs">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <label className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  <input type="checkbox" className="mr-2" checked={invoiceDraft.recurring} onChange={(e) => setInvoiceDraft((d) => ({ ...d, recurring: e.target.checked }))} />
                  Recurring invoice
                </label>
                <label className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  <input type="checkbox" className="mr-2" checked={invoiceDraft.lateFees} onChange={(e) => setInvoiceDraft((d) => ({ ...d, lateFees: e.target.checked }))} />
                  Late fees
                </label>
              </div>
              <textarea
                className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
                rows={2}
                value={invoiceDraft.notes}
                onChange={(e) => setInvoiceDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Notes..."
              />
              {invoiceError && <p className="mt-2 text-sm text-rose-300">{invoiceError}</p>}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-[#1d1d1d] px-3 py-2 text-sm">
                <span>Total</span>
                <span className="font-semibold">{money(invoiceDraft.currency, totalDraft)}</span>
              </div>
              <button onClick={createInvoice} className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-900 hover:bg-emerald-400">
                Generate invoice
              </button>
            </Panel>

            <Panel title="Invoices List">
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{inv.number}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        inv.status === "paid" ? "bg-emerald-500/20 text-emerald-100" :
                        inv.status === "overdue" ? "bg-rose-500/20 text-rose-100" :
                        inv.status === "sent" ? "bg-amber-500/20 text-amber-100" : "bg-slate-500/20 text-slate-100"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/80">{clientById[inv.clientId]?.name} · {money(inv.currency, invoiceTotal(inv))}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {inv.status === "draft" && <button onClick={() => sendInvoice(inv.id)} className="rounded border border-white/20 px-2 py-1 text-xs">Send</button>}
                      {inv.status === "sent" && <button onClick={() => markOverdue(inv.id)} className="rounded border border-white/20 px-2 py-1 text-xs">Mark overdue</button>}
                      {inv.status !== "paid" && <button onClick={() => payInvoice(inv.id)} className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-900">Mark paid</button>}
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && <p className="text-sm text-slate-300/80">No invoices yet.</p>}
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <Panel title="Client Portal">
              <Select label="Portal user" value={portalClientId} onChange={setPortalClientId}>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <div className="mt-3 space-y-2">
                {portalInvoices.map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="font-medium">{inv.number}</p>
                    <p className="text-xs text-slate-300/80">{money(inv.currency, invoiceTotal(inv))} · {inv.status}</p>
                    <div className="mt-2 flex gap-2">
                      {inv.status !== "paid" && <button onClick={() => payInvoice(inv.id)} className="rounded border border-white/20 px-2 py-1 text-xs">Pay</button>}
                      <button onClick={() => downloadReceipt(inv.id)} className="rounded border border-white/20 px-2 py-1 text-xs">Download receipt</button>
                    </div>
                  </div>
                ))}
                {portalInvoices.length === 0 && <p className="text-sm text-slate-300/80">No portal invoices yet.</p>}
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-[#1f1f1f] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Payment history</p>
                <div className="mt-2 space-y-1">
                  {portalPayments.map((p) => (
                    <p key={p.id} className="text-xs text-slate-200/90">{money("USD", p.amount)} · {p.method}</p>
                  ))}
                  {portalPayments.length === 0 && <p className="text-xs text-slate-300/80">No payments yet.</p>}
                </div>
              </div>
            </Panel>

            <Panel title="Settings">
              <Input label="Brand name" value={settings.brandName} onChange={(v) => setSettings((s) => ({ ...s, brandName: v }))} />
              <Input label="Logo text" value={settings.logoText} onChange={(v) => setSettings((s) => ({ ...s, logoText: v }))} />
              <Input label="Invoice prefix" value={settings.prefix} onChange={(v) => setSettings((s) => ({ ...s, prefix: v }))} />
              <Input label="Next number" type="number" min={1} value={String(settings.nextNumber)} onChange={(v) => setSettings((s) => ({ ...s, nextNumber: Number(v) || 1 }))} />
            </Panel>

            <Panel title="Email to Screen">
              <div className="max-h-72 space-y-2 overflow-auto pr-1">
                {outbox.map((o) => (
                  <div key={o.id} className="rounded-lg border border-white/10 bg-[#1d1d1d] p-2.5 text-xs">
                    <p className="text-emerald-200/80">{o.at} · {o.to}</p>
                    <p className="font-semibold">{o.subject}</p>
                    <p className="text-slate-200/90">{o.body}</p>
                  </div>
                ))}
                {outbox.length === 0 && <p className="text-sm text-slate-300/80">No outbound events yet.</p>}
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
    <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/85">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300/90">{label}</span>
      <input
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-300"
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
