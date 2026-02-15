import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug, templates } from "@/app/templates/template-catalog";

type TemplatePageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: TemplatePageProps) {
  const { slug } = params;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return {
      title: "Template Not Found - islaAPP",
      description: "The selected template could not be found.",
    };
  }

  return {
    title: `${template.title} - islaAPP`,
    description: template.desc,
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { slug } = params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const agentHref = `/agent?template=${template.slug}&source=template_detail`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-indigo-300/80">
          <span data-i18n-en="islaAPP Template" data-i18n-es="Plantilla islaAPP">islaAPP Template</span>
        </p>
        <h1
          className="text-3xl font-semibold text-gray-100 md:text-4xl"
          data-i18n-en={template.title}
          data-i18n-es={template.titleEs}
        >
          {template.title}
        </h1>
        <p
          className="mx-auto mt-3 max-w-2xl text-indigo-200/70"
          data-i18n-en={template.desc}
          data-i18n-es={template.descEs}
        >
          {template.desc}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70">
        <Image
          src={template.hero}
          alt={`${template.title} template preview`}
          className="h-[340px] w-full object-cover md:h-[460px]"
          priority
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={agentHref}
          className="btn-sm bg-indigo-600 text-center text-white hover:bg-indigo-500"
          data-i18n-en="Start With This Template"
          data-i18n-es="Comenzar con esta plantilla"
        >
          Start With This Template
        </a>
        <a
          href={agentHref}
          className="btn-sm border border-gray-700 bg-gray-800 text-center text-white hover:bg-gray-700"
          data-i18n-en="Open AI Agent"
          data-i18n-es="Abrir agente IA"
        >
          Open AI Agent
        </a>
      </div>

      <div className="mt-6">
        <Link href="/templates" className="text-sm text-indigo-300 hover:text-indigo-200">
          <span data-i18n-en="Back to Template Gallery" data-i18n-es="Volver a la Galeria de Plantillas">Back to Template Gallery</span>
        </Link>
      </div>
    </section>
  );
}
