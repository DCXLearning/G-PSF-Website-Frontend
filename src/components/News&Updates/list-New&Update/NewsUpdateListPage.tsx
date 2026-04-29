"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, List, CalendarDays } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { buildAbsoluteUrl } from "@/utils/socialShare";
import { buildNewsDetailPath } from "@/utils/newsDetail";
import { formatLocalizedDate } from "@/utils/localizedDate";
import SocialShareButtons from "./SocialShareButtons";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type LangText = string | { en?: string; km?: string; kh?: string };

type ContentBlock = {
  type?: string;
  attrs?: {
    src?: string;
  };
};

type PostItem = {
  id: number;
  slug: string | null;
  title: LangText;
  description: LangText;
  createdAt: string;
  publishedAt: string | null;
  coverImage: string | null;
  status?: string;
  isPublished?: boolean;
  content?: {
    en?: {
      type?: string;
      content?: ContentBlock[];
    };
    km?: {
      type?: string;
      content?: ContentBlock[];
    };
    kh?: {
      type?: string;
      content?: ContentBlock[];
    };
  };
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: PostItem[];
};

type ViewMode = "list" | "grid";

const API_URL = "/api/newupdate-page/detail";

const text = {
  en: {
    latest: "Latest",
    title: "News & Updates",
    list: "List",
    grid: "Grid",
    loading: "Loading...",
    empty: "No published news yet.",
    error: "Failed to load news and updates.",
    viewDetails: "View details",
    noDescription: "No description available.",
    cover: "G-PSF Cover",
  },
  kh: {
    latest: "ចុងក្រោយ",
    title: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
    list: "បញ្ជី",
    grid: "ក្រឡា",
    loading: "កំពុងផ្ទុក...",
    empty: "មិនទាន់មានព័ត៌មានបានផ្សព្វផ្សាយទេ។",
    error: "មិនអាចទាញយកព័ត៌មានបានទេ។",
    viewDetails: "មើលលម្អិត",
    noDescription: "មិនមានការពិពណ៌នា។",
    cover: "រូបភាពព័ត៌មាន",
  },
};

function uiToApiLang(language: UiLang): ApiLang {
  return language === "kh" ? "km" : "en";
}

function getText(value: LangText | undefined, language: UiLang) {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (language === "kh") {
    return value.km || value.kh || value.en || "";
  }

  return value.en || value.km || value.kh || "";
}

function getContentBlocks(post: PostItem, language: UiLang): ContentBlock[] {
  if (language === "kh") {
    return (
      post.content?.km?.content ||
      post.content?.kh?.content ||
      post.content?.en?.content ||
      []
    );
  }

  return (
    post.content?.en?.content ||
    post.content?.km?.content ||
    post.content?.kh?.content ||
    []
  );
}

function getThumbnail(post: PostItem, language: UiLang) {
  if (post.coverImage) return post.coverImage;

  const blocks = getContentBlocks(post, language);
  const firstImage = blocks.find(
    (block) => block.type === "image" && block.attrs?.src
  );

  return firstImage?.attrs?.src || "";
}

export default function NewsUpdateListPage() {
  const { language } = useLanguage();
  const uiLanguage = (language as UiLang) || "en";
  const t = text[uiLanguage];

  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, {
          cache: "no-store",
        });

        const json: ApiResponse = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch posts");
        }

        const publishedOnly = (json.data || []).filter(
          (item) => item.isPublished === true || item.status === "published"
        );

        if (mounted) setItems(publishedOnly);
      } catch (err) {
        console.error(err);
        if (mounted) setError(t.error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [t.error]);

  const content = useMemo(() => {
    return items.map((item) => {
      const title = getText(item.title, uiLanguage);
      const excerpt = getText(item.description, uiLanguage);
      const imageUrl = getThumbnail(item, uiLanguage);
      const date = formatLocalizedDate(
        item.publishedAt || item.createdAt,
        uiLanguage
      );

      const detailPath = buildNewsDetailPath({
        id: item.id,
        slug: item.slug,
      });

      const shareUrl = buildAbsoluteUrl(detailPath);

      return {
        ...item,
        title,
        excerpt,
        imageUrl,
        date,
        detailPath,
        shareUrl,
      };
    });
  }, [items, uiLanguage]);

  return (
    <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 center flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 md:text-3xl">
              {t.latest}
            </p>
            <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl">
              {t.title}
            </h1>
            <div className="mt-4 h-1.5 w-60 bg-orange-500" />
          </div>

          <div className="mt-10 flex items-center gap-2 self-start rounded-lg bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${viewMode === "list"
                ? "bg-[#273650] text-white"
                : "text-[#273650] hover:bg-gray-100"
                }`}
            >
              <List size={18} />
              {t.list}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${viewMode === "grid"
                ? "bg-[#273650] text-white"
                : "text-[#273650] hover:bg-gray-100"
                }`}
            >
              <Grid3X3 size={18} />
              {t.grid}
            </button>
          </div>
        </div>

        {loading && <div className="py-2 text-center">{t.loading}</div>}

        {error && !loading && (
          <div className="rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && content.length === 0 && (
          <div className="rounded bg-white px-6 py-10 text-center shadow-sm">
            {t.empty}
          </div>
        )}

        {!loading && !error && viewMode === "list" && (
          <div>
            {content.map((item, index) => (
              <article
                key={item.id}
                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 ${index !== content.length - 1
                  ? "mb-10 border-b border-gray-300"
                  : ""
                  }`}
              >
                <Link href={item.detailPath} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-md md:h-[260px] md:aspect-auto">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white px-4 text-center text-xl font-semibold text-[#0f2347] md:text-2xl">
                        {t.cover}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex min-w-0 flex-col justify-center pt-1">
                  <Link href={item.detailPath} className="block">
                    <h2 className="mt-3 text-xl khmer-font font-bold leading-tight text-[#0f2347] hover:underline md:text-xl lg:text-[25px]">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="mt-4 max-w-4xl text-sm leading-7 khmer-font text-[#4f6482] md:text-base md:leading-8 lg:text-[19px]">
                    {item.excerpt || t.noDescription}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 pt-4">
                    <Link
                      href={item.detailPath}
                      className="inline-block w-fit text-base font-bold text-[#0f2347] underline md:text-lg lg:text-[18px]"
                    >
                      {t.viewDetails}
                    </Link>

                    <div className="flex items-center gap-2 text-sm text-[#6b7890]">
                      <CalendarDays className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>

                    <SocialShareButtons
                      shareUrl={item.shareUrl}
                      title={item.title}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded bg-white shadow-sm"
              >
                <Link href={item.detailPath} className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white px-4 text-center text-xl font-semibold text-[#0f2347]">
                        {t.cover}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={item.detailPath} className="block">
                    <h2 className="line-clamp-2 khmer-font text-xl font-bold leading-tight text-[#0f2347] hover:underline">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="mt-3 line-clamp-2 khmer-font text-sm leading-7 text-[#4f6482]">
                    {item.excerpt || t.noDescription}
                  </p>

                  <Link
                    href={item.detailPath}
                    className="mt-5 block text-base font-bold text-[#0f2347] underline"
                  >
                    {t.viewDetails}
                  </Link>

                  <div className="mt-4 flex items-center gap-2 text-sm text-[#6b7890]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date}</span>
                  </div>

                  <div className="mt-4">
                    <SocialShareButtons
                      shareUrl={item.shareUrl}
                      title={item.title}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}