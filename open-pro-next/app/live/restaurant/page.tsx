"use client";

import { useMemo, useState } from "react";

type TimeSlot = {
  time: string;
  status: "available" | "unavailable" | "trending";
};

const palette = {
  burgundy: "#8B2635",
  gold: "#D4AF37",
  cream: "#FAF8F5",
  charcoal: "#333333",
  white: "#FFFFFF",
};

type Palette = typeof palette;

const timeSlots: TimeSlot[] = [
  { time: "5:00 PM", status: "available" },
  { time: "5:30 PM", status: "available" },
  { time: "7:00 PM", status: "trending" },
  { time: "8:30 PM", status: "available" },
  { time: "9:00 PM", status: "unavailable" },
];

const menuTabs = ["Appetizers", "Mains", "Desserts", "Drinks", "Wine List"];

const menuItems = [
  {
    name: "Wagyu Carpaccio",
    desc: "Shaved parmesan, capers, lemon-infused olive oil.",
    price: "$28",
    tags: ["🌾 GF", "🌶️ Mild"],
  },
  {
    name: "Black Truffle Tagliatelle",
    desc: "House-made pasta, pecorino romano, shaved truffle.",
    price: "$34",
    tags: ["🌿 Veg"],
  },
  {
    name: "Bone-In Ribeye 18oz",
    desc: "Charred over oak, herb butter, roasted garlic.",
    price: "$62",
    tags: ["🔥 Chef's pick"],
  },
];

const deposits = [
  {
    name: "Osteria Luna",
    date: "Feb 20, 7:30 PM",
    amount: "$50",
    status: "Paid",
    policy: "Free cancellation until Feb 19, 7:30 PM",
  },
  {
    name: "Maison Rouge",
    date: "Mar 02, 8:00 PM",
    amount: "$75",
    status: "Pending",
    policy: "Deposit applies to bill",
  },
];

const payments = [
  { brand: "Visa", last4: "4242", exp: "12/26", isDefault: true },
  { brand: "Amex", last4: "3005", exp: "05/27", isDefault: false },
];

export default function TableReadyPage() {
  const [activeScreen, setActiveScreen] = useState<
    "home" | "reserve" | "menu" | "deposits" | "profile"
  >("home");
  const [activeTab, setActiveTab] = useState("Mains");
  const [selectedTime, setSelectedTime] = useState("7:00 PM");
  const [partySize, setPartySize] = useState(2);
  const [ref, setRef] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  const [smsPreview, setSmsPreview] = useState<string | null>(null);

  const screenTitle = useMemo(() => {
    switch (activeScreen) {
      case "home":
        return "Home";
      case "reserve":
        return "Reservation";
      case "menu":
        return "QR Menu";
      case "deposits":
        return "Deposits";
      case "profile":
        return "Profile";
      default:
        return "Home";
    }
  }, [activeScreen]);

  const confirmReservation = () => {
    const newRef = `TR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setRef(newRef);
    const date = "Today · Feb 15";
    const summary = `${partySize} guests · ${date} at ${selectedTime} · Osteria Luna`;
    setEmailPreview(
      `Thanks for reserving!\\nRef: ${newRef}\\n${summary}\\nDeposit: $50 holds your table. Fully refundable up to 24h before.\\nThis is a mock email preview (would send via SendGrid).`
    );
    setSmsPreview(
      `TableReady ${newRef}: ${summary}. Reply C to confirm or R to adjust. (Mock SMS preview; would send via Twilio)`
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(circle at 20% 20%, rgba(212,175,55,0.08), transparent 45%), radial-gradient(circle at 80% 0%, rgba(139,38,53,0.12), transparent 40%), ${palette.cream}`,
        color: palette.charcoal,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <header className="flex items-center justify-between gap-4 pb-6">
          <div>
            <div className="text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: palette.burgundy }}>
              TableReady
            </div>
            <p className="text-sm text-gray-600">Premium reservations, QR menus, and deposits.</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium">
            {["home", "reserve", "menu", "deposits", "profile"].map((key) => (
              <button
                key={key}
                onClick={() => setActiveScreen(key as any)}
                className={`rounded-full px-4 py-2 transition ${
                  activeScreen === key
                    ? "shadow-sm"
                    : "border border-gray-300"
                }`}
                style={{
                  backgroundColor: activeScreen === key ? palette.burgundy : palette.white,
                  color: activeScreen === key ? palette.white : palette.charcoal,
                  borderColor: activeScreen === key ? palette.burgundy : "#e5e7eb",
                }}
              >
                {screenLabel(key)}
              </button>
            ))}
          </nav>
        </header>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>iPhone 15 Pro · 1179×2556 · Photorealistic demo</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: palette.gold }}></span> Live preview: {screenTitle}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(520px,1fr),1fr]">
          <MockDevice activeScreen={activeScreen} palette={palette} />

          <div className="space-y-6">
            {activeScreen === "home" && <HomeScreen palette={palette} />}
            {activeScreen === "reserve" && (
              <ReservationPanel
                palette={palette}
                timeSlots={timeSlots}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                partySize={partySize}
                setPartySize={setPartySize}
              />
            )}
            {activeScreen === "menu" && (
              <MenuPanel
                palette={palette}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
            {activeScreen === "deposits" && (
              <DepositsPanel palette={palette} />
            )}
            {activeScreen === "profile" && <ProfilePanel palette={palette} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function screenLabel(key: string) {
  switch (key) {
    case "home":
      return "Home";
    case "reserve":
      return "Reserve";
    case "menu":
      return "QR Menu";
    case "deposits":
      return "Deposits";
    case "profile":
      return "Profile";
    default:
      return key;
  }
}

function MockDevice({
  activeScreen,
  palette,
}: {
  activeScreen: "home" | "reserve" | "menu" | "deposits" | "profile";
  palette: Palette;
}) {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>TableReady Desktop Preview</span>
        <span style={{ color: palette.burgundy }}>Desktop</span>
      </div>
      <div className="relative" style={{ background: palette.cream }}>
        {activeScreen === "home" && <HomeScreen palette={palette} />}
        {activeScreen === "reserve" && <ReserveScreen palette={palette} />}
        {activeScreen === "menu" && <MenuScreen palette={palette} />}
        {activeScreen === "deposits" && <DepositScreen palette={palette} />}
        {activeScreen === "profile" && <ProfileScreen palette={palette} />}
      </div>
    </div>
  );
}

function HomeScreen({ palette }: { palette: Palette }) {
  return (
    <div className="h-[680px] w-full">
      <div
        className="relative h-2/5 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15)), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 45%), url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80') center/cover",
        }}
      >
        <div className="absolute inset-0 p-5 text-white">
          <div className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            TableReady
          </div>
          <div className="text-sm text-gray-200">Reserve. Dine. Experience.</div>
          <div className="mt-16 text-xs uppercase tracking-wide text-gray-200">Tonight</div>
          <div className="text-xl font-semibold">Good Evening, Sarah</div>
        </div>
      </div>

      <div className="space-y-4 p-5" style={{ background: palette.cream }}>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-600">This month</div>
          <div className="text-lg font-semibold text-gray-900">3 reservations • 12 favorite restaurants</div>
        </div>

        <button
          className="w-full rounded-xl py-3 text-center text-base font-semibold text-white shadow-md transition active:scale-95"
          style={{ backgroundColor: palette.burgundy, boxShadow: "0 10px 30px rgba(139,38,53,0.25)" }}
        >
          Make a Reservation
        </button>

        <div className="grid grid-cols-3 gap-3 text-sm font-medium text-gray-800">
          {[
            { label: "Browse QR Menus", icon: "📖" },
            { label: "Manage Deposits", icon: "💳" },
            { label: "My Reservations", icon: "🗓️" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-lg">{item.icon}</div>
              <div className="text-xs text-gray-700">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReserveScreen({ palette }: { palette: Palette }) {
  return (
    <div className="h-[680px] space-y-4 bg-white p-5">
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div
          className="h-32"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80') center/cover",
          }}
        ></div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Osteria Luna
              </div>
              <div className="text-sm text-gray-600">Italian • $$$ • Downtown • 1.2 mi</div>
            </div>
            <div className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">4.8 ★</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>Date</span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">Today · Feb 15</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["Feb 15", "Feb 16", "Feb 17", "Feb 18"].map((d, i) => (
            <button
              key={d}
              className={`rounded-full border px-3 py-1 ${i === 0 ? "border-transparent" : "border-gray-200"}`}
              style={{ backgroundColor: i === 0 ? palette.burgundy : palette.white, color: i === 0 ? palette.white : palette.charcoal }}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>Party size</span>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full border border-gray-300 bg-white text-lg">−</button>
            <span className="text-base font-semibold">2</span>
            <button className="h-9 w-9 rounded-full border border-gray-300 bg-white text-lg">+</button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">Time</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={slot.status === "unavailable"}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  slot.status === "unavailable" ? "line-through opacity-40" : ""
                }`}
                style={{
                  borderColor:
                    slot.status === "trending"
                      ? palette.gold
                      : slot.status === "unavailable"
                      ? "#e5e7eb"
                      : palette.burgundy,
                  color: slot.status === "unavailable" ? "#9ca3af" : palette.charcoal,
                  backgroundColor: slot.status === "trending" ? "#FFF9EC" : palette.white,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: slot.status === "trending" ? palette.burgundy : undefined }}>
                    {slot.time}
                  </span>
                  {slot.status === "trending" && <span className="text-xs">🔥 Trending</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-800">
          {["Indoor", "Outdoor", "Bar"].map((opt) => (
            <button
              key={opt}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 hover:border-gray-300"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-700">Special requests</div>
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-gray-300"
          placeholder="Birthday 🎂 | Anniversary 💍 | Business Meal 💼"
          rows={2}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Deposit Required: $25 per person</div>
              <div className="text-xs text-gray-600">Fully refundable up to 24 hours before</div>
            </div>
            <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Visa •••• 4242</div>
          </div>
        </div>

        <button
          onClick={confirmReservation}
          className="w-full rounded-xl py-3 text-center text-base font-semibold text-white shadow-md transition active:scale-95"
          style={{ backgroundColor: palette.burgundy, boxShadow: "0 10px 30px rgba(139,38,53,0.25)" }}
        >
          Confirm Reservation — $50 Deposit
        </button>
        {ref && (
          <div className="space-y-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <p className="font-semibold">Reservation confirmed</p>
            <p>Ref: {ref}</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-xl border border-green-200 bg-white p-2 text-xs text-green-900">
                <p className="font-semibold text-green-800">Email preview</p>
                <pre className="whitespace-pre-wrap">{emailPreview}</pre>
              </div>
              <div className="rounded-xl border border-green-200 bg-white p-2 text-xs text-green-900">
                <p className="font-semibold text-green-800">SMS preview</p>
                <p>{smsPreview}</p>
              </div>
            </div>
            <p className="text-xs text-green-700">In production this would send via email/SMS/webhook; here it’s printed to screen for demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuScreen({ palette }: { palette: Palette }) {
  return (
    <div className="h-[680px] bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Osteria Luna
          </div>
          <div className="text-xs text-gray-600">📍 You're dining here now</div>
        </div>
        <button className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">Scan to View</button>
      </div>

      <div className="px-5">
        <div className="flex gap-2 overflow-auto pb-3 text-sm font-semibold">
          {menuTabs.map((tab) => (
            <span
              key={tab}
              className="rounded-full border border-gray-200 px-3 py-2"
              style={{
                backgroundColor: tab === "Mains" ? palette.burgundy : palette.white,
                color: tab === "Mains" ? palette.white : palette.charcoal,
                borderColor: tab === "Mains" ? palette.burgundy : "#e5e7eb",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Chef's Recommendations • Today's pairings included
        </div>
        {menuItems.map((item) => (
          <div key={item.name} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div
              className="h-20 w-24 flex-shrink-0 rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80') center/cover",
              }}
            ></div>
            <div className="flex-1 space-y-1">
              <div className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {item.name}
              </div>
              <div className="text-sm text-gray-600">{item.desc}</div>
              <div className="flex flex-wrap gap-1 text-xs text-gray-700">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="text-sm font-semibold" style={{ color: palette.burgundy }}>
                {item.price}
              </div>
              <button className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-300">
                Add to order
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3 text-sm font-semibold shadow-[0_-10px_30px_rgba(0,0,0,0.08)]"
        style={{ background: "rgba(255,255,255,0.95)" }}
      >
        <span>View Cart (3 items)</span>
        <button
          className="rounded-full px-4 py-2 text-white"
          style={{ background: palette.burgundy }}
        >
          $87.50 • Checkout
        </button>
      </div>
    </div>
  );
}

function DepositScreen({ palette }: { palette: Palette }) {
  return (
    <div className="h-[680px] space-y-4 bg-white p-5">
      <div className="space-y-3">
        {deposits.map((d) => (
          <div key={d.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {d.name}
                </div>
                <div className="text-sm text-gray-600">{d.date}</div>
              </div>
              <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{d.status}: {d.amount}</div>
            </div>
            <div className="mt-2 text-xs text-gray-600">{d.policy}</div>
            <div className="mt-3 flex gap-2 text-xs font-semibold text-gray-700">
              <button className="rounded-full border border-gray-200 px-3 py-1">Modify</button>
              <button className="rounded-full border border-gray-200 px-3 py-1">Cancel</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-800">Payment methods</div>
        <div className="mt-3 space-y-2 text-sm">
          {payments.map((p) => (
            <div key={p.last4} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <span>
                  {p.brand} •••• {p.last4} — exp {p.exp}
                  {p.isDefault && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Default
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-2 text-xs font-semibold text-gray-600">
                <button>Edit</button>
                <button>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full rounded-xl border border-dashed border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700">
          + Add new payment method
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-800">
        <div className="font-semibold">Deposit history</div>
        <div className="mt-2 space-y-2">
          {["Jan 22", "Dec 18", "Dec 02"].map((d, idx) => (
            <div key={d} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>
                {d} • Osteria Luna
              </span>
              <span className="font-semibold" style={{ color: idx === 0 ? palette.burgundy : palette.charcoal }}>
                {idx === 0 ? "Refunded $50" : idx === 1 ? "Applied $40" : "Forfeited $25"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-sm font-semibold">Financial summary</div>
          <div className="text-xs text-gray-700">Total deposits YTD: $425 • Upcoming commitments: $125 • 2x points on next reservation</div>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ palette }: { palette: Palette }) {
  return (
    <div className="h-[680px] space-y-4 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
        <div>
          <div className="text-lg font-semibold">Sarah Collins</div>
          <div className="text-sm text-gray-600">sarah.collins@example.com</div>
          <div className="text-xs text-gray-600">Dining preferences: Italian, Seafood, Chef's tasting</div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-800">Rewards & loyalty</div>
        <div className="mt-2 text-sm text-gray-700">1,280 points • Tier: Gold • 2x points on next reservation</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-800">Reservation history</div>
        <div className="mt-2 space-y-2 text-sm text-gray-700">
          {["Maison Rouge — Feb 8", "Osteria Luna — Jan 28", "Brasserie 12 — Jan 12"].map((r) => (
            <div key={r} className="rounded-lg bg-gray-50 px-3 py-2">
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">Dining notifications</div>
            <div className="text-xs text-gray-600">Reminders, deposit alerts, QR menu prompts</div>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Enabled</div>
        </div>
      </div>
    </div>
  );
}

function MenuPanel({
  palette,
  activeTab,
  setActiveTab,
}: {
  palette: Palette;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: palette.burgundy }}>
          QR Menu experience
        </h3>
        <div className="text-xs text-gray-500">Live indicator & cart summary</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
        {menuTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="rounded-full border px-3 py-1"
            style={{
              backgroundColor: tab === activeTab ? palette.burgundy : palette.white,
              color: tab === activeTab ? palette.white : palette.charcoal,
              borderColor: tab === activeTab ? palette.burgundy : "#e5e7eb",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {menuItems.map((m) => (
          <div key={m.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: palette.charcoal }}>
              {m.name}
            </div>
            <div className="text-sm text-gray-600">{m.desc}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-700">
              {m.tags.map((t) => (
                <span key={t} className="rounded-full bg-white px-2 py-1">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: palette.burgundy }}>
                {m.price}
              </span>
              <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                Add to order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationPanel({
  palette,
  timeSlots,
  selectedTime,
  setSelectedTime,
  partySize,
  setPartySize,
}: {
  palette: Palette;
  timeSlots: TimeSlot[];
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  partySize: number;
  setPartySize: (n: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: palette.burgundy }}>
          Reservation flow
        </h3>
        <div className="text-xs text-gray-500">Deposits, seating prefs, requests</div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-800">Date</div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
            {["Fri 15", "Sat 16", "Sun 17", "Mon 18"].map((d, idx) => (
              <span
                key={d}
                className="rounded-full border px-3 py-1"
                style={{
                  backgroundColor: idx === 0 ? palette.burgundy : palette.white,
                  color: idx === 0 ? palette.white : palette.charcoal,
                  borderColor: idx === 0 ? palette.burgundy : "#e5e7eb",
                }}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-gray-800">
            <span>Party size</span>
            <div className="flex items-center gap-2">
              <button
                className="h-9 w-9 rounded-full border border-gray-300 bg-white text-lg"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
              >
                −
              </button>
              <span className="text-base">{partySize}</span>
              <button
                className="h-9 w-9 rounded-full border border-gray-300 bg-white text-lg"
                onClick={() => setPartySize(Math.min(10, partySize + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm font-semibold text-gray-800">
            <div>Time</div>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.status === "unavailable"}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    slot.status === "unavailable" ? "line-through opacity-50" : ""
                  }`}
                  style={{
                    borderColor:
                      selectedTime === slot.time
                        ? palette.burgundy
                        : slot.status === "trending"
                        ? palette.gold
                        : "#e5e7eb",
                    backgroundColor: selectedTime === slot.time ? "#FFF5F7" : "#fff",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{slot.time}</span>
                    {slot.status === "trending" && <span className="text-xs">🔥</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
          <div className="font-semibold text-gray-900">Deposit & payment</div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Deposit: $25 / guest</span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">Visa •••• 4242</span>
            </div>
            <div className="text-xs text-gray-600">Refundable up to 24h before</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Indoor", "Outdoor", "Bar"].map((opt) => (
              <div key={opt} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center font-semibold">
                {opt}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs text-gray-600">Special requests</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {["Birthday 🎂", "Anniversary 💍", "Business Meal 💼"].map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            className="w-full rounded-xl py-3 text-center text-sm font-semibold text-white shadow-md"
            style={{ backgroundColor: palette.burgundy }}
          >
            Confirm reservation — {selectedTime}
          </button>
        </div>
      </div>
    </div>
  );
}

function DepositsPanel({ palette }: { palette: Palette }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl text-sm text-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: palette.burgundy }}>
          Deposits & payments
        </h3>
        <span className="text-xs text-gray-500">Status, methods, history</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {deposits.map((d) => (
            <div key={d.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-gray-600">{d.date}</div>
                </div>
                <div className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">{d.status}: {d.amount}</div>
              </div>
              <div className="text-xs text-gray-600">{d.policy}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-800">Payment methods</div>
            <div className="mt-2 space-y-2">
              {payments.map((p) => (
                <div key={p.last4} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span>
                    {p.brand} •••• {p.last4} — exp {p.exp}
                  </span>
                  {p.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Default</span>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-2 w-full rounded-lg border border-dashed border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700">
              + Add payment method
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            <div className="font-semibold">Financial summary</div>
            <div>Total deposits YTD: $425 • Upcoming: $125 • 2x points next booking</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ palette }: { palette: Palette }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: palette.burgundy }}>
          Profile & reviews
        </h3>
        <span className="text-xs text-gray-500">Preferences, history, trust</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
            <div>
              <div className="text-base font-semibold">Sarah Collins</div>
              <div className="text-xs text-gray-600">Gold · 1,280 pts · Prefers window seating</div>
            </div>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-xs text-gray-700">
            Favorites: Osteria Luna, Maison Rouge, Brasserie 12
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
          <div className="font-semibold">Recent reviews</div>
          {["Exceptional service and wine program.", "Loved the truffle pasta."].map((r) => (
            <div key={r} className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700">
              ★★★★★ · {r}
            </div>
          ))}
          <div className="text-xs text-gray-500">Filters: Highest rated | With photos</div>
        </div>
      </div>
    </div>
  );
}
