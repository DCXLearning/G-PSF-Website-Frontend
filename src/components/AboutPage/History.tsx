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
        
    }
}

const HexNode = () => (
    <div className="relative flex h-12 w-12 items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>
        <span className="absolute h-3.5 w-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

function HistorySkeleton() {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl animate-pulse px-4">
                <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                <div className="mb-4 h-12 w-full max-w-4xl rounded bg-slate-200 md:h-14" />
                <div className="h-12 w-4/5 max-w-3xl rounded bg-slate-200 md:h-14" />

                <div className="mt-8 grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-12 h-1.5 w-72 bg-orange-200 sm:w-[520px] lg:w-[528px]" />

                        <div className="mt-8 h-5 w-full max-w-xl rounded bg-slate-200" />
                        <div className="mt-4 h-5 w-11/12 max-w-lg rounded bg-slate-200" />
                        <div className="mt-8 h-5 w-full max-w-xl rounded bg-slate-200" />
                        <div className="mt-4 h-5 w-5/6 max-w-md rounded bg-slate-200" />
                    </div>

                    <div className="lg:pt-24 xl:pt-64">
                        <div className="mb-10 h-12 w-full max-w-xl rounded bg-slate-200" />

                        <div className="relative">
                            <div className="absolute top-0 bottom-0 left-[22px] w-[4px] bg-orange-200" />

                            <div className="space-y-12">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="w-full pt-1">
                                            <div className="mb-3 h-7 w-64 rounded bg-slate-200" />
                                            <div className="mb-2 h-5 w-full max-w-sm rounded bg-slate-200" />
                                            <div className="h-5 w-5/6 max-w-xs rounded bg-slate-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function History() {
    const { language } = useLanguage();

    const uiLang: UiLang = language === "kh" ? "kh" : "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const [mounted, setMounted] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const titleFontClass = isKh
        ? "title-km khmer-font font-bold"
        : "title-en airbnb-font font-extrabold";

    const mainTitleFontClass = isKh
        ? "main-title-km khmer-font font-bold"
        : "main-title-en airbnb-font font-extrabold";

    const bodyFontClass = isKh
        ? "body-km khmer-font"
        : "body-en airbnb-font";

    const labelFontClass = isKh
        ? "body-km !font-bold normal-case"
        : "body-en !font-bold uppercase tracking-[0.7px]";

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
        return <HistorySkeleton />;
    }

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {showErrorOnly && (
                    <div
                        className={`mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 ${bodyFontClass}`}
                    >
                        {error}
                    </div>
                )}

                <p className={`mb-2 text-gray-700 ${labelFontClass}`}>
                    {view.badge}
                </p>

                <h1
                    className={`
                        max-w-full whitespace-pre-line text-gray-900
                        md:max-w-[800px]
                        ${titleFontClass}
                    `}
                >
                    {view.hero}
                </h1>

                <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-8 h-1.5 w-72 bg-orange-500 sm:w-[520px] lg:w-[528px]" />

                        <ul className="mt-8 list-disc space-y-7 pl-4">
                            {view.paras.map((p, i) => (
                                <li
                                    key={i}
                                    className={`
                                        max-w-xl font-bold text-[#1e3a8a]
                                        ${bodyFontClass}
                                    `}
                                >
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:pt-24 xl:pt-64">
                        <h2
                            className={`
                                mb-10 whitespace-pre-line text-gray-900
                                ${titleFontClass}
                            `}
                        >
                            {view.rightTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute top-0 bottom-0 left-[22px] w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {view.objectives.length === 0 && (
                                    <div className={`text-gray-500 ${bodyFontClass}`}>
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
                                                className={`
                                                    text-gray-900
                                                    !whitespace-normal !overflow-visible !text-clip
                                                    ${mainTitleFontClass}
                                                `}
                                            >
                                                {obj.title}
                                            </h3>

                                            <p
                                                className={`
                                                    mt-2 max-w-sm text-gray-600
                                                    ${bodyFontClass}
                                                `}
                                            >
                                                {obj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}