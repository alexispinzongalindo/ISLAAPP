"use client";

import { useMemo, useState } from "react";

type Service = {
  name: string;
  duration: string;
  price: string;
  category: string;
};

type AddOn = {
  name: string;
  price: string;
};

const services: Service[] = [
  { name: "Swedish Massage", duration: "60 / 90 min", price: "$95 / $135", category: "Massage Therapy" },
  { name: "Deep Tissue", duration: "60 / 90 min", price: "$95 / $135", category: "Massage Therapy" },
  { name: "Hot Stone", duration: "90 min", price: "$135", category: "Massage Therapy" },
  { name: "Aromatherapy", duration: "60 min", price: "$110", category: "Massage Therapy" },
  { name: "Hydrating Facial", duration: "50 / 80 min", price: "$85 / $125", category: "Facial Treatments" },
  { name: "Anti-Aging Treatment", duration: "50 / 80 min", price: "$85 / $125", category: "Facial Treatments" },
  { name: "Acne Clarifying", duration: "50 / 80 min", price: "$85 / $125", category: "Facial Treatments" },
  { name: "Body Scrub & Wrap", duration: "60 min", price: "$110", category: "Body Treatments" },
  { name: "Detox Treatment", duration: "60 min", price: "$110", category: "Body Treatments" },
  { name: "Manicure", duration: "45 min", price: "$45", category: "Nail Services" },
  { name: "Pedicure", duration: "60 min", price: "$65", category: "Nail Services" },
  { name: "Gel Polish", duration: "Add-on", price: "+$20", category: "Nail Services" },
];

const addOns: AddOn[] = [
  { name: "CBD enhancement", price: "+$25" },
  { name: "Extended time", price: "+$40" },
  { name: "Scalp treatment", price: "+$15" },
  { name: "Paraffin hand treatment", price: "+$12" },
];

const giftAmounts = ["$50", "$100", "$150", "$200", "Custom"];

const defaultTheme = {
  accent: "#4A9B8E",
  cta: "Book Now",
  promo: true,
  promoText: "Winter Glow Package: Save 15% this week",
};

export default function CalmSpaDemo() {
  const [accent, setAccent] = useState(defaultTheme.accent);
  const [ctaText, setCtaText] = useState(defaultTheme.cta);
  const [promoOn, setPromoOn] = useState(defaultTheme.promo);
  const [promoText, setPromoText] = useState(defaultTheme.promoText);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [giftAmount, setGiftAmount] = useState("$100");
  const [giftMessage, setGiftMessage] = useState("For your next escape – enjoy! ");

  const filtered = useMemo(
    () => services.filter((s) => !filter || s.category === filter),
    [filter]
  );

  const themeGradient = `linear-gradient(135deg, ${accent} 0%, #b8e3da 100%)`;

  return (
    <div className="min-h-screen bg-[#f6f9f7] text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-semibold" style={{ color: accent }}>
              CalmSpa
            </div>
            <p className="text-slate-600">Serene booking experience with live theme customization.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              "Massage Therapy",
              "Facial Treatments",
              "Body Treatments",
              "Nail Services",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(filter === cat ? null : cat)}
                className={`rounded-full border px-3 py-1 transition ${
                  filter === cat ? "shadow" : ""
                }`}
                style={{
                  borderColor: filter === cat ? accent : "#e5e7eb",
                  background: filter === cat ? accent : "white",
                  color: filter === cat ? "white" : "#0f172a",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
          <PhonePreview
            accent={accent}
            promoOn={promoOn}
            promoText={promoText}
            ctaText={ctaText}
            selectedService={selectedService}
            selectedAddOns={selectedAddOns}
            giftMessage={giftMessage}
          />

          <div className="space-y-6">
            <ThemePanel
              accent={accent}
              setAccent={setAccent}
              ctaText={ctaText}
              setCtaText={setCtaText}
              promoOn={promoOn}
              setPromoOn={setPromoOn}
              promoText={promoText}
              setPromoText={setPromoText}
            />

            <ServicePanel
              accent={accent}
              services={filtered}
              selectedService={selectedService}
              onSelectService={(s) => {
                setSelectedService(s);
                setSelectedAddOns(new Set());
              }}
            />

            {selectedService && (
              <UpsellPanel
                accent={accent}
                addOns={addOns}
                selectedAddOns={selectedAddOns}
                setSelectedAddOns={setSelectedAddOns}
              />
            )}

            <GiftPanel
              accent={accent}
              giftAmount={giftAmount}
              setGiftAmount={setGiftAmount}
              giftMessage={giftMessage}
              setGiftMessage={setGiftMessage}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <div className="font-semibold" style={{ color: accent }}>
            Demo flow
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Browse services and filter by category.</li>
            <li>Select a service to see smart upsells.</li>
            <li>Open Theme Panel → change accent to lavender (#8D7CBF) and CTA to "Reserve Your Escape".</li>
            <li>Toggle promo banner on/off and edit the copy.</li>
            <li>Show gift card purchase with preset amounts + custom message.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function PhonePreview({
  accent,
  promoOn,
  promoText,
  ctaText,
  selectedService,
  selectedAddOns,
  giftMessage,
}: {
  accent: string;
  promoOn: boolean;
  promoText: string;
  ctaText: string;
  selectedService: Service | null;
  selectedAddOns: Set<string>;
  giftMessage: string;
}) {
  const total = useMemo(() => {
    if (!selectedService) return null;
    const base = selectedService.price.replace(/[^0-9]/g, "");
    const addOnTotal = Array.from(selectedAddOns).reduce((sum, name) => {
      const add = addOns.find((a) => a.name === name);
      if (!add) return sum;
      const n = parseInt(add.price.replace(/[^0-9]/g, "")) || 0;
      return sum + n;
    }, 0);
    const baseNum = parseInt(base || "0");
    return `$${baseNum + addOnTotal}`;
  }, [selectedService, selectedAddOns]);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="rounded-[32px] border border-slate-200 bg-white shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(22,101,92,0.18)" }}
      >
        <div
          className="rounded-t-[32px] px-6 py-3 text-center text-xs font-semibold tracking-wide text-white"
          style={{ background: accent }}
        >
          CalmSpa • Live Preview
        </div>
        <div className="relative overflow-hidden rounded-b-[32px]" style={{ background: "#f7fbf9" }}>
          <div className="h-[680px] space-y-0">
            {promoOn && (
              <div
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white"
                style={{ background: accent }}
              >
                🌿 {promoText}
              </div>
            )}

            <div className="p-5 pb-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">Welcome</div>
                <div className="text-lg font-semibold text-slate-900">Unwind with CalmSpa</div>
                <div className="mt-2 text-xs text-slate-500">Smart upsells and theme changes apply instantly.</div>
                <button
                  className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-95"
                  style={{ background: accent }}
                >
                  {ctaText}
                </button>
              </div>
            </div>

            <div className="px-5">
              <div className="mb-2 text-sm font-semibold text-slate-700">Selected service</div>
              <div className="space-y-2">
                {selectedService ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{selectedService.name}</div>
                        <div className="text-xs text-slate-500">{selectedService.duration}</div>
                      </div>
                      <div className="text-sm font-semibold" style={{ color: accent }}>
                        {selectedService.price}
                      </div>
                    </div>
                    {selectedAddOns.size > 0 && (
                      <div className="mt-2 text-xs text-slate-600">
                        Add-ons: {Array.from(selectedAddOns).join(", ")}
                      </div>
                    )}
                    {total && (
                      <div className="mt-2 text-sm font-semibold" style={{ color: accent }}>
                        Est. total {total}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                    Select a service to preview upsells and pricing.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1 px-5 pb-5 text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Gift cards</div>
              <div>Preset amounts: {giftAmounts.join(", ")}</div>
              <div>Digital delivery • Personalized message</div>
              <div className="rounded-xl bg-white/80 px-3 py-2 text-slate-600">“{giftMessage}”</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemePanel({
  accent,
  setAccent,
  ctaText,
  setCtaText,
  promoOn,
  setPromoOn,
  promoText,
  setPromoText,
}: {
  accent: string;
  setAccent: (v: string) => void;
  ctaText: string;
  setCtaText: (v: string) => void;
  promoOn: boolean;
  setPromoOn: (v: boolean) => void;
  promoText: string;
  setPromoText: (v: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Theme customization</h3>
        <div className="text-xs text-slate-500">Live preview updates instantly</div>
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
          <label className="flex items-center justify-between gap-3">
            <span>CTA text</span>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-48 rounded border border-slate-200 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={promoOn}
              onChange={(e) => setPromoOn(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Show promo banner</span>
          </label>
          <textarea
            value={promoText}
            onChange={(e) => setPromoText(e.target.value)}
            className="w-full rounded border border-slate-200 px-2 py-2 text-sm"
            rows={2}
            placeholder="Seasonal offer copy"
          />
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-3 text-xs text-slate-600">
            Try changing to lavender (#8D7CBF) and CTA “Reserve Your Escape”.
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Before / After</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500">Default</div>
              <div className="mt-1 rounded-lg bg-[#4A9B8E] px-2 py-2 text-center font-semibold text-white">
                Book Now
              </div>
              <div className="mt-2 rounded-lg bg-[#4A9B8E]/10 px-2 py-1 text-slate-600">Promo on</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500">Live</div>
              <div
                className="mt-1 rounded-lg px-2 py-2 text-center font-semibold text-white"
                style={{ background: accent }}
              >
                {ctaText || "CTA"}
              </div>
              <div
                className="mt-2 rounded-lg px-2 py-1 text-slate-600"
                style={{ background: `${accent}20` }}
              >
                Promo {promoOn ? "On" : "Off"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicePanel({
  accent,
  services,
  selectedService,
  onSelectService,
}: {
  accent: string;
  services: Service[];
  selectedService: Service | null;
  onSelectService: (s: Service) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Service menu</h3>
        <span className="text-xs text-slate-500">Tap to preview upsells</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.name}
            onClick={() => onSelectService(s)}
            className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
              selectedService?.name === s.name ? "ring-2" : ""
            }`}
            style={{
              borderColor:
                selectedService?.name === s.name ? accent : "#e5e7eb",
              boxShadow:
                selectedService?.name === s.name
                  ? `0 10px 30px ${accent}22`
                  : undefined,
            }}
          >
            <div className="text-sm font-semibold text-slate-900">{s.name}</div>
            <div className="text-xs text-slate-500">{s.duration}</div>
            <div className="text-sm font-semibold" style={{ color: accent }}>
              {s.price}
            </div>
            <div className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
              {s.category}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UpsellPanel({
  accent,
  addOns,
  selectedAddOns,
  setSelectedAddOns,
}: {
  accent: string;
  addOns: AddOn[];
  selectedAddOns: Set<string>;
  setSelectedAddOns: (s: Set<string>) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Smart upsells</h3>
        <span className="text-xs text-slate-500">Suggested for this service</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {addOns.map((a) => {
          const active = selectedAddOns.has(a.name);
          return (
            <button
              key={a.name}
              onClick={() => {
                const next = new Set(selectedAddOns);
                if (active) next.delete(a.name);
                else next.add(a.name);
                setSelectedAddOns(next);
              }}
              className="rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={{
                borderColor: active ? accent : "#e5e7eb",
                boxShadow: active ? `0 10px 30px ${accent}22` : undefined,
                background: active ? `${accent}0D` : "white",
              }}
            >
              <div className="text-sm font-semibold text-slate-900">{a.name}</div>
              <div className="text-xs font-semibold" style={{ color: accent }}>
                {a.price}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GiftPanel({
  accent,
  giftAmount,
  setGiftAmount,
  giftMessage,
  setGiftMessage,
}: {
  accent: string;
  giftAmount: string;
  setGiftAmount: (v: string) => void;
  giftMessage: string;
  setGiftMessage: (v: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Gift cards</h3>
        <span className="text-xs text-slate-500">Digital delivery</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {giftAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setGiftAmount(amt)}
            className={`rounded-full border px-3 py-1 ${giftAmount === amt ? "shadow" : ""}`}
            style={{
              borderColor: giftAmount === amt ? accent : "#e5e7eb",
              background: giftAmount === amt ? accent : "white",
              color: giftAmount === amt ? "white" : "#0f172a",
            }}
          >
            {amt}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-600">Personalized message</div>
      <textarea
        value={giftMessage}
        onChange={(e) => setGiftMessage(e.target.value)}
        className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
        rows={2}
      />
      <button
        className="mt-3 w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition active:scale-95"
        style={{ background: accent }}
      >
        Send Gift
      </button>
    </div>
  );
}
