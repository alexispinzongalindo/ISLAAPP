import { redirect } from "next/navigation";
import { isLivePageSlug } from "@/app/live/live-slugs";

async function generateProjectId(slug: string): Promise<string> {
  let id: string;
  try {
    id = `${slug}--${crypto.randomUUID()}`;
  } catch {
    // Fallback if crypto.randomUUID is unavailable
    id = `${slug}--${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }
  return id;
}

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

  const projectId = await generateProjectId(slug);
  redirect(`/editor/${projectId}`);
}
