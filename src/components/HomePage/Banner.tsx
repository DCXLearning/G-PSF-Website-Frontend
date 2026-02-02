"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const PLACEHOLDER_IMAGE_URL = "/image/Banner.bmp";

type I18nText = { en?: string; km?: string };

type Banner = {
    id: number;
    slug: string;

    title: I18nText;
    subtitle: I18nText;
    description: I18nText;

    background?: string | null;
    backgroundImages?: string[];

    ctas?: Array<{
        href: string;
        label: I18nText;
    }>;
};

export default function HeroBanner() {
    const { language } = useLanguage(); // "en" | "kh"
    const [banner, setBanner] = useState<Banner | null>(null);

    // ✅ Bottom stats data (like screenshot)
    const stats = [
        { value: "1,200", labelEn: "TOTAL MEMBERS", labelKm: "សមាជិកសរុប" },
        { value: "90%", labelEn: "RESOLUTION RATE", labelKm: "អត្រាដោះស្រាយ" },
        { value: "63", labelEn: "POLICY REFORMS", labelKm: "កំណែទម្រង់គោលនយោបាយ" },
    ];

    useEffect(() => {
        fetch("/api/home-post")
            .then((res) => res.json())
            .then(setBanner)
            .catch(console.error);
    }, []);

    if (!banner) return null;

    // ✅ map LanguageContext "kh" -> API "km"
    const langKey: "en" | "km" = language === "kh" ? "km" : "en";

    // ✅ Text
    const title = banner.title?.[langKey] ?? banner.title?.en ?? "";
    const subtitle = banner.subtitle?.[langKey] ?? banner.subtitle?.en ?? "";
    const description = banner.description?.[langKey] ?? banner.description?.en ?? "";

    // ✅ Background (support both normalized "background" OR raw "backgroundImages")
    const bgImage = banner.background || banner.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

    // ✅ CTA Button (first item)
    const cta = banner.ctas?.[0];
    const ctaLabel = cta?.label?.[langKey] ?? cta?.label?.en ?? "";
    const ctaHref = cta?.href && cta.href.trim() !== "" ? cta.href : "#";

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-gray-100">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div
                className={`relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-56 max-w-5xl w-full ${langKey === "km" ? "khmer-font" : ""
                    }`}
            >
                {subtitle && (
                    <p className="text-lg md:text-3xl text-white mb-8 mt-14 whitespace-pre-line">
                        {subtitle}
                    </p>
                )}

                {title && (
                    <h1
                        className="
                            text-3xl md:text-5xl font-bold text-white mb-8 whitespace-pre-line
                            w-full
                            max-w-[22rem] sm:max-w-[30rem] md:max-w-[44rem] lg:max-w-[28rem]
                            leading-tight md:leading-snug
                            px-2
    "
                    >
                        {title}
                    </h1>
                )}


                {description && (
                    <p className="text-base md:text-lg w-full max-w-[22rem] sm:max-w-[30rem] md:max-w-[44rem] lg:max-w-[90rem] text-white mb-10 whitespace-pre-line">
                        {description}
                    </p>
                )}

                {/* CTA Button */}
                {ctaLabel && (
                    <a
                        href={ctaHref}
                        className="inline-block bg-blue-900 hover:bg-blue-800 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
                    >
                        {ctaLabel}
                    </a>
                )}
            </div>

            {/* ===== Bottom Stats Bar (like screenshot) ===== */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
                <div className="max-w-6xl mx-auto">
                    {/* Top white line */}
                    <div className="h-[2px] bg-white/80" />

                    <div className="py-5">
                        <div className="grid grid-cols-3 text-center text-white">
                            {stats.map((s, idx) => (
                                <div key={idx} className="px-2">
                                    <div className="text-2xl md:text-4xl font-extrabold tracking-wide">
                                        {s.value}
                                    </div>
                                    <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/90">
                                        {langKey === "km" ? s.labelKm : s.labelEn}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom white line */}
                    {/* <div className="h-[2px] bg-white/80" /> */}
                </div>
            </div>
        </div>
    );
}
