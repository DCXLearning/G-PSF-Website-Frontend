"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, List, CalendarDays } from "lucide-react";
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import {
  buildAbsoluteUrl,
  buildFacebookShareUrl,
  buildPathWithQuery,
  buildTelegramShareUrl,
} from "@/utils/socialShare";

type LangText = string | { en?: string; km?: string };

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
  };
  category?: {
    id: number;
    name?: {
      en?: string;
      km?: string;
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

function getText(value: LangText | undefined, lang: "en" | "km" = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.km || "";
}

function formatDate(dateValue?: string | null): string {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPostType(post: PostItem) {
  const contentEn = post.content?.en?.content || [];
  const hasYoutube = contentEn.some((block) => block.type === "youtube");

  if (hasYoutube) return "VIDEO";
  return "PUBLICATION";
}

function getThumbnail(post: PostItem) {
  if (post.coverImage) return post.coverImage;

  const contentEn = post.content?.en?.content || [];
  const firstImage = contentEn.find(
    (block) => block.type === "image" && block.attrs?.src
  );

  return firstImage?.attrs?.src || "";
}

export default function NewsUpdateListPage() {
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

        if (mounted) {
          setItems(publishedOnly);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load news and updates.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    return items.map((item) => {
      const title = getText(item.title, "en");
      const excerpt = getText(item.description, "en");
      const imageUrl = getThumbnail(item);
      const type = getPostType(item);
      const date = formatDate(item.publishedAt || item.createdAt);

      const detailPath = buildPathWithQuery("/new-update/view-detail", {
        id: String(item.id),
        ...(item.slug ? { slug: item.slug } : {}),
      });
      const shareUrl = buildAbsoluteUrl(detailPath);

      return {
        ...item,
        title,
        excerpt,
        imageUrl,
        type,
        date,
        detailPath,
        facebookShareUrl: buildFacebookShareUrl(shareUrl),
        telegramShareUrl: buildTelegramShareUrl(shareUrl, title),
      };
    });
  }, [items]);

  return (
    <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 center flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 md:text-3xl">Latest</p>
            <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl">
              News & Updates
            </h1>
            <div className="mt-4 h-1.5 w-60 bg-orange-500" />
          </div>

          <div className="mt-12 flex items-center gap-2 self-start rounded-lg bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                viewMode === "list"
                  ? "bg-[#273650] text-white"
                  : "text-[#273650] hover:bg-gray-100"
              }`}
            >
              <List size={18} />
              List
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                viewMode === "grid"
                  ? "bg-[#273650] text-white"
                  : "text-[#273650] hover:bg-gray-100"
              }`}
            >
              <Grid3X3 size={18} />
              Grid
            </button>
          </div>
        </div>

        {loading && <div className="py-2 text-center">Loading...</div>}

        {error && !loading && (
          <div className="rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && content.length === 0 && (
          <div className="rounded bg-white px-6 py-10 text-center shadow-sm">
            No published news yet.
          </div>
        )}

        {!loading && !error && viewMode === "list" && (
          <div>
            {content.map((item, index) => (
              <article
                key={item.id}
                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 ${
                  index !== content.length - 1 ? "mb-10 border-b border-gray-300" : ""
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
                        G-PSF Cover
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex min-w-0 flex-col justify-between pt-1">
                  <div>

                    <Link href={item.detailPath} className="block">
                      <h2 className="mt-3 text-xl khmer-font font-bold leading-tight text-[#0f2347] hover:underline md:text-xl lg:text-[25px]">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="mt-4 max-w-4xl text-sm leading-7 khmer-font text-[#4f6482] md:text-base md:leading-8 lg:text-[19px]">
                      {item.excerpt || "No description available."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 pt-4">
                    <Link
                      href={item.detailPath}
                      className="inline-block w-fit text-base font-bold text-[#0f2347] underline md:text-lg lg:text-[18px]"
                    >
                      View details
                    </Link>

                    <div className="flex items-center gap-2 text-sm font-medium text-[#6a7b96] md:text-base">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="khmer-font">{item.date || "No date"}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-[18px] font-medium text-[#2f2f2f]">Share:</span>

                      <a
                        href={item.facebookShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Share ${item.title} on Facebook`}
                        className="grid h-11 w-11 place-items-center rounded-full bg-[#1877F2] text-white transition hover:scale-105"
                      >
                        <FaFacebookF className="h-5 w-5" />
                      </a>

                      <a
                        href={item.telegramShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Share ${item.title} on Telegram`}
                        className="grid h-11 w-11 place-items-center rounded-full bg-[#27A7E7] text-white transition hover:scale-105"
                      >
                        <FaTelegramPlane className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {content.map((item) => (
              <article
                key={item.id}
                className="group flex h-full flex-col overflow-hidden bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={item.detailPath} className="block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-xl font-semibold text-[#0f2347]">
                        G-PSF Cover
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex h-full grow flex-col justify-between p-5">
                  <div>

                    <Link href={item.detailPath} className="block">
                      <h2 className="mt-3 line-clamp-2 text-xl khmer-font font-bold leading-tight text-[#0f2347] hover:underline">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="mt-4 line-clamp-3 khmer-font text-sm leading-7 text-[#4f6482]">
                      {item.excerpt || "No description available."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 pt-5">
                    <Link
                      href={item.detailPath}
                      className="inline-block w-fit text-base font-bold text-[#0f2347] underline"
                    >
                      View details
                    </Link>

                    <div className="flex items-center gap-2 text-sm font-medium text-[#6a7b96]">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="khmer-font">{item.date || "No date"}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-[18px] font-medium text-[#2f2f2f]">Share:</span>

                      <a
                        href={item.facebookShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Share ${item.title} on Facebook`}
                        className="grid h-11 w-11 place-items-center rounded-full bg-[#1877F2] text-white transition hover:scale-105"
                      >
                        <FaFacebookF className="h-5 w-5" />
                      </a>

                      <a
                        href={item.telegramShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Share ${item.title} on Telegram`}
                        className="grid h-11 w-11 place-items-center rounded-full bg-[#27A7E7] text-white transition hover:scale-105"
                      >
                        <FaTelegramPlane className="h-5 w-5" />
                      </a>
                    </div>
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
