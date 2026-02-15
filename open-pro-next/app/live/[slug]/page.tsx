import { redirect } from "next/navigation";

export default function LiveDemoRedirect({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // Redirect to the static demo asset under /public/live/<slug>/index.html
  redirect(`/live/${slug}/index.html`);
}
