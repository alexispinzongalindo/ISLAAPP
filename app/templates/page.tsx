import Link from "next/link";
import Image from "next/image";
import { templates } from "./data";

export default function TemplatesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="pb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-100">Template Gallery</h1>
        <p className="text-indigo-200/65">
          Pick a template, then click “Use this template” to open IslaAPP with the trial.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
                  placeholder="blur"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-800 px-2 py-1 text-xs text-indigo-200/80"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-100">{t.title}</h3>
            <p className="text-indigo-200/70 mb-4">{t.desc}</p>
            <div className="flex gap-3 flex-wrap">
              {t.slug === "bookflow" && (
                <Link
                  href="/live/bookflow"
                  className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  Live demo
                </Link>
              )}
              {t.slug === "medtrack" && (
                <Link
                  href="/live/medtrack"
                  className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  Live demo
                </Link>
              )}
              <a
                href={t.useHref}
                className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Use this template
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
