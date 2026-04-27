/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    status?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    coverImage?: string | null;
    document?: string | null;
    documentThumbnail?: string | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string };
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
    link?: string | null;
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
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    data?: {
        blocks?: ApiBlock[];
    };
};

const CACHE_KEY = "wg-outputs-block-cache";

function containsKhmer(value?: string | null): boolean {
    return /[\u1780-\u17FF]/.test(value ?? "");
}

function pickText(
    obj: I18n | null | undefined,
    lang: "en" | "km",
    fallback = ""
) {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function pickDocUrl(post: ApiPost, lang: "en" | "km") {
    return post.documents?.[lang]?.url || post.document || undefined;
}

function pickThumbUrl(post: ApiPost, lang: "en" | "km") {
    return (
        post.documents?.[lang]?.thumbnailUrl ||
        post.documentThumbnail ||
        post.coverImage ||
        undefined
    );
}

function getWGBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];
    return (
        blocks.find((b) => b.id === 28) ||
        blocks.find((b) => b.type === "post_list") ||
        null
    );
}

function readCache(): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(block: ApiBlock | null) {
    if (!block) return;
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(block));
    } catch {
        // ignore
    }
}

function sortPostsByLatest(posts: ApiPost[]) {
    return [...posts].sort((leftPost, rightPost) => {
        const leftDate = new Date(
            leftPost.publishedAt || leftPost.createdAt || leftPost.updatedAt || ""
        ).getTime();
        const rightDate = new Date(
            rightPost.publishedAt || rightPost.createdAt || rightPost.updatedAt || ""
        ).getTime();

        return rightDate - leftDate;
    });
}

/** ---------- UI ---------- */
type WGOutputsSectionProps = {
    showAllPosts?: boolean;
    showSeeMoreButton?: boolean;
};

export default function WGOutputs() {
    return <WGOutputsSection />;
}

export function WGOutputsSection({
    showAllPosts = false,
    showSeeMoreButton = true,
}: WGOutputsSectionProps = {}) {
    const { language, fontClass } = useLanguage();
    const uiLang: "en" | "kh" = language === "kh" ? "kh" : "en";
    const apiLang: "en" | "km" = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
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

                if (!res.ok) throw new Error(`API error: ${res.status}`);

                const json: ApiResponse = await res.json();
                if (!alive) return;

                const wg = getWGBlock(json);

                if (wg) {
                    setBlock(wg);
                    writeCache(wg);
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
    }, []);

    const posts = useMemo(() => {
        const arr = block?.posts || [];
        const publishedPosts = arr.filter((p) =>
            p.status ? p.status === "published" : true
        );
        const sortedPosts = sortPostsByLatest(publishedPosts);

        // Homepage keeps the hero card + 2 side cards.
        // The dedicated page shows all published WG output posts.
        return showAllPosts ? sortedPosts : sortedPosts.slice(0, 3);
    }, [block, showAllPosts]);

    const featured = posts[0];
    const sidePosts = posts.slice(1);

    const title = pickText(block?.title, apiLang, "WG Outputs");
    const desc = pickText(block?.description, apiLang, "");
    const titleClass = isKh || containsKhmer(title) ? "khmer-font" : "";
    const descClass = isKh || containsKhmer(desc) ? "khmer-font" : "";

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    return (
        <section className={`bg-white py-16 px-4 max-w-7xl mx-auto ${fontClass}`}>
            {/* Header */}
            <div className="text-center mb-12">
                <h3
                    className={`text-[#1e2756] text-xl md:text-2xl font-semibold tracking-wide ${
                        isKh ? "khmer-font normal-case" : ""
                    }`}
                >
                    {/* This subtitle is static text, but it still changes with the current language. */}
                    {isKh
                        ? "ការយល់ដឹង — របកគំហើញ — លទ្ធផល"
                        : "Insights — Findings — Results"}
                </h3>

                <h2 className={`text-[#1e2756] text-4xl md:text-5xl font-bold mt-2 mb-6 ${titleClass}`}>
                    {title}
                </h2>

                {!!desc && (
                    <p className={`text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed ${descClass}`}>
                        {desc}
                    </p>
                )}

                {showErrorOnly && <p className="text-red-600 mt-4">{error}</p>}
            </div>

            {showSkeleton ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                    <div className="relative overflow-hidden rounded-sm min-h-[500px] lg:min-h-[600px] border border-gray-100 bg-slate-100">
                        <div className="absolute inset-0 bg-slate-200" />
                        <div className="relative z-10 max-w-md mx-auto h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-300 mb-4" />
                            <div className="h-4 w-28 bg-slate-300 rounded mb-3" />
                            <div className="h-10 w-3/4 bg-slate-300 rounded mb-4" />
                            <div className="h-4 w-full bg-slate-300 rounded mb-2" />
                            <div className="h-4 w-5/6 bg-slate-300 rounded mb-8" />
                            <div className="flex gap-4">
                                <div className="h-10 w-32 bg-slate-300 rounded" />
                                <div className="h-10 w-24 bg-slate-300 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="border border-gray-200 p-10 flex flex-col items-center justify-center text-center flex-1"
                            >
                                <div className="w-14 h-14 rounded-full bg-slate-300 mb-4" />
                                <div className="h-4 w-24 bg-slate-300 rounded mb-2" />
                                <div className="h-8 w-2/3 bg-slate-300 rounded mb-3" />
                                <div className="h-4 w-4/5 bg-slate-300 rounded mb-2" />
                                <div className="h-4 w-3/5 bg-slate-300 rounded mb-6" />
                                <div className="flex gap-5">
                                    <div className="h-4 w-20 bg-slate-300 rounded" />
                                    <div className="h-4 w-16 bg-slate-300 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Featured */}
                    <div className="relative group overflow-hidden rounded-sm min-h-[500px] lg:min-h-[600px] flex items-center justify-center p-8 text-center border border-gray-100">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={
                                    featured
                                        ? pickThumbUrl(featured, apiLang) || "/image/resources_top.bmp"
                                        : "/image/resources_top.bmp"
                                }
                                alt="Featured"
                                fill
                                className="object-cover opacity-50"
                                priority
                            />
                            <div className="absolute inset-0 bg-white/40" />
                        </div>

                        <div className="relative z-10 max-w-md">
                            <div className="bg-[#1e2756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                <Image
                                    src={featured?.coverImage || "/icon_Resources_page/icon1.png"}
                                    alt="Icon"
                                    width={45}
                                    height={45}
                                    className="object-contain"
                                />
                            </div>

                            <p
                                className={`text-[#1e2756] font-bold tracking-wider mb-2 ${
                                    isKh || containsKhmer(
                                        featured?.category
                                            ? pickText(featured.category.name, apiLang, "Category")
                                            : "Category"
                                    )
                                        ? "khmer-font normal-case"
                                        : "uppercase"
                                }`}
                            >
                                {featured?.category
                                    ? pickText(featured.category.name, apiLang, "Category")
                                    : "Category"}
                            </p>

                            <h4
                                className={`text-[#1e2756] text-3xl md:text-4xl font-extrabold mb-4 line-clamp-3 ${
                                    isKh ||
                                    containsKhmer(
                                        featured
                                            ? pickText(featured.title, apiLang, "Featured Report")
                                            : "—"
                                    )
                                        ? "khmer-font"
                                        : ""
                                }`}
                            >
                                {featured
                                    ? pickText(featured.title, apiLang, "Featured Report")
                                    : "—"}
                            </h4>

                            <p
                                className={`text-gray-800 mb-8 font-medium line-clamp-4 ${
                                    isKh ||
                                    containsKhmer(
                                        featured
                                            ? pickText(featured.description || undefined, apiLang, "")
                                            : ""
                                    )
                                        ? "khmer-font"
                                        : ""
                                }`}
                            >
                                {featured
                                    ? pickText(featured.description || undefined, apiLang, "")
                                    : ""}
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 items-center">
                                {featured && pickDocUrl(featured, apiLang) ? (
                                    <a
                                        href={pickDocUrl(featured, apiLang)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-[#f39c32] hover:bg-[#e68a1e] text-[#1e2756] cursor-pointer font-bold py-2 px-6 rounded flex items-center gap-2 transition-all"
                                    >
                                        Download <ChevronRight size={16} />
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="bg-gray-200 text-gray-500 font-bold py-2 px-6 rounded flex items-center gap-2 cursor-not-allowed"
                                    >
                                        Download <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Cards */}
                    <div className="flex flex-col gap-8">
                        {sidePosts.map((p) => (
                            <ArticleCard
                                key={p.id}
                                icon={p.coverImage || "/icon_Resources_page/icon2.png"}
                                category={
                                    p.category
                                        ? pickText(p.category.name, apiLang, "Category")
                                        : "Category"
                                }
                                headline={pickText(p.title, apiLang, "Article")}
                                description={pickText(p.description || undefined, apiLang, "")}
                                downloadUrl={pickDocUrl(p, apiLang)}
                                isKh={isKh}
                            />
                        ))}

                        {sidePosts.length === 0 && (
                            <ArticleCard
                                icon="/icon_Resources_page/icon2.png"
                                category="—"
                                headline="No more posts"
                                description="Add more published posts in the WG Outputs block."
                                isKh={isKh}
                            />
                        )}
                    </div>
                </div>
            )}

            {showSeeMoreButton && posts.length > 0 ? (
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/wg-outputs"
                        className={`bg-[#1e2756] hover:bg-[#161d44] text-white py-2 px-6 rounded-md font-semibold transition-colors ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {isKh ? "មើលបន្ថែម" : "See More"}
                    </Link>
                </div>
            ) : null}
        </section>
    );
}

/** ---------- Card ---------- */
function ArticleCard({
    icon,
    category,
    headline,
    description,
    downloadUrl,
    isKh,
}: {
    icon?: string;
    category: string;
    headline: string;
    description?: string;
    downloadUrl?: string;
    isKh: boolean;
}) {
    const categoryClass = isKh || containsKhmer(category) ? "khmer-font normal-case" : "uppercase";
    const headlineClass = isKh || containsKhmer(headline) ? "khmer-font" : "";
    const descriptionClass = isKh || containsKhmer(description || "") ? "khmer-font" : "";

    return (
        <div className="border border-gray-200 p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="bg-[#1e2756] w-14 h-14 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                <Image
                    src={icon || "/icon_Resources_page/icon2.png"}
                    alt={category}
                    width={40}
                    height={40}
                    className="object-contain"
                />
            </div>

            <p
                className={`text-[#1e2756] text-sm font-bold tracking-widest mb-1 ${categoryClass}`}
            >
                {category}
            </p>

            <h4
                className={`text-[#1e2756] text-2xl md:text-3xl font-bold mb-3 line-clamp-2 ${headlineClass}`}
            >
                {headline}
            </h4>

            <p className={`text-gray-700 text-sm max-w-sm mb-6 line-clamp-3 ${descriptionClass}`}>
                {description || ""}
            </p>

            <div className="flex items-center gap-5">
                {downloadUrl ? (
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1e2756] cursor-pointer font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                        Download <ChevronRight size={14} />
                    </a>
                ) : (
                    <span className="text-gray-400 font-bold text-xs flex items-center gap-1">
                        Download <ChevronRight size={14} />
                    </span>
                )}
            </div>
        </div>
    );
}
