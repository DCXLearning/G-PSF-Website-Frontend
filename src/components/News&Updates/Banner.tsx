"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type HeroCTA = { href: string; label?: I18n };

type HeroContent = {
    title?: I18n;
    subtitle?: I18n;
    description?: I18n;
    ctas?: HeroCTA[];
    backgroundImages?: string[];
};

type Block = {
    id: number;
    type: string;
    posts?: Array<{
        id: number;
        content?: {
            en?: HeroContent;
            km?: HeroContent;
        };
    }>;
};

type ApiResponse = {
    success: boolean;
    data?: {
        blocks?: Block[];
    };
};

const DEFAULT_IMAGE = "/image/BannerNews_Updates.bmp";
const CACHE_KEY_PREFIX = "newupdate-hero-cache";

function uiToApiLang(ui: UiLang): ApiLang {
    return ui === "kh" ? "km" : "en";
}

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function getCacheKey(apiLang: ApiLang) {
    return `${CACHE_KEY_PREFIX}-${apiLang}`;
}

function readCache(apiLang: ApiLang): HeroContent | null {
    try {
        const raw = localStorage.getItem(getCacheKey(apiLang));
        if (!raw) return null;
        return JSON.parse(raw) as HeroContent;
    } catch {
        return null;
    }
}

function writeCache(apiLang: ApiLang, hero: HeroContent | null) {
    if (!hero) return;
    try {
        localStorage.setItem(getCacheKey(apiLang), JSON.stringify(hero));
    } catch {
        // ignore cache errors
    }
}

function HeroSkeleton({ isKhmer }: { isKhmer: boolean }) {
    return (
        <section className="bg-white py-5 md:py-13 animate-pulse">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            </div>

            <div className="w-full">
                <div className="relative w-full mt-20 h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px] bg-slate-200 shadow-[0_-15px_30px_rgba(0,0,0,0.20),0_15px_30px_rgba(0,0,0,0.20)]" />
            </div>
        </section>
    );
}

export default function NewUpdate() {
    const { language } = useLanguage() as { language: UiLang };
    const apiLang = useMemo(() => uiToApiLang(language), [language]);
    const isKhmer = language === "kh";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hero, setHero] = useState<HeroContent | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(apiLang);
        if (cached) {
            setHero(cached);
            setLoading(false);
        }

        let alive = true;

        async function run() {
            try {
                const res = await fetch("/api/newupdate-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

                const json: ApiResponse = await res.json();
                const blocks = json?.data?.blocks || [];

                const heroBlock = blocks.find((b) => b.type === "hero_banner");
                const post = heroBlock?.posts?.[0];
                const content = post?.content?.[apiLang] || post?.content?.en || null;

                if (!alive) return;

                if (content) {
                    setHero(content);
                    writeCache(apiLang, content);
                }
            } catch {
                if (!alive) return;
                // keep old cached hero, do not clear state
            } finally {
                if (alive) setLoading(false);
            }
        }

        run();

        return () => {
            alive = false;
        };
    }, [apiLang]);

    const title = pickText(
        hero?.title,
        apiLang,
        apiLang === "km"
            ? "តាមដានការសន្ទនា ការសម្រេចចិត្ត និងកំណែទម្រង់"
            : "Tracking dialogue, decisions, and reforms"
    );

    const subtitle = pickText(hero?.subtitle, apiLang, "");

    const description = pickText(
        hero?.description,
        apiLang,
        apiLang === "km"
            ? "ទទួលបានព័ត៌មានអំពីការអភិវឌ្ឍន៍សំខាន់ៗពី G-PSF រួមទាំងលទ្ធផលពេញអង្គ វឌ្ឍនភាពនៃក្រុមការងារ ការសង្ខេបគោលនយោបាយ និងកំណែទម្រង់ស្ថាប័ន។"
            : "Stay informed on key developments from the G-PSF, including plenary outcomes, Working Group progress, policy briefs, and institutional reforms."
    );

    const imageUrl = hero?.backgroundImages?.[0] || DEFAULT_IMAGE;

    const showSkeleton = !mounted || (loading && !hero);

    if (showSkeleton) {
        return <HeroSkeleton isKhmer={isKhmer} />;
    }

    return (
        <section className="bg-white py-5 md:py-13">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1
                        className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {title}
                    </h1>

                    {subtitle ? (
                        <p
                            className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {subtitle}
                        </p>
                    ) : null}

                    {description ? (
                        <p
                            className={`mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-700 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="w-full">
                <div className="relative w-full mt-20 h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px] shadow-[0_-15px_30px_rgba(0,0,0,0.20),0_15px_30px_rgba(0,0,0,0.20)]">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        priority
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>
        </section>
    );
}