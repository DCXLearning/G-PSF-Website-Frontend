/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };
type ApiLang = "en" | "km";
type UiLang = "en" | "kh";

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    coverImage?: string | null;
    document?: string | null;
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
    settings?: { limit?: number; categoryIds?: number[] } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY_PREFIX = "tools-section-block-cache";

const FONT_FAMILY =
    '"Airbnb Cereal", var(--font-kantumruy-pro), "Kantumruy Pro", system-ui, sans-serif';

function containsKhmer(value?: string | null): boolean {
    return /[\u1780-\u17FF]/.test(value ?? "");
}

function fontStyle(
    value: string | null | undefined,
    uiLang: UiLang,
    type: "mainTitle" | "sectionTitle" | "body" | "cardTitle" | "button" | "category"
): React.CSSProperties {
    const isKh = uiLang === "kh" || containsKhmer(value);

    if (type === "sectionTitle") {
        return {
            fontFamily: FONT_FAMILY,
            fontSize: isKh ? "35px" : "32px",
            lineHeight: isKh ? "50px" : "42px",
            fontWeight: isKh ? 700 : 800,
            letterSpacing: "0.7px",
        };
    }

    if (type === "mainTitle" || type === "cardTitle") {
        return {
            fontFamily: FONT_FAMILY,
            fontSize: isKh ? "22px" : "21px",
            lineHeight: "32px",
            fontWeight: isKh ? 700 : 800,
            letterSpacing: "0.7px",
        };
    }

    if (type === "button") {
        return {
            fontFamily: FONT_FAMILY,
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 700,
            letterSpacing: "0.4px",
        };
    }

    if (type === "category") {
        return {
            fontFamily: FONT_FAMILY,
            fontSize: isKh ? "17px" : "16px",
            lineHeight: "30px",
            fontWeight: 700,
            letterSpacing: "0.5px",
        };
    }

    return {
        fontFamily: FONT_FAMILY,
        fontSize: isKh ? "17px" : "16px",
        lineHeight: "30px",
        fontWeight: 400,
        letterSpacing: "0.5px",
    };
}

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
        // ignore
    }
}

function pickToolsBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (block) =>
                block?.enabled !== false &&
                block?.type === "post_list" &&
                (block?.id === 29 || block?.title?.en === "Templates & Forms")
        ) || null
    );
}

function ToolCardSkeleton() {
    return (
        <div className="flex flex-col items-center rounded-2xl p-6 animate-pulse">
            <div className="w-20 h-20 rounded-full mb-6 bg-slate-200" />
            <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-8 w-40 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-full max-w-[240px] bg-slate-200 rounded mb-2" />
            <div className="h-4 w-5/6 max-w-[220px] bg-slate-200 rounded mb-2" />
            <div className="h-4 w-2/3 max-w-[180px] bg-slate-200 rounded mb-8" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg" />
        </div>
    );
}

type ToolsSectionProps = {
    showAllPosts?: boolean;
    showSeeMoreButton?: boolean;
};

export default function ToolsSection() {
    return <ToolsSectionContent />;
}

export function ToolsSectionContent({
    showAllPosts = false,
    showSeeMoreButton = true,
}: ToolsSectionProps = {}) {
    const { language, apiLang, fontClass } = useLanguage();

    const uiLang: UiLang =
        String(language) === "kh" || String(language) === "km" ? "kh" : "en";

    const currentApiLang: ApiLang =
        String(apiLang) === "km" || uiLang === "kh" ? "km" : "en";

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

                const picked = pickToolsBlock(json);

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
        const postList = block?.posts || [];

        if (showAllPosts) return postList;

        const limit = block?.settings?.limit ?? 3;
        return postList.slice(0, limit);
    }, [block, showAllPosts]);

    const sectionMainTitle =
        pickText(block?.title, uiLang) || "Standard Templates & Forms";

    const sectionTitle = uiLang === "kh" ? "បែបបទ" : "Tools";

    const sectionDescription =
        pickText(block?.description, uiLang) ||
        "Download standard templates and forms to support Working Group operations and documentation.";

    const emptyText = uiLang === "kh" ? "មិនមានបែបបទទេ។" : "No templates found.";
    const downloadText = uiLang === "kh" ? "ទាញយក" : "Download";
    const seeMoreText = uiLang === "kh" ? "មើលបន្ថែម" : "See More";

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;
    const showEmpty = !showSkeleton && !error && posts.length === 0;

    return (
        <section
            className={`bg-white pt-4 pb-12 px-4 ${fontClass || ""}`}
            style={{ fontFamily: FONT_FAMILY }}
        >
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-[#1e1e4b]" style={fontStyle(sectionMainTitle, uiLang, "mainTitle")}>
                    {sectionMainTitle}
                </h2>

                <h1 className="text-[#1e1e4b] mt-2 mb-6" style={fontStyle(sectionTitle, uiLang, "sectionTitle")}>
                    {sectionTitle}
                </h1>

                <p className="max-w-3xl mx-auto text-[#1e1e4b] mb-16" style={fontStyle(sectionDescription, uiLang, "body")}>
                    {sectionDescription}
                </p>

                {showErrorOnly ? (
                    <div className="text-red-600 text-sm">Failed to load: {error}</div>
                ) : null}

                {showSkeleton ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <ToolCardSkeleton />
                        <ToolCardSkeleton />
                        <ToolCardSkeleton />
                    </div>
                ) : showEmpty ? (
                    <div className="text-slate-600" style={fontStyle(emptyText, uiLang, "body")}>
                        {emptyText}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {posts.map((post) => {
                            const docUrl = pickDocUrl(post, currentApiLang);
                            const category = pickText(post.category?.name, uiLang) || "Template";
                            const title = pickText(post.title, uiLang) || "Untitled";
                            const description = pickText(post.description, uiLang) || "—";

                            return (
                                <div
                                    key={post.id}
                                    className="flex flex-col items-center rounded-2xl p-6 transition hover:shadow-lg"
                                    style={{ fontFamily: FONT_FAMILY }}
                                >
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm overflow-hidden bg-[#1e1e4b]">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={title || "icon"}
                                                width={56}
                                                height={56}
                                                className="w-12 h-12 object-contain"
                                            />
                                        ) : (
                                            <span className="text-white text-xs font-bold">PDF</span>
                                        )}
                                    </div>

                                    <span className="text-slate-900 mb-2" style={fontStyle(category, uiLang, "category")}>
                                        {category}
                                    </span>

                                    <h3
                                        className="text-slate-800 mb-4"
                                        title={title}
                                        style={{
                                            ...fontStyle(title, uiLang, "cardTitle"),
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {title}
                                    </h3>

                                    <p
                                        className="text-[#1e1e4b] mb-8 px-2 line-clamp-4"
                                        style={fontStyle(description, uiLang, "body")}
                                    >
                                        {description}
                                    </p>

                                    <a
                                        href={docUrl || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`hover:underline flex items-center gap-2 px-8 py-2 border border-orange-400 text-slate-800 rounded-lg hover:bg-orange-50 transition-colors ${!docUrl ? "pointer-events-none opacity-50" : ""
                                            }`}
                                        style={fontStyle(downloadText, uiLang, "button")}
                                    >
                                        {downloadText} <span className="text-xs">›</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showSeeMoreButton && posts.length > 0 ? (
                    <div className="mt-12 flex justify-center">
                        <Link
                            href="/templates-and-forms"
                            className="bg-[#1e1e4b] hover:bg-[#15153a] text-white py-2 px-6 rounded-lg transition-colors"
                            style={fontStyle(seeMoreText, uiLang, "button")}
                        >
                            {seeMoreText}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}