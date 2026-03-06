"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type ApiWorkingGroup = {
  slug?: string;
  orderIndex?: number;
};

type ApiWorkingGroupsResponse = {
  items?: ApiWorkingGroup[];
};

type StartProps = {
  pageSlug?: string;
};

const PLACEHOLDER_IMAGE_URL = "/image/city.jpg";
const DEFAULT_PAGE_SLUG = "law-tax-and-governance";

function getText(value?: string): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function getWgNumber(
  groups: ApiWorkingGroup[],
  targetSlug: string,
  fallback = 0
): number {
  const normalizedSlug = getText(targetSlug);
  if (!normalizedSlug) {
    return fallback;
  }

  const bySlug = groups.find((group) => getText(group.slug) === normalizedSlug);
  if (!bySlug) {
    return fallback;
  }

  if (typeof bySlug.orderIndex === "number" && Number.isFinite(bySlug.orderIndex)) {
    return bySlug.orderIndex;
  }

  const fallbackIndex = groups.findIndex(
    (group) => getText(group.slug) === normalizedSlug
  );
  return fallbackIndex >= 0 ? fallbackIndex : fallback;
}

const Start: React.FC<StartProps> = ({ pageSlug = DEFAULT_PAGE_SLUG }) => {
  const { language } = useLanguage();
  const lang = (language as Lang) ?? "en";
  const [groups, setGroups] = useState<ApiWorkingGroup[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkingGroups() {
      try {
        const response = await fetch("/api/working-groups", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setGroups([]);
          return;
        }

        const json = (await response.json()) as ApiWorkingGroupsResponse;
        setGroups(Array.isArray(json.items) ? json.items : []);
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setGroups([]);
        }
      }
    }

    loadWorkingGroups();

    return () => {
      controller.abort();
    };
  }, []);

  const wgNumber = useMemo(
    () => getWgNumber(groups, pageSlug, 0),
    [groups, pageSlug]
  );

  const topLine =
    lang === "en"
      ? `Need to raise an issue for WG ${wgNumber}?`
      : `តើអ្នកមានបញ្ហាដែលត្រូវលើកឡើងសម្រាប់ WG ${wgNumber} ដែរឬទេ?`;

  const buttonLabel =
    lang === "en" ? "Start Submission" : "ដាក់ស្នើឥឡូវនេះ";

  return (
    <div className="relative mb-0 opacity-110 min-h-130 flex flex-col items-center justify-start overflow-hidden bg-gray-100">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-gray-900/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-68 pb-3 sm:pb-2 max-w-5xl w-full">
        <p
          className={`text-base sm:text-lg md:text-5xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${
            lang === "kh" ? "khmer-font" : ""
          }`}
        >
          {topLine}
        </p>

        <Link
          href="/contact-us"
          className={`inline-flex bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 md:py-4 px-4 sm:px-8 md:px-12 rounded-2xl shadow-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base md:text-lg ${
            lang === "kh" ? "khmer-font" : ""
          }`}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
};

export default Start;
