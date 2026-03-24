/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = {
    en?: string;
    km?: string;
};

type EngageItem = {
    title?: I18n;
    description?: I18n;
};

type Block = {
    id: number;
    type: string;
    title?: I18n;
    posts?: Array<{
        id: number;
        content?: {
            en?: { items?: EngageItem[] };
            km?: { items?: EngageItem[] };
        };
    }>;
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: Block[];
    };
};

const CACHE_KEY = "working-groups-engage-blocks-cache";

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function readCache(): Block[] {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCache(blocks: Block[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(blocks));
    } catch {
        // ignore cache error
    }
}

function EngageSkeleton({ isKh }: { isKh: boolean }) {
    return (
        <section className="bg-white mt-5 md:mt-10 lg:mt-14 py-8 md:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 animate-pulse">
                <div className="h-10 w-64 rounded bg-slate-200 mb-8" />
                <div className="mb-8 h-1.5 bg-orange-200 w-40 sm:w-52 rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm h-full"
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-200" />
                                <div className="h-6 w-36 rounded bg-slate-200" />
                            </div>

                            <div className="h-4 w-full rounded bg-slate-200 mb-2" />
                            <div className="h-4 w-5/6 rounded bg-slate-200 mb-2" />
                            <div className="h-4 w-4/6 rounded bg-slate-200" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Engage() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const [mounted, setMounted] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached.length > 0) {
            setBlocks(cached);
            setLoading(false);
        }

        let alive = true;

        async function loadData() {
            try {
                setError(null);

                const res = await fetch(
                    "/api/working-groups-page/section?slug=working-groups&types=text_block",
                    {
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                    }
                );

                const json: ApiResponse = await res.json();

                if (!alive) return;

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || "Failed to fetch engage section.");
                }

                const nextBlocks = json?.data?.blocks || [];
                setBlocks(nextBlocks);
                writeCache(nextBlocks);
            } catch (err: any) {
                if (!alive) return;
                setError(err?.message || "Failed to fetch engage section.");
                // keep cached data if any
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        loadData();

        return () => {
            alive = false;
        };
    }, []);

    const view = useMemo(() => {
        const engageBlock = blocks.find(
            (block) => block.type === "text_block" && block.id === 23
        );

        const sectionTitle = pickText(
            engageBlock?.title,
            apiLang,
            isKh ? "របៀបចូលរួម" : "How To Engage"
        );

        const rawItems =
            engageBlock?.posts?.[0]?.content?.[apiLang]?.items ||
            engageBlock?.posts?.[0]?.content?.en?.items ||
            [];

        const items = rawItems
            .map((item, index) => ({
                id: index + 1,
                title: pickText(item.title, apiLang, ""),
                description: pickText(item.description, apiLang, ""),
            }))
            .filter((item) => item.title || item.description);

        return { sectionTitle, items };
    }, [blocks, apiLang, isKh]);

    const showSkeleton = !mounted || (loading && blocks.length === 0);
    const showErrorOnly = !showSkeleton && blocks.length === 0 && !!error;

    if (showSkeleton) {
        return <EngageSkeleton isKh={isKh} />;
    }

    if (view.items.length === 0 && !showErrorOnly) {
        return null;
    }

    return (
        <section className="bg-white mt-4 md:mt-6 lg:mt-8 py-8 md:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {showErrorOnly && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <h2
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 md:mb-10 tracking-tight ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {view.sectionTitle}
                </h2>

                <div className="mb-8 h-1.5 bg-orange-500 w-40 sm:w-52 rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {view.items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm h-full"
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                                <h3
                                    className={`text-lg sm:text-xl md:text-2xl font-bold text-gray-900 ${isKh ? "khmer-font" : ""
                                        }`}
                                >
                                    {item.title}
                                </h3>
                            </div>

                            <p
                                className={`text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed ${isKh ? "khmer-font" : ""
                                    }`}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}