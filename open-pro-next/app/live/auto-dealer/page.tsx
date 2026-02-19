"use client";

import { useMemo, useState } from "react";

type Car = {
  id: string;
  stockNo: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  price: number;
  status: "available" | "sold" | "hold";
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type TradeIn = {
  id: string;
  clientId: string;
  vehicle: string;
  offer: number;
  note: string;
  createdAt: string;
};

type Contract = {
  id: string;
  clientId: string;
  carId: string;
  lenderType: "dealer" | "bank";
  bankName: string;
  principal: number;
  apr: number;
  termMonths: number;
  monthlyDue: number;
  balance: number;
  nextDueDate: string;
};

type Payment = {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  method: "cash" | "card" | "bank";
  note: string;
};

type Repair = {
  id: string;
  carId: string;
  repairType: string;
  cost: number;
  receiptName: string;
  repairDate: string;
};

type MailLog = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcMonthlyPayment(principal: number, apr: number, months: number) {
  const monthlyRate = apr / 100 / 12;
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  return Number(payment.toFixed(2));
}

export default function AutoDealerPage() {
  const [cars, setCars] = useState<Car[]>([
    {
      id: "car-1",
      stockNo: "A-102",
      vin: "1HGBH41JXMN109186",
      year: 2020,
      make: "Toyota",
      model: "Camry SE",
      price: 18450,
      status: "available",
    },
    {
      id: "car-2",
      stockNo: "A-117",
      vin: "2FMPK3J9XKBC34921",
      year: 2019,
      make: "Ford",
      model: "Edge SEL",
      price: 16900,
      status: "hold",
    },
  ]);
  const [clients, setClients] = useState<Client[]>([
    { id: "cl-1", name: "Luis Rivera", email: "luis@example.com", phone: "(787) 555-1177" },
    { id: "cl-2", name: "Ana Cruz", email: "ana@example.com", phone: "(787) 555-8841" },
  ]);
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [mailLogs, setMailLogs] = useState<MailLog[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [stockNo, setStockNo] = useState("");
  const [vin, setVin] = useState("");
  const [year, setYear] = useState(2021);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState(0);

  const [tradeClientId, setTradeClientId] = useState("cl-1");
  const [tradeVehicle, setTradeVehicle] = useState("");
  const [tradeOffer, setTradeOffer] = useState(0);
  const [tradeNote, setTradeNote] = useState("");

  const [finClientId, setFinClientId] = useState("cl-1");
  const [finCarId, setFinCarId] = useState("car-1");
  const [lenderType, setLenderType] = useState<"dealer" | "bank">("dealer");
  const [bankName, setBankName] = useState("Banco Popular");
  const [downPayment, setDownPayment] = useState(2000);
  const [apr, setApr] = useState(8.9);
  const [termMonths, setTermMonths] = useState(60);

  const [payContractId, setPayContractId] = useState("");
  const [payAmount, setPayAmount] = useState(300);
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "bank">("bank");
  const [payNote, setPayNote] = useState("");

  const [repairCarId, setRepairCarId] = useState("car-1");
  const [repairType, setRepairType] = useState("");
  const [repairCost, setRepairCost] = useState(0);
  const [receiptName, setReceiptName] = useState("");

  const selectedCar = cars.find((c) => c.id === finCarId);
  const principal = Math.max(0, (selectedCar?.price ?? 0) - downPayment);
  const monthlyDue = calcMonthlyPayment(principal, apr, termMonths);

  const totals = useMemo(() => {
    const arBalance = contracts.reduce((sum, c) => sum + c.balance, 0);
    const depositsAndPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const inventoryValue = cars.filter((c) => c.status !== "sold").reduce((sum, c) => sum + c.price, 0);
    const repairTotal = repairs.reduce((sum, r) => sum + r.cost, 0);
    return { arBalance, depositsAndPayments, inventoryValue, repairTotal };
  }, [contracts, payments, cars, repairs]);

  const addMailLog = (to: string, subject: string, body: string) => {
    setMailLogs((prev) => [{ id: uid("mail"), to, subject, body, sentAt: new Date().toLocaleString() }, ...prev]);
  };

  const createClient = () => {
    if (!clientName.trim() || !clientEmail.trim()) return;
    const newClient: Client = { id: uid("cl"), name: clientName.trim(), email: clientEmail.trim(), phone: clientPhone.trim() };
    setClients((prev) => [newClient, ...prev]);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    addMailLog(newClient.email, "Client profile created", `Welcome ${newClient.name}. Your account was created in AutoDealer CRM.`);
  };

  const addCar = () => {
    if (!stockNo.trim() || !vin.trim() || !make.trim() || !model.trim() || price <= 0) return;
    const newCar: Car = {
      id: uid("car"),
      stockNo: stockNo.trim(),
      vin: vin.trim(),
      year,
      make: make.trim(),
      model: model.trim(),
      price,
      status: "available",
    };
    setCars((prev) => [newCar, ...prev]);
    setStockNo("");
    setVin("");
    setMake("");
    setModel("");
    setPrice(0);
  };

  const saveTradeIn = () => {
    if (!tradeClientId || !tradeVehicle.trim() || tradeOffer <= 0) return;
    const trade: TradeIn = {
      id: uid("tr"),
      clientId: tradeClientId,
      vehicle: tradeVehicle.trim(),
      offer: tradeOffer,
      note: tradeNote.trim(),
      createdAt: new Date().toLocaleDateString(),
    };
    setTradeIns((prev) => [trade, ...prev]);
    setTradeVehicle("");
    setTradeOffer(0);
    setTradeNote("");
  };

  const createFinancingContract = () => {
    if (!finClientId || !finCarId || principal <= 0 || termMonths <= 0) return;
    const contract: Contract = {
      id: uid("ct"),
      clientId: finClientId,
      carId: finCarId,
      lenderType,
      bankName: lenderType === "bank" ? bankName : "Dealer Finance",
      principal,
      apr,
      termMonths,
      monthlyDue,
      balance: principal,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    setContracts((prev) => [contract, ...prev]);
    setPayContractId(contract.id);

    setCars((prev) => prev.map((car) => (car.id === finCarId ? { ...car, status: "sold" } : car)));

    const client = clients.find((c) => c.id === finClientId);
    if (client) {
      addMailLog(
        client.email,
        "Financing contract created",
        `Contract ${contract.id} created for ${selectedCar?.year} ${selectedCar?.make} ${selectedCar?.model}. Monthly due: ${money(
          contract.monthlyDue,
        )}.`,
      );
    }
  };

  const postPayment = () => {
    if (!payContractId || payAmount <= 0) return;
    setContracts((prev) =>
      prev.map((c) => (c.id === payContractId ? { ...c, balance: Math.max(0, Number((c.balance - payAmount).toFixed(2))) } : c)),
    );
    const payment: Payment = {
      id: uid("pay"),
      contractId: payContractId,
      amount: payAmount,
      paymentDate: new Date().toISOString().slice(0, 10),
      method: payMethod,
      note: payNote.trim(),
    };
    setPayments((prev) => [payment, ...prev]);
    setPayNote("");
  };

  const sendStatementReminder = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const client = clients.find((c) => c.id === contract.clientId);
    const car = cars.find((c) => c.id === contract.carId);
    if (!client) return;
    addMailLog(
      client.email,
      `Payment reminder - Contract ${contract.id}`,
      `Statement update: ${car?.year} ${car?.make} ${car?.model} | Remaining balance ${money(contract.balance)} | Next due ${
        contract.nextDueDate
      }.`,
    );
  };

  const addRepair = () => {
    if (!repairCarId || !repairType.trim() || repairCost <= 0) return;
    const repair: Repair = {
      id: uid("rep"),
      carId: repairCarId,
      repairType: repairType.trim(),
      cost: repairCost,
      receiptName: receiptName.trim() || "No receipt uploaded",
      repairDate: new Date().toISOString().slice(0, 10),
    };
    setRepairs((prev) => [repair, ...prev]);
    setRepairType("");
    setRepairCost(0);
    setReceiptName("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-rose-900/50 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-200">AutoDealer CRM</p>
          <h1 className="mt-2 text-3xl font-semibold">Used Cars, Trade-Ins, Financing, A/R Ledger, Repairs</h1>
          <p className="mt-2 text-slate-300">
            Functional demo for dealerships: inventory control, trade-in offers, buyer financing (dealer or bank), payment ledger, statements by email, and repair receipts tracking.
          </p>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Inventory value" value={money(totals.inventoryValue)} />
          <MetricCard label="A/R balance" value={money(totals.arBalance)} />
          <MetricCard label="Payments posted" value={money(totals.depositsAndPayments)} />
          <MetricCard label="Repair ledger" value={money(totals.repairTotal)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Client Accounts">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" className={inputCls} />
              <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Phone" className={inputCls} />
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" className={`${inputCls} sm:col-span-2`} />
            </div>
            <button type="button" onClick={createClient} className={btnPrimary}>
              Create client account
            </button>
            <div className="mt-4 space-y-2">
              {clients.map((c) => (
                <div key={c.id} className={rowCls}>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-slate-400">{c.email}</p>
                  </div>
                  <span className="text-sm text-slate-300">{c.phone || "No phone"}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Vehicle Inventory">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={stockNo} onChange={(e) => setStockNo(e.target.value)} placeholder="Stock #" className={inputCls} />
              <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="VIN" className={inputCls} />
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || 2021)} placeholder="Year" className={inputCls} />
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} placeholder="Price" className={inputCls} />
              <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make" className={inputCls} />
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className={inputCls} />
            </div>
            <button type="button" onClick={addCar} className={btnPrimary}>
              Add car to inventory
            </button>
            <div className="mt-4 max-h-52 space-y-2 overflow-auto">
              {cars.map((car) => (
                <div key={car.id} className={rowCls}>
                  <div>
                    <p className="font-medium">{car.year} {car.make} {car.model}</p>
                    <p className="text-xs text-slate-400">Stock {car.stockNo} · VIN {car.vin}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(car.price)}</p>
                    <p className="text-xs capitalize text-slate-300">{car.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel title="Trade-In Intake">
            <select value={tradeClientId} onChange={(e) => setTradeClientId(e.target.value)} className={inputCls}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input value={tradeVehicle} onChange={(e) => setTradeVehicle(e.target.value)} placeholder="Trade-in vehicle (e.g., 2016 Honda Civic)" className={inputCls} />
            <input type="number" value={tradeOffer} onChange={(e) => setTradeOffer(Number(e.target.value) || 0)} placeholder="Offer amount" className={inputCls} />
            <textarea value={tradeNote} onChange={(e) => setTradeNote(e.target.value)} placeholder="Condition notes" className="h-20 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            <button type="button" onClick={saveTradeIn} className={btnPrimary}>Save trade-in</button>
            <div className="mt-3 space-y-2">
              {tradeIns.slice(0, 4).map((t) => (
                <div key={t.id} className={rowCls}>
                  <p className="text-sm">{t.vehicle}</p>
                  <p className="font-semibold">{money(t.offer)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Financing (Dealer + Banks)">
            <select value={finClientId} onChange={(e) => setFinClientId(e.target.value)} className={inputCls}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={finCarId} onChange={(e) => setFinCarId(e.target.value)} className={inputCls}>
              {cars.filter((c) => c.status !== "sold").map((c) => (
                <option key={c.id} value={c.id}>{c.year} {c.make} {c.model} - {money(c.price)}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select value={lenderType} onChange={(e) => setLenderType(e.target.value as "dealer" | "bank")} className={inputCls}>
                <option value="dealer">Dealer finance</option>
                <option value="bank">Bank finance</option>
              </select>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={lenderType !== "bank"} placeholder="Bank name" className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value) || 0)} placeholder="Down" className={inputCls} />
              <input type="number" value={apr} onChange={(e) => setApr(Number(e.target.value) || 0)} placeholder="APR %" className={inputCls} />
              <input type="number" value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value) || 1)} placeholder="Months" className={inputCls} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm">
              <p>Principal: <strong>{money(principal)}</strong></p>
              <p>Est. monthly: <strong>{money(monthlyDue)}</strong></p>
            </div>
            <button type="button" onClick={createFinancingContract} className={btnPrimary}>Create financing contract</button>
          </Panel>

          <Panel title="Payment Posting (A/R Ledger)">
            <select value={payContractId} onChange={(e) => setPayContractId(e.target.value)} className={inputCls}>
              <option value="">Select contract</option>
              {contracts.map((c) => {
                const client = clients.find((x) => x.id === c.clientId);
                return <option key={c.id} value={c.id}>{c.id} · {client?.name} · Bal {money(c.balance)}</option>;
              })}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value) || 0)} placeholder="Amount" className={inputCls} />
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as "cash" | "card" | "bank")} className={inputCls}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Memo / note" className={inputCls} />
            <button type="button" onClick={postPayment} className={btnPrimary}>Post payment</button>
            <div className="mt-3 space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className={rowCls}>
                  <p className="text-sm">{p.contractId} · {p.paymentDate}</p>
                  <p className="font-semibold">{money(p.amount)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Contracts + Statement Reminders">
            <div className="space-y-2">
              {contracts.length === 0 ? (
                <p className="text-sm text-slate-400">No contracts yet.</p>
              ) : (
                contracts.map((c) => {
                  const client = clients.find((x) => x.id === c.clientId);
                  const car = cars.find((x) => x.id === c.carId);
                  return (
                    <div key={c.id} className={rowCls}>
                      <div>
                        <p className="font-medium">{client?.name} · {car?.year} {car?.make} {car?.model}</p>
                        <p className="text-xs text-slate-400">
                          {c.lenderType === "bank" ? c.bankName : "Dealer Finance"} · Due {money(c.monthlyDue)} · Next {c.nextDueDate}
                        </p>
                        <p className="text-xs text-slate-300">Balance: {money(c.balance)}</p>
                      </div>
                      <button type="button" onClick={() => sendStatementReminder(c.id)} className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-amber-400">
                        Email statement
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          <Panel title="Repair Ledger + Receipt Upload">
            <select value={repairCarId} onChange={(e) => setRepairCarId(e.target.value)} className={inputCls}>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>{c.year} {c.make} {c.model}</option>
              ))}
            </select>
            <input value={repairType} onChange={(e) => setRepairType(e.target.value)} placeholder="Repair type" className={inputCls} />
            <input type="number" value={repairCost} onChange={(e) => setRepairCost(Number(e.target.value) || 0)} placeholder="Cost" className={inputCls} />
            <label className="block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
              Upload receipt
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="mt-2 block w-full text-xs"
                onChange={(e) => setReceiptName(e.target.files?.[0]?.name || "")}
              />
            </label>
            <button type="button" onClick={addRepair} className={btnPrimary}>Save repair entry</button>

            <div className="mt-3 max-h-52 space-y-2 overflow-auto">
              {repairs.map((r) => {
                const car = cars.find((x) => x.id === r.carId);
                return (
                  <div key={r.id} className={rowCls}>
                    <div>
                      <p className="font-medium">{car?.year} {car?.make} {car?.model}</p>
                      <p className="text-xs text-slate-400">{r.repairType} · Receipt: {r.receiptName}</p>
                    </div>
                    <p className="font-semibold">{money(r.cost)}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <Panel title="Email-to-Screen Reminder Outbox" className="mt-6">
          <div className="space-y-2">
            {mailLogs.length === 0 ? (
              <p className="text-sm text-slate-400">No email reminders/statements sent yet.</p>
            ) : (
              mailLogs.map((m) => (
                <div key={m.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-sm text-slate-400">To: {m.to}</p>
                  <p className="text-sm text-slate-300">{m.body}</p>
                  <p className="text-xs text-slate-500">{m.sentAt}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-700 bg-slate-900 p-5 ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2";
const rowCls = "flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3";
const btnPrimary = "rounded-lg bg-rose-600 px-3 py-2 font-medium hover:bg-rose-500";

