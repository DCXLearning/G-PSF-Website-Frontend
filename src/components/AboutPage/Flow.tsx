//  src/components/About/Flow.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type Block = {
    id: number;
    type: string;
    title?: I18n;
    posts?: Array<{
        id: number;
        title?: I18n;
        coverImage?: string;
    }>;
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: Block[];
    };
};

const CACHE_KEY = "about-flow-blocks-cache";

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
        // ignore cache write errors
    }
}

function FlowSkeleton() {
    return (
        <section className="bg-white py-5 md:py-7 animate-pulse">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="mt-3 max-w-md mx-auto h-8 bg-slate-200 rounded" />
                    <div className="mt-4 max-w-xl mx-auto h-12 bg-slate-200 rounded" />
                </div>
            </div>

            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px] bg-slate-100" />
            </div>
        </section>
    );
}

export default function Flow() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [mounted, setMounted] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);

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
                const res = await fetch("/api/about-us-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: ApiResponse = await res.json();
                if (!alive) return;

                if (!res.ok || !json?.success) {
                    return;
                }

                const nextBlocks = json?.data?.blocks || [];
                setBlocks(nextBlocks);
                writeCache(nextBlocks);
            } catch {
                if (!alive) return;
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
        const reform = blocks.find(
            (b) =>
                b.type === "post_list" &&
                (b.title?.en || "").toLowerCase().includes("reform")
        );

        const subtitle = pickText(
            reform?.title,
            apiLang,
            uiLang === "kh" ? "លំហូរកំណែទម្រង់" : "Reform Flow"
        );

        const post = reform?.posts?.[0];

        const title = pickText(
            post?.title,
            apiLang,
            uiLang === "kh"
                ? "គំរូលំដាប់កម្រិត G-PSF"
                : "The G-PSF Escalatory Model"
        );

        const imageUrl = post?.coverImage || "/image/s.png";

        return { subtitle, title, imageUrl };
    }, [blocks, apiLang, uiLang]);

    const showSkeleton = !mounted || (loading && blocks.length === 0);

    if (showSkeleton) {
        return <FlowSkeleton />;
    }

    return (
        <section className="bg-white py-5 md:py-7">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <p
                        className={`mt-3 max-w-2xl mx-auto text-xl font-bold sm:text-3xl text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {view.subtitle}
                    </p>

                    <h1
                        className={`text-3xl sm:text-5xl font-bold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {view.title}
                    </h1>
                </div>
            </div>

            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={view.imageUrl}
                        alt={view.title || "Reform Flow"}
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
}