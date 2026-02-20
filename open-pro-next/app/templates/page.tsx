"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templates, type TemplateDefinition } from "@/app/templates/template-catalog";
import { isLivePageSlug } from "@/app/live/live-slugs";

const MAINTENANCE_AUTH_KEY = "isla_maintenance_auth_v1";

function TemplateModal({
  template,
  onClose,
  onUse,
}: {
  template: TemplateDefinition;
  onClose: () => void;
  onUse: (slug: string) => void;
}) {
  const slides = useMemo(() => {
    // Reuse hero for a simple carousel feel; if a future gallery exists, replace with real images.
    return [template.hero, template.thumb, template.hero];
  }, [template.hero, template.thumb]);

  const [active, setActive] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200 hover:bg-slate-700"
        >
          Close
        </button>

        <div className="grid gap-6 p-6 md:grid-cols-[1.6fr,1fr]">
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="relative h-72 sm:h-80 md:h-full">
              <Image
                src={slides[active]}
                alt={template.title}
                className="h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`h-2.5 w-2.5 rounded-full ${idx === active ? "bg-white" : "bg-white/40"}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Template</p>
              <h2 className="text-2xl font-semibold text-slate-50">{template.title}</h2>
              <p className="mt-2 text-sm text-slate-200/80">{template.desc}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onUse(template.slug)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Use template
              </button>
              {isLivePageSlug(template.slug) ? (
                <Link
                  href={`/live/${template.slug}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  View app
                </Link>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200/80">
              <p className="font-semibold text-slate-100">How it works</p>
              <ol className="mt-2 space-y-1 list-decimal pl-5">
                <li>Pick this template and start customization.</li>
                <li>See changes right away in preview.</li>
                <li>Save drafts anytime; publish when ready.</li>
                <li>Share the live link with your team or customers.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateDefinition | null>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloningTitle, setCloningTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsAdminSession(window.sessionStorage.getItem(MAINTENANCE_AUTH_KEY) === "1");
  }, []);

  const handleUseTemplate = (slug: string, title: string) => {
    setActiveTemplate(null);
    setCloningTitle(title);
    setIsCloning(true);
    // Simulate clone then route to the agent for customization.
    setTimeout(() => {
      setIsCloning(false);
      router.push(`/agent?template=${slug}&source=template_gallery`);
    }, 1200);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="pb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-100">Template Gallery</h1>
        <p className="text-indigo-200/65">
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
            className="rounded-2xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-sm transition hover:-translate-y-1 hover:border-indigo-700/70 hover:shadow-indigo-900/30"
          >
            <button
              type="button"
              onClick={() => setActiveTemplate(t)}
              className="mb-3 block w-full overflow-hidden rounded-xl border border-gray-800"
            >
              <Image src={t.thumb} alt={t.title} className="h-48 w-full object-cover" />
            </button>
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
            <div className="flex flex-wrap gap-3">
              {isLivePageSlug(t.slug) && (
                <Link
                  href={`/live/${t.slug}`}
                  className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  Live demo
                </Link>
              )}
              <button
                type="button"
                onClick={() => setActiveTemplate(t)}
                className="btn-sm border border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                App info
              </button>
          <Link
            href={`/builder/${t.slug}`}
            className="btn-sm border border-indigo-600 text-indigo-200 hover:bg-indigo-900/40"
          >
            Builder + AI
          </Link>
          <button
            type="button"
            onClick={() => handleUseTemplate(t.slug, t.title)}
            className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500"
          >
            AI only
          </button>
        </div>
          </div>
        ))}
      </div>

      {activeTemplate && (
        <TemplateModal
          template={activeTemplate}
          onClose={() => setActiveTemplate(null)}
          onUse={(slug) => handleUseTemplate(slug, activeTemplate.title)}
        />
      )}

      {isCloning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-100 shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-400" />
            <p className="text-lg font-semibold">Cloning {cloningTitle || "template"}...</p>
            <p className="mt-2 text-sm text-slate-300">This takes a few seconds. You will go to the editor when it is ready.</p>
          </div>
        </div>
      )}
    </section>
  );
}
