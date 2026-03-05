// components/HeroBanner.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh"; // UI
type ApiLang = "en" | "km"; // API
type I18n = { en?: string; km?: string };

type HeroCTA = {
    href?: string;
    label?: I18n;
};

type HeroContent = {
    title?: I18n;
    subtitle?: I18n;
    description?: I18n;
    backgroundImages?: string[];
    ctas?: HeroCTA[];
};

type ApiPost = {
    id: number;
    slug?: string;
    content?: {
        en?: HeroContent;
        km?: HeroContent;
    } | null;
};

type ApiBlock = {
    id: number;
    type: string; // hero_banner
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: ApiBlock[];
    };
};

const PLACEHOLDER_IMAGE_URL = "/image/bannerpdf.bmp";

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function cleanHref(href?: string) {
    if (!href) return "";
    // API gives "/https://...." => fix
    if (href.startsWith("/https://")) return href.slice(1);
    return href;
}

export default function Bannerpdf() {
    const { language, apiLang, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const apiLanguage = (apiLang as ApiLang) ?? "en";

    const [loading, setLoading] = useState(true);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                setLoading(true);

                // About Us endpoint (via your Next.js proxy route)
                // create: app/api/pages/about-us/section/route.ts
                const res = await fetch("/api/about-us-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                const blocks = json?.data?.blocks || [];

                const hero =
                    blocks.find(
                        (b) =>
                            b?.enabled !== false &&
                            b?.type === "hero_banner" &&
                            (b?.id === 20 || b?.posts?.[0]?.slug === "about-us-banner-3")
                    ) || null;

                if (mounted) setBlock(hero);
            } catch (e) {
                console.error(e);
                if (mounted) setBlock(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const hero = useMemo(() => {
        const post = block?.posts?.[0];
        const key = apiLanguage === "km" ? "km" : "en";
        const content = post?.content?.[key];

        const bg =
            content?.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

        const topLine =
            pickText(content?.title, uiLang) ||
            (uiLang === "en"
                ? "Get the G-PSF Policy Brief."
                : "ទទួលបានឯកសារសង្ខេបគោលនយោបាយ G-PSF");

        const cta = content?.ctas?.[0];
        const buttonLabel =
            pickText(cta?.label, uiLang) ||
            (uiLang === "en" ? "Download PDF" : "ទាញយក PDF");

        const href = cleanHref(cta?.href);

        return { bg, topLine, buttonLabel, href };
    }, [block, apiLanguage, uiLang]);

    return (
        <div className={`relative mb-0 opacity-110 min-h-[520px] flex flex-col items-center justify-start overflow-hidden bg-gray-100 ${fontClass}`}>
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${hero.bg})` }}
            >
                <div className="absolute inset-0 bg-gray-900/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-65 pb-6 sm:pb-6 max-w-5xl w-full">
                {/* Top line */}
                <p
                    className={`text-base sm:text-lg md:text-5xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${uiLang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {hero.topLine}
                </p>

                {/* Button */}
                <a
                    href={hero.href || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 md:py-4 px-4 sm:px-8 md:px-12 rounded-2xl shadow-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base md:text-lg ${uiLang === "kh" ? "khmer-font" : ""
                        } ${!hero.href ? "pointer-events-none opacity-60" : ""}`}
                    aria-disabled={!hero.href}
                >
                    {loading ? (uiLang === "kh" ? "កំពុងផ្ទុក..." : "Loading...") : hero.buttonLabel}
                </a>
            </div>
        </div>
    );
}