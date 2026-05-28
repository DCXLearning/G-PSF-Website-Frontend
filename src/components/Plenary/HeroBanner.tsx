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
    imageUrl: "",
    title: {
        en: "The Government-Private Sector Forum Plenary",
        km: "កិច្ចប្រជុំពេញអង្គវេទិការាជរដ្ឋាភិបាល-ឯកជន",
    },
    subtitle: {
        en: "Cambodia’s Highest Platform for Public-Private Solutions",
        km: "វេទិកាខ្ពស់បំផុតសម្រាប់ដំណោះស្រាយរវាងរដ្ឋ និងឯកជននៅកម្ពុជា",
    },
};

function pickImage(images: string[] | undefined) {
    return images?.find((image) => image?.trim())?.trim() || "";
}

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

    const enContent = post?.content?.en;
    const kmContent = post?.content?.km;
    const content = enContent || kmContent;

    if (!content) {
        return null;
    }

    return {
        imageUrl:
            pickImage(enContent?.backgroundImages) ||
            pickImage(kmContent?.backgroundImages),
        title: pickText(content.title, FALLBACK_BANNER.title),
        subtitle: pickText(content.subtitle, FALLBACK_BANNER.subtitle),
    };
}

function HeroBannerSkeleton() {
    return (
        <main className="bg-white">
            <section className="mx-auto max-w-full overflow-hidden bg-white shadow-2xl">
                <div className="mx-auto max-w-5xl animate-pulse px-6 pt-8 pb-6 text-center sm:px-8 md:px-8">
                    <div className="mx-auto h-10 w-4/5 max-w-3xl rounded bg-slate-200 md:h-12" />
                    <div className="mx-auto mt-4 h-5 w-3/5 max-w-2xl rounded bg-slate-200" />
                </div>

                <div className="h-[260px] w-full animate-pulse bg-slate-200 sm:h-[400px] md:h-[550px] lg:h-[700px] xl:h-[820px]" />
            </section>
        </main>
    );
}

export default function HeroBanner() {
    const { language } = useLanguage();

    const currentLang = normalizeLang(language);
    const isKh = currentLang === "kh";

    const [banner, setBanner] = useState<HeroBannerData>(FALLBACK_BANNER);
    const [loading, setLoading] = useState(true);

    const titleFontClass = isKh
        ? "title-km khmer-font font-bold"
        : "title-en airbnb-font font-extrabold";

    const subtitleFontClass = isKh
        ? "body-km khmer-font"
        : "body-en airbnb-font";

    useEffect(() => {
        let alive = true;
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

                if (alive && nextBanner) {
                    setBanner(nextBanner);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load plenary hero banner:", error);
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        };

        void loadBanner();

        return () => {
            alive = false;
            controller.abort();
        };
    }, []);

    const title = isKh ? banner.title.km : banner.title.en;
    const subtitle = isKh ? banner.subtitle.km : banner.subtitle.en;

    if (loading) {
        return <HeroBannerSkeleton />;
    }

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

                {banner.imageUrl ? (
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
                ) : null}
            </section>
        </main>
    );
}
