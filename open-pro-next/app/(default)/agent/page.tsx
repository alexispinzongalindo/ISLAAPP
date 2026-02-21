"use client";

import { useEffect, useMemo, useState } from "react";

export default function AgentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const redirectHref = useMemo(() => {
    if (selectedTemplate) {
      return `https://app.islaapp.tech/?plan=trial&lang=en&template=${encodeURIComponent(selectedTemplate)}`;
    }
    return "/templates";
  }, [selectedTemplate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const template = String(params.get("template") || "").trim();
    setSelectedTemplate(template);
  }, []);

  useEffect(() => {
    if (!redirectHref) return;
    window.location.href = redirectHref;
  }, [redirectHref]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <p className="text-sm text-indigo-200/70">Opening template…</p>
          {selectedTemplate ? (
            <p className="mt-2 text-lg font-semibold text-gray-100">{selectedTemplate}</p>
          ) : null}
          <p className="mt-3 text-sm text-indigo-200/60">
            If you are not redirected automatically, use the link below.
          </p>
          <a href={redirectHref} className="btn mt-6 bg-indigo-600 text-white hover:bg-indigo-500">
            Continue
          </a>
        </div>
      </div>
    </section>
  );
}
