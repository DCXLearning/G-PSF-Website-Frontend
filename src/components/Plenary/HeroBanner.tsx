"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

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

    if (!content) return null;

    return {
        imageUrl: content.backgroundImages?.[0] || FALLBACK_BANNER.imageUrl,
        title: pickText(content.title, FALLBACK_BANNER.title),
        subtitle: pickText(content.subtitle, FALLBACK_BANNER.subtitle),
    };
}

export default function HeroBanner() {
    const { language } = useLanguage();
    const [banner, setBanner] = useState<HeroBannerData>(FALLBACK_BANNER);

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

                if (!response.ok) return;

                const result = await response.json();
                const blocks = Array.isArray(result?.data?.blocks)
                    ? (result.data.blocks as HeroBannerBlock[])
                    : [];

                // Use the CMS hero banner when it exists, otherwise keep the old fallback.
                const heroBlock =
                    blocks.find((block) => block.enabled !== false && block.id === 50) ||
                    blocks.find((block) => block.enabled !== false && block.type === "hero_banner");
                const nextBanner = buildBannerFromBlock(heroBlock);

                if (nextBanner) {
                    setBanner(nextBanner);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("Failed to load plenary hero banner:", error);
            }
        };

        // Load the CMS banner after mount without changing the current layout structure.
        void loadBanner();

        return () => controller.abort();
    }, []);

    const title = language === "kh" ? banner.title.km : banner.title.en;
    const subtitle = language === "kh" ? banner.subtitle.km : banner.subtitle.en;

    return (
        <main className="bg-white">
            <section className="mx-auto max-w-[1500px] overflow-hidden bg-white shadow-2xl">
                {/* Title */}
                <div className="px-6 pt-10 pb-6 text-center sm:px-10 md:px-16">
                    <h1
                        className={`font-extrabold tracking-tight text-[#1f1f1f] 
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                        ${language === "kh" ? "khmer-font leading-relaxed" : ""}`}
                    >
                        {title}
                    </h1>

                    <p
                        className={`mt-4 text-gray-600 
                        text-sm sm:text-base md:text-xl lg:text-2xl
                        ${language === "kh" ? "khmer-font leading-relaxed" : ""}`}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Image */}
                <div className="relative w-full shadow-lg">
                    <div className="relative h-[260px] sm:h-[400px] md:h-[550px] lg:h-[700px] xl:h-[820px]">
                        <Image
                            src={banner.imageUrl}
                            alt="Plenary"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Light overlay */}
                    <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                </div>
            </section>
        </main>
    );
}
