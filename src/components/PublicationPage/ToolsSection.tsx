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
    } catch {}
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
        <div className="flex animate-pulse flex-col items-center rounded-2xl p-6">
            <div className="mb-6 h-20 w-20 rounded-full bg-slate-200" />
            <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
            <div className="mb-4 h-8 w-40 rounded bg-slate-200" />
            <div className="mb-2 h-4 w-full max-w-[240px] rounded bg-slate-200" />
            <div className="mb-2 h-4 w-5/6 max-w-[220px] rounded bg-slate-200" />
            <div className="mb-8 h-4 w-2/3 max-w-[180px] rounded bg-slate-200" />
            <div className="h-10 w-32 rounded-lg bg-slate-200" />
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
    const { language, apiLang } = useLanguage();

    const uiLang: UiLang =
        String(language) === "kh" || String(language) === "km" ? "kh" : "en";

    const currentApiLang: ApiLang =
        String(apiLang) === "km" || uiLang === "kh" ? "km" : "en";

    const isKhmer = uiLang === "kh";

    const wrapperFontClass = isKhmer ? "khmer-font" : "airbnb-font";
    const titleClass = isKhmer ? "title-km" : "title-en";
    const mainTitleClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyClass = isKhmer ? "body-km" : "body-en";

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
        <section className={`bg-white px-4 pb-12 pt-4 ${wrapperFontClass}`}>
            <div className="mx-auto max-w-7xl text-center">
                <h2 className={`text-[#1e1e4b] ${mainTitleClass}`}>
                    {sectionMainTitle}
                </h2>

                <h1 className={`mb-6 mt-2 text-[#1e1e4b] ${titleClass}`}>
                    {sectionTitle}
                </h1>

                <p className={`mx-auto mb-16 max-w-3xl text-[#1e1e4b] ${bodyClass}`}>
                    {sectionDescription}
                </p>

                {showErrorOnly ? (
                    <div className={`text-red-600 ${bodyClass}`}>Failed to load: {error}</div>
                ) : null}

                {showSkeleton ? (
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        <ToolCardSkeleton />
                        <ToolCardSkeleton />
                        <ToolCardSkeleton />
                    </div>
                ) : showEmpty ? (
                    <div className={`text-slate-600 ${bodyClass}`}>{emptyText}</div>
                ) : (
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        {posts.map((post) => {
                            const docUrl = pickDocUrl(post, currentApiLang);
                            const category = pickText(post.category?.name, uiLang) || "Template";
                            const title = pickText(post.title, uiLang) || "Untitled";
                            const description = pickText(post.description, uiLang) || "—";

                            return (
                                <div
                                    key={post.id}
                                    className={`flex flex-col items-center rounded-2xl p-6 transition hover:shadow-lg ${wrapperFontClass}`}
                                >
                                    <div className="mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-sm">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={title || "icon"}
                                                width={56}
                                                height={56}
                                                className="h-12 w-12 object-contain"
                                            />
                                        ) : (
                                            <span className={`text-xs font-bold text-white ${bodyClass}`}>
                                                PDF
                                            </span>
                                        )}
                                    </div>

                                    <span className={`mb-2 text-slate-900 ${bodyClass} !font-bold`}>
                                        {category}
                                    </span>

                                    <h3
                                        className={`
                                            mb-4 max-w-full text-slate-800
                                            ${mainTitleClass}
                                            !block !overflow-hidden !text-ellipsis !whitespace-nowrap
                                        `}
                                        title={title}
                                    >
                                        {title}
                                    </h3>

                                    <p className={`mb-8 line-clamp-4 px-2 text-[#1e1e4b] ${bodyClass}`}>
                                        {description}
                                    </p>

                                    <div className="mt-auto flex w-full justify-center pt-2">
                                        {docUrl ? (
                                            <a
                                                href={docUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`
                                                    inline-flex w-full max-w-[320px]
                                                    items-center justify-center gap-2
                                                    rounded-md bg-[#f5a20a]
                                                    px-7 py-3
                                                    text-center !text-white no-underline
                                                    shadow-sm transition-all duration-200
                                                    hover:bg-[#ea9805] hover:no-underline
                                                    ${bodyClass} !font-bold
                                                `}
                                            >
                                                <span>{downloadText}</span>
                                                <span className="text-xl leading-none">›</span>
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className={`
                                                    inline-flex w-full max-w-[320px]
                                                    cursor-not-allowed items-center justify-center gap-2
                                                    rounded-md bg-gray-300
                                                    px-7 py-3
                                                    text-center !text-white
                                                    ${bodyClass} !font-bold
                                                `}
                                            >
                                                <span>
                                                    {uiLang === "kh" ? "មិនមានឯកសារ" : "No document"}
                                                </span>
                                                <span className="text-xl leading-none">›</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showSeeMoreButton && posts.length > 0 ? (
                    <div className="mt-12 flex justify-center">
                        <Link
                            href="/templates-and-forms"
                            className={`
                                rounded-lg bg-[#1e1e4b] px-6 py-2 text-white
                                transition-colors hover:bg-[#15153a]
                                ${bodyClass} !font-bold !text-white
                            `}
                        >
                            {seeMoreText}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}