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

function formatMonthYear(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
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

const API_URL = "/api/resources/section";

export default function PolicyDocuments() {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setErr(null);

                const res = await fetch(API_URL, { cache: "no-store" });
                if (!res.ok) throw new Error(`API error: ${res.status}`);

                const json = (await res.json()) as ApiResponse;

                const blocks = json?.data?.blocks ?? [];
                const postList =
                    blocks.find((b) => b.enabled && b.type === "post_list") ||
                    blocks.find((b) => b.type === "post_list") ||
                    null;

                if (alive) setBlock(postList);
            } catch (e: any) {
                if (alive) setErr(e?.message || "Failed to load policy documents");
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

    return (
        <section className="relative bg-white font-sans overflow-hidden py-16 print:py-0">
            {/* Header */}
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

            {/* BLUE BACKGROUND DECORATION (hide in print) */}
            <div className="absolute bottom-0 left-0 w-full h-[350px] bg-[#3b5998] z-0 print:hidden" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 print:max-w-none print:px-0">
                {loading ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow print:shadow-none print:border print:rounded-none">
                        <p className="text-[#1a2b4b] font-semibold">Loading documents…</p>
                    </div>
                ) : err ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow print:shadow-none print:border print:rounded-none">
                        <p className="text-red-600 font-semibold">Error: {err}</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow print:shadow-none print:border print:rounded-none">
                        <p className="text-[#1a2b4b] font-semibold">No documents found.</p>
                    </div>
                ) : (
                    <>
                        {/* SCREEN: Swiper */}
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
                                        <SwiperSlide key={p.id} className="h-full">
                                            <Card
                                                thumb={thumb}
                                                title={title}
                                                desc={desc}
                                                dateText={dateText}
                                                docUrl={docUrl}
                                            />
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <div className="custom-pagination flex justify-center gap-3 mt-4" />
                            {/* View More button */}
                            <div className="mt-8 -mb-[30px] flex justify-center">
                                <Link
                                    href="/resources/detail" // change to your "all documents" page
                                    className="inline-flex items-center justify-center rounded-full bg-[#fb923c] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:opacity-90"
                                >
                                    View More <span className="ml-2 text-lg">›</span>
                                </Link>
                            </div>
                        </div>

                        {/*PRINT: A4-friendly grid/list (NO slider) */}
                        <div className="hidden print:grid print:grid-cols-2 print:gap-3">
                            {posts.map((p) => {
                                const thumb = pickThumbnail(p);
                                const title = pickText(p.title, "Untitled");
                                const desc = pickText(p.description, "");
                                const dateText = formatMonthYear(p.createdAt);
                                const docUrl = pickDocUrl(p);

                                return (
                                    <div key={p.id} className="border border-slate-300 p-3 break-inside-avoid">
                                        <div className="text-[10pt] font-semibold text-slate-800">
                                            {dateText}
                                        </div>

                                        <div className="mt-1 text-[11pt] font-bold text-[#1a2b4b] uppercase leading-snug">
                                            {title}
                                        </div>

                                        {thumb ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={thumb}
                                                alt={title}
                                                className="mt-2 w-full h-32 object-cover border"
                                            />
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

                        {/* Global CSS for Custom Pagination */}
                        <style jsx global>{`
                            .custom-pagination .swiper-pagination-bullet {
                                width: 16px;
                                height: 16px;
                                background-color: #fb923c !important;
                                opacity: 0.6;
                                margin: 0 6px;
                            }
                            .custom-pagination .swiper-pagination-bullet-active {
                                opacity: 1;
                            }

                            /* A4 print setup */
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
        <div className="bg-[#e9ecef] flex flex-col shadow-xl h-full min-h-[500px]">
            <div className="bg-white m-4 aspect-[3/4] flex flex-col items-center justify-center border border-gray-100 overflow-hidden">
                {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 text-center">
                        <span className="text-gray-500 font-medium text-lg mt-2">No thumbnail</span>
                    </div>
                )}
            </div>

            <div className="px-6 pb-8 pt-2 flex flex-col grow">
                <span className="text-[#1a2b4b] text-xs font-semibold mb-3">{dateText}</span>

                <h3 className="text-[#1a2b4b] text-2xl font-bold mb-3 uppercase line-clamp-1">
                    {title}
                </h3>

                <p className="text-gray-700 text-sm mb-6 flex-grow line-clamp-1">
                    {desc || title}
                </p>

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
    );
}