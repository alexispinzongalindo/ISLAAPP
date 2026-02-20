"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { templates } from "@/app/templates/template-catalog";
import { isLivePageSlug } from "@/app/live/live-slugs";

const MAINTENANCE_AUTH_KEY = "isla_maintenance_auth_v1";

export default function TemplatesPage() {
  const [activeInfoSlug, setActiveInfoSlug] = useState<string | null>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);

  useEffect(() => {
    setIsAdminSession(window.sessionStorage.getItem(MAINTENANCE_AUTH_KEY) === "1");
  }, []);

  const buildAppInfo = (slug: string) => {
    const template = templates.find((tpl) => tpl.slug === slug);
    if (!template) return null;

    const tags = template.tags.join(", ");
    return [
      `${template.title} is a full working app that lets customers try the real flow, not just a preview. It is a strong fit for teams in ${tags}.`,
      "How customers use their tokens after they subscribe:",
      "1. Pick a template and click Use template.",
      "2. A numbered list of changes appears. Choose number 1 to start.",
      "3. Each change costs tokens and updates the preview right away.",
      "4. Save the draft at any time.",
      "5. Publish when ready to go live.",
      "6. Later changes use tokens and are tracked in history.",
    ].join("\n");
  };

  const activeInfoText = activeInfoSlug ? buildAppInfo(activeInfoSlug) : null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="pb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-100" data-i18n-en="Template Gallery" data-i18n-es="Galeria de Plantillas">Template Gallery</h1>
        <p className="text-indigo-200/65" data-i18n-en="Pick a starter, preview it, then launch directly in islaAPP Builder." data-i18n-es="Elige una base, previsualizala y luego lanzala directamente en el constructor de islaAPP.">
          Pick a starter, preview it, then launch directly in islaAPP Builder.
        </p>
        {isAdminSession && (
          <div className="mt-4">
            <Link
              href="/admin/maintenance"
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-700"
            >
              Back to Maintenance
            </Link>
          </div>
        )}
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
            <div className="flex gap-3">
              {isLivePageSlug(t.slug) && (
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
            <div className="mt-4 text-sm leading-7 text-indigo-100/85 whitespace-pre-line">
              {activeInfoText}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
