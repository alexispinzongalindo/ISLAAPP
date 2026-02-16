import { notFound, redirect } from "next/navigation";

const livePages = ["bookflow", "medtrack", "fitcoach", "restaurant"];

export default function LiveDemoRedirect({ params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!livePages.includes(slug)) {
    notFound();
  }
  redirect(`/live/${slug}`);
}
