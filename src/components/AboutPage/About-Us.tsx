/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type ObjectiveItem = {
    title?: I18n;
    description?: I18n;
};

type Block = {
    id: number;
    type: "hero_banner" | "post_list" | "text_block" | string;
    title?: I18n;
    description?: I18n;
    posts?: Array<{
        id: number;
        content?: {
            en?: { items?: ObjectiveItem[] };
            km?: { items?: ObjectiveItem[] };
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

const CACHE_KEY = "about-us-blocks-cache";

function normalizeLang(language: unknown): UiLang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

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
        // ignore cache errors
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

function AboutUsSkeleton() {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="animate-pulse lg:sticky lg:top-10">
                        <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                        <div className="mb-5 h-12 w-3/4 rounded bg-slate-200" />
                        <div className="h-1.5 w-56 rounded bg-orange-300 sm:w-72 md:w-96 lg:w-[360px]" />
                        <div className="mt-8 mb-3 h-6 w-full max-w-md rounded bg-slate-200" />
                        <div className="h-6 w-5/6 max-w-sm rounded bg-slate-200" />
                    </div>

                    <div className="animate-pulse lg:pt-24 xl:pt-80">
                        <div className="mb-10 h-12 w-52 rounded bg-slate-200" />

                        <div className="relative">
                            <div className="absolute bottom-0 left-[23px] top-0 w-[4px] bg-orange-200" />

                            <div className="space-y-12">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="w-full pt-1">
                                            <div className="mb-3 h-7 w-56 rounded bg-slate-200" />
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

const AboutUs: React.FC = () => {
    const { language } = useLanguage();

    const uiLang = normalizeLang(language);
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [error, setError] = useState<string | null>(null);

    const titleFontClass = isKh ? "title-km" : "title-en";
    const mainTitleFontClass = isKh ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKh ? "body-km" : "body-en";

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

                const res = await fetch("/api/about-us-page/about", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const contentType = res.headers.get("content-type") || "";

                if (!contentType.includes("application/json")) {
                    const text = await res.text();

                    throw new Error(
                        `Expected JSON but got: ${text.slice(0, 80)}... (check /api/about route)`
                    );
                }

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
        const postList = blocks.find((b) => b.type === "post_list");
        const textBlock = blocks.find((b) => b.type === "text_block");

        const badge = isKh ? "អំពីពួកយើង" : "About Us";

        const title = pickText(
            postList?.title,
            apiLang,
            isKh ? "G-PSF គឺជាអ្វី?" : "What is G-PSF?"
        );

        const desc = pickText(
            postList?.description,
            apiLang,
            isKh ? "មិនមានសេចក្ដីពណ៌នា។" : "Description not available."
        );

        const objectivesTitle = pickText(
            textBlock?.title,
            apiLang,
            isKh ? "គោលបំណង" : "G-PSF’s Mandate"
        );

        const items =
            textBlock?.posts?.[0]?.content?.[apiLang]?.items ||
            textBlock?.posts?.[0]?.content?.en?.items ||
            [];

        const objectives = items.map((it, idx) => ({
            id: idx + 1,
            title: pickText(
                it.title,
                apiLang,
                `${isKh ? "គោលបំណង" : "Objective"} ${idx + 1}`
            ),
            description: pickText(it.description, apiLang, ""),
        }));

        return {
            badge,
            title,
            desc,
            objectivesTitle,
            objectives,
        };
    }, [blocks, apiLang, isKh]);

    const showSkeleton = !mounted || (loading && blocks.length === 0);
    const showErrorOnly = !showSkeleton && blocks.length === 0 && !!error;

    if (showSkeleton) {
        return <AboutUsSkeleton />;
    }

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {showErrorOnly && (
                    <div
                        className={`
                            mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700
                            ${bodyFontClass}
                        `}
                    >
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-10">
                        <p className={`mb-2 text-gray-700 ${labelFontClass}`}>
                            {view.badge}
                        </p>

                        <h1 className={`text-gray-900 ${titleFontClass}`}>
                            {view.title}
                        </h1>

                        <div className="mt-5 h-1.5 w-56 translate-x-0 bg-orange-500 sm:w-72 sm:translate-x-8 md:w-96 md:translate-x-25 lg:w-[360px]" />

                        <p
                            className={`
                                mt-8 max-w-md translate-x-0 text-[#1e3a8a]
                                sm:translate-x-8 md:translate-x-25
                                ${bodyFontClass} !font-bold
                            `}
                        >
                            {view.desc}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-80">
                        <h2 className={`mb-10 text-gray-900 ${titleFontClass}`}>
                            {view.objectivesTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute bottom-0 left-[23px] top-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {view.objectives.length === 0 && (
                                    <div className={`text-gray-500 ${bodyFontClass}`}>
                                        {isKh
                                            ? "មិនមានទិន្នន័យគោលបំណងទេ"
                                            : "No objectives found."}
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
                                                    text-blue-900
                                                    !whitespace-normal !overflow-visible !text-clip
                                                    ${mainTitleFontClass}
                                                `}
                                            >
                                                {obj.title}
                                            </h3>

                                            <p
                                                className={`
                                                    mt-2 max-w-sm line-clamp-3 text-gray-600
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
};

export default AboutUs;