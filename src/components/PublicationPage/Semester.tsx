/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    description?: I18n | null;
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
    publishedAt?: string | null;
    slug?: string | null;
    category?: {
        id: number;
        name?: I18n;
    } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n | null;
    enabled?: boolean;
    settings?: {
        limit?: number;
        categoryIds?: number[];
    } | null;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: ApiBlock[];
    };
};

type SemesterReportsSectionProps = {
    showAllPosts?: boolean;
    showSeeMoreButton?: boolean;
};

const CACHE_KEY_PREFIX = "semester-reports-ui-cache-v6";

function pickText(value: I18n | null | undefined, lang: UiLang): string {
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || "";
}

function getCacheKey(apiLanguage: ApiLang) {
    return `${CACHE_KEY_PREFIX}-${apiLanguage}`;
}

function readCache(apiLanguage: ApiLang): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(getCacheKey(apiLanguage));
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(apiLanguage: ApiLang, block: ApiBlock | null) {
    if (!block) return;
    try {
        sessionStorage.setItem(getCacheKey(apiLanguage), JSON.stringify(block));
    } catch {
        // ignore
    }
}

function pickSemesterReportsBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (b) =>
                b?.enabled !== false &&
                b?.type === "post_list" &&
                (b?.id === 30 || pickText(b?.title, "en") === "Semester Reports")
        ) || null
    );
}

function pickDocUrl(post: ApiPost, apiLanguage: ApiLang): string {
    const primary =
        apiLanguage === "km" ? post.documents?.km?.url : post.documents?.en?.url;

    return (
        primary ||
        post.documents?.en?.url ||
        post.documents?.km?.url ||
        post.document ||
        post.link ||
        ""
    );
}

function pickThumbUrl(post: ApiPost, apiLanguage: ApiLang): string {
    const primary =
        apiLanguage === "km"
            ? post.documents?.km?.thumbnailUrl || post.documentThumbnails?.km
            : post.documents?.en?.thumbnailUrl || post.documentThumbnails?.en;

    return (
        primary ||
        post.documents?.en?.thumbnailUrl ||
        post.documents?.km?.thumbnailUrl ||
        post.documentThumbnails?.en ||
        post.documentThumbnails?.km ||
        post.documentThumbnail ||
        ""
    );
}

function formatPublishedDate(dateString: string | null | undefined, lang: UiLang): string {
    if (!dateString) return "";

    try {
        return new Intl.DateTimeFormat(lang === "kh" ? "km-KH" : "en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(dateString));
    } catch {
        return "";
    }
}

function getDetailHref(post: ApiPost): string {
    if (post.slug) return `/plenary/${post.slug}`;
    return `/plenary/${post.id}`;
}

export default function SemesterReportsAnnualUi() {
    return <SemesterReportsSection />;
}

export function SemesterReportsSection({
    showAllPosts = false,
    showSeeMoreButton = true,
}: SemesterReportsSectionProps = {}) {
    const { language, apiLang, fontClass } = useLanguage();

    const uiLang = (language as UiLang) ?? "en";
    const apiLanguage = (apiLang as ApiLang) ?? "en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(apiLanguage);
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

                if (!res.ok) {
                    throw new Error(`API error ${res.status}`);
                }

                const json = (await res.json()) as ApiResponse;
                if (!alive) return;

                const picked = pickSemesterReportsBlock(json);

                if (picked) {
                    setBlock(picked);
                    writeCache(apiLanguage, picked);
                }
            } catch (err: unknown) {
                if (!alive) return;
                const message = err instanceof Error ? err.message : "Fetch failed";
                setError(message);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, [apiLanguage]);

    const posts = useMemo(() => {
        const allPosts = block?.posts || [];
        return showAllPosts ? allPosts : allPosts;
    }, [block, showAllPosts]);

    const sectionTitle = pickText(block?.title, uiLang) || "Semester Reports";
    const sectionDescription = pickText(block?.description, uiLang);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;
    const showEmpty = !showSkeleton && !error && posts.length === 0;

    return (
        <section className={`relative overflow-hidden ${fontClass || ""}`}>
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#3f5fa8]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 pt-10 pb-14">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1e2f5d]">
                        {sectionTitle}
                    </h2>

                    {sectionDescription ? (
                        <p className="max-w-4xl mx-auto mt-4 text-sm md:text-lg leading-7 text-[#51607f]">
                            {sectionDescription}
                        </p>
                    ) : null}
                </div>

                {showErrorOnly ? (
                    <div className="text-center text-red-500 mb-6">{error}</div>
                ) : null}

                {showSkeleton ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-full">
                                <div className="bg-[#dfe3ea] p-4 animate-pulse h-full flex flex-col">
                                    <div className="bg-[#cfd4db] h-[280px] w-full mb-5 shrink-0" />
                                    <div className="h-5 w-32 bg-slate-300 rounded mb-3 shrink-0" />
                                    <div className="h-7 w-full bg-slate-300 rounded mb-3 shrink-0" />
                                    <div className="h-5 w-full bg-slate-300 rounded mb-2 shrink-0" />
                                    <div className="h-5 w-4/5 bg-slate-300 rounded mb-6 shrink-0" />
                                    <div className="mt-auto h-11 w-full bg-slate-300 rounded shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className="text-center text-slate-700 py-10">
                        {uiLang === "kh" ? "មិនមានរបាយការណ៍ឆមាសទេ។" : "No semester reports found."}
                    </div>
                ) : (
                    <>
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            loop={posts.length > 5}
                            autoplay={{
                                delay: 3200,
                                disableOnInteraction: false,
                            }}
                            pagination={{
                                clickable: true,
                            }}
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                },
                                768: {
                                    slidesPerView: 2,
                                },
                                1024: {
                                    slidesPerView: 2,
                                },
                                1280: {
                                    slidesPerView: 3,
                                },
                            }}
                            className="semesterReportsSwiper !pb-16"
                        >
                            {posts.map((post) => {
                                const title = pickText(post.title, uiLang) || "Semester Report";
                                const description = pickText(post.description, uiLang);
                                const docUrl = pickDocUrl(post, apiLanguage);
                                const thumb = pickThumbUrl(post, apiLanguage);
                                const publishedDate = formatPublishedDate(post.publishedAt, uiLang);
                                const detailHref = getDetailHref(post);

                                return (
                                    <SwiperSlide key={post.id} className="!h-auto">
                                        <div className="h-full">
                                            <article className="bg-[#dfe3ea] p-4 shadow-sm h-full flex flex-col">
                                                <div className="block shrink-0">
                                                    <div className="bg-[#d0d3d9] p-4 flex items-center justify-center h-[280px] mb-5">
                                                        <div className="relative w-[192px] h-[257px]">
                                                            {thumb ? (
                                                                <Image
                                                                    src={thumb}
                                                                    alt={title}
                                                                    fill
                                                                    className="object-contain p-1"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col flex-1">
                                                    <p className="text-[#2f416b] text-sm md:text-base font-medium mb-3 min-h-[24px] shrink-0">
                                                        {publishedDate}
                                                    </p>

                                                    <div className="block shrink-0">
                                                        <h3 className="text-[#16264d] text-xl md:text-2xl leading-tight font-bold line-clamp-1 min-h-[14px] mb-3 transition">
                                                            {title}
                                                        </h3>
                                                    </div>

                                                    <p className="text-[#5e687b] text-sm md:text-base leading-7 line-clamp-2 min-h-[44px] mb-6">
                                                        {description}
                                                    </p>

                                                    <a
                                                        href={docUrl || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-10 bg-[#f5a20a] hover:bg-[#ea9805] text-white text-base md:text-lg font-medium rounded-md py-2 transition shrink-0 ${!docUrl ? "pointer-events-none opacity-50" : ""
                                                            }`}
                                                    >
                                                        <span>{uiLang === "kh" ? "ទាញយក" : "Download"}</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </article>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        {showSeeMoreButton && posts.length > 0 ? (
                            <div className="flex justify-center mt-2">
                                <Link
                                    href="/publication/semester-reports/semester-view-more"
                                    className={`inline-flex items-center gap-2 bg-[#f79a3b] hover:bg-[#ee8f2d] text-white font-semibold uppercase tracking-wide px-4 py-3 rounded-full shadow-md transition ${uiLang === "kh" ? "khmer-font" : ""
                                        }`}
                                >
                                    <span>{uiLang === "kh" ? "មើលបន្ថែម" : "View More"}</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : null}
                    </>
                )}
            </div>

            <style jsx global>{`
                .semesterReportsSwiper .swiper-wrapper {
                align-items: stretch;
                }

                .semesterReportsSwiper .swiper-slide {
                height: 10px;
                display: flex;
                }

                .semesterReportsSwiper .swiper-pagination {
                bottom: 0 !important;
                }

                .semesterReportsSwiper .swiper-pagination-bullet {
                width: 16px;
                height: 16px;
                background: #c98c64;
                opacity: 1;
                }

                .semesterReportsSwiper .swiper-pagination-bullet-active {
                background: #f39c3d;
                }
            `}</style>
        </section>
    );
}