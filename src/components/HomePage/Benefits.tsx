"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
  id: number;
  slug?: string | null;
  title?: I18n;
  description?: I18n | null;
  coverImage?: string | null;
  content?: any;
};

type ApiBlock = {
  id: number;
  type: string;
  title?: I18n;
  description?: I18n | null;
  settings?: { limit?: number } | null;
  enabled?: boolean;
  posts?: ApiPost[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY = "benefits_block";

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
  return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function iconFallback(idx: number) {
  const map = [
    "/icon_home_page/Benefits1.svg",
    "/icon_home_page/Benefits2.svg",
    "/icon_home_page/Benefits3.svg",
    "/icon_home_page/Benefits4.svg",
  ];
  return map[idx % map.length];
}

function pickIcon(post: ApiPost, idx: number) {
  return post.coverImage || iconFallback(idx);
}

function readCache(): ApiBlock | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApiBlock;
  } catch {
    return null;
  }
}

function writeCache(block: ApiBlock | null) {
  if (!block) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(block));
  } catch {
    // ignore cache errors
  }
}

type BenefitCardProps = {
  icon: string;
  title: string;
  description: string;
  isKhmer: boolean;
  href: string;
  disabled?: boolean;
};

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
  isKhmer,
  href,
  disabled,
}) => (
  <div
    className={`flex flex-col md:flex-row items-start gap-4 md:gap-10 ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <div className="p-4 md:p-3 mt-6 flex-shrink-0">
      <Image
        src={icon}
        alt={title || "benefit"}
        width={64}
        height={64}
        className="w-16 h-16 object-contain"
      />
    </div>

    <div className="flex-1">
      <h3
        className={`text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 mb-2 ${
          isKhmer ? "khmer-font" : ""
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-gray-600 mb-4 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line ${
          isKhmer ? "khmer-font" : ""
        }`}
      >
        {description}
      </p>

      <Link
        href={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`inline-flex px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full hover:bg-[#03057f] transition ${
          isKhmer ? "khmer-font" : ""
        } ${disabled ? "opacity-60" : ""}`}
      >
        {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
      </Link>
    </div>
  </div>
);

function BenefitCardSkeleton({
  icon,
  isKhmer,
}: {
  icon: string;
  isKhmer: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-10 animate-pulse">
      <div className="p-4 md:p-3 mt-6 flex-shrink-0">
        <Image
          src={icon}
          alt="benefit"
          width={64}
          height={64}
          className="w-16 h-16 object-contain opacity-60"
        />
      </div>

      <div className="flex-1">
        <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-slate-200 rounded mb-4" />

        <div
          className={`inline-flex px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full opacity-50 ${
            isKhmer ? "khmer-font" : ""
          }`}
        >
          {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
        </div>
      </div>
    </div>
  );
}

export default function Benefits() {
  const { language, fontClass } = useLanguage();

  const uiLang = (language as UiLang) ?? "en";
  const langKey: ApiLang = uiLang === "kh" ? "km" : "en";
  const isKhmer = langKey === "km";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [block, setBlock] = useState<ApiBlock | null>(null);

  useEffect(() => {
    setMounted(true);

    const cached = readCache();
    if (cached) {
      setBlock(cached);
      setLoading(false);
    }

    let alive = true;

    async function fetchData() {
      try {
        setError(null);

        const res = await fetch("/api/home-page/benefit", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const json = (await res.json()) as ApiResponse;
        const blocks = json?.data?.blocks || [];

        const picked =
          blocks.find(
            (b) =>
              b?.enabled !== false &&
              b?.type === "post_list" &&
              (b?.id === 2 || b?.title?.en === "G-PSF Benefit")
          ) || null;

        if (!alive) return;

        if (picked) {
          setBlock(picked);
          writeCache(picked);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Fetch failed");
        // keep old cached block, do not clear state
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();

    return () => {
      alive = false;
    };
  }, []);

  const limit = block?.settings?.limit ?? 4;

  const posts = useMemo(() => {
    const p = block?.posts || [];
    return p.slice(0, limit);
  }, [block, limit]);

  const heading = useMemo(() => {
    const h = pickText(block?.title, uiLang);
    const d = pickText(block?.description ?? undefined, uiLang);
    return { h, d };
  }, [block, uiLang]);

  const showSkeleton = !mounted || (loading && !block);
  const showErrorOnly = !showSkeleton && !block && !!error;

  return (
    <section
      className={`bg-white px-4 sm:px-8 md:px-16 lg:px-32 py-12 md:py-16 ${fontClass}`}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
        {/* LEFT */}
        <div className="mb-32 sm:mb-10 md:mb-0">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-tight ${
              isKhmer ? "khmer-font" : ""
            }`}
          >
            {heading.h || (isKhmer ? "អត្ថប្រយោជន៍ G-PSF" : "G-PSF Benefit")}
          </h2>

          <div className="mt-6 sm:mt-8 relative">
            <div className="absolute top-0 left-0 sm:left-4 md:left-28 w-20 sm:w-24 md:w-72 h-1 bg-orange-500 rounded-full mb-4" />

            <p
              className={`absolute top-0 left-0 sm:left-4 md:left-28 text-gray-700 text-sm sm:text-base md:text-xl leading-relaxed mt-6 ${
                isKhmer ? "khmer-font" : ""
              }`}
            >
              {heading.d}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
          {showSkeleton ? (
            Array.from({ length: limit }).map((_, idx) => (
              <BenefitCardSkeleton
                key={idx}
                icon={iconFallback(idx)}
                isKhmer={isKhmer}
              />
            ))
          ) : posts.length > 0 ? (
            posts.map((p, idx) => {
              const title = pickText(p.title, uiLang) || "\u00A0";
              const desc = pickText(p.description ?? undefined, uiLang) || "\u00A0";

              return (
                <BenefitCard
                  key={p.id}
                  icon={pickIcon(p, idx)}
                  title={title}
                  description={desc}
                  isKhmer={isKhmer}
                  href={p.slug ? `/posts/${p.slug}` : "#"}
                  disabled={!p.slug}
                />
              );
            })
          ) : null}

          {showErrorOnly && <p className="text-red-600 text-sm">Failed: {error}</p>}

          {!showSkeleton && !showErrorOnly && posts.length === 0 && (
            <p className={`text-gray-600 ${isKhmer ? "khmer-font" : ""}`}>
              {isKhmer ? "មិនមានទិន្នន័យអត្ថប្រយោជន៍" : "No benefits found"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}