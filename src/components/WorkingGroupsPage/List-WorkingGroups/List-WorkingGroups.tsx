"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
  en?: string;
  km?: string;
};

type WgTemplateContent = {
  heroBanner?: {
    ctas?: Array<{
      href?: string;
      label?: I18nText;
    }>;
    title?: I18nText;
    subtitle?: I18nText;
    description?: I18nText;
    backgroundImages?: string[];
  };
};

type WgTemplateResponse = {
  data?: {
    blocks?: Array<{
      type?: string;
      enabled?: boolean;
      posts?: Array<{
        status?: string;
        content?: {
          en?: WgTemplateContent;
          km?: WgTemplateContent;
        };
      }>;
    }>;
  };
};

type HeroData = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
};

type WorkingGroupItem = {
  slug?: string;
  orderIndex?: number;
  title?: I18nText;
};

type WorkingGroupsResponse = {
  items?: WorkingGroupItem[];
};

type ListWorkingGroupsProps = {
  pageSlug?: string;
};

const DEFAULT_PAGE_SLUG = "law-tax-and-governance";
const DEFAULT_IMAGE_URL = "/image/bannerpdf.bmp";

function normalizeLang(value: unknown): Lang {
  const lang = String(value || "en").toLowerCase();

  if (lang === "kh" || lang === "km") {
    return "kh";
  }

  return "en";
}

function getText(value?: string | null): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

// Working groups are labelled A, B, C... in the public branding (matching the
// "Working Group A: Agriculture" wording from the backend content). The DB
// stores orderIndex as 1-indexed integers, so 1 → A, 2 → B, etc. Clamped to
// A–Z so a malformed orderIndex can never escape the alphabet.
function toAlpha(orderIndex: number | null | undefined): string {
  const idx =
    typeof orderIndex === "number" && Number.isFinite(orderIndex) && orderIndex >= 1
      ? Math.floor(orderIndex)
      : 1;
  const clamped = Math.min(26, Math.max(1, idx));
  return String.fromCharCode(64 + clamped); // 64 + 1 = 65 = 'A'
}

function pickI18nText(value: I18nText | undefined, apiLang: ApiLang): string {
  if (!value) return "";

  const primary = apiLang === "km" ? getText(value.km) : getText(value.en);
  return primary || getText(value.en) || getText(value.km);
}

function pickTemplateContent(
  response: WgTemplateResponse,
  apiLang: ApiLang
): WgTemplateContent | null {
  const blocks = response.data?.blocks ?? [];

  const block =
    blocks.find((item) => item.enabled !== false && item.type === "wg_template") ??
    blocks.find((item) => item.enabled !== false);

  const post =
    block?.posts?.find((item) => item.status === "published") ??
    block?.posts?.[0];

  if (!post) return null;

  return post.content?.[apiLang] ?? post.content?.en ?? post.content?.km ?? null;
}

function mapHeroData(
  response: WgTemplateResponse,
  apiLang: ApiLang
): HeroData | null {
  const content = pickTemplateContent(response, apiLang);
  const heroBanner = content?.heroBanner;

  if (!heroBanner) return null;

  const cta = heroBanner.ctas?.[0];

  const title = pickI18nText(heroBanner.title, apiLang);
  const subtitle = pickI18nText(heroBanner.subtitle, apiLang);
  const description = pickI18nText(heroBanner.description, apiLang);
  const ctaLabel = pickI18nText(cta?.label, apiLang);
  const ctaHref = getText(cta?.href);

  const rawImage = getText(heroBanner.backgroundImages?.[0]);
  const imageUrl = rawImage || DEFAULT_IMAGE_URL;

  const hasContent = Boolean(
    title || subtitle || description || ctaLabel || ctaHref || rawImage,
  );

  if (!hasContent) return null;

  return {
    title,
    subtitle,
    description,
    imageUrl,
    ctaLabel,
    ctaHref,
  };
}

const ListWorkingGroups: React.FC<ListWorkingGroupsProps> = ({
  pageSlug = DEFAULT_PAGE_SLUG,
}) => {
  const { language } = useLanguage();

  const lang = normalizeLang(language);
  const apiLang: ApiLang = lang === "kh" ? "km" : "en";
  const isKh = lang === "kh";

  const titleFontClass = isKh ? "title-km" : "title-en";
  const bodyFontClass = isKh ? "body-km" : "body-en";

  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [workingGroupTitle, setWorkingGroupTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHeroBanner() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/working-groups-page/section?slug=${encodeURIComponent(pageSlug)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setHeroData(null);
          return;
        }

        const json = (await response.json()) as WgTemplateResponse;
        setHeroData(mapHeroData(json, apiLang));
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setHeroData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadHeroBanner();

    return () => {
      controller.abort();
    };
  }, [apiLang, pageSlug]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkingGroupTitle() {
      try {
        const response = await fetch("/api/working-groups", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setWorkingGroupTitle("");
          return;
        }

        const json = (await response.json()) as WorkingGroupsResponse;
        const groups = Array.isArray(json.items) ? json.items : [];
        const cleanSlug = getText(pageSlug);

        const group = groups.find((item) => getText(item.slug) === cleanSlug);

        if (!group) {
          setWorkingGroupTitle("");
          return;
        }

        const label = pickI18nText(group.title, apiLang);

        if (!label) {
          setWorkingGroupTitle("");
          return;
        }

        const rawOrderIndex =
          typeof group.orderIndex === "number"
            ? group.orderIndex
            : groups.findIndex((item) => getText(item.slug) === cleanSlug);

        const orderIndex = rawOrderIndex >= 0 ? rawOrderIndex : 0;

        // The Khmer label already carries its own native prefix
        // ("ក្រុមការងារ គ៖ …"), so prepending an English "WG C:" would duplicate
        // it. Only the English label needs the "WG <letter>:" prefix.
        setWorkingGroupTitle(
          apiLang === "km" ? label : `WG ${toAlpha(orderIndex)}: ${label}`,
        );
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setWorkingGroupTitle("");
        }
      }
    }

    loadWorkingGroupTitle();

    return () => {
      controller.abort();
    };
  }, [apiLang, pageSlug]);

  const titleLine =
    lang === "en" ? "Working Group Profile" : "ព័ត៌មានអំពីក្រុមការងារ";

  const fallbackTitle =
    workingGroupTitle ||
    (lang === "en"
      ? "WG D: Law, Tax & Governance"
      : "ច្បាប់ បទប្បញ្ញត្តិ និងប្រព័ន្ធអភិបាលកិច្ច");

  const fallbackButtonLabel =
    lang === "en" ? "Download WG Brief" : "ទាញយកសង្ខេប WG";

  const mainTitle = heroData?.title || fallbackTitle;
  const subtitle = heroData?.subtitle || heroData?.description || "";
  const buttonLabel = heroData?.ctaLabel || fallbackButtonLabel;
  const buttonHref = heroData?.ctaHref || "";
  const imageUrl = heroData?.imageUrl || DEFAULT_IMAGE_URL;

  return (
    <div className="relative mb-0 flex min-h-180 flex-col items-center justify-start overflow-hidden bg-gray-100 opacity-110">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gray-900/50" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center px-4 pt-68 pb-3 text-center sm:pb-2">
        <p className={`mb-4 text-white sm:mb-6 ${bodyFontClass}`}>
          {titleLine}
        </p>

        <h1
          className={`
            mb-4 max-w-5xl break-words text-white sm:mb-6
            ${titleFontClass}
          `}
        >
          {mainTitle}
        </h1>

        {subtitle ? (
          <p
            className={`
              mb-4 max-w-4xl break-words text-white sm:mb-6
              ${bodyFontClass}
            `}
          >
            {subtitle}
          </p>
        ) : null}

        {buttonHref ? (
          <a
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex rounded-2xl bg-blue-500 px-4 py-2 text-white shadow-xl
              transition duration-300 hover:scale-105 hover:bg-blue-700
              focus:outline-none focus:ring-4 focus:ring-blue-500/50
              sm:px-8 sm:py-3 md:px-12 md:py-4
              ${bodyFontClass}
            `}
            style={{ fontWeight: 600 }}
          >
            {buttonLabel}
          </a>
        ) : null}

        {loading ? (
          <p className={`mt-4 text-white/90 ${bodyFontClass}`}>
            {lang === "kh" ? "កំពុងទាញទិន្នន័យ..." : "Loading data..."}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ListWorkingGroups;