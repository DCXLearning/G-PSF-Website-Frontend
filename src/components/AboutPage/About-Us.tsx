"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh"; // your UI language
type ApiLang = "en" | "km"; // API language

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

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

// Bigger, clean hex node
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

const AboutUs: React.FC = () => {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [error, setError] = useState<string | null>(null);

    // ✅ Fetch from your Next.js API route: /api/about
    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api-about/about/", { cache: "no-store" });

                // If API route is wrong, it might return HTML -> this prevents JSON crash
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
                    setError(json?.message || "Failed to load About Us data.");
                    setBlocks([]);
                    return;
                }

                setBlocks(json?.data?.blocks || []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load About Us data.");
                setBlocks([]);
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

    // ✅ Map blocks -> UI content
    const view = useMemo(() => {
        const postList = blocks.find((b) => b.type === "post_list");
        const textBlock = blocks.find((b) => b.type === "text_block");

        const badge = uiLang === "kh" ? "អំពីពួកយើង" : "About Us";

        const title = pickText(postList?.title, apiLang, uiLang === "kh" ? "G-PSF គឺជាអ្វី?" : "What is the G-PSF?");
        const desc = pickText(
            postList?.description,
            apiLang,
            uiLang === "kh" ? "មិនមានសេចក្ដីពណ៌នា។" : "Description not available."
        );

        const objectivesTitle = pickText(textBlock?.title, apiLang, uiLang === "kh" ? "គោលបំណង" : "Objectives");

        const items =
            textBlock?.posts?.[0]?.content?.[apiLang]?.items ||
            textBlock?.posts?.[0]?.content?.en?.items ||
            [];

        const objectives = items.map((it, idx) => ({
            id: idx + 1,
            title: pickText(it.title, apiLang, `${uiLang === "kh" ? "គោលបំណង" : "Objective"} ${idx + 1}`),
            description: pickText(it.description, apiLang, ""),
        }));

        return { badge, title, desc, objectivesTitle, objectives };
    }, [blocks, apiLang, uiLang]);

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {error && (
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
                            {loading ? (uiLang === "kh" ? "កំពុងផ្ទុក..." : "Loading...") : view.title}
                        </h1>

                        <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[360px] translate-x-0 sm:translate-x-8 md:translate-x-25" />

                        <p
                            className={`mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-25 ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {loading ? "" : view.desc}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 ${uiLang === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {loading ? "" : view.objectivesTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {!loading && view.objectives.length === 0 && (
                                    <div className="text-gray-500">
                                        {uiLang === "kh" ? "មិនមានទិន្នន័យគោលបំណងទេ" : "No objectives found."}
                                    </div>
                                )}

                                {!loading &&
                                    view.objectives.map((obj) => (
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
                                                    className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${uiLang === "kh" ? "khmer-font" : ""
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