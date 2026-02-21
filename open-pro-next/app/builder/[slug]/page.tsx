"use client";

import { useEffect, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { templates } from "@/app/templates/template-catalog";

export default function BuilderPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const template = useMemo(() => templates.find((t) => t.slug === slug), [slug]);

  useEffect(() => {
    if (!template) notFound();
  }, [template]);

  if (!template) return null;

  const startHref = `https://app.islaapp.tech/?plan=trial&lang=en&template=${template.slug}`;

  useEffect(() => {
    window.location.href = startHref;
  }, [startHref]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center">
        <p className="text-sm text-indigo-200/70">Opening template…</p>
        <p className="mt-2 text-lg font-semibold text-gray-100">{template.title}</p>
        <p className="mt-3 text-sm text-indigo-200/60">
          If you are not redirected automatically, use the link below.
        </p>
        <a href={startHref} className="btn mt-6 bg-indigo-600 text-white hover:bg-indigo-500">
          Start with this template
        </a>
      </div>
    </div>
  );
}
