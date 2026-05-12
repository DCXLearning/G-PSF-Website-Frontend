/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type ApiLang = "en" | "km";
type MultiLang = string | { en?: string; km?: string; kh?: string };

type Block = {
  id: number;
  type: string;
  title?: MultiLang;
  description?: MultiLang | null;
};

type WorkingGroupsSectionResponse = {
  success: boolean;
  message?: string;
  data?: {
    blocks?: Block[];
  };
};

const CACHE_KEY = "working-groups-block-43-cache";

function getText(value: MultiLang | null | undefined, lang: ApiLang): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value[lang] || value.km || value.kh || value.en || "";
}

function readCache(): Block[] {
  try {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(blocks: Block[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(CACHE_KEY, JSON.stringify(blocks));
  } catch {
    // ignore cache error
  }
}

function SectionSkeleton() {
  return (
    <section className="w-full overflow-hidden bg-white py-10 sm:py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="w-full max-w-5xl">
          <div className="h-6 w-32 rounded bg-slate-200 mb-3" />
          <div className="h-10 w-full max-w-[520px] rounded bg-slate-200 mb-3" />
          <div className="h-10 w-4/5 max-w-[420px] rounded bg-slate-200" />
          <div className="mt-5 h-1.5 w-full max-w-[520px] rounded bg-orange-200" />
          <div className="mt-8 h-6 w-full max-w-md rounded bg-slate-200 mb-2" />
          <div className="h-6 w-5/6 max-w-sm rounded bg-slate-200" />
        </div>
      </div>
    </section>
  );
}

export default function WorkingGroups16() {
  const { language } = useLanguage();

  const apiLang: ApiLang = useMemo(() => {
    return language === "kh" ? "km" : "en";
  }, [language]);

  const isKh = apiLang === "km";

  const [mounted, setMounted] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const cached = readCache();

    if (cached.length > 0) {
      setBlocks(cached);
      setLoading(false);
    }

    let alive = true;

    async function loadData() {
      try {
        setError(null);

        const res = await fetch(
          "/api/working-groups-page/section?slug=working-groups&types=text_block",
          {
            cache: "no-store",
            headers: { Accept: "application/json" },
          }
        );

        const json: WorkingGroupsSectionResponse = await res.json();

        if (!alive) return;

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch data");
        }

        const nextBlocks = json.data?.blocks || [];

        setBlocks(nextBlocks);
        writeCache(nextBlocks);
      } catch (err: any) {
        if (!alive) return;
        setError(err?.message || "Failed to fetch data");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  const view = useMemo(() => {
    const block = blocks.find(
      (item) => item.id === 43 && item.type === "text_block"
    );

    const fallbackTitle = isKh ? "ក្រុមការងារ (WGs)?" : "Working Groups?";

    const fallbackDescription = isKh
      ? "ក្រុមការងារ (WGs) គឺជាម៉ាស៊ីនដំណើរការស្នូលរបស់ G-PSF។"
      : "The Working Groups (WGs) are the core operational engine of the G-PSF.";

    const title = getText(block?.title, apiLang) || fallbackTitle;
    const description =
      getText(block?.description, apiLang) || fallbackDescription;

    return { title, description };
  }, [blocks, apiLang, isKh]);

  const titleParts = useMemo(() => {
    const rawTitle = view.title.trim();

    if (!rawTitle) {
      return {
        small: isKh ? "តើអ្វីទៅជា" : "What are",
        main: isKh ? "ក្រុមការងារ (WGs)?" : "Working Groups?",
      };
    }

    if (isKh) {
      return {
        small: "តើអ្វីទៅជា",
        main: rawTitle,
      };
    }

    if (/^what are/i.test(rawTitle)) {
      return {
        small: "What are",
        main: rawTitle.replace(/^what are\s*/i, ""),
      };
    }

    return {
      small: "What are",
      main: rawTitle,
    };
  }, [view.title, isKh]);

  const showSkeleton = !mounted || (loading && blocks.length === 0);

  if (showSkeleton) {
    return <SectionSkeleton />;
  }

  return (
    <section className="w-full overflow-hidden bg-white py-10 sm:py-14 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {error && blocks.length === 0 && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="w-full min-w-0">
          <div className="w-full min-w-0 max-w-6xl">
            <p
              className={[
                "mb-2 font-semibold text-gray-900",
                isKh
                  ? "khmer-font text-base sm:text-xl md:text-2xl leading-relaxed tracking-normal"
                  : "text-lg sm:text-xl md:text-2xl tracking-wider",
              ].join(" ")}
            >
              {titleParts.small}
            </p>

            <h1
              className={[
                "w-full max-w-full break-words font-bold text-gray-900",
                isKh
                  ? "khmer-font text-[24px] leading-[1.55] sm:text-[32px] sm:leading-[1.45] md:text-[42px] md:leading-[1.35] lg:text-[48px]"
                  : "text-3xl leading-tight sm:text-4xl md:text-5xl",
              ].join(" ")}
            >
              {titleParts.main}
            </h1>

            <div className="mt-4 h-1.5 w-full max-w-[220px] rounded-full bg-orange-500 sm:max-w-[320px] md:mt-5 md:max-w-[520px] lg:max-w-[756px] sm:translate-x-8 md:translate-x-52" />

            <p
              className={[
                "mt-6 w-full max-w-4xl whitespace-pre-line break-words font-bold text-[#1e3a8a] sm:translate-x-8 md:translate-x-52",
                isKh
                  ? "khmer-font text-[15px] leading-[1.9] sm:text-lg md:text-xl md:leading-[1.85]"
                  : "text-base leading-relaxed sm:text-lg md:text-2xl",
              ].join(" ")}
            >
              {view.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}