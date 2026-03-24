/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type Item = {
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
            en?: { items?: Item[] };
            km?: { items?: Item[] };
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

const CACHE_KEY = "about-history-blocks-cache";

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function splitParagraphs(s: string) {
    return (s || "")
        .split(/\n\s*\n/g)
        .map((x) => x.trim())
        .filter(Boolean);
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
        // ignore cache errors
    }
}

const HexNode = () => (
    <div className="relative w-12 h-12 flex items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>
        <span className="absolute w-3.5 h-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

function HistorySkeleton({ isKh }: { isKh: boolean }) {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                <div className="h-12 md:h-14 w-full max-w-4xl bg-slate-200 rounded mb-4" />
                <div className="h-12 md:h-14 w-4/5 max-w-3xl bg-slate-200 rounded" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start mt-8">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-12 h-1.5 bg-orange-200 w-72 sm:w-[520px] lg:w-[528px]" />

                        <div className="mt-8 h-5 w-full max-w-xl bg-slate-200 rounded" />
                        <div className="mt-4 h-5 w-11/12 max-w-lg bg-slate-200 rounded" />
                        <div className="mt-8 h-5 w-full max-w-xl bg-slate-200 rounded" />
                        <div className="mt-4 h-5 w-5/6 max-w-md bg-slate-200 rounded" />
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-64">
                        <div className="h-12 w-full max-w-xl bg-slate-200 rounded mb-10" />

                        <div className="relative">
                            <div className="absolute left-[22px] top-0 bottom-0 w-[4px] bg-orange-200" />

                            <div className="space-y-12">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1 w-full">
                                            <div className="h-7 w-64 bg-slate-200 rounded mb-3" />
                                            <div className="h-5 w-full max-w-sm bg-slate-200 rounded mb-2" />
                                            <div className="h-5 w-5/6 max-w-xs bg-slate-200 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* end right */}
                </div>
            </div>
        </section>
    );
}

export default function History() {
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

        async function load() {
            try {
                setError(null);

                const res = await fetch("/api/about-us-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: ApiResponse = await res.json();

                if (!alive) return;

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || "Failed to load About Us data.");
                }

                const nextBlocks = json?.data?.blocks || [];
                setBlocks(nextBlocks);
                writeCache(nextBlocks);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load About Us data.");
                // keep cached blocks, do not clear state
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

    const view = useMemo(() => {
        const block18 = blocks.find((b) => b.type === "text_block" && b.id === 18);

        const heroItem =
            block18?.posts?.[0]?.content?.[apiLang]?.items?.[0] ||
            block18?.posts?.[0]?.content?.en?.items?.[0];

        const badge = isKh ? "អំពីពួកយើង" : "History";

        const hero = pickText(
            heroItem?.title,
            apiLang,
            isKh
                ? "អស់រយៈពេលជាង ២៥ ឆ្នាំ G-PSF បានជំរុញលទ្ធផលកែទម្រង់..."
                : "For over 25 years, the G-PSF has delivered trust-based reform outcomes..."
        );

        const desc = pickText(heroItem?.description, apiLang, "");
        const paras = splitParagraphs(desc);

        const block19 = blocks.find((b) => b.type === "text_block" && b.id === 19);

        const rightTitle = pickText(
            block19?.title,
            apiLang,
            isKh
                ? "តួនាទីរបស់ក្រុមប្រឹក្សាអភិវឌ្ឍន៍កម្ពុជា (CDC)"
                : "Role of the Council for the Development of Cambodia (CDC)"
        );

        const rightItems =
            block19?.posts?.[0]?.content?.[apiLang]?.items ||
            block19?.posts?.[0]?.content?.en?.items ||
            [];

        const objectives = rightItems.map((it, idx) => ({
            id: idx + 1,
            title: pickText(it.title, apiLang, ""),
            description: pickText(it.description, apiLang, ""),
        }));

        return { badge, hero, paras, rightTitle, objectives };
    }, [blocks, apiLang, isKh]);

    const showSkeleton = !mounted || (loading && blocks.length === 0);
    const showErrorOnly = !showSkeleton && blocks.length === 0 && !!error;

    if (showSkeleton) {
        return <HistorySkeleton isKh={isKh} />;
    }

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {showErrorOnly && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <p
                    className={`text-xl font-bold text-gray-700 mb-2  tracking-wider ${isKh ? "khmer-font normal-case" : ""
                        }`}
                >
                    {view.badge}
                </p>

                <h1
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                    max-w-full md:max-w-[800px] 
                    text-gray-900 leading-tight whitespace-pre-line
                    ${isKh ? "khmer-font" : ""}`}
                >
                    {view.hero}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-20 h-1.5 bg-orange-500 w-72 sm:w-[520px] lg:w-[528px]" />

                        <ul className="mt-8 space-y-7 list-disc pl-4">
                            {view.paras.map((p, i) => (
                                <li
                                    key={i}
                                    className={`max-w-xl text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""
                                        }`}
                                >
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-64">
                        <h2
                            className={`text-4xl md:text-5xl font-bold text-gray-900 mb-10 whitespace-pre-line ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {view.rightTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[22px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {view.objectives.length === 0 && (
                                    <div className={`text-gray-500 ${isKh ? "khmer-font" : ""}`}>
                                        {isKh ? "មិនមានទិន្នន័យ" : "No data"}
                                    </div>
                                )}

                                {view.objectives.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3
                                                className={`text-xl font-extrabold text-gray-900 ${isKh ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {obj.title}
                                            </h3>
                                            <p
                                                className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${isKh ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {obj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* end right */}
                </div>
            </div>
        </section>
    );
}