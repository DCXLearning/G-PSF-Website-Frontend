"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
    en?: string;
    km?: string;
};

type HeroCta = {
    href?: string;
    label?: I18nText;
};

type HeroContent = {
    title?: I18nText;
    ctas?: HeroCta[];
    backgroundImages?: string[];
};

type HeroPost = {
    slug?: string | null;
    status?: string;
    isPublished?: boolean;
    content?: {
        en?: HeroContent;
        km?: HeroContent;
    };
};

type HeroBlock = {
    id?: number;
    type?: string;
    enabled?: boolean;
    posts?: HeroPost[];
};

type AboutSectionResponse = {
    success?: boolean;
    data?: {
        blocks?: HeroBlock[];
    };
};

type Slide = {
    id: number;
    title: string;
    backgroundImage: string;
    ctaText: string;
    href: string;
};

const HERO_BLOCK_ID = 17;
const HERO_POST_SLUG = "about-us-banner-2";

function pickText(value: I18nText | undefined, apiLang: ApiLang, fallback = ""): string {
    if (!value) {
        return fallback;
    }

    if (apiLang === "km") {
        return value.km || value.en || fallback;
    }

    return value.en || value.km || fallback;
}

function buildFallbackSlides(lang: Lang): Slide[] {
    const title =
        lang === "kh"
            ? "ស្វែងយល់អំពីក្រុមការងារ (WGs) ដែលជួយជំរុញការកែទម្រង់"
            : "Explore the Working Groups driving reform";

    const ctaText = lang === "kh" ? "មើលក្រុមការងារ" : "View working group";

    return [
        {
            id: 1,
            title,
            backgroundImage: "/image/Banner-g.bmp",
            ctaText,
            href: "/working-groups",
        },
        {
            id: 2,
            title,
            backgroundImage: "/image/Banner.bmp",
            ctaText,
            href: "/working-groups",
        },
        {
            id: 3,
            title,
            backgroundImage: "/image/BannerAbout.bmp",
            ctaText,
            href: "/working-groups",
        },
    ];
}

function findHeroBlock(blocks: HeroBlock[]): HeroBlock | undefined {
    return (
        blocks.find(
            (block) =>
                block.enabled !== false &&
                block.type === "hero_banner" &&
                block.id === HERO_BLOCK_ID
        ) ??
        blocks.find(
            (block) =>
                block.enabled !== false &&
                block.type === "hero_banner" &&
                block.posts?.some((post) => post.slug === HERO_POST_SLUG)
        )
    );
}

function buildSlides(blocks: HeroBlock[], lang: Lang): Slide[] {
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    const heroBlock = findHeroBlock(blocks);
    const heroPost =
        heroBlock?.posts?.find((post) => post.status === "published" && post.isPublished !== false) ??
        heroBlock?.posts?.[0];
    const content = heroPost?.content?.[apiLang] ?? heroPost?.content?.en ?? heroPost?.content?.km;

    if (!content) {
        return buildFallbackSlides(lang);
    }

    const title = pickText(
        content.title,
        apiLang,
        lang === "kh"
            ? "ស្វែងយល់អំពីក្រុមការងារ (WGs) ដែលជួយជំរុញការកែទម្រង់"
            : "Explore the Working Groups driving reform"
    );

    const firstCta = content.ctas?.[0];
    const ctaText = pickText(
        firstCta?.label,
        apiLang,
        lang === "kh" ? "មើលក្រុមការងារ" : "View working group"
    );
    const href = firstCta?.href?.trim() || "/working-groups";
    const backgroundImages = (content.backgroundImages ?? []).filter(Boolean);

    if (backgroundImages.length === 0) {
        return buildFallbackSlides(lang);
    }

    // Use each CMS background image as one slide so the old slider layout still works.
    return backgroundImages.map((backgroundImage, index) => ({
        id: index + 1,
        title,
        backgroundImage,
        ctaText,
        href,
    }));
}

export default function WorkingGroup() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";

    const [blocks, setBlocks] = useState<HeroBlock[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const sectionClass =
        "relative w-full overflow-hidden h-[55vh] min-h-[360px] sm:h-[60vh] sm:min-h-[420px] lg:h-[70vh] lg:min-h-[520px]";

    useEffect(() => {
        let alive = true;

        async function loadBanner() {
            try {
                const response = await fetch("/api/about-us-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = (await response.json()) as AboutSectionResponse;

                if (!alive || !response.ok || !json.success) {
                    return;
                }

                // Save the full block list, then pick the hero banner block in useMemo.
                setBlocks(json.data?.blocks ?? []);
            } catch (error) {
                console.error("Failed to load About Us working groups banner:", error);
            }
        }

        loadBanner();

        return () => {
            alive = false;
        };
    }, []);

    const slides = useMemo(() => buildSlides(blocks, lang), [blocks, lang]);
    const activeSlideIndex =
        slides.length === 0 ? 0 : Math.min(currentSlide, slides.length - 1);

    useEffect(() => {
        if (slides.length <= 1) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setCurrentSlide((previousSlide) => (previousSlide + 1) % slides.length);
        }, 3800);

        return () => window.clearInterval(timer);
    }, [slides.length]);

    return (
        <section className={sectionClass}>
            <div className="absolute inset-0">
                {slides.map((slide, index) => {
                    const isActive = index === activeSlideIndex;

                    return (
                        <div
                            key={slide.id}
                            aria-hidden={!isActive}
                            className={[
                                "absolute inset-0 transition-opacity duration-700",
                                isActive ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            style={{
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${slide.backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                            }}
                        >
                            <div className="mx-auto min-h-screen flex items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8 pb-[130px]">
                                <div className="max-w-5xl">
                                    <h1
                                        className={`text-3xl font-bold tracking-tight text-white sm:text-5xl ${
                                            lang === "kh" ? "khmer-font" : ""
                                        }`}
                                    >
                                        {slide.title}
                                    </h1>

                                    <div className="mt-8">
                                        <Link
                                            href={slide.href}
                                            className={`inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 ${
                                                lang === "kh" ? "khmer-font" : ""
                                            }`}
                                        >
                                            {slide.ctaText}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
