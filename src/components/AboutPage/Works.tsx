"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type ApiItem = {
    title?: I18n;
    description?: I18n; // contains \n lines
};

type Block = {
    id: number;
    type: string; // "text_block"
    title?: I18n; // "How it work?"
    posts?: Array<{
        id: number;
        content?: {
            en?: { items?: ApiItem[] };
            km?: { items?: ApiItem[] };
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

function splitLines(s: string) {
    return (s || "")
        .split(/\r?\n/g)
        .map((x) => x.trim())
        .filter(Boolean);
}

type StepCard = {
    title: string;
    lines: string[];
    variant?: "dark" | "light";
};

export default function Works() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                //  your endpoint is /api-about/about
                const res = await fetch("/api-about/about", { cache: "no-store" });
                const ct = res.headers.get("content-type") || "";
                if (!ct.includes("application/json")) {
                    const text = await res.text();
                    throw new Error(`Expected JSON, got: ${text.slice(0, 80)}...`);
                }

                const json: ApiResponse = await res.json();
                if (!alive) return;

                if (!res.ok || !json?.success) {
                    setError(json?.message || "Failed to load data");
                    setBlocks([]);
                    return;
                }

                setBlocks(json?.data?.blocks || []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load data");
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

    const { title, cards } = useMemo(() => {
        //  Find the "How it work?" block (id 15 in your sample)
        const howBlock = blocks.find((b) => b.type === "text_block" && (b.title?.en || "").toLowerCase().includes("how"));

        const title =
            pickText(howBlock?.title, apiLang, uiLang === "kh" ? "ដំណើរការរបៀបធ្វើការ" : "How it works");

        const items =
            howBlock?.posts?.[0]?.content?.[apiLang]?.items ||
            howBlock?.posts?.[0]?.content?.en?.items ||
            [];

        const cards: StepCard[] = items.map((it, idx) => {
            const t = pickText(it.title, apiLang, "");
            const desc = pickText(it.description, apiLang, "");
            return {
                title: t,
                lines: splitLines(desc),
                variant: idx === 0 ? "dark" : "light", // first dark like your design
            };
        });

        return { title, cards };
    }, [blocks, apiLang, uiLang]);

    return (
        <section className="bg-white py-16 md:py-4">
            <div className="max-w-7xl mx-auto px-4">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Title */}
                <h2
                    className={`text-4xl md:text-6xl font-extrabold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {loading ? (uiLang === "kh" ? "កំពុងផ្ទុក..." : "Loading...") : title}
                </h2>

                <div className="mt-6 w-58 md:w-50 h-1.5 bg-orange-500 sm:translate-x-2 md:translate-x-48" />

                {/* Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {!loading && cards.length === 0 && (
                        <p className="text-gray-500">
                            {uiLang === "kh" ? "មិនមានទិន្នន័យ" : "No data"}
                        </p>
                    )}

                    {!loading &&
                        cards.map((c, i) => {
                            const isDark = c.variant === "dark";

                            return (
                                <div
                                    key={i}
                                    className={[
                                        "relative overflow-hidden",
                                        "min-h-[220px] md:min-h-[260px]",
                                        "rounded-tl-[70px] rounded-br-[70px] rounded-tr-none rounded-bl-none",
                                        "md:rounded-tl-[90px] md:rounded-br-[90px]",
                                        "flex items-center justify-center text-center px-10",
                                        isDark
                                            ? "bg-[#1b235c] text-white"
                                            : "bg-white text-gray-900 shadow-[0_18px_35px_rgba(0,0,0,0.25)]",
                                    ].join(" ")}
                                >
                                    <div className="absolute right-0 top-0 h-full w-20 md:w-24 bg-white/0" />

                                    <div>
                                        <h3
                                            className={[
                                                "font-extrabold",
                                                "text-xl md:text-2xl",
                                                isDark ? "text-white" : "text-gray-800",
                                                uiLang === "kh" ? "khmer-font" : "",
                                            ].join(" ")}
                                        >
                                            {c.title}
                                        </h3>

                                        <div
                                            className={[
                                                "mt-4 space-y-1",
                                                isDark ? "text-white/90" : "text-gray-700",
                                                "text-base md:text-lg",
                                                uiLang === "kh" ? "khmer-font" : "",
                                            ].join(" ")}
                                        >
                                            {c.lines.map((line, idx) => (
                                                <p key={idx}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </section>
    );
}