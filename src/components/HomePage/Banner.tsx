"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

type StatItemApi = {
    label?: I18nText;
    value?: I18nText;
};

type HomePostApi = {
    hero: {
        title: I18nText;
        subtitle: I18nText;
        description: I18nText;
        backgroundImages: string[];
        ctas: Array<{ href: string; label: I18nText }>;
    };
    bannerStats: {
        itemsEn: StatItemApi[];
        itemsKm: StatItemApi[];
    };
};

const PLACEHOLDER_IMAGE_URL = "/image/Banner.bmp";

export default function HeroBanner() {
    const { language } = useLanguage(); // "en" | "kh"
    const [data, setData] = useState<HomePostApi | null>(null);

    useEffect(() => {
        fetch("/api/home-post")
            .then((r) => r.json())
            .then((j) => setData(j?.data ?? null)) // ✅ IMPORTANT FIX
            .catch(console.error);
    }, []);

    if (!data) return null;

    const langKey: "en" | "km" = language === "kh" ? "km" : "en";

    const hero = data.hero;

    const title = hero.title?.[langKey] ?? hero.title?.en ?? "";
    const subtitle = hero.subtitle?.[langKey] ?? hero.subtitle?.en ?? "";
    const description = hero.description?.[langKey] ?? hero.description?.en ?? "";

    const bgImage = hero.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

    const cta = hero.ctas?.[0];
    const ctaLabel = cta?.label?.[langKey] ?? cta?.label?.en ?? "";
    const ctaHref = cta?.href?.trim() ? cta.href : "#";

    // ✅ pick stats items (fallback to EN if KM empty)
    const statsItems =
        langKey === "km" && data.bannerStats.itemsKm?.length
            ? data.bannerStats.itemsKm
            : data.bannerStats.itemsEn;

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div
                className={`relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-56 max-w-5xl w-full mx-auto ${langKey === "km" ? "khmer-font" : ""
                    }`}
            >
                {subtitle && (
                    <p className="text-lg md:text-3xl text-white mb-8 mt-14 whitespace-pre-line">
                        {subtitle}
                    </p>
                )}

                {title && (
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 whitespace-pre-line leading-tight">
                        {title}
                    </h1>
                )}

                {description && (
                    <p className="text-base md:text-lg w-full max-w-4xl text-white mb-10 whitespace-pre-line">
                        {description}
                    </p>
                )}

                {/* Button */}
                {ctaLabel && (
                    <a
                        href={ctaHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-blue-900 hover:bg-blue-800 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
                    >
                        {ctaLabel}
                    </a>
                )}
            </div>

            {/* ✅ Bottom Stats Bar from API */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
                <div className="max-w-6xl mx-auto">
                    <div className="h-[2px] bg-white/80" />

                    <div className="py-5">
                        <div className="grid grid-cols-3 text-center text-white">
                            {statsItems.slice(0, 3).map((it, idx) => {
                                const value = it?.value?.[langKey] ?? it?.value?.en ?? "";
                                const label = it?.label?.[langKey] ?? it?.label?.en ?? "";
                                return (
                                    <div key={idx} className="px-2">
                                        <div className="text-2xl md:text-4xl font-extrabold tracking-wide">
                                            {value}
                                        </div>
                                        <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/90">
                                            {label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* bottom line optional */}
                    {/* <div className="h-[2px] bg-white/80" /> */}
                </div>
            </div>
        </div>
    );
}