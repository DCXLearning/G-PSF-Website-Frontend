"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "km";
type MultiLang = string | { en?: string; km?: string };

type WorkingGroupsSectionResponse = {
  success: boolean;
  message?: string;
  data?: {
    blocks?: Array<{
      id: number;
      type: string;
      title?: MultiLang;
      description?: MultiLang | null;
    }>;
  };
};

function getText(value: MultiLang | null | undefined, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || "";
}

export default function WorkingGroups16() {
  const { language } = useLanguage();

  const lang: Lang = useMemo(() => {
    return language === "kh" ? "km" : "en";
  }, [language]);

  const isKh = lang === "km";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const res = await fetch(
          "/api/working-groups-page/section?slug=working-groups",
          {
            cache: "no-store",
          }
        );

        const json: WorkingGroupsSectionResponse = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch data");
        }

        const block = json.data?.blocks?.find(
          (item) => item.id === 43 && item.type === "text_block"
        );

        if (!mounted) return;

        setTitle(getText(block?.title, lang));
        setDescription(getText(block?.description, lang));
      } catch (error) {
        console.error("Failed to load block 43:", error);

        if (!mounted) return;

        setTitle(isKh ? "ក្រុមការងារ (WGs)?" : "Working Groups?");
        setDescription(
          isKh
            ? "ក្រុមការងារ (WGs) គឺជាម៉ាស៊ីនដំណើរការស្នូលរបស់ G-PSF។"
            : "The Working Groups (WGs) are the core operational engine of the G-PSF."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [lang, isKh]);

  const titleParts = useMemo(() => {
    const rawTitle = title.trim();

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
  }, [title, isKh]);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-10">
            <p
              className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${
                isKh ? "khmer-font normal-case" : ""
              }`}
            >
              {loading ? (isKh ? "កំពុងទាញយក..." : "Loading...") : titleParts.small}
            </p>

            <h1
              className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${
                isKh ? "khmer-font" : ""
              }`}
            >
              {loading ? "..." : titleParts.main}
            </h1>

            <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[440px] translate-x-0 sm:translate-x-8 md:translate-x-25" />

            <p
              className={`mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] whitespace-pre-line translate-x-0 sm:translate-x-8 md:translate-x-25 ${
                isKh ? "khmer-font" : ""
              }`}
            >
              {loading ? "..." : description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}