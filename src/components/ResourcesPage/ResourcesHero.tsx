"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type HeroCTA = {
  href: string;
  label?: I18n;
};

type HeroContent = {
  title?: I18n;
  subtitle?: I18n;
  description?: I18n;
  ctas?: HeroCTA[];
  backgroundImages?: string[];
};

type Block = {
  id: number;
  type: string; // "hero_banner"
  title?: I18n;
  posts?: Array<{
    id: number;
    content?: {
      en?: HeroContent;
      km?: HeroContent;
    };
  }>;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    blocks?: Block[];
  };
};

function uiToApiLang(ui: UiLang): ApiLang {
  return ui === "kh" ? "km" : "en";
}

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
  if (!obj) return fallback;
  const primary = lang === "km" ? obj.km : obj.en;
  return primary || obj.en || obj.km || fallback;
}

export default function ResourcesHero() {
  const { language } = useLanguage() as { language: UiLang };
  const apiLang = useMemo(() => uiToApiLang(language), [language]);

  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroContent | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);

        // ✅ correct path for: app/api/resources-page/section/route.ts
        const res = await fetch("/api/resources-page/section", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json: ApiResponse = await res.json();
        const blocks = json?.data?.blocks || [];

        const heroBlock = blocks.find((b) => b.type === "hero_banner");
        const post = heroBlock?.posts?.[0];
        const content = post?.content?.[apiLang] || post?.content?.en || null;

        if (alive) setHero(content);
      } catch {
        if (alive) setHero(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [apiLang]);

  const title = pickText(hero?.title, apiLang, "Resources");
  const subtitle = pickText(hero?.subtitle, apiLang, "Streamlining the Reform Process");
  const desc = pickText(hero?.description, apiLang, "");
  const ctas = hero?.ctas || [];
  const bg = hero?.backgroundImages?.[0] || "/image/resources_top.bmp";

  return (
    <section className="w-full bg-white px-6 py-12 md:px-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Left */}
        <div className="flex-1 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1e2756] tracking-tight">
              {title}
            </h1>
            <p className="text-2xl md:text-4xl font-medium text-[#1e2756]">
              {subtitle}
            </p>

            {desc ? (
              <p className="mt-4 max-w-xl text-base md:text-lg text-slate-600 leading-relaxed">
                {desc}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            {ctas.length ? (
              ctas.map((cta, idx) => {
                const label = pickText(cta.label, apiLang, idx === 0 ? "Templates" : "Learn more");
                const isPrimary = idx === 0;

                return (
                  <Link
                    key={`${cta.href}-${idx}`}
                    href={cta.href}
                    className={[
                      "inline-flex items-center justify-between gap-4 font-medium py-3 px-6 rounded-lg transition-colors min-w-[160px]",
                      isPrimary
                        ? "bg-[#f39c32] hover:bg-[#e68a1e] text-white"
                        : "bg-[#e9ecef] hover:bg-[#dee2e6] text-[#1e2756]",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    <ChevronRight size={18} />
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-between gap-4 bg-[#f39c32] hover:bg-[#e68a1e] text-white font-medium py-3 px-6 rounded-lg transition-colors min-w-[160px]"
                >
                  <span>Templates</span>
                  <ChevronRight size={18} />
                </Link>

                <Link
                  href="/mis-portal"
                  className="inline-flex items-center justify-between gap-4 bg-[#e9ecef] hover:bg-[#dee2e6] text-[#1e2756] font-medium py-3 px-6 rounded-lg transition-colors min-w-[160px]"
                >
                  <span>MIS Portal</span>
                  <ChevronRight size={18} />
                </Link>
              </>
            )}
          </div>

          {loading ? <p className="text-sm text-slate-500">Loading banner...</p> : null}
        </div>

        {/* Right image */}
        <div className="flex-1 w-full">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-sm">
            <Image src={bg} alt={title} fill className="object-cover" unoptimized priority />
          </div>
        </div>
      </div>
    </section>
  );
}