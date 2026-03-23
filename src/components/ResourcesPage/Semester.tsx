/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ImFilePdf } from "react-icons/im";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useLanguage } from "@/app/context/LanguageContext";

import "swiper/css";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    description?: I18n | null;
    document?: string | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string };
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
    link?: string | null;
    category?: { id: number; name?: I18n } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n | null;
    settings?: { limit?: number; categoryIds?: number[] } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY_PREFIX = "semester-reports-block-cache";

const pickText = (i18n: I18n | null | undefined, lang: UiLang) =>
    (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";

function pickDocUrl(post: ApiPost, apiLang: ApiLang) {
    const key = apiLang === "km" ? "km" : "en";
    return post.documents?.[key]?.url || post.document || post.link || "";
}

function getCacheKey(apiLang: ApiLang) {
    return `${CACHE_KEY_PREFIX}-${apiLang}`;
}

function readCache(apiLang: ApiLang): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(getCacheKey(apiLang));
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(apiLang: ApiLang, block: ApiBlock | null) {
    if (!block) return;
    try {
        sessionStorage.setItem(getCacheKey(apiLang), JSON.stringify(block));
    } catch {
        // ignore cache errors
    }
}

function pickSemesterReportsBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (b) =>
                b?.enabled !== false &&
                b?.type === "post_list" &&
                (b?.id === 30 || b?.title?.en === "Semester Reports")
        ) || null
    );
}

function ReportCard({
    post,
    lang,
    apiLang,
}: {
    post: ApiPost;
    lang: UiLang;
    apiLang: ApiLang;
}) {
    const docUrl = pickDocUrl(post, apiLang);

    return (
        <div className="bg-[#1e3a8a] aspect-square md:aspect-[4/3] w-full flex items-center text-white overflow-hidden">
            <div className="flex flex-col justify-center gap-2 md:gap-4 text-left px-4 md:px-8">
                <h3
                    className={`font-bold text-xs md:text-xl lg:text-2xl leading-tight line-clamp-2 ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {pickText(post.title, lang) || "Untitled"}
                </h3>

                <p className="text-[10px] md:text-sm opacity-90 line-clamp-3">
                    {pickText(post.description ?? undefined, lang) || "—"}
                </p>

                <div className="flex items-center gap-2 mt-1 md:mt-2">
                    <div className="bg-yellow-500 p-1 md:p-2 rounded-lg shrink-0">
                        <ImFilePdf className="w-4 h-4 md:w-8 md:h-8 text-white" />
                    </div>

                    <a
                        href={docUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-white text-[10px] md:text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap ${!docUrl ? "pointer-events-none opacity-60" : ""
                            }`}
                    >
                        {lang === "kh" ? "ទាញយក" : "Download"}
                        <MdKeyboardArrowRight className="text-base md:text-lg" />
                    </a>
                </div>
            </div>
        </div>
    );
}

function ReportCardSkeleton() {
    return (
        <div className="bg-[#1e3a8a] aspect-square md:aspect-[4/3] w-full flex items-center text-white overflow-hidden animate-pulse">
            <div className="flex flex-col justify-center gap-3 md:gap-4 text-left px-4 md:px-8 w-full">
                <div className="h-4 md:h-7 w-3/4 bg-white/20 rounded" />
                <div className="h-3 md:h-4 w-full bg-white/20 rounded" />
                <div className="h-3 md:h-4 w-5/6 bg-white/20 rounded" />
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-yellow-400/60 shrink-0" />
                    <div className="h-4 w-24 bg-white/20 rounded" />
                </div>
            </div>
        </div>
    );
}

type SemesterReportsSectionProps = {
    showAllPosts?: boolean;
    showSeeMoreButton?: boolean;
};

export default function SemesterReportsSwiper() {
    return <SemesterReportsSection />;
}

export function SemesterReportsSection({
    showAllPosts = false,
    showSeeMoreButton = true,
}: SemesterReportsSectionProps = {}) {
    const { language, apiLang } = useLanguage();
    const lang = (language as UiLang) ?? "en";
    const currentApiLang = (apiLang as ApiLang) ?? "en";

    const topSwiperRef = useRef<SwiperType | null>(null);
    const bottomSwiperRef = useRef<SwiperType | null>(null);

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(currentApiLang);
        if (cached) {
            setBlock(cached);
            setLoading(false);
        }

        let alive = true;

        async function load() {
            try {
                setError(null);

                const res = await fetch("/api/resources-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                if (!alive) return;

                const picked = pickSemesterReportsBlock(json);

                if (picked) {
                    setBlock(picked);
                    writeCache(currentApiLang, picked);
                }
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Fetch failed");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, [currentApiLang]);

    const posts = useMemo(() => {
        const p = block?.posts || [];
        // Homepage keeps the CMS limit.
        // The dedicated page shows the full list.
        if (showAllPosts) {
            return p;
        }
        const limit = block?.settings?.limit ?? p.length;
        return p.slice(0, limit);
    }, [block, showAllPosts]);

    const topPosts = useMemo(() => posts.filter((_, i) => i % 2 === 0), [posts]);
    const bottomPosts = useMemo(() => posts.filter((_, i) => i % 2 === 1), [posts]);

    const topLoop = topPosts.length > 2;
    const bottomLoop = bottomPosts.length > 2;

    const makeConfig = (count: number, loop: boolean) => ({
        modules: [Navigation],
        spaceBetween: 6,
        loop,
        slidesPerView: Math.min(2, Math.max(1, count)),
        breakpoints: {
            0: { slidesPerView: count > 1 ? 1.2 : 1 },
            768: { slidesPerView: Math.min(2, Math.max(1, count)) },
        },
    });

    const navBtnStyle =
        "bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 w-12 md:w-[20%] lg:w-[32.9%] transition-colors";

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    return (
        <section className="py-8 md:py-16 max-w-7xl px-4 mx-auto overflow-hidden bg-white">
            <div className="max-w-4xl text-center mx-auto mb-8 md:mb-12 px-4">
                <h3
                    className={`text-lg md:text-2xl font-medium mb-2 text-[#1e1e4b] ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {lang === "kh" ? "របាយការណ៍ឆមាស" : "Biannual Term Progress"}
                </h3>

                <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-[#1e1e4b]">
                    {pickText(block?.title, lang) || "Semester Reports"}
                </h1>

                <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                    {pickText(block?.description, lang) || "Browse and download reports."}
                </p>

                {showErrorOnly ? (
                    <div className="text-center text-sm text-red-600 mt-4">Failed: {error}</div>
                ) : null}
            </div>

            {showSkeleton ? (
                <div className="flex flex-col gap-1 md:gap-1.5">
                    <div className="flex w-full gap-1 md:gap-1.5 items-stretch">
                        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1.5">
                            <ReportCardSkeleton />
                            <div className="hidden md:block">
                                <ReportCardSkeleton />
                            </div>
                        </div>
                        <div className={navBtnStyle}>
                            <ArrowRight className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl opacity-60" />
                        </div>
                    </div>

                    <div className="flex w-full flex-row-reverse gap-1 md:gap-1.5 items-stretch">
                        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1.5">
                            <ReportCardSkeleton />
                            <div className="hidden md:block">
                                <ReportCardSkeleton />
                            </div>
                        </div>
                        <div className={navBtnStyle}>
                            <ArrowLeft className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl opacity-60" />
                        </div>
                    </div>
                </div>
            ) : posts.length > 0 ? (
                <div className="flex flex-col gap-1 md:gap-1.5">
                    {topPosts.length > 0 && (
                        <div className="flex w-full gap-1 md:gap-1.5 items-stretch">
                            <div className="flex-1 overflow-hidden">
                                <Swiper
                                    {...makeConfig(topPosts.length, topLoop)}
                                    onSwiper={(s) => (topSwiperRef.current = s)}
                                >
                                    {topPosts.map((post) => (
                                        <SwiperSlide key={post.id}>
                                            <ReportCard post={post} lang={lang} apiLang={currentApiLang} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            <button
                                onClick={() => topSwiperRef.current?.slideNext()}
                                className={navBtnStyle}
                                aria-label="Next"
                            >
                                <ArrowRight className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl" />
                            </button>
                        </div>
                    )}

                    {bottomPosts.length > 0 && (
                        <div className="flex w-full flex-row-reverse gap-1 md:gap-1.5 items-stretch">
                            <div className="flex-1 overflow-hidden">
                                <Swiper
                                    {...makeConfig(bottomPosts.length, bottomLoop)}
                                    onSwiper={(s) => (bottomSwiperRef.current = s)}
                                >
                                    {bottomPosts.map((post) => (
                                        <SwiperSlide key={post.id}>
                                            <ReportCard post={post} lang={lang} apiLang={currentApiLang} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            <button
                                onClick={() => bottomSwiperRef.current?.slidePrev()}
                                className={navBtnStyle}
                                aria-label="Previous"
                            >
                                <ArrowLeft className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-sm text-slate-600">No semester reports found.</div>
            )}

            {showSeeMoreButton && posts.length > 0 ? (
                <div className="mt-8 flex justify-center">
                    <Link
                        href="/semester-reports"
                        className={`bg-[#1e3a8a] hover:bg-[#17306f] text-white py-2 px-6 rounded-md font-semibold transition-colors ${
                            lang === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {lang === "kh" ? "មើលបន្ថែម" : "See More"}
                    </Link>
                </div>
            ) : null}
        </section>
    );
}
