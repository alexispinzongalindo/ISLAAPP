import { notFound, redirect } from "next/navigation";
import { isLivePageSlug } from "@/app/live/live-slugs";

export default async function LiveDemoRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isLivePageSlug(slug)) {
    notFound();
  }
  redirect(`/live/${slug}`);
}
