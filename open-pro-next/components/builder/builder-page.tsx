"use client";

import { Content, fetchOneEntry, isPreviewing } from "@builder.io/sdk-react";
import { useEffect, useState } from "react";
import { BUILDER_API_KEY } from "@/lib/builder";

type BuilderPageProps = {
  model?: string;
  path?: string;
  content?: any;
};

export default function BuilderPage({
  model = "page",
  path,
  content: initialContent,
}: BuilderPageProps) {
  const [content, setContent] = useState<any>(initialContent || undefined);
  const [loading, setLoading] = useState(!initialContent);

  useEffect(() => {
    if (initialContent) return;

    const urlPath = path || window.location.pathname || "/";
    setLoading(true);

    fetchOneEntry({
      model,
      apiKey: BUILDER_API_KEY,
      userAttributes: { urlPath },
    })
      .then((data) => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [model, path, initialContent]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
        <p className="text-sm text-indigo-200/70">Loading…</p>
      </div>
    );
  }

  const shouldRender = content || isPreviewing();

  if (!shouldRender) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
        <p className="text-lg font-semibold">Page not found</p>
      </div>
    );
  }

  return (
    <Content content={content} model={model} apiKey={BUILDER_API_KEY} />
  );
}
