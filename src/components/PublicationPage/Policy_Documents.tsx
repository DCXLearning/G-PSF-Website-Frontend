/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";

import "swiper/css";
import "swiper/css/pagination";

type UiLang = "en" | "kh";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string;
    description?: I18n;
    createdAt?: string;
    document?: string | null;
    documentThumbnail?: string | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string };
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n;
    settings?: { sort?: string; limit?: number; categoryIds?: number[] };
    orderIndex?: number;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { page?: I18n; slug?: string; blocks?: ApiBlock[] };
};

const API_URL = "/api/resources/section";
const CACHE_KEY = "policy-documents-block-cache";

const FONT_FAMILY =
    '"Airbnb Cereal", var(--font-kantumruy-pro), "Kantumruy Pro", system-ui, sans-serif';

function containsKhmer(value?: string | null): boolean {
    return /[\u1780-\u17FF]/.test(value ?? "");
}

function pickText(i18n: I18n | null | undefined, lang: UiLang, fallback = "") {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || fallback;
}

function pickThumbnail(post: ApiPost) {
    return (
        post.documentThumbnail ||
        post.documents?.en?.thumbnailUrl ||
        post.documents?.km?.thumbnailUrl ||
        ""
    );
}

function pickDocUrl(post: ApiPost) {
    return post.document || post.documents?.en?.url || post.documents?.km?.url || "";
}

function getPostListBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks ?? [];

    return (
        blocks.find(
            (block) =>
                block.enabled !== false &&
                block.type === "post_list" &&
                block.settings?.categoryIds?.includes(6)
        ) ||
        blocks.find((block) => block.enabled && block.type === "post_list") ||
        blocks.find((block) => block.type === "post_list") ||
        null
    );
}

function readCachedBlock(): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCachedBlock(block: ApiBlock | null) {
    if (!block) return;

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(block));
    } catch {
        // ignore cache errors
    }
}

export default function PolicyDocuments() {
    const { language, fontClass } = useLanguage();

    const uiLang: UiLang =
        String(language) === "kh" || String(language) === "km" ? "kh" : "en";

    const isKh = uiLang === "kh";

    const [block, setBlock] = useState<ApiBlock | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const cached = readCachedBlock();

        if (cached) {
            setBlock(cached);
            setLoading(false);
        }

        let alive = true;

        async function load() {
            try {
                setErr(null);

                const res = await fetch(API_URL, {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error: ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                const postList = getPostListBlock(json);

                if (!alive) return;

                if (postList) {
                    setBlock(postList);
                    writeCachedBlock(postList);
                }
            } catch (error: any) {
                if (!alive) return;
                setErr(error?.message || "Failed to load policy documents");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, []);

    const posts = useMemo(() => {
        const list = block?.posts ?? [];

        return [...list].sort((a, b) => {
            const firstDate = new Date(a.createdAt || 0).getTime();
            const secondDate = new Date(b.createdAt || 0).getTime();

            return secondDate - firstDate;
        });
    }, [block]);

    const headerTitle = pickText(block?.title, uiLang, "Policy Documents");
    const headerDesc = pickText(block?.description, uiLang, "");

    const showSkeleton = !mounted || (loading && !block);
    const showEmpty = !showSkeleton && !err && posts.length === 0;
    const showErrorOnly = !showSkeleton && !block && !!err;

    return (
        <section
            className={`relative bg-white overflow-hidden py-16 print:py-0 ${fontClass || ""}`}
            style={{
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.5px",
            }}
        >
            <div className="max-w-5xl mx-auto text-center px-4 mb-16 relative z-10 print:mb-6 print:text-left print:max-w-none">
                <p
                    className="text-gray-900 mb-1"
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: isKh ? "22px" : "21px",
                        lineHeight: "32px",
                        fontWeight: isKh ? 700 : 800,
                        letterSpacing: "0.7px",
                    }}
                >
                    {isKh ? "គោលនយោបាយ និងក្របខ័ណ្ឌ" : "Core Policies & Frameworks"}
                </p>

                <h2
                    className="text-[#1a2b4b] mb-4"
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: isKh || containsKhmer(headerTitle) ? "35px" : "32px",
                        lineHeight: isKh || containsKhmer(headerTitle) ? "50px" : "42px",
                        fontWeight: isKh || containsKhmer(headerTitle) ? 700 : 800,
                        letterSpacing: "0.7px",
                    }}
                >
                    {headerTitle}
                </h2>

                {headerDesc ? (
                    <p
                        className="text-gray-900 font-semibold max-w-5xl mx-auto"
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: isKh || containsKhmer(headerDesc) ? "17px" : "16px",
                            lineHeight: "30px",
                            fontWeight: 500,
                            letterSpacing: "0.5px",
                        }}
                    >
                        {headerDesc}
                    </p>
                ) : null}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[350px] bg-[#3b5998] z-0 print:hidden" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 print:max-w-none print:px-0">
                {showSkeleton ? (
                    <div className="print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-[#e9ecef] flex flex-col shadow-xl min-h-[560px] animate-pulse overflow-hidden"
                                >
                                    <div className="m-4 h-[300px] bg-[#dfe3e6] rounded-sm" />
                                    <div className="px-6 pb-8 pt-2 flex flex-col grow">
                                        <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
                                        <div className="h-8 w-3/4 bg-slate-200 rounded mb-3" />
                                        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                                        <div className="h-4 w-5/6 bg-slate-200 rounded mb-6" />
                                        <div className="mt-auto h-4 w-28 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : showErrorOnly ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow print:shadow-none print:border print:rounded-none">
                        <p className="text-red-600 font-semibold">Error: {err}</p>
                    </div>
                ) : showEmpty ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow print:shadow-none print:border print:rounded-none">
                        <p
                            className="text-[#1a2b4b] font-semibold"
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: isKh ? "17px" : "16px",
                                lineHeight: "30px",
                            }}
                        >
                            {isKh ? "មិនមានឯកសារ" : "No documents found."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="print:hidden">
                            <Swiper
                                modules={[Pagination, Autoplay]}
                                spaceBetween={30}
                                slidesPerView={1}
                                autoplay={{
                                    delay: 5000,
                                    disableOnInteraction: false,
                                }}
                                pagination={{
                                    clickable: true,
                                    el: ".custom-pagination",
                                }}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                className="pb-20 equal-card-swiper"
                            >
                                {posts.map((post) => {
                                    const thumb = pickThumbnail(post);
                                    const title = pickText(post.title, uiLang, "Untitled");
                                    const desc = pickText(post.description, uiLang, "");
                                    const dateText = formatLocalizedDate(post.createdAt, uiLang);
                                    const docUrl = pickDocUrl(post);

                                    return (
                                        <SwiperSlide key={post.id} className="!h-auto">
                                            <div className="h-full w-full">
                                                <Card
                                                    thumb={thumb}
                                                    title={title}
                                                    desc={desc}
                                                    dateText={dateText}
                                                    docUrl={docUrl}
                                                    isKh={isKh}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <div className="custom-pagination flex justify-center gap-3 mt-4" />

                            <div className="mt-8 -mb-[30px] flex justify-center">
                                <Link
                                    href="/publication/detail"
                                    className="inline-flex items-center justify-center rounded-full bg-[#fb923c] px-6 py-2 text-white shadow-md hover:opacity-90"
                                    style={{
                                        fontFamily: FONT_FAMILY,
                                        fontSize: "16px",
                                        lineHeight: "24px",
                                        fontWeight: 700,
                                        textTransform: isKh ? "none" : "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    {isKh ? "មើលបន្ថែម" : "View More"}
                                    <span className="ml-2 text-lg">›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="hidden print:grid print:grid-cols-2 print:gap-3">
                            {posts.map((post) => {
                                const thumb = pickThumbnail(post);
                                const title = pickText(post.title, uiLang, "Untitled");
                                const desc = pickText(post.description, uiLang, "");
                                const dateText = formatLocalizedDate(post.createdAt, uiLang);
                                const docUrl = pickDocUrl(post);

                                return (
                                    <div
                                        key={post.id}
                                        className="border border-slate-300 p-3 break-inside-avoid"
                                        style={{ fontFamily: FONT_FAMILY }}
                                    >
                                        <div className="text-[10pt] font-semibold text-slate-800">
                                            {dateText}
                                        </div>

                                        <div className="mt-1 text-[11pt] font-bold text-[#1a2b4b] leading-snug">
                                            {title}
                                        </div>

                                        {thumb ? (
                                            <div className="mt-2 h-48 border bg-[#f4f4f4] flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={thumb}
                                                    alt={title}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        ) : null}

                                        {desc ? (
                                            <div className="mt-2 text-[10pt] text-slate-700 leading-snug">
                                                {desc}
                                            </div>
                                        ) : null}

                                        <div className="mt-2 text-[10pt] text-[#1a2b4b] font-semibold">
                                            {docUrl
                                                ? `${isKh ? "ឯកសារ" : "Document"}: ${docUrl}`
                                                : isKh
                                                    ? "មិនមានឯកសារ"
                                                    : "No document"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <style jsx global>{`
                            .equal-card-swiper .swiper-wrapper {
                                align-items: stretch;
                            }

                            .equal-card-swiper .swiper-slide {
                                height: auto;
                                display: flex;
                            }

                            .custom-pagination .swiper-pagination-bullet {
                                width: 16px;
                                height: 16px;
                                background-color: #fb923c !important;
                                opacity: 0.6;
                            }

                            .custom-pagination .swiper-pagination-bullet-active {
                                opacity: 1;
                            }

                            @media print {
                                @page {
                                    size: A4;
                                    margin: 12mm;
                                }

                                html,
                                body {
                                    background: #fff !important;
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                            }
                        `}</style>
                    </>
                )}
            </div>
        </section>
    );
}

function Card({
    thumb,
    title,
    desc,
    dateText,
    docUrl,
    isKh,
}: {
    thumb: string;
    title: string;
    desc: string;
    dateText: string;
    docUrl: string;
    isKh: boolean;
}) {
    const titleHasKhmer = containsKhmer(title);
    const descHasKhmer = containsKhmer(desc || title);

    return (
        <div
            className="bg-[#e9ecef] flex h-full min-h-[560px] flex-col shadow-xl overflow-hidden"
            style={{
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.5px",
            }}
        >
            <div className="m-4 h-[300px] bg-[#dfe3e6] flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                {thumb ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img
                            src={thumb}
                            alt={title}
                            className="max-h-full max-w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                        <span
                            className="text-gray-500 font-medium"
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: isKh ? "17px" : "16px",
                                lineHeight: "30px",
                            }}
                        >
                            {isKh ? "មិនមានរូបភាព" : "No thumbnail"}
                        </span>
                    </div>
                )}
            </div>

            <div className="px-6 pb-8 pt-2 flex flex-1 flex-col">
                <span
                    className="text-[#1a2b4b] mb-3 shrink-0"
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: isKh ? "17px" : "16px",
                        lineHeight: "30px",
                        fontWeight: 400,
                    }}
                >
                    {dateText}
                </span>

                <h3
                    className="text-[#1a2b4b] mb-3 shrink-0"
                    title={title}
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: titleHasKhmer ? "22px" : "21px",
                        lineHeight: "32px",
                        fontWeight: titleHasKhmer ? 700 : 800,
                        letterSpacing: "0.7px",
                        display: "block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {title}
                </h3>

                <p
                    className="text-gray-700 mb-6 min-h-[40px] line-clamp-2"
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: descHasKhmer ? "17px" : "16px",
                        lineHeight: "30px",
                        fontWeight: 400,
                    }}
                >
                    {desc || title}
                </p>

                <div className="mt-auto pt-2">
                    {docUrl ? (
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1a2b4b] flex items-center hover:underline tracking-wider font-bold"
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: "16px",
                                lineHeight: "24px",
                                fontWeight: 700,
                                textTransform: isKh ? "none" : "uppercase",
                            }}
                        >
                            {isKh ? "ទាញយក" : "Download"}
                            <span className="ml-1 text-lg">›</span>
                        </a>
                    ) : (
                        <button
                            disabled
                            className="text-gray-400 flex items-center tracking-wider cursor-not-allowed font-bold"
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: "16px",
                                lineHeight: "24px",
                                fontWeight: 700,
                                textTransform: isKh ? "none" : "uppercase",
                            }}
                        >
                            {isKh ? "មិនមានឯកសារ" : "No document"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}