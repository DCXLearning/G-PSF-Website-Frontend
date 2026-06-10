"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, List, CalendarDays } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { buildAbsoluteUrl } from "@/utils/socialShare";
import { buildNewsDetailPath } from "@/utils/newsDetail";
import { formatLocalizedDate } from "@/utils/localizedDate";
import Pagination from "@/components/Pagination";
import SocialShareButtons from "./SocialShareButtons";

const ITEMS_PER_PAGE = 6;
const API_URL = "/api/newupdate-page/detail";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type ViewMode = "list" | "grid";

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
    en?: { type?: string; content?: ContentBlock[] };
    km?: { type?: string; content?: ContentBlock[] };
    kh?: { type?: string; content?: ContentBlock[] };
  };
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: PostItem[];
};

const pageText = {
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

function cleanText(value?: string) {
  const txt = value?.trim() ?? "";
  return txt === "." ? "" : txt;
}

function getText(value: LangText | undefined, language: UiLang) {
  if (!value) return "";
  if (typeof value === "string") return cleanText(value);

  return language === "kh"
    ? cleanText(value.km) || cleanText(value.kh) || cleanText(value.en)
    : cleanText(value.en) || cleanText(value.km) || cleanText(value.kh);
}

function getContentBlocks(post: PostItem, language: UiLang): ContentBlock[] {
  return language === "kh"
    ? post.content?.km?.content ||
        post.content?.kh?.content ||
        post.content?.en?.content ||
        []
    : post.content?.en?.content ||
        post.content?.km?.content ||
        post.content?.kh?.content ||
        [];
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

  const currentLang = String(language || "en").toLowerCase();
  const isKh =
    currentLang === "kh" || currentLang === "km" || currentLang === "khmer";

  const uiLanguage: UiLang = isKh ? "kh" : "en";
  const apiLang = uiToApiLang(uiLanguage);
  const t = pageText[uiLanguage];

  const mainTitleFontClass = isKh ? "main-title-km" : "main-title-en";
  const titleFontClass = isKh ? "title-km" : "title-en";
  const bodyFontClass = isKh ? "body-km" : "body-en";

  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setHasError(false);

        const res = await fetch(API_URL, { cache: "no-store" });
        const json: ApiResponse = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch posts");
        }

        const publishedOnly = (json.data || []).filter(
          (item) => item.isPublished === true || item.status === "published"
        );

        if (mounted) {
          setItems(publishedOnly);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setItems([]);
          setHasError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, viewMode]);

  const content = useMemo(() => {
    return items.map((item) => {
      const title = getText(item.title, uiLanguage);
      const excerpt = getText(item.description, uiLanguage);
      const imageUrl = getThumbnail(item, uiLanguage);

      const date = formatLocalizedDate(
        item.publishedAt || item.createdAt,
        apiLang
      );

      const detailPath = buildNewsDetailPath({
        id: item.id,
        slug: item.slug,
      });

      return {
        ...item,
        title,
        excerpt: excerpt.trim() === "." ? "" : excerpt.trim(),
        imageUrl,
        date,
        detailPath,
        shareUrl: buildAbsoluteUrl(detailPath),
      };
    });
  }, [items, uiLanguage, apiLang]);

  const totalPages = Math.max(1, Math.ceil(content.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedContent = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return content.slice(start, start + ITEMS_PER_PAGE);
  }, [content, currentPage]);

  function handlePageChange(nextPage: number) {
    setCurrentPage(nextPage);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`${mainTitleFontClass} text-[#0f2347]`}>
              {t.latest}
            </p>

            <h1 className={`${titleFontClass} mt-1 text-[#0f2347]`}>
              {t.title}
            </h1>

            <div className="mt-4 h-1.5 w-60 bg-orange-500" />
          </div>

          <div className="mt-10 flex items-center gap-1 self-start rounded-lg bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-[#273650] text-white"
                  : "text-[#273650] hover:bg-gray-100"
              }`}
            >
              <List size={15} />
              {t.list}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-[#273650] text-white"
                  : "text-[#273650] hover:bg-gray-100"
              }`}
            >
              <Grid3X3 size={15} />
              {t.grid}
            </button>
          </div>
        </div>

        {loading && (
          <div
            className={`${bodyFontClass} rounded bg-white px-6 py-10 text-center shadow-sm`}
          >
            {t.loading}
          </div>
        )}

        {hasError && !loading && (
          <div
            className={`${bodyFontClass} rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm`}
          >
            {t.error}
          </div>
        )}

        {!loading && !hasError && content.length === 0 && (
          <div
            className={`${bodyFontClass} rounded bg-white px-6 py-10 text-center shadow-sm`}
          >
            {t.empty}
          </div>
        )}

        {!loading && !hasError && viewMode === "list" && (
          <div>
            {paginatedContent.map((item, index) => (
              <article
                key={item.id}
                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 ${
                  index !== paginatedContent.length - 1
                    ? "mb-10 border-b border-gray-300"
                    : ""
                }`}
              >
                <Link href={item.detailPath} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-md md:h-[270px] md:aspect-auto">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title || t.cover}
                        fill
                        unoptimized
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`${bodyFontClass} flex h-full w-full items-center justify-center bg-gray-100 text-gray-400`}
                      >
                        {t.cover}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex min-w-0 flex-col justify-between pt-1">
                  <div>
                    <h2
                      className={`${mainTitleFontClass} line-clamp-2 !whitespace-normal text-[#0f2347]`}
                    >
                      {item.title}
                    </h2>

                    <p
                      className={`${bodyFontClass} mt-4 max-w-4xl line-clamp-3 text-[#4f6482]`}
                    >
                      {item.excerpt || t.noDescription}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 pt-4">
                    <div
                      className={`${bodyFontClass} flex items-center gap-2 text-[#6a7b96]`}
                    >
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span>{item.date}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={item.detailPath}
                        className={`${bodyFontClass} font-bold text-[#0f2347] underline transition hover:text-blue-700`}
                      >
                        {t.viewDetails}
                      </Link>

                      <SocialShareButtons
                        shareUrl={item.shareUrl}
                        title={item.title}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !hasError && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedContent.map((item) => (
              <article
                key={item.id}
                className="group flex h-full flex-col overflow-hidden bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={item.detailPath} className="block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title || t.cover}
                        fill
                        unoptimized
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`${bodyFontClass} flex h-full w-full items-center justify-center text-gray-400`}
                      >
                        {t.cover}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex h-full grow flex-col justify-between p-5">
                  <div>
                    <h2
                      className={`${mainTitleFontClass} line-clamp-2 !whitespace-normal text-[#0f2347]`}
                    >
                      {item.title}
                    </h2>

                    <p
                      className={`${bodyFontClass} mt-4 line-clamp-4 text-[#4f6482]`}
                    >
                      {item.excerpt || t.noDescription}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 pt-5">
                    <div
                      className={`${bodyFontClass} flex items-center gap-2 text-[#6a7b96]`}
                    >
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span>{item.date}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={item.detailPath}
                        className={`${bodyFontClass} font-bold text-[#0f2347] underline transition hover:text-blue-700`}
                      >
                        {t.viewDetails}
                      </Link>

                      <SocialShareButtons
                        shareUrl={item.shareUrl}
                        title={item.title}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !hasError && content.length > ITEMS_PER_PAGE && (
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalItems={content.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
}