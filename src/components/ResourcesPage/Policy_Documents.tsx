"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

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
    settings?: {
        sort?: string;
        limit?: number;
        categoryIds?: number[];
    };
    orderIndex?: number;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        page?: I18n;
        slug?: string;
        blocks?: ApiBlock[];
    };
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
                // pick the first enabled post_list block (or fallback to first post_list)
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
        // Optional: if API doesn’t already sort, you can sort by createdAt desc
        return [...list].sort((a, b) => {
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return tb - ta;
        });
    }, [block]);

    const headerTitle = pickText(block?.title, "Policy Documents");
    const headerDesc = pickText(block?.description, "");

    return (
        <section className="relative bg-white font-sans overflow-hidden py-16">
            {/* Header */}
            <div className="max-w-5xl mx-auto text-center px-4 mb-16 relative z-10">
                <p className="text-gray-900 font-bold text-3xl md:text-4xl mb-1">
                    Core Policies & Frameworks
                </p>

                <h2 className="text-[#1a2b4b] text-5xl md:text-6xl font-semibold mb-4">
                    {headerTitle}
                </h2>

                {headerDesc ? (
                    <p className="text-gray-900 font-semibold text-xl md:text-2xl">
                        {headerDesc}
                    </p>
                ) : null}
            </div>

            {/* BLUE BACKGROUND DECORATION */}
            <div className="absolute bottom-0 left-0 w-full h-[350px] bg-[#3b5998] z-0" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow">
                        <p className="text-[#1a2b4b] font-semibold">Loading documents…</p>
                    </div>
                ) : err ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow">
                        <p className="text-red-600 font-semibold">Error: {err}</p>
                        <p className="text-gray-700 mt-2 text-sm">
                            Tip: if CORS blocks this, proxy through your Next.js API route.
                        </p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white/70 rounded-xl p-8 text-center shadow">
                        <p className="text-[#1a2b4b] font-semibold">No documents found.</p>
                    </div>
                ) : (
                    <>
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
                                        <div className="bg-[#e9ecef] flex flex-col shadow-xl h-full min-h-[500px]">
                                            {/* Thumbnail */}
                                            <div className="bg-white m-4 aspect-square flex flex-col items-center justify-center border border-gray-100 overflow-hidden">
                                                {thumb ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={thumb}
                                                        alt={title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center px-6 text-center">
                                                        <div className="w-24 h-24 text-gray-300">
                                                            <svg
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-gray-500 font-medium text-lg mt-2">
                                                            No thumbnail
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="px-6 pb-8 pt-2 flex flex-col grow">
                                                <span className="text-[#1a2b4b] text-xs font-semibold mb-3">
                                                    {dateText}
                                                </span>

                                                <h3 className="text-[#1a2b4b] text-2xl font-bold mb-3 uppercase line-clamp-3">
                                                    {title}
                                                </h3>

                                                <p className="text-gray-700 text-sm mb-6 flex-grow line-clamp-5">
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
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        {/* Custom Pagination Dots */}
                        <div className="custom-pagination flex justify-center gap-3 mt-4" />

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
            `}</style>
                    </>
                )}
            </div>
        </section>
    );
}