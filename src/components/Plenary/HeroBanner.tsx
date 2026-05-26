"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh" | "km";

type BannerTranslation = {
    en: string;
    km: string;
};

type HeroBannerData = {
    imageUrl: string;
    title: BannerTranslation;
    subtitle: BannerTranslation;
};

type HeroBannerPostContent = {
    title?: {
        en?: string;
        km?: string;
    };
    subtitle?: {
        en?: string;
        km?: string;
    };
    backgroundImages?: string[];
};

type HeroBannerBlock = {
    id?: number;
    type?: string;
    enabled?: boolean;
    posts?: Array<{
        content?: {
            en?: HeroBannerPostContent;
            km?: HeroBannerPostContent;
        };
    }>;
};

const FALLBACK_BANNER: HeroBannerData = {
    imageUrl: "/image/Subpages_plenary_Banner.bmp",
    title: {
        en: "The Government-Private Sector Forum Plenary",
        km: "កិច្ចប្រជុំពេញអង្គវេទិការាជរដ្ឋាភិបាល-ឯកជន",
    },
    subtitle: {
        en: "Cambodia’s Highest Platform for Public-Private Solutions",
        km: "វេទិកាខ្ពស់បំផុតសម្រាប់ដំណោះស្រាយរវាងរដ្ឋ និងឯកជននៅកម្ពុជា",
    },
};

function normalizeLang(language: unknown): Lang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

function pickText(
    value: { en?: string; km?: string } | undefined,
    fallback: BannerTranslation
): BannerTranslation {
    return {
        en: value?.en?.trim() || value?.km?.trim() || fallback.en,
        km: value?.km?.trim() || value?.en?.trim() || fallback.km,
    };
}

function buildBannerFromBlock(block: HeroBannerBlock | undefined): HeroBannerData | null {
    const post = block?.posts?.[0];

    const content = post?.content?.en || post?.content?.km;

    if (!content) {
        return null;
    }

    return {
        imageUrl: content.backgroundImages?.[0] || FALLBACK_BANNER.imageUrl,
        title: pickText(content.title, FALLBACK_BANNER.title),
        subtitle: pickText(content.subtitle, FALLBACK_BANNER.subtitle),
    };
}

export default function HeroBanner() {
    const { language } = useLanguage();

    const currentLang = normalizeLang(language);
    const isKh = currentLang === "kh";

    const [banner, setBanner] = useState<HeroBannerData>(FALLBACK_BANNER);

    const titleFontClass = isKh
        ? "title-km khmer-font font-bold"
        : "title-en airbnb-font font-extrabold";

    const subtitleFontClass = isKh
        ? "body-km khmer-font"
        : "body-en airbnb-font";

    useEffect(() => {
        const controller = new AbortController();

        const loadBanner = async () => {
            try {
                const response = await fetch("/api/plenary/section?types=hero_banner", {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    return;
                }

                const result = await response.json();

                const blocks = Array.isArray(result?.data?.blocks)
                    ? (result.data.blocks as HeroBannerBlock[])
                    : [];

                const heroBlock =
                    blocks.find((block) => block.enabled !== false && block.id === 50) ||
                    blocks.find(
                        (block) =>
                            block.enabled !== false && block.type === "hero_banner"
                    );

                const nextBanner = buildBannerFromBlock(heroBlock);

                if (nextBanner) {
                    setBanner(nextBanner);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load plenary hero banner:", error);
            }
        };

        void loadBanner();

        return () => controller.abort();
    }, []);

    const title = isKh ? banner.title.km : banner.title.en;
    const subtitle = isKh ? banner.subtitle.km : banner.subtitle.en;

    return (
        <main className="bg-white">
            <section className="mx-auto max-w-full overflow-hidden bg-white shadow-2xl">
                {/* Title */}
                <div className="mx-auto max-w-5xl px-6 pt-8 pb-6 text-center sm:px-8 md:px-8">
                    <h1
                        className={`
                            text-[#1f1f1f]
                            ${titleFontClass}
                        `}
                    >
                        {title}
                    </h1>

                    <p
                        className={`
                            mt-4 text-gray-600
                            ${subtitleFontClass}
                        `}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Image */}
                <div className="relative w-full shadow-lg">
                    <div className="relative h-[260px] sm:h-[400px] md:h-[550px] lg:h-[700px] xl:h-[820px]">
                        <Image
                            src={banner.imageUrl}
                            alt={title || "Plenary"}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Light overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-white/10" />
                </div>
            </section>
        </main>
    );
}