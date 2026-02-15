export default function Faqs() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-gray-800 py-12 md:py-20 lg:border-0 lg:pt-0">
          {/* Section header */}
          <div className="mb-12">
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-2xl font-semibold text-transparent md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          {/* Faqs */}
          <ul className="grid gap-8 md:grid-cols-2 lg:gap-y-12 xl:gap-x-16">
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                How do the 3 steps work?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                1) Pick a template, 2) verify your email/plan, 3) AI generates a
                live preview you can tweak and publish.
              </p>
            </li>
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                Do I need a credit card to start?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                No. The Free Trial lets you generate and preview without a card.
                Add billing only when you upgrade to Starter, Pro, or Elite.
              </p>
            </li>
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                Can I use my own domain (Dynadot, etc.)?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                Yes. Point a CNAME to the Render target we show, wait for DNS to
                propagate, and SSL is issued automatically.
              </p>
            </li>
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                Can I switch language between EN and ES?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                Yes. Use the toggle in the nav; the entire UI swaps—no mixed
                language screens.
              </p>
            </li>
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                What types of businesses is this for?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                Any service-driven small business: barbershops, offices,
                clinics, consultancies, studios, and local stores.
              </p>
            </li>
            <li>
              <h4 className="mb-2 font-nacelle text-lg font-semibold text-gray-200">
                What support do I get?
              </h4>
              <p className="text-[1rem] text-indigo-200/65">
                Email and chat on all plans. Pro and Elite include onboarding
                help to connect payments, domains, and automations.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
