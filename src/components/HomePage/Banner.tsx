/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const CACHE_KEY = "home-post-cache-v2";
const AUTO_SLIDE_MS = 5000;

export default function HeroBanner() {
    const { language } = useLanguage();

    const [data, setData] = useState<HomePostApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const loadData = async () => {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);

                if (cached && !ignore) {
                    try {
                        const parsed = JSON.parse(cached);
                        setData(parsed);
                        setLoading(false);
                    } catch {
                        sessionStorage.removeItem(CACHE_KEY);
                    }
                } else {
                    setLoading(true);
                }

                const res = await fetch(`/api/home-page/home-post?_t=${Date.now()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch home post");
                }

                const json = await res.json();
                const newData = json?.data ?? null;

                if (!ignore) {
                    setData(newData);
                    if (newData) {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                    }
                }
            } catch (err: any) {
                if (err?.name !== "AbortError") {
                    console.error("HeroBanner fetch error:", err);
                    if (!ignore && !data) {
                        setData(null);
                    }
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, []);

    const langKey: "en" | "km" = language === "kh" ? "km" : "en";

    const hero = data?.hero;
    const title = hero?.title?.[langKey] || hero?.title?.en || hero?.title?.km || "";
    const subtitle =
        hero?.subtitle?.[langKey] || hero?.subtitle?.en || hero?.subtitle?.km || "";
    const description =
        hero?.description?.[langKey] ||
        hero?.description?.en ||
        hero?.description?.km ||
        "";

    const slides = useMemo(() => {
        const imgs = Array.isArray(hero?.backgroundImages)
            ? hero.backgroundImages.filter((img) => typeof img === "string" && img.trim())
            : [];

        return imgs;
    }, [hero?.backgroundImages]);

    useEffect(() => {
        setCurrentSlide(0);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, AUTO_SLIDE_MS);

        return () => clearInterval(timer);
    }, [slides]);

    const goPrev = () => {
        if (slides.length <= 1) return;
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goNext = () => {
        if (slides.length <= 1) return;
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const cta = hero?.ctas?.[0];
    const ctaLabel = cta?.label?.[langKey] || cta?.label?.en || cta?.label?.km || "";
    const ctaHref = cta?.href?.trim() ? cta.href : "#";
    const isExternal = ctaHref.startsWith("http");

    const statsItems =
        langKey === "km" && data?.bannerStats?.itemsKm?.length
            ? data.bannerStats.itemsKm
            : data?.bannerStats?.itemsEn ?? [];

    const formatNumber = (val: any) => {
        if (!val) return "";

        const match = String(val).match(/\d+/);
        if (!match) return String(val);

        const number = Number(match[0]);
        const formatted = number.toLocaleString(langKey === "km" ? "km-KH" : "en-US");
        const suffix = String(val).replace(match[0], "");

        return formatted + suffix;
    };

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Background slider */}
            <div className="absolute inset-0">
                {slides.length > 0 ? (
                    slides.map((img, index) => (
                        <div
                            key={`${img}-${index}`}
                            className={`absolute inset-0 bg-cover bg-bottom bg-no-repeat transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
                                }`}
                            style={{
                                backgroundImage: `url(${img})`,
                            }}
                        />
                    ))
                ) : (
                    <div className="absolute inset-0 bg-gray-100" />
                )}

                <div className="absolute inset-0 bg-black/35" />
            </div>

            {/* Loading overlay */}
            {loading && !data && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" />
            )}

            {/* Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous slide"
                        className="absolute cursor-pointer left-3 md:left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next slide"
                        className="absolute cursor-pointer right-3 md:right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}

            {/* Content */}
            <div
                className={`relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-95 max-w-5xl w-full min-h-screen mx-auto ${langKey === "km" ? "khmer-font" : ""
                    }`}
            >
                {subtitle && (
                    <p className="text-xl md:text-5xl font-medium text-white mb-8 mt-2 whitespace-pre-line">
                        {subtitle}
                    </p>
                )}

                {/* {title && (
                    <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 whitespace-pre-line leading-tight">
                        {title}
                    </h1>
                    )} */}

                {description && (
                    <p className="text-base md:text-2xl max-w-4xl text-white mb-8 whitespace-pre-line">
                        {description}
                    </p>
                )}

                {!!ctaLabel &&
                    !loading &&
                    (isExternal ? (
                        <a
                            href={ctaHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-blue-800 hover:bg-blue-900 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
                        >
                            {ctaLabel}
                        </a>
                    ) : (
                        <Link
                            href={ctaHref}
                            className="inline-block bg-blue-800 hover:bg-blue-900 font-semibold text-white px-5 py-3 rounded-3xl shadow-xl transition"
                        >
                            {ctaLabel}
                        </Link>
                    ))}
            </div>

            {/* Stats */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
                <div className="max-w-6xl mx-auto">
                    <div className="h-[2px] bg-white/80" />

                    <div className="py-5">
                        <div className="grid grid-cols-3 text-center text-white">
                            {(loading && !data ? Array.from({ length: 3 }) : statsItems.slice(0, 3)).map(
                                (it: any, idx) => {
                                    if (loading && !data) {
                                        return (
                                            <div key={idx} className="px-2">
                                                <div className="h-10 md:h-12 w-20 mx-auto rounded bg-white/20 animate-pulse" />
                                                <div className="mt-3 h-4 w-24 mx-auto rounded bg-white/20 animate-pulse" />
                                            </div>
                                        );
                                    }

                                    const rawValue =
                                        it?.value?.[langKey] || it?.value?.en || it?.value?.km || "";

                                    const label =
                                        it?.label?.[langKey] || it?.label?.en || it?.label?.km || "";

                                    return (
                                        <div key={idx} className="px-2">
                                            <div className="text-2xl md:text-4xl font-bold">
                                                {formatNumber(rawValue)}
                                            </div>
                                            <div className="mt-2 text-xs md:text-sm uppercase tracking-wider">
                                                {label}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}