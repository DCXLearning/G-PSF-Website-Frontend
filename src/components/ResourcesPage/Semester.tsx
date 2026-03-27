/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Hexagon } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

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

const CACHE_KEY_PREFIX = "semester-reports-annual-ui-cache";

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

function extractYear(text: string): string {
    const match = text.match(/\b(20\d{2})\b/);
    return match?.[1] || "";
}

function formatDate(dateString: string | null | undefined, lang: UiLang): string {
    if (!dateString) return "";

    try {
        return new Intl.DateTimeFormat(lang === "kh" ? "km-KH" : "en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(dateString));
    } catch {
        return "";
    }
}

function buildHighlights(post: ApiPost, lang: UiLang): string[] {
    const published = formatDate(post.publishedAt, lang);

    return [
        published
            ? lang === "kh"
                ? `ចេញផ្សាយ: ${published}`
                : `Published: ${published}`
            : lang === "kh"
                ? "ឯកសារ PDF"
                : "PDF Document",
        lang === "kh" ? "ទាញយកឯកសារ PDF" : "Download PDF document",
    ];
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

                const message =
                    err instanceof Error ? err.message : "Fetch failed";
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

        if (showAllPosts) {
            return allPosts;
        }

        return allPosts.slice(0, 3);
    }, [block, showAllPosts]);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;
    const showEmpty = !showSkeleton && !error && posts.length === 0;

    return (
        <section className={`pt-16 pb-4 px-4 ${fontClass || ""}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-blue-950 mb-4">
                        {pickText(block?.title, uiLang) || "Semester Reports"}
                    </h2>

                    <p className="text-blue-950 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2">
                        {pickText(block?.description, uiLang) ||
                            (uiLang === "kh"
                                ? "សូមទាញយករបាយការណ៍វឌ្ឍនភាព និងសកម្មភាពការងារតាមឆមាស។"
                                : "Browse and download semester progress reports and activity summaries.")}
                    </p>

                    {showErrorOnly ? (
                        <div className="text-red-200 text-center mt-4">Failed: {error}</div>
                    ) : null}
                </div>

                {showSkeleton ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-pulse">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white p-3 md:p-4 shadow-2xl flex flex-col h-full"
                            >
                                <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 flex-grow">
                                    <div className="w-full h-full bg-slate-200" />

                                    <div className="absolute inset-x-0 bottom-0 top-[35%] bg-white/60 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between border-t border-white/20">
                                        <div>
                                            <div className="h-4 w-16 bg-slate-300 rounded mb-3" />
                                            <div className="h-8 w-3/4 bg-slate-300 rounded mb-4" />

                                            <div className="space-y-3">
                                                {Array.from({ length: 2 }).map((__, i) => (
                                                    <div key={i} className="flex items-center">
                                                        <div className="w-3 h-3 mr-2 rounded-full bg-slate-300 shrink-0" />
                                                        <div className="h-4 w-full bg-slate-300 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-10 w-full bg-slate-300 rounded mt-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className="text-white/80 text-center">
                        {uiLang === "kh" ? "មិនមានរបាយការណ៍ឆមាសទេ។" : "No semester reports found."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {posts.map((post) => {
                            const title = pickText(post.title, uiLang) || "Semester Report";

                            const highlights = buildHighlights(post, uiLang);
                            const docUrl = pickDocUrl(post, apiLanguage);
                            const thumb = pickThumbUrl(post, apiLanguage);

                            return (
                                <div
                                    key={post.id}
                                    className="bg-white p-3 md:p-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 flex-grow">
                                        {thumb ? (
                                            <Image
                                                src={thumb}
                                                alt={title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100" />
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 top-[60%] bg-white/40 md:bg-white/60 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between border-t border-white/20">
                                            <div>
                                                <p className="text-[#3b5998] text-xl md:text-2xl font-bold mb-4 line-clamp-2">
                                                    {title}
                                                </p>

                                                {/* <ul className="space-y-2 md:space-y-3">
                                                    {highlights.map((item, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center text-gray-700 text-xs md:text-sm font-medium"
                                                        >
                                                            <Hexagon className="w-3 h-3 mr-2 text-[#3b5998] fill-[#3b5998]/10 shrink-0" />
                                                            <span className="line-clamp-1">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul> */}
                                            </div>

                                            <a
                                                href={docUrl || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`w-full mt-3 md:mt-5 bg-[#f39c12] hover:bg-[#e67e22] text-white py-2 px-3 rounded transition-all flex items-center justify-center group ${!docUrl ? "pointer-events-none opacity-60" : ""
                                                    }`}
                                            >
                                                <span>{uiLang === "kh" ? "ទាញយក" : "Download"}</span>
                                                <ChevronRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showSeeMoreButton && posts.length > 0 ? (
                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/semester-reports"
                            className={`bg-[#f39c12] hover:bg-[#e67e22] text-white py-2 px-6 rounded transition-all font-semibold ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {uiLang === "kh" ? "មើលបន្ថែម" : "See More"}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}