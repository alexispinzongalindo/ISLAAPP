import { redirect } from "next/navigation";
import { isLivePageSlug } from "@/app/live/live-slugs";

export default async function NewEditorProject({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const slug = String(template || "").trim();

  if (!slug || !isLivePageSlug(slug)) {
    redirect("/templates");
  }

  const projectId = `${slug}--${crypto.randomUUID()}`;
  redirect(`/editor/${projectId}`);
}
