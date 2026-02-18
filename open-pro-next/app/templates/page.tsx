"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { templates } from "@/app/templates/template-catalog";

export default function TemplatesPage() {
  const [activeInfoSlug, setActiveInfoSlug] = useState<string | null>(null);

  const buildAppInfo = (slug: string) => {
    const template = templates.find((tpl) => tpl.slug === slug);
    if (!template) return null;

    const tags = template.tags.join(", ");
    return `${template.title} is a functional web application built with Next.js and TypeScript, designed to run real user flows instead of a static preview; core capabilities include ${template.desc.toLowerCase()} This template is a strong fit for teams working in ${tags}, and it can be extended with production upgrades such as real payment processors, calendar and notification integrations, audit logs, role-based access controls, and backend data persistence while preserving the same front-end workflow your customers already test in the live demo.`;
  };

  const activeInfoText = activeInfoSlug ? buildAppInfo(activeInfoSlug) : null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="pb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-100" data-i18n-en="Template Gallery" data-i18n-es="Galeria de Plantillas">Template Gallery</h1>
        <p className="text-indigo-200/65" data-i18n-en="Pick a starter, preview it, then launch directly in islaAPP Builder." data-i18n-es="Elige una base, previsualizala y luego lanzala directamente en el constructor de islaAPP.">
          Pick a starter, preview it, then launch directly in islaAPP Builder.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.slug}
            className="rounded-2xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-sm"
          >
            <div className="mb-3 overflow-hidden rounded-xl border border-gray-800">
              <Link href={`/templates/${t.slug}`}>
                <Image
                  src={t.thumb}
                  alt={t.title}
                  className="h-48 w-full object-cover"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-gray-800 px-2 py-1 text-center text-xs text-indigo-200/80"
                >
                  {tag}
                </span>
              ))}
              <span className="ml-auto rounded-full bg-indigo-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                Customized with AI
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-100">{t.title}</h3>
            <p className="text-indigo-200/70 mb-4">{t.desc}</p>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-2.5 py-2 text-xs text-indigo-100/80">
              <span className="text-indigo-100/65">Built with</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2 py-1">
                <Image src="/templates/nextjs-mark.svg" alt="Next.js" width={14} height={14} />
                <span>Next.js</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2 py-1">
                <Image src="/templates/typescript-mark.svg" alt="TypeScript" width={14} height={14} />
                <span>TypeScript</span>
              </span>
            </div>
            <div className="flex gap-3">
              {(t.slug === "bookflow" || t.slug === "medtrack" || t.slug === "fitcoach" || t.slug === "restaurant" || t.slug === "spa" || t.slug === "clinic" || t.slug === "dental" || t.slug === "law" || t.slug === "real-estate" || t.slug === "habits" || t.slug === "priorityos" || t.slug === "flexspace" || t.slug === "service-crm" || t.slug === "invoice-pilot" || t.slug === "memberdock" || t.slug === "chairlock" || t.slug === "meetflow") && (
                <a
                  href={`/live/${t.slug}`}
                  className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
                  data-i18n-en="Live demo"
                  data-i18n-es="Demo en vivo"
                >
                  Live demo
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveInfoSlug(t.slug)}
                className="btn-sm border border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                App info
              </button>
              <a
                href={`/agent?template=${t.slug}&source=template_gallery`}
                className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500"
                data-i18n-en="Use template"
                data-i18n-es="Usar plantilla"
              >
                Use template
              </a>
            </div>
          </div>
        ))}
      </div>
      {activeInfoSlug && activeInfoText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-100">
                {templates.find((tpl) => tpl.slug === activeInfoSlug)?.title ?? "App information"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveInfoSlug(null)}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-800"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-indigo-100/85">{activeInfoText}</p>
          </div>
        </div>
      )}
    </section>
  );
}
