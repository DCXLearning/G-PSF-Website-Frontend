"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
  en?: string;
  km?: string;
};

type ApiWorkingGroup = {
  id: number;
  title?: I18nText;
  iconUrl?: string;
  slug?: string;
};

type WorkingGroupsResponse = {
  items?: ApiWorkingGroup[];
};

type WorkingGroupCard = {
  id: number;
  title: string;
  iconUrl: string;
  href: string;
};

type WorkingGroupListCardsProps = {
  currentSlug?: string;
};

const ICON_BG = "#4C518D";

function getText(value?: string | null) {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function pickText(value: I18nText | undefined, apiLang: ApiLang) {
  if (!value) {
    return "";
  }

  const primary = apiLang === "km" ? getText(value.km) : getText(value.en);
  return primary || getText(value.en) || getText(value.km);
}

function buildCards(
  items: ApiWorkingGroup[],
  apiLang: ApiLang,
  currentSlug?: string
): WorkingGroupCard[] {
  const cleanCurrentSlug = getText(currentSlug);

  return items
    .filter((item) => getText(item.slug) !== cleanCurrentSlug)
    .map((item) => {
      const slug = getText(item.slug);

      return {
        id: item.id,
        title: pickText(item.title, apiLang),
        iconUrl: getText(item.iconUrl),
        href: slug ? `/working-groups/${slug}` : "/working-groups",
      };
    })
    .filter((item) => item.title);
}

export default function WorkingGroupListCards({
  currentSlug,
}: WorkingGroupListCardsProps) {
  const { language } = useLanguage();
  const lang: Lang = language === "kh" ? "kh" : "en";
  const apiLang: ApiLang = lang === "kh" ? "km" : "en";
  const isKh = lang === "kh";

  const [items, setItems] = useState<ApiWorkingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkingGroups() {
      try {
        setLoading(true);

        const response = await fetch("/api/working-groups", {
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setItems([]);
          return;
        }

        const data = (await response.json()) as WorkingGroupsResponse;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadWorkingGroups();

    return () => {
      controller.abort();
    };
  }, []);

  const cards = useMemo(
    () => buildCards(items, apiLang, currentSlug),
    [apiLang, currentSlug, items]
  );

  const emptyLabel = isKh ? "មិនទាន់មានក្រុមការងារ" : "No working groups found";
  const title = isKh ? "ក្រុមការងារតាមវិស័យផ្សេងទៀត" : "Related Working Groups";

  return (
    <section className="bg-white px-4 pb-20 pt-8 sm:px-6 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-10 text-center md:mb-14">
          <h2
            className={`text-4xl font-extrabold leading-[1.05] text-blue-950 md:text-5xl ${
              isKh ? "khmer-font" : ""
            }`}
          >
            {title}
          </h2>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 gap-[22px] sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[210px] w-full animate-pulse flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 shadow-sm"
              >
                <div className="mb-4 h-20 w-20 shrink-0 rounded-full bg-slate-200" />
                <div className="flex h-[52px] flex-col items-center justify-center">
                  <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-[22px] sm:grid-cols-3 lg:grid-cols-6">
            {cards.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex h-[210px] w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center shadow-sm transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md"
              >
                <span
                  className="relative mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: ICON_BG }}
                >
                  {item.iconUrl ? (
                    <Image
                      src={item.iconUrl}
                      alt={item.title}
                      fill
                      className="object-contain p-5"
                      sizes="80px"
                    />
                  ) : null}
                </span>

                <div className="flex h-[52px] items-center justify-center">
                  <span
                    className={`m-0 line-clamp-2 max-w-[170px] text-center font-semibold leading-snug text-gray-900 ${
                      isKh ? "khmer-font" : ""
                    }`}
                    title={item.title}
                  >
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={`text-center text-sm text-slate-500 ${isKh ? "khmer-font" : ""}`}>
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  );
}
