/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "km";

interface ApiImage {
    id: number;
    url: string;
    sortOrder: number;
}

interface ApiPost {
    id: number;
    title: { en?: string; km?: string };
    slug: string;
    description?: { en?: string; km?: string };
    content?: any;
    status: string;
    images?: ApiImage[];
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string | null;
    document?: string | null;
    documentThumbnail?: string | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    } | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string } | null;
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
    link?: string | null;
}

interface PostListBlock {
    id: number;
    type: "post_list";
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
    settings?: { sort?: string; limit?: number; categoryIds?: number[] };
    posts?: ApiPost[];
    enabled?: boolean;
}

interface ApiResponse {
    success?: boolean;
    message?: string;
    data?: {
        blocks?: PostListBlock[];
    };
}

const DARK_BLUE = "#1A1D42";
const CACHE_KEY_PREFIX = "latestReportCache";

function getCacheKey(lang: Lang) {
    return `${CACHE_KEY_PREFIX}-${lang}`;
}

function readCache(lang: Lang): PostListBlock | null {
    try {
        const raw = localStorage.getItem(getCacheKey(lang));
        if (!raw) return null;
        return JSON.parse(raw) as PostListBlock;
    } catch {
        return null;
    }
}

function writeCache(lang: Lang, block: PostListBlock | null) {
    if (!block) return;

    try {
        localStorage.setItem(getCacheKey(lang), JSON.stringify(block));
    } catch {

    }
}

function pickSemesterReportsBlock(json: ApiResponse): PostListBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (b) =>
                b?.enabled !== false &&
                b?.type === "post_list" &&
                ((b?.title?.en || "").toLowerCase().includes("semester reports") ||
                    (b?.title?.km || "").includes("Semester Reports") ||
                    b?.id === 30)
        ) || null
    );
}

function pickDocUrl(post: ApiPost, lang: Lang): string {
    const primary =
        lang === "km" ? post.documents?.km?.url : post.documents?.en?.url;

    return (
        primary ||
        post.documents?.en?.url ||
        post.documents?.km?.url ||
        post.document ||
        post.link ||
        ""
    );
}

function pickThumbUrl(post: ApiPost, lang: Lang): string {
    const primary =
        lang === "km"
            ? post.documents?.km?.thumbnailUrl || post.documentThumbnails?.km
            : post.documents?.en?.thumbnailUrl || post.documentThumbnails?.en;

    return (
        primary ||
        post.documents?.en?.thumbnailUrl ||
        post.documents?.km?.thumbnailUrl ||
        post.documentThumbnails?.en ||
        post.documentThumbnails?.km ||
        post.documentThumbnail ||
        post.images?.[0]?.url ||
        ""
    );
}

function ReformCardSkeleton() {
    return (
        <div
            className="relative flex h-[430px] animate-pulse flex-col overflow-hidden rounded-bl-[25px] rounded-br-[25px] rounded-tl-[120px] bg-white pb-10 pt-12"
            style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
        >
            <div className="absolute left-1/2 top-0 h-70 w-full -translate-x-1/2 -translate-y-1/2 bg-blue-950">
                <div className="flex h-[160px] w-full items-center justify-center">
                    <div className="h-[120px] w-[120px] rounded-full border-4 border-white bg-white/20" />
                </div>
            </div>

            <div className="relative top-8 mb-4 ml-10 h-25 w-25 rounded-[200px]">
                <div className="flex h-25 w-25 items-center justify-center overflow-hidden rounded-[200px] border-3 border-white bg-blue-950">
                    <div className="h-full w-full bg-white/20" />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6 pt-8">
                <div className="mb-4 h-16 w-full rounded bg-slate-200" />
                <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                <div className="mb-6 h-4 w-5/6 rounded bg-slate-200" />
                <div className="mt-auto h-8 w-28 rounded bg-slate-200" />
            </div>
        </div>
    );
}

const LatestReport: React.FC = () => {
    const { language } = useLanguage();

    const lang: Lang = language === "kh" ? "km" : "en";
    const isKhmer = lang === "km";

    const titleFontClass = isKhmer ? "title-km" : "title-en";
    const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";
    const smallFontClass = isKhmer ? "khmer-font" : "airbnb-font";

    const [mounted, setMounted] = useState(false);
    const [block, setBlock] = useState<PostListBlock | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(lang);

        if (cached) {
            setBlock(cached);
            setLoading(false);
        }

        let alive = true;

        async function run() {
            try {
                const res = await fetch("/api/resources-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    throw new Error(`API error ${res.status}`);
                }

                const json = (await res.json()) as ApiResponse;

                if (!alive) return;

                const apiBlock = pickSemesterReportsBlock(json);

                if (apiBlock) {
                    setBlock(apiBlock);
                    writeCache(lang, apiBlock);
                }
            } catch {
                if (!alive) return;
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        run();

        return () => {
            alive = false;
        };
    }, [lang]);

    const posts = useMemo(() => {
        const arr = block?.posts ?? [];
        const limit = block?.settings?.limit ?? arr.length;

        return arr.slice(0, limit);
    }, [block]);

    const showSkeleton = !mounted || (loading && !block);

    const subHeading = isKhmer ? "ព័ត៌មានបច្ចុប្បន្នភាពគោលនយោបាយ" : "Policy Update";

    const mainHeading = isKhmer ? "របាយការណ៍បច្ចុប្បន្នភាព" : "Latest Report";

    const description = isKhmer
        ? "ផ្តល់ព័ត៌មានបច្ចុប្បន្នភាពអំពីកំណែទម្រង់គោលនយោបាយថ្មីៗ ការកែលម្អបទប្បញ្ញត្តិ និងគំនិតផ្តួចផ្តើមនានា ដើម្បីពង្រឹងអភិបាលកិច្ច និងការអភិវឌ្ឍសេដ្ឋកិច្ច។"
        : "Provides updates on recent policy reforms, regulatory improvements, and initiatives aimed at strengthening governance and economic development.";

    return (
        <>
            <div className="mb-90 mt-4 md:mt-14 text-center">
                <p
                    className={`
                        text-blue-950
                        !whitespace-normal !overflow-visible !text-clip
                        ${mainTitleFontClass}
                    `}
                >
                    {subHeading}
                </p>

                <h1 className={`mt-2 text-blue-950 ${titleFontClass}`}>
                    {mainHeading}
                </h1>

                <p
                    className={`
                        mx-auto mt-4 max-w-4xl text-gray-500
                        ${bodyFontClass}
                    `}
                >
                    {description}
                </p>
            </div>

            <div
                className="relative flex h-[220px] flex-col justify-end"
                style={{ backgroundColor: DARK_BLUE }}
            >
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    {showSkeleton ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <ReformCardSkeleton />

                            <div className="hidden sm:block">
                                <ReformCardSkeleton />
                            </div>

                            <div className="hidden lg:block">
                                <ReformCardSkeleton />
                            </div>
                        </div>
                    ) : posts.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            slidesPerView={1}
                            spaceBetween={20}
                            navigation={false}
                            pagination={{ clickable: true }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="custom-swiper-pagination-white"
                        >
                            {posts.map((post) => {
                                const title = isKhmer
                                    ? post.title?.km || post.title?.en || "Untitled"
                                    : post.title?.en || post.title?.km || "Untitled";

                                const desc = isKhmer
                                    ? post.description?.km || post.description?.en || ""
                                    : post.description?.en || post.description?.km || "";

                                const cover = pickThumbUrl(post, lang);
                                const docUrl = pickDocUrl(post, lang);

                                return (
                                    <SwiperSlide
                                        key={post.id}
                                        className="h-auto px-[10px] pb-10 pt-12"
                                    >
                                        <div
                                            className="relative flex h-[430px] flex-col overflow-hidden rounded-bl-[25px] rounded-br-[25px] rounded-tl-[120px] bg-white pt-12"
                                            style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                                        >
                                            <div className="absolute left-1/2 top-0 h-70 w-full -translate-x-1/2 -translate-y-1/2 bg-blue-950">
                                                <div className="flex h-[160px] w-full items-center justify-center text-white">
                                                    {cover ? (
                                                        <img
                                                            src={cover}
                                                            alt={title}
                                                            className="h-[120px] w-[120px] rounded-full border-4 border-white object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative top-8 mb-4 ml-10 h-25 w-25 shrink-0 rounded-[200px]">
                                                <div className="flex h-25 w-25 items-center justify-center overflow-hidden rounded-[200px] border-3 border-white bg-gray-200">
                                                    {cover ? (
                                                        <img
                                                            src={cover}
                                                            alt={title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl text-white">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col p-6 pt-8">
                                                <h3
                                                    className={`
                                                        report-card-title-2line
                                                        mb-3 text-gray-800
                                                        ${isKhmer ? "report-card-title-km" : "report-card-title-en"}
                                                    `}
                                                    title={title}
                                                >
                                                    {title}
                                                </h3>

                                                <p
                                                    className={`
                                                        min-h-[56px] line-clamp-2 text-gray-600
                                                        ${bodyFontClass}
                                                    `}
                                                >
                                                    {desc}
                                                </p>

                                                <a
                                                    href={docUrl || "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`
                                                        mt-auto w-full inline-flex items-center justify-center gap-2
                                                        px-10 py-2.5 rounded-md shrink-0
                                                        bg-[#f5a20a] hover:bg-[#ea9805] text-white font-medium transition
                                                        ${smallFontClass}
                                                        ${!docUrl ? "pointer-events-none opacity-50" : ""}
                                                    `}
                                                >
                                                    <span>{isKhmer ? "ទាញយក" : "Download"}</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    ) : (
                        <div className={`text-center text-white/80 ${bodyFontClass}`}>
                            {isKhmer ? "មិនមានទិន្នន័យរបាយការណ៍" : "No report items found."}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .report-card-title-2line {
                    display: -webkit-box !important;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden !important;
                    text-overflow: ellipsis;
                    white-space: normal !important;
                    min-height: calc(var(--main-title-line-height) * 2);
                    max-height: calc(var(--main-title-line-height) * 2);
                }

                .report-card-title-en {
                    font-family: "Airbnb Cereal", system-ui, sans-serif;
                    font-size: var(--main-title-en-size) !important;
                    line-height: var(--main-title-line-height);
                    letter-spacing: var(--header-letter-spacing);
                    font-weight: 800;
                }

                .report-card-title-km {
                    font-family: var(--font-kantumruy-pro), sans-serif;
                    font-size: var(--main-title-km-size) !important;
                    line-height: var(--main-title-line-height);
                    letter-spacing: var(--header-letter-spacing);
                    font-weight: 700;
                }

                .custom-swiper-pagination-white .swiper-pagination-bullet {
                    background: #ffffff !important;
                    opacity: 0.55;
                }

                .custom-swiper-pagination-white .swiper-pagination-bullet-active {
                    opacity: 1;
                }
            `}</style>
        </>
    );
};

export default LatestReport;