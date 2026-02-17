import Link from "next/link";
import Image from "next/image";
import { templates } from "@/app/templates/template-catalog";

export default function TemplatesPage() {
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
                  className="rounded-full bg-gray-800 px-2 py-1 text-xs text-indigo-200/80"
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
              {(t.slug === "bookflow" || t.slug === "medtrack" || t.slug === "fitcoach" || t.slug === "restaurant" || t.slug === "spa" || t.slug === "clinic" || t.slug === "dental" || t.slug === "law" || t.slug === "real-estate" || t.slug === "habits" || t.slug === "priorityos") && (
                <a
                  href={`/live/${t.slug}`}
                  className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
                  data-i18n-en="Live demo"
                  data-i18n-es="Demo en vivo"
                >
                  Live demo
                </a>
              )}
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
    </section>
  );
}
