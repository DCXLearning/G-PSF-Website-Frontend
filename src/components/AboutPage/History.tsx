// ✅ src/components/About/History.tsx
// Pulls data from API blocks:
// - id 18 text_block  => hero + 4 paragraphs (from description split by blank lines)
// - id 19 text_block  => right-side objectives (items list)

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
    type: string; // "text_block"
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

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function splitParagraphs(s: string) {
    // split by blank lines
    return (s || "")
        .split(/\n\s*\n/g)
        .map((x) => x.trim())
        .filter(Boolean);
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

export default function History() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // ✅ your endpoint
                const res = await fetch("/api-about/about", { cache: "no-store" });
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

    const view = useMemo(() => {
        // ✅ Block 18: For over 25 years (hero + paragraphs)
        const block18 = blocks.find((b) => b.type === "text_block" && b.id === 18);

        const heroItem = block18?.posts?.[0]?.content?.[apiLang]?.items?.[0]
            || block18?.posts?.[0]?.content?.en?.items?.[0];

        const badge = isKh ? "អំពីពួកយើង" : "About Us";

        const hero =
            pickText(
                heroItem?.title,
                apiLang,
                isKh
                    ? "អស់រយៈពេលជាង ២៥ ឆ្នាំ G-PSF បានជំរុញលទ្ធផលកែទម្រង់..."
                    : "For over 25 years, the G-PSF has delivered trust-based reform outcomes..."
            );

        const desc = pickText(heroItem?.description, apiLang, "");
        const paras = splitParagraphs(desc);

        // ✅ Block 19: Role of CDC (objectives list)
        const block19 = blocks.find((b) => b.type === "text_block" && b.id === 19);
        const rightTitle = pickText(
            block19?.title,
            apiLang,
            isKh ? "តួនាទីរបស់ក្រុមប្រឹក្សាអភិវឌ្ឍន៍កម្ពុជា (CDC)" : "Role of the Council for the Development of Cambodia (CDC)"
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

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <p
                    className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${isKh ? "khmer-font normal-case" : ""
                        }`}
                >
                    {view.badge}
                </p>

                <h1
                    className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight whitespace-pre-line ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {loading ? (isKh ? "កំពុងផ្ទុក..." : "Loading...") : view.hero}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-20 h-1.5 bg-orange-500 w-72 sm:w-[520px] lg:w-[528px]" />

                        {(loading ? [] : view.paras).map((p, i) => (
                            <p
                                key={i}
                                className={`mt-8 max-w-xl text-lg sm:text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""
                                    }`}
                            >
                                {p}
                            </p>
                        ))}
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-64">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 whitespace-pre-line ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {loading ? "" : view.rightTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[22px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {!loading &&
                                    view.objectives.map((obj) => (
                                        <div key={obj.id} className="relative flex items-start gap-6">
                                            <div className="relative z-10">
                                                <HexNode />
                                            </div>

                                            <div className="pt-1">
                                                <h3 className={`text-xl font-extrabold text-gray-900 ${isKh ? "khmer-font" : ""}`}>
                                                    {obj.title}
                                                </h3>
                                                <p className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${isKh ? "khmer-font" : ""}`}>
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