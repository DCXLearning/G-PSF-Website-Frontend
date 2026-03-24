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
  type: string;
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
  data?: {
    blocks?: Block[];
  };
};

function uiToApiLang(ui: UiLang): ApiLang {
  return ui === "kh" ? "km" : "en";
}

function pickText(obj: I18n | undefined, lang: ApiLang) {
  if (!obj) return "";
  return lang === "km" ? obj.km || "" : obj.en || "";
}

const CACHE_KEY = "resources-hero-cache";

export default function ResourcesHero() {
  const { language } = useLanguage() as { language: UiLang };
  const apiLang = useMemo(() => uiToApiLang(language), [language]);

  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroContent | null>(null);

  useEffect(() => {
    let alive = true;

    // 1) Load cached hero first to avoid blank on refresh
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: Record<ApiLang, HeroContent | null> = JSON.parse(cached);
        const cachedHero = parsed?.[apiLang] || parsed?.en || null;
        if (cachedHero && alive) {
          setHero(cachedHero);
          setLoading(false);
        }
      }
    } catch {
      // ignore cache error
    }

    async function fetchHero() {
      try {
        setLoading((prev) => (hero ? false : prev));

        const res = await fetch("/api/resources-page/section", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json: ApiResponse = await res.json();
        const blocks = json?.data?.blocks ?? [];

        const heroBlock = blocks.find((b) => b.type === "hero_banner");
        const post = heroBlock?.posts?.[0];

        const enContent = post?.content?.en || null;
        const kmContent = post?.content?.km || null;
        const nextHero = post?.content?.[apiLang] || enContent || null;

        // 2) Save both langs in cache
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              en: enContent,
              km: kmContent,
            })
          );
        } catch {
          // ignore cache write error
        }

        if (alive && nextHero) {
          setHero(nextHero);
        }
      } catch {
        // keep previous hero, do not wipe it out
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchHero();

    return () => {
      alive = false;
    };
  }, [apiLang]);

  // First load only: show skeleton instead of returning null
  if (!hero && loading) {
    return (
      <section className="w-full bg-white px-6 py-12 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-12 animate-pulse">
          <div className="flex-1 w-full">
            <div className="aspect-[4/3] rounded-sm bg-white" />
          </div>
        </div>
      </section>
    );
  }

  if (!hero) return null;

  const title = pickText(hero.title, apiLang);
  const subtitle = pickText(hero.subtitle, apiLang);
  const desc = pickText(hero.description, apiLang);
  const ctas = hero.ctas ?? [];
  const bg = hero.backgroundImages?.[0];

  return (
    <section className="w-full bg-white px-6 py-6 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          {title && (
            <h1 className="text-5xl md:text-6xl font-bold text-[#1e2756] tracking-tight">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-2xl md:text-4xl font-medium text-[#1e2756]">
              {subtitle}
            </p>
          )}

          {desc && (
            <p className="mt-4 max-w-xl text-base md:text-lg text-slate-600 leading-relaxed">
              {desc}
            </p>
          )}

          <div className="flex flex-wrap gap-4 mt-8">
            {ctas.map((cta, idx) => {
              const label = pickText(cta.label, apiLang);
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
            })}
          </div>
        </div>

        {bg && (
          <div className="flex-1 w-full">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-sm">
              <Image
                src={bg}
                alt={title || "Hero image"}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}