"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type Slide = {
    id: number;
    title: string;
    backgroundImage: string;
    ctaText: string;
    href?: string;
    bgPos?: string;
};

export default function WorkingGroup() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";

    // ✅ stable className (NO multiline template string -> no hydration mismatch)
    const sectionClass =
        "relative w-full overflow-hidden h-[55vh] min-h-[360px] sm:h-[60vh] sm:min-h-[420px] lg:h-[70vh] lg:min-h-[520px]";

    // ✅ build slides based on language
    const slides = useMemo<Slide[]>(() => {
        const content = {
            en: {
                title: "Explore the Working Groups driving reform",
                cta: "View Working Groups",
            },
            kh: {
                title: "ស្វែងយល់អំពីក្រុមការងារ (WGs) ដែលជួយជំរុញការកែទម្រង់",
                cta: "មើលក្រុមការងារ",
            },
        }[lang];

        return [
            {
                id: 1,
                title: content.title,
                backgroundImage: "/image/Banner-g.bmp",
                ctaText: content.cta,
                href: "/working-groups",
            },
            {
                id: 2,
                title: content.title,
                backgroundImage: "/image/Banner.bmp",
                ctaText: content.cta,
                href: "/working-groups",
            },
            {
                id: 3,
                title: content.title,
                backgroundImage: "/image/BannerAbout.bmp",
                ctaText: content.cta,
                href: "/working-groups",
            },
        ];
    }, [lang]);

    const [current, setCurrent] = useState(0);

    // ✅ keep current index valid when language changes (slides re-memoized)
    useEffect(() => {
        // ======Not=====
        // setCurrent(0); 
    }, [lang]);

    // Auto-advance
    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 3800);

        return () => window.clearInterval(timer);
    }, [slides.length]);

    return (
        <section className={sectionClass}>
            {/* Slides */}
            <div className="absolute inset-0">
                {slides.map((s, idx) => {
                    const active = idx === current;

                    return (
                        <div
                            key={s.id}
                            aria-hidden={!active}
                            className={[
                                "absolute inset-0 transition-opacity duration-700",
                                active ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            style={{
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${s.backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: s.bgPos ?? "center",
                            }}
                        >
                            <div className="mx-auto min-h-screen flex items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8 pb-[130px]">
                                <div className="max-w-5xl">
                                    <h1
                                        className={`text-3xl font-bold tracking-tight text-white sm:text-5xl ${lang === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        {s.title}
                                    </h1>

                                    <div className="mt-8">
                                        {s.href ? (
                                            <Link
                                                href={s.href}
                                                className={`inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 ${lang === "kh" ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {s.ctaText}
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 ${lang === "kh" ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {s.ctaText}
                                            </button>
                                        )}
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
