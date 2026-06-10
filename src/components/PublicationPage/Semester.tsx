"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";

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
    coverImage?: string | null;
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
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n | null;
    enabled?: boolean;
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
    const primary = apiLanguage === "km" ? post.documents?.km?.url : post.documents?.en?.url;

    return primary || post.documents?.en?.url || post.documents?.km?.url || post.document || post.link || "";
}

function pickThumbUrl(post: ApiPost, apiLanguage: ApiLang): string {
    const primary =
        apiLanguage === "km"
            ? post.documents?.km?.thumbnailUrl || post.documentThumbnails?.km
            : post.documents?.en?.thumbnailUrl || post.documentThumbnails?.en;

    return (
        post.coverImage ||
        primary ||
        post.documents?.en?.thumbnailUrl ||
        post.documents?.km?.thumbnailUrl ||
        post.documentThumbnails?.en ||
        post.documentThumbnails?.km ||
        post.documentThumbnail ||
        ""
    );
}

export default function SemesterReportsAnnualUi() {
    return <SemesterReportsSection />;
}

export function SemesterReportsSection({
    showAllPosts = false,
    showSeeMoreButton = true,
}: SemesterReportsSectionProps = {}) {
    const { language, apiLang } = useLanguage();

    const uiLang = (language === "kh" ? "kh" : "en") as UiLang;
    const apiLanguage = (apiLang === "km" ? "km" : "en") as ApiLang;
    const isKhmer = uiLang === "kh";

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

                if (!res.ok) throw new Error(`API error ${res.status}`);

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

    const wrapperFontClass = isKhmer ? "khmer-font" : "airbnb-font";
    const bodyClass = isKhmer ? "body-km" : "body-en";
    const titleClass = isKhmer ? "title-km" : "title-en";
    const mainTitleClass = isKhmer ? "main-title-km" : "main-title-en";

    return (
        <section className={`relative overflow-hidden ${wrapperFontClass}`}>
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#3f5fa8]" />

            <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-14">
                <div className="mb-8 text-center">
                    <h2 className={titleClass}>{sectionTitle}</h2>

                    {sectionDescription ? (
                        <p className={`mx-auto mt-4 max-w-4xl ${bodyClass}`}>{sectionDescription}</p>
                    ) : null}
                </div>

                {showErrorOnly ? (
                    <div className="mb-6 text-center font-medium text-red-500">{error}</div>
                ) : null}

                {showSkeleton ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-full">
                                <div className="flex h-full animate-pulse flex-col bg-[#dfe3ea] p-4">
                                    <div className="mb-5 h-[280px] w-full shrink-0 bg-[#cfd4db]" />
                                    <div className="mb-3 h-5 w-32 shrink-0 rounded bg-slate-300" />
                                    <div className="mb-3 h-7 w-full shrink-0 rounded bg-slate-300" />
                                    <div className="mb-2 h-5 w-full shrink-0 rounded bg-slate-300" />
                                    <div className="mb-6 h-5 w-4/5 shrink-0 rounded bg-slate-300" />
                                    <div className="mt-auto h-11 w-full shrink-0 rounded bg-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className={`py-10 text-center ${bodyClass}`}>
                        {uiLang === "kh" ? "មិនមានរបាយការណ៍ឆមាសទេ។" : "No semester reports found."}
                    </div>
                ) : (
                    <>
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            loop={posts.length > 3}
                            autoplay={{
                                delay: 3200,
                                disableOnInteraction: false,
                            }}
                            pagination={{
                                clickable: true,
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 2 },
                                1280: { slidesPerView: 3 },
                            }}
                            className="semesterReportsSwiper !pb-16"
                        >
                            {posts.map((post) => {
                                const title = pickText(post.title, uiLang) || "Semester Report";
                                const description = pickText(post.description, uiLang);
                                const docUrl = pickDocUrl(post, apiLanguage);
                                const thumb = pickThumbUrl(post, apiLanguage);
                                const publishedDate = formatLocalizedDate(post.publishedAt, uiLang);

                                return (
                                    <SwiperSlide key={post.id} className="!h-auto">
                                        <div className="h-full w-full">
                                            <article className="flex h-full flex-col bg-[#dfe3ea] p-4 shadow-sm">
                                                <div className="shrink-0">
                                                    <div className="mb-5 flex h-[280px] items-center justify-center bg-[#d0d3d9] p-4">
                                                        <div className="relative h-[257px] w-[192px]">
                                                            {thumb ? (
                                                                <Image
                                                                    src={thumb}
                                                                    alt={title}
                                                                    fill
                                                                    sizes="192px"
                                                                    className="object-contain p-1"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 flex-col">
                                                    <p
                                                        className={`
                              mb-1 min-h-[24px] shrink-0
                              ${bodyClass}
                              !font-medium !text-[#2f416b]
                            `}
                                                    >
                                                        {publishedDate}
                                                    </p>

                                                    <h3
                                                        className={`
                              mb-2 min-h-[32px]
                              ${mainTitleClass}
                              !block
                              !overflow-hidden
                              !text-ellipsis
                              !whitespace-nowrap
                              text-left
                            `}
                                                        title={title}
                                                    >
                                                        {title}
                                                    </h3>

                                                    <p className={`mb-6 min-h-[60px] line-clamp-2 ${bodyClass}`}>
                                                        {description}
                                                    </p>

                                                    <a
                                                        href={docUrl || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`
                              mt-auto inline-flex w-full shrink-0 items-center justify-center gap-2
                              rounded-md bg-[#f5a20a] px-10 py-2.5
                              text-white transition hover:bg-[#ea9805]
                              ${bodyClass}
                              !font-bold !text-white
                              ${!docUrl ? "pointer-events-none opacity-50" : ""}
                            `}
                                                    >
                                                        <span>{uiLang === "kh" ? "ទាញយក" : "Download"}</span>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </article>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        {showSeeMoreButton && posts.length > 0 ? (
                            <div className="mt-2 flex justify-center">
                                <Link
                                    href="/publication/semester-reports/semester-view-more/17"
                                    className={`
                                        inline-flex items-center gap-2 rounded-md
                                        bg-blue-950 px-5 py-1.5 text-white
                                        shadow-md transition hover:bg-blue-900
                                        ${bodyClass}
                                        !font-medium !text-white
                                    `}
                                >
                                    <span>{uiLang === "kh" ? "មើលបន្ថែម" : "See More"}</span>
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
                display: flex;
                height: auto;
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