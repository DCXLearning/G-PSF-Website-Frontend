"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export type DocumentHeroProps = {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
};

type UiLang = "en" | "kh";

type I18nText = {
    en?: string;
    km?: string;
};

type HeroContent = {
    title?: I18nText;
    subtitle?: I18nText;
    description?: I18nText;
    backgroundImages?: string[];
};

type HeroPost = {
    status?: string;
    isPublished?: boolean;
    content?: {
        en?: HeroContent;
        km?: HeroContent;
    };
};

type HeroBlock = {
    type?: string;
    enabled?: boolean;
    posts?: HeroPost[];
};

type HeroApiResponse = {
    data?: {
        blocks?: HeroBlock[];
    };
};

type HeroBannerData = {
    title: I18nText;
    subtitle: I18nText;
    backgroundImage: string;
};

const HERO_API_ENDPOINT = "/api/resources/section";

const DEFAULT_HERO: HeroBannerData = {
    title: {
        en: "Documents",
        km: "ឯកសារ",
    },
    subtitle: {
        en: "Using standard documents saves\ntime and makes information easy\nto share.",
        km: "ការប្រើប្រាស់ឯកសារស្តង់ដារជួយសន្សំសំចៃពេលវេលា និងធ្វើឱ្យព័ត៌មានងាយស្រួលចែករំលែក។",
    },
    backgroundImage: "/image/resources_top.bmp",
};

function getCleanText(value?: string | null) {
    return value?.trim() ?? "";
}

function pickText(value: I18nText, language: UiLang, fallback: string) {
    if (language === "kh") {
        return getCleanText(value.km) || getCleanText(value.en) || fallback;
    }

    return getCleanText(value.en) || getCleanText(value.km) || fallback;
}

function normalizeImageUrl(value?: string | null) {
    const url = getCleanText(value);

    if (url.startsWith("/https://") || url.startsWith("/http://")) {
        return url.slice(1);
    }

    return url;
}

function createFallbackHero(props: DocumentHeroProps): HeroBannerData {
    return {
        title: {
            en: props.title || DEFAULT_HERO.title.en,
            km: props.title || DEFAULT_HERO.title.km,
        },
        subtitle: {
            en: props.subtitle || DEFAULT_HERO.subtitle.en,
            km: props.subtitle || DEFAULT_HERO.subtitle.km,
        },
        backgroundImage: props.backgroundImage || DEFAULT_HERO.backgroundImage,
    };
}

function buildHeroFromResponse(response: HeroApiResponse, fallback: HeroBannerData) {
    const blocks = response.data?.blocks ?? [];
    const heroBlock = blocks.find(
        (block) => block.enabled !== false && block.type === "hero_banner"
    );
    const post =
        heroBlock?.posts?.find((item) => item.isPublished !== false && item.status !== "draft") ||
        heroBlock?.posts?.[0];
    const enContent = post?.content?.en;
    const kmContent = post?.content?.km;

    if (!enContent && !kmContent) {
        return null;
    }

    return {
        title: {
            en:
                getCleanText(enContent?.title?.en) ||
                getCleanText(kmContent?.title?.en) ||
                getCleanText(kmContent?.title?.km) ||
                fallback.title.en,
            km:
                getCleanText(kmContent?.title?.km) ||
                getCleanText(enContent?.title?.km) ||
                getCleanText(enContent?.title?.en) ||
                fallback.title.km,
        },
        subtitle: {
            en:
                getCleanText(enContent?.subtitle?.en) ||
                getCleanText(kmContent?.subtitle?.en) ||
                getCleanText(kmContent?.subtitle?.km) ||
                fallback.subtitle.en,
            km:
                getCleanText(kmContent?.subtitle?.km) ||
                getCleanText(enContent?.subtitle?.km) ||
                getCleanText(enContent?.subtitle?.en) ||
                fallback.subtitle.km,
        },
        backgroundImage:
            normalizeImageUrl(enContent?.backgroundImages?.[0]) ||
            normalizeImageUrl(kmContent?.backgroundImages?.[0]) ||
            fallback.backgroundImage,
    };
}

export default function HeroBanner({
    title,
    subtitle,
    backgroundImage,
}: DocumentHeroProps) {
    const { language } = useLanguage();
    const currentLanguage: UiLang = language === "kh" ? "kh" : "en";
    const fallbackHero = useMemo(
        () => createFallbackHero({ title, subtitle, backgroundImage }),
        [title, subtitle, backgroundImage]
    );
    const [cmsHero, setCmsHero] = useState<HeroBannerData | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadHeroBanner() {
            try {
                const response = await fetch(HERO_API_ENDPOINT, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    return;
                }

                const json = (await response.json()) as HeroApiResponse;
                const nextHero = buildHeroFromResponse(json, fallbackHero);

                if (nextHero) {
                    setCmsHero(nextHero);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load document hero banner:", error);
            }
        }

        void loadHeroBanner();

        return () => controller.abort();
    }, [fallbackHero]);

    const hero = cmsHero || fallbackHero;
    const defaultTitle =
        currentLanguage === "kh" ? DEFAULT_HERO.title.km ?? "Documents" : DEFAULT_HERO.title.en ?? "Documents";
    const defaultSubtitle =
        currentLanguage === "kh" ? DEFAULT_HERO.subtitle.km ?? "" : DEFAULT_HERO.subtitle.en ?? "";
    const heroTitle = pickText(hero.title, currentLanguage, defaultTitle);
    const heroSubtitle = pickText(hero.subtitle, currentLanguage, defaultSubtitle);

    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[280px] sm:h-[340px] md:h-[420px] lg:h-[650px]">
                <Image
                    src={hero.backgroundImage}
                    alt={`${heroTitle} banner`}
                    fill
                    priority
                    className="object-cover object-top"
                />

                <div className="absolute inset-0 bg-white/20" />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl">
                        <h1
                            className={`text-[#1a2b4b] text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl ${
                                currentLanguage === "kh" ? "khmer-font leading-relaxed" : ""
                            }`}
                        >
                            {heroTitle}
                        </h1>

                        <p
                            className={`mt-4 whitespace-pre-line text-[#1a2b4b] text-base font-semibold leading-relaxed sm:text-lg md:text-xl ${
                                currentLanguage === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {heroSubtitle}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
