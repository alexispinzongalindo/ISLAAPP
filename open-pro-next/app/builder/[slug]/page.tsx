"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { templates, type TemplateDefinition } from "@/app/templates/template-catalog";
import { isLivePageSlug } from "@/app/live/live-slugs";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`h-6 w-11 rounded-full border border-slate-700 transition ${
          value ? "bg-indigo-500" : "bg-slate-800"
        }`}
        aria-pressed={value}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-300">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-slate-700 bg-slate-800"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100"
        />
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-300">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100"
        rows={3}
      />
    </div>
  );
}

export default function BuilderPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const router = useRouter();
  const template = useMemo(() => templates.find((t) => t.slug === slug), [slug]);

  useEffect(() => {
    if (!template) notFound();
  }, [template]);

  const [primary, setPrimary] = useState("#1f6feb");
  const [secondary, setSecondary] = useState("#0f172a");
  const [accent, setAccent] = useState("#ff9f1c");
  const [background, setBackground] = useState("#0b1221");
  const [text, setText] = useState("#e2e8f0");
  const [showHero, setShowHero] = useState(true);
  const [heroTitle, setHeroTitle] = useState(template?.title ?? "");
  const [heroDesc, setHeroDesc] = useState(template?.desc ?? "");

  if (!template) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-6xl gap-4 px-4 py-6 sm:px-6">
      <div className="w-[340px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-300">
          <Link href="/templates" className="text-indigo-300 hover:text-indigo-100">← Gallery</Link>
          <span>/</span>
          <span className="text-slate-200">{template.title}</span>
        </div>

        <h2 className="text-lg font-semibold text-slate-50">Branding</h2>
        <p className="mb-4 text-sm text-slate-300">Change colors, hero text, and visibility.</p>

        <div className="space-y-4">
          <ColorInput label="Primary" value={primary} onChange={setPrimary} />
          <ColorInput label="Secondary" value={secondary} onChange={setSecondary} />
          <ColorInput label="Accent" value={accent} onChange={setAccent} />
          <ColorInput label="Background" value={background} onChange={setBackground} />
          <ColorInput label="Text" value={text} onChange={setText} />

          <Toggle label="Show hero section" value={showHero} onChange={setShowHero} />

          <TextInput label="Hero title" value={heroTitle} onChange={setHeroTitle} />
          <TextInput label="Hero description" value={heroDesc} onChange={setHeroDesc} />

          <button
            type="button"
            onClick={() => router.push(`/agent?template=${slug}&source=builder`) }
            className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Ask AI to change more
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="absolute inset-0 overflow-y-auto">
          <div
            className="min-h-full px-6 py-6"
            style={{
              background: background,
              color: text,
            }}
          >
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: text }}>
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ background: secondary }}
                  aria-hidden
                />
                <span>{template.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isLivePageSlug(template.slug) ? (
                  <Link
                    href={`/live/${template.slug}`}
                    className="rounded border border-slate-700 px-3 py-1 text-slate-100 hover:bg-slate-800"
                  >
                    View live demo
                  </Link>
                ) : null}
                <button className="rounded border border-slate-700 px-3 py-1 text-slate-100 hover:bg-slate-800">
                  Publish draft
                </button>
              </div>
            </div>

            {showHero && (
              <div
                className="mb-6 rounded-2xl p-8 shadow-lg"
                style={{ background: secondary, color: text }}
              >
                <h1 className="text-3xl font-semibold" style={{ color: text }}>
                  {heroTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-lg" style={{ color: text }}>
                  {heroDesc}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: primary }}
                  >
                    Primary action
                  </button>
                  <button
                    className="rounded-lg px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: text, color: text, borderWidth: 1 }}
                  >
                    Secondary action
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="rounded-xl p-4 shadow"
                  style={{ background: secondary, color: text }}
                >
                  <p className="text-sm font-semibold" style={{ color: text }}>
                    Section {card}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: text }}>
                    Replace this with your content. Change copy, images, or layout in the editor.
                  </p>
                  <button
                    className="mt-3 rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                    style={{ background: accent }}
                  >
                    Call to action
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-200">
              <p className="font-semibold">Draft preview</p>
              <p className="mt-1 text-slate-300">
                Changes here are visual only. Use AI or deeper editor to change structure, copy, images, and forms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
