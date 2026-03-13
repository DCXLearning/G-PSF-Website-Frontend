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

function AboutUsSkeleton({ uiLang }: { uiLang: UiLang }) {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    <div className="lg:sticky lg:top-10 animate-pulse">
                        <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                        <div className="h-12 w-3/4 bg-slate-200 rounded mb-5" />
                        <div className="h-1.5 w-56 sm:w-72 md:w-96 lg:w-[360px] bg-orange-300 rounded" />
                        <div className="mt-8 h-6 w-full max-w-md bg-slate-200 rounded mb-3" />
                        <div className="h-6 w-5/6 max-w-sm bg-slate-200 rounded" />
                    </div>

                    <div className="lg:pt-24 xl:pt-80 animate-pulse">
                        <div className="h-12 w-52 bg-slate-200 rounded mb-10" />
                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-200" />
                            <div className="space-y-12">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>
                                        <div className="pt-1 w-full">
                                            <div className="h-7 w-56 bg-slate-200 rounded mb-3" />
                                            <div className="h-5 w-full max-w-sm bg-slate-200 rounded mb-2" />
                                            <div className="h-5 w-5/6 max-w-xs bg-slate-200 rounded" />
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
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
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
        const postList = blocks.find((b) => b.type === "post_list");
        const textBlock = blocks.find((b) => b.type === "text_block");

        const badge = uiLang === "kh" ? "អំពីពួកយើង" : "About Us";

        const title = pickText(
            postList?.title,
            apiLang,
            uiLang === "kh" ? "G-PSF គឺជាអ្វី?" : "What is the G-PSF?"
        );

        const desc = pickText(
            postList?.description,
            apiLang,
            uiLang === "kh" ? "មិនមានសេចក្ដីពណ៌នា។" : "Description not available."
        );

        const objectivesTitle = pickText(
            textBlock?.title,
            apiLang,
            uiLang === "kh" ? "គោលបំណង" : "Objectives"
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
                `${uiLang === "kh" ? "គោលបំណង" : "Objective"} ${idx + 1}`
            ),
            description: pickText(it.description, apiLang, ""),
        }));

        return { badge, title, desc, objectivesTitle, objectives };
    }, [blocks, apiLang, uiLang]);

    const showSkeleton = !mounted || (loading && blocks.length === 0);
    const showErrorOnly = !showSkeleton && blocks.length === 0 && !!error;

    if (showSkeleton) {
        return <AboutUsSkeleton uiLang={uiLang} />;
    }

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {showErrorOnly && (
                    <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-10">
                        <p
                            className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${uiLang === "kh" ? "khmer-font normal-case" : ""
                                }`}
                        >
                            {view.badge}
                        </p>

                        <h1
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {view.title}
                        </h1>

                        <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[360px] translate-x-0 sm:translate-x-8 md:translate-x-25" />

                        <p
                            className={`mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-25 ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {view.desc}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {view.objectivesTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {view.objectives.length === 0 && (
                                    <div className="text-gray-500">
                                        {uiLang === "kh"
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
                                                className={`text-xl font-extrabold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {obj.title}
                                            </h3>

                                            <p
                                                className={`mt-2 text-base sm:text-lg text-gray-600 line-clamp-3 leading-relaxed max-w-sm ${uiLang === "kh" ? "khmer-font" : ""
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
};

export default AboutUs;