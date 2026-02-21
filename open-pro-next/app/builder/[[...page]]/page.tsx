import { fetchOneEntry } from "@builder.io/sdk-react";
import { BUILDER_API_KEY } from "@/lib/builder";
import BuilderPage from "@/components/builder/builder-page";

type Props = {
  params: Promise<{ page?: string[] }>;
};

export default async function BuilderCatchAllPage({ params }: Props) {
  const { page } = await params;
  const urlPath = "/" + (page?.join("/") || "");

  let content: any = null;
  try {
    content = await fetchOneEntry({
      model: "page",
      apiKey: BUILDER_API_KEY,
      userAttributes: { urlPath },
    });
  } catch {
    content = null;
  }

  return <BuilderPage model="page" path={urlPath} content={content} />;
}
