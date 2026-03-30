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
        // ignore cache errors
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
            className="rounded-tl-[120px] bg-white overflow-hidden rounded-bl-[25px] rounded-br-[25px] relative pt-12 h-[430px] pb-10 flex flex-col animate-pulse"
            style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
        >
            <div className="absolute bg-blue-950 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-70">
                <div className="flex items-center justify-center w-full h-[160px]">
                    <div className="h-[120px] w-[120px] rounded-full border-4 border-white bg-white/20" />
                </div>
            </div>

            <div className="w-25 h-25 relative rounded-[200px] ml-10 top-8 mb-6">
                <div className="bg-blue-950 w-25 h-25 border-white border-3 rounded-[200px] flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-white/20" />
                </div>
            </div>

            <div className="p-6 pt-10 flex flex-col flex-1">
                <div className="h-7 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 rounded w-5/6 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-6" />
                <div className="mt-auto h-11 bg-slate-200 rounded w-full" />
            </div>
        </div>
    );
}

const LatestReport: React.FC = () => {
    const { language } = useLanguage();
    const lang: Lang = language === "kh" ? "km" : "en";
    const isKhmer = lang === "km";

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
            <div className="text-center mb-90 mt-20">
                <p
                    className={`text-xl font-medium text-indigo-400 uppercase tracking-wider ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {subHeading}
                </p>

                <h1
                    className={`text-6xl font-bold text-blue-950 mt-2 ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {mainHeading}
                </h1>

                <p
                    className={`mt-4 text-2xl text-gray-500 max-w-4xl mx-auto ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {description}
                </p>
            </div>

            <div
                className="h-[220px] flex flex-col justify-end relative"
                style={{ backgroundColor: DARK_BLUE }}
            >
                <div className="container mx-auto px-4 max-w-7xl py-8">
                    {showSkeleton ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                const title =
                                    isKhmer
                                        ? post.title?.km || post.title?.en || "Untitled"
                                        : post.title?.en || post.title?.km || "Untitled";

                                const desc =
                                    isKhmer
                                        ? post.description?.km || post.description?.en || ""
                                        : post.description?.en || post.description?.km || "";

                                const cover = pickThumbUrl(post, lang);
                                const docUrl = pickDocUrl(post, lang);

                                return (
                                    <SwiperSlide key={post.id} className="pb-10 pt-12 px-[10px] h-auto">
                                        <div
                                            className="rounded-tl-[120px] bg-white overflow-hidden rounded-bl-[25px] rounded-br-[25px] relative pt-12 h-[390px] flex flex-col"
                                            style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                                        >
                                            <div className="absolute bg-blue-950 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-70">
                                                <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                                                    {cover ? (
                                                        <img
                                                            src={cover}
                                                            alt={title}
                                                            className="h-[120px] w-[120px] object-cover rounded-full border-4 border-white"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-25 h-25 relative rounded-[200px] ml-10 top-8 mb-4 shrink-0">
                                                <div className="bg-gray-200 w-25 h-25 border-white border-3 rounded-[200px] flex items-center justify-center overflow-hidden">
                                                    {cover ? (
                                                        <img
                                                            src={cover}
                                                            alt={title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white text-3xl">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6 pt-8 flex flex-col flex-1">
                                                <h3
                                                    className={`text-xl font-bold text-gray-800 mb-3 line-clamp-2 min-h-[60px] ${isKhmer ? "khmer-font" : ""
                                                        }`}
                                                >
                                                    {title}
                                                </h3>

                                                <p
                                                    className={`text-gray-600 leading-relaxed text-base line-clamp-2 min-h-[56px] ${isKhmer ? "khmer-font" : ""
                                                        }`}
                                                >
                                                    {desc}
                                                </p>

                                                <a
                                                    href={docUrl || "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`mt-4 inline-flex items-center gap-2 text-[#1d3ea6] hover:text-[#16338a] text-base md:text-lg font-semibold transition self-start ${!docUrl ? "pointer-events-none opacity-50" : ""
                                                        }`}
                                                >
                                                    <span>{isKhmer ? "ទាញយក" : "Download"}</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    ) : (
                        <div
                            className={`text-center text-white/80 text-sm ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {isKhmer ? "មិនមានទិន្នន័យរបាយការណ៍" : "No report items found."}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LatestReport;