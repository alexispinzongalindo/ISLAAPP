import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { templates } from "../data";

export default function TemplatePreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Content params={params} />
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = templates.find((tpl) => tpl.slug === slug);
  if (!t) return notFound();

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">{t.title}</h1>
          <p className="text-indigo-200/65 max-w-2xl mt-2">{t.desc}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/templates"
            className="btn-sm bg-gray-800 text-gray-100 hover:bg-gray-700"
          >
            Back to gallery
          </Link>
          <a
            href={t.useHref}
            className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Use this template
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70">
        <Image
          src={t.thumb}
          alt={t.title}
          className="w-full object-cover"
          placeholder="blur"
        />
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}
