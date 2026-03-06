/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
    } catch {
        // ignore cache errors
    }
}

function pickToolsBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (b) =>
                b?.enabled !== false &&
                b?.type === "post_list" &&
                (b?.id === 29 || b?.title?.en === "Templates & Forms")
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

export default function ToolsSection() {
    const { language, apiLang, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const currentApiLang = (apiLang as ApiLang) ?? "en";

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
        const p = block?.posts || [];
        const limit = block?.settings?.limit ?? 3;
        return p.slice(0, limit);
    }, [block]);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;
    const showEmpty = !showSkeleton && !error && posts.length === 0;

    return (
        <section className={`bg-white py-20 px-4 ${fontClass}`}>
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e1e4b] uppercase tracking-tight">
                    {pickText(block?.title, uiLang) || "Templates & Forms"}
                </h2>

                <h1 className="text-5xl md:text-6xl font-bold text-[#1e1e4b] mt-2 mb-6">
                    Tools
                </h1>

                <p className="max-w-3xl mx-auto text-[#1e1e4b] text-xl leading-relaxed mb-16">
                    {pickText(block?.description, uiLang) ||
                        "Download standard templates and forms to support Working Group operations and documentation."}
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
                    <div className="text-slate-600 text-sm">No templates found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {posts.map((post) => {
                            const docUrl = pickDocUrl(post, currentApiLang);

                            return (
                                <div
                                    key={post.id}
                                    className="flex flex-col items-center rounded-2xl p-6 transition hover:shadow-lg"
                                >
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg overflow-hidden bg-[#1e1e4b]">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={pickText(post.title, uiLang) || "icon"}
                                                width={56}
                                                height={56}
                                                className="w-12 h-12 object-contain"
                                            />
                                        ) : (
                                            <span className="text-white text-xs font-bold">PDF</span>
                                        )}
                                    </div>

                                    <span className="text-slate-900 font-bold mb-2">
                                        {pickText(post.category?.name, uiLang) || "Template"}
                                    </span>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">
                                        {pickText(post.title, uiLang) || "Untitled"}
                                    </h3>

                                    <p className="text-[#1e1e4b] text-sm leading-6 mb-8 px-2 line-clamp-4">
                                        {pickText(post.description, uiLang) || "—"}
                                    </p>

                                    <a
                                        href={docUrl || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`hover:underline flex items-center gap-2 px-8 py-2 border border-orange-400 text-slate-800 text-sm font-bold rounded-lg hover:bg-orange-50 transition-colors ${!docUrl ? "pointer-events-none opacity-50" : ""
                                            }`}
                                    >
                                        {uiLang === "kh" ? "ទាញយក" : "Download"}{" "}
                                        <span className="text-xs">›</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}