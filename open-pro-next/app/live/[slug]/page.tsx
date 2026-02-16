import { notFound, redirect } from "next/navigation";

const livePages = ["bookflow", "medtrack", "fitcoach", "restaurant", "spa", "clinic", "dental", "law", "real-estate"];

export default async function LiveDemoRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!livePages.includes(slug)) {
    notFound();
  }
  redirect(`/live/${slug}`);
}
