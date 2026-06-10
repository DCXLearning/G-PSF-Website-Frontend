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
        // ignore
    }
}

export default function PolicyDocuments() {
    const { language } = useLanguage();

    const uiLang: UiLang = String(language) === "kh" || String(language) === "km" ? "kh" : "en";
    const isKh = uiLang === "kh";

    const wrapperFontClass = isKh ? "khmer-font" : "airbnb-font";
    const bodyClass = isKh ? "body-km" : "body-en";
    const titleClass = isKh ? "title-km" : "title-en";
    const mainTitleClass = isKh ? "main-title-km" : "main-title-en";

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
        <section className={`relative overflow-hidden bg-white py-16 print:py-0 ${wrapperFontClass}`}>
            <div className="relative z-10 mx-auto mb-16 max-w-5xl px-4 text-center print:mb-6 print:max-w-none print:text-left">
                <p className={`mb-1 ${mainTitleClass}`}>
                    {isKh ? "គោលនយោបាយ និងក្របខ័ណ្ឌ" : "Core Policies & Frameworks"}
                </p>

                <h2 className={`mb-4 ${titleClass}`}>{headerTitle}</h2>

                {headerDesc ? (
                    <p className={`mx-auto max-w-5xl !font-medium ${bodyClass}`}>{headerDesc}</p>
                ) : null}
            </div>

            <div className="absolute bottom-0 left-0 z-0 h-[350px] w-full bg-[#3b5998] print:hidden" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 print:max-w-none print:px-0">
                {showSkeleton ? (
                    <div className="print:hidden">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex min-h-[560px] animate-pulse flex-col overflow-hidden bg-[#e9ecef] shadow-xl"
                                >
                                    <div className="m-4 h-[300px] rounded-sm bg-[#dfe3e6]" />
                                    <div className="flex grow flex-col px-6 pb-8 pt-2">
                                        <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
                                        <div className="mb-3 h-8 w-3/4 rounded bg-slate-200" />
                                        <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                                        <div className="mb-6 h-4 w-5/6 rounded bg-slate-200" />
                                        <div className="mt-auto h-4 w-28 rounded bg-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : showErrorOnly ? (
                    <div className="rounded-xl bg-white/70 p-8 text-center shadow print:rounded-none print:border print:shadow-none">
                        <p className="font-semibold text-red-600">Error: {err}</p>
                    </div>
                ) : showEmpty ? (
                    <div className="rounded-xl bg-white/70 p-8 text-center shadow print:rounded-none print:border print:shadow-none">
                        <p className={`!font-semibold ${bodyClass}`}>
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
                                className="equal-card-swiper pb-20"
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
                                                    bodyClass={bodyClass}
                                                    mainTitleClass={mainTitleClass}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <div className="custom-pagination mt-4 flex justify-center gap-3" />

                            <div className="-mb-[30px] mt-8 flex justify-center">
                                <Link
                                    href="/publication/detail"
                                    className={`inline-flex items-center justify-center rounded-md bg-blue-950 hover:bg-blue-900 px-5 py-1.5 text-white shadow-md hover:opacity-90 ${bodyClass} !font-medium !text-white`}
                                >
                                    {isKh ? "មើលបន្ថែម" : "See More"}
                                </Link>
                            </div>
                        </div>

                        <style jsx global>{`
                            .equal-card-swiper .swiper-wrapper {
                                align-items: stretch;
                            }

                            .equal-card-swiper .swiper-slide {
                                display: flex;
                                height: auto;
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
    bodyClass,
    mainTitleClass,
}: {
    thumb: string;
    title: string;
    desc: string;
    dateText: string;
    docUrl: string;
    isKh: boolean;
    bodyClass: string;
    mainTitleClass: string;
}) {
    return (
        <div className="flex h-full min-h-[560px] flex-col overflow-hidden bg-[#e9ecef] shadow-xl">
            <div className="m-4 flex h-[300px] shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#dfe3e6]">
                {thumb ? (
                    <div className="flex h-full w-full items-center justify-center p-4">
                        <img
                            src={thumb}
                            alt={title}
                            className="max-h-full max-w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                        <span className={`${bodyClass} text-gray-500`}>{isKh ? "មិនមានរូបភាព" : "No thumbnail"}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col px-6 pb-8 pt-2">
                <span className={`mb-3 shrink-0 !text-[#1a2b4b] ${bodyClass}`}>{dateText}</span>

                <h3
                    className={`
                        mb-3 min-h-[32px] shrink-0
                        ${mainTitleClass}
                        !block
                        !overflow-hidden
                        !text-ellipsis
                        !whitespace-nowrap
                        !text-[#1a2b4b]
                    `}
                    title={title}
                >
                    {title}
                </h3>

                <p className={`mb-6 min-h-[60px] line-clamp-2 text-gray-700 ${bodyClass}`}>
                    {desc || title}
                </p>

                <div className="mt-auto pt-2">
                    {docUrl ? (
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                flex w-full items-center justify-center gap-2
                                rounded-md bg-[#f5a20a] px-6 py-2.5
                                !text-white transition hover:bg-[#ea9805]
                                ${bodyClass} !font-bold
                            `}
                        >
                            {isKh ? "ទាញយក" : "Download"}
                            <span className="text-xl leading-none">›</span>
                        </a>
                    ) : (
                        <button
                            disabled
                            className={`
                                flex w-full cursor-not-allowed items-center justify-center gap-2
                                rounded-md bg-gray-300 px-6 py-3
                                text-white
                                ${bodyClass} !font-bold
                            `}
                        >
                            {isKh ? "មិនមានឯកសារ" : "No document"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}