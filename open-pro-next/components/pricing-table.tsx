"use client";

const plans = [
  {
    name: "Free Trial",
    price: "0",
    blurb: "Generate one app with AI and live preview. No card. Domain/DB locked.",
    cta: "Start free",
    href: "https://app.islaapp.tech/?plan=trial&lang=en",
    features: ["One project", "Email support", "Live preview in minutes"],
  },
  {
    name: "Starter",
    price: "20",
    blurb: "Custom domain, hosting, starter database, bookings & payments.",
    cta: "Pick Starter",
    href: "https://app.islaapp.tech/pricing?plan=starter&lang=en",
    features: [
      "Domain + SSL + hosting",
      "Starter database",
      "Email & chat support",
    ],
  },
  {
    name: "Pro",
    price: "80",
    blurb: "Automations, reminders, multi-page templates, priority support.",
    cta: "Go Pro",
    href: "https://app.islaapp.tech/pricing?plan=pro&lang=en",
    features: [
      "Everything in Starter",
      "Automations & reminders",
      "Custom fields & templates",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    price: "160",
    blurb: "White-label, multi-domain/location, advanced DB, concierge onboarding.",
    cta: "Talk to us",
    href: "https://app.islaapp.tech/pricing?plan=elite&lang=en",
    features: [
      "Everything in Pro",
      "White-label + SLA",
      "Multi-domain / location",
      "Concierge onboarding",
    ],
  },
];

export default function PricingTable() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className="relative flex h-full flex-col rounded-2xl bg-linear-to-br from-gray-900/60 via-gray-800/30 to-gray-900/60 p-5 backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]"
        >
          <div className="relative mb-4 border-b pb-5 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-400/.25),transparent)1]">
            <div className="mb-2 font-nacelle text-[1rem] text-gray-200">
              {plan.name}
            </div>
            <div className="mb-1.5 flex items-baseline font-nacelle">
              <span className="text-2xl text-indigo-200/65">$</span>
              <span className="text-4xl font-semibold tabular-nums text-gray-200">
                {plan.price}
              </span>
              <span className="ml-2 text-sm text-indigo-200/65">/mo</span>
            </div>
            <div className="mb-4 grow text-xs text-indigo-200/65">
              {plan.blurb}
            </div>
            <a
              className="btn-sm relative w-full bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] text-gray-100 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%]"
              href={plan.href}
            >
              {plan.cta}
            </a>
          </div>
          <ul className="grow space-y-2 text-sm text-indigo-200/65">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center">
                <svg
                  className="mr-2 h-3 w-3 shrink-0 fill-current text-indigo-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
