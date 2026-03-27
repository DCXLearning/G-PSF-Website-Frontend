/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";

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

function formatMonthYear(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
    }).format(d);
}

function pickText(i18n?: I18n, fallback = "") {
    return i18n?.en?.trim() || i18n?.km?.trim() || fallback;
}

function pickThumbnail(p: ApiPost) {
    return (
        p.documentThumbnail ||
        p.documents?.en?.thumbnailUrl ||
        p.documents?.km?.thumbnailUrl ||
        ""
    );
}

function pickDocUrl(p: ApiPost) {
    return p.document || p.documents?.en?.url || p.documents?.km?.url || "";
}

function getPostListBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks ?? [];
    return (
        blocks.find((b) => b.enabled && b.type === "post_list") ||
        blocks.find((b) => b.type === "post_list") ||
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
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.message || "Failed to load policy documents");
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
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return tb - ta;
        });
    }, [block]);

    const headerTitle = pickText(block?.title, "Policy Documents");
    const headerDesc = pickText(block?.description, "");

    const showSkeleton = !mounted || (loading && !block);
    const showEmpty = !showSkeleton && !err && posts.length === 0;
    const showErrorOnly = !showSkeleton && !block && !!err;

    return (
        <section className="relative bg-white font-sans overflow-hidden py-16 print:py-0">
            <div className="max-w-5xl mx-auto text-center px-4 mb-16 relative z-10 print:mb-6 print:text-left print:max-w-none">
                <p className="text-gray-900 font-bold text-3xl md:text-4xl mb-1 print:text-xl print:mb-1">
                    Core Policies & Frameworks
                </p>

                <h2 className="text-[#1a2b4b] text-5xl md:text-6xl font-semibold mb-4 print:text-2xl print:mb-2">
                    {headerTitle}
                </h2>

                {headerDesc ? (
                    <p className="text-gray-900 font-semibold text-xl md:text-2xl print:text-sm print:font-normal">
                        {headerDesc}
                    </p>
                ) : null}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[350px] bg-[#3b5998] z-0 print:hidden" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 print:max-w-none print:px-0">
                {showSkeleton ? (
                    <div className="print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
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
                        <p className="text-[#1a2b4b] font-semibold">No documents found.</p>
                    </div>
                ) : (
                    <>
                        <div className="print:hidden">
                            <Swiper
                                modules={[Pagination, Autoplay]}
                                spaceBetween={30}
                                slidesPerView={1}
                                autoplay={{ delay: 5000, disableOnInteraction: false }}
                                pagination={{ clickable: true, el: ".custom-pagination" }}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                className="pb-20"
                            >
                                {posts.map((p) => {
                                    const thumb = pickThumbnail(p);
                                    const title = pickText(p.title, "Untitled");
                                    const desc = pickText(p.description, "");
                                    const dateText = formatMonthYear(p.createdAt);
                                    const docUrl = pickDocUrl(p);

                                    return (
                                        <SwiperSlide key={p.id} className="h-auto">
                                            <div className="h-full">
                                                <Card
                                                    thumb={thumb}
                                                    title={title}
                                                    desc={desc}
                                                    dateText={dateText}
                                                    docUrl={docUrl}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <div className="custom-pagination flex justify-center gap-3 mt-4" />

                            <div className="mt-8 -mb-[30px] flex justify-center">
                                <Link
                                    href="/resources/detail"
                                    className="inline-flex items-center justify-center rounded-full bg-[#fb923c] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:opacity-90"
                                >
                                    View More <span className="ml-2 text-lg">›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="hidden print:grid print:grid-cols-2 print:gap-3">
                            {posts.map((p) => {
                                const thumb = pickThumbnail(p);
                                const title = pickText(p.title, "Untitled");
                                const desc = pickText(p.description, "");
                                const dateText = formatMonthYear(p.createdAt);
                                const docUrl = pickDocUrl(p);

                                return (
                                    <div
                                        key={p.id}
                                        className="border border-slate-300 p-3 break-inside-avoid"
                                    >
                                        <div className="text-[10pt] font-semibold text-slate-800">
                                            {dateText}
                                        </div>

                                        <div className="mt-1 text-[11pt] font-bold text-[#1a2b4b] uppercase leading-snug">
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
                                            {docUrl ? `Document: ${docUrl}` : "No document"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <style jsx global>{`
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
}: {
    thumb: string;
    title: string;
    desc: string;
    dateText: string;
    docUrl: string;
}) {
    return (
        <div className="bg-[#e9ecef] flex flex-col shadow-xl h-full min-h-[560px] overflow-hidden">
            <div className="m-4 h-[300px] bg-[#dfe3e6] flex items-center justify-center overflow-hidden rounded-sm">
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
                        <span className="text-gray-500 font-medium text-lg">
                            No thumbnail
                        </span>
                    </div>
                )}
            </div>

            <div className="px-6 pb-8 pt-2 flex flex-col grow min-h-[220px]">
                <span className="text-[#1a2b4b] text-xs font-semibold mb-3 shrink-0">
                    {dateText}
                </span>

                <h3 className="text-[#1a2b4b] khmer-font text-2xl font-bold mb-3 uppercase line-clamp-1 leading-tight">
                    {title}
                </h3>

                <p className="text-gray-700 khmer-font text-sm mb-4 line-clamp-3 min-h-[32x]">
                    {desc || title}
                </p>

                <div className="mt-auto pt-2">
                    {docUrl ? (
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1a2b4b] text-xs font-bold flex items-center hover:underline uppercase tracking-wider"
                        >
                            Download <span className="ml-1 text-lg">›</span>
                        </a>
                    ) : (
                        <button
                            disabled
                            className="text-gray-400 text-xs font-bold flex items-center uppercase tracking-wider cursor-not-allowed"
                        >
                            No document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}