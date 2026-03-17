/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
const CACHE_KEY = "home-post-cache-v2";

export default function HeroBanner() {
    const { language } = useLanguage();

    const [data, setData] = useState<HomePostApi | null>(null);
    const [loading, setLoading] = useState(true);

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

    const bgImage = hero?.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

    const cta = hero?.ctas?.[0];
    const ctaLabel = cta?.label?.[langKey] || cta?.label?.en || cta?.label?.km || "";
    const ctaHref = cta?.href?.trim() ? cta.href : "#";
    const isExternal = ctaHref.startsWith("http");

    const statsItems =
        langKey === "km" && data?.bannerStats?.itemsKm?.length
            ? data.bannerStats.itemsKm
            : data?.bannerStats?.itemsEn ?? [];

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage || PLACEHOLDER_IMAGE_URL})` }}
            >
                <div className="absolute inset-0 bg-white/30" />
            </div>

            {/* Loading overlay */}
            {loading && !data && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" />
            )}

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

                {!title && loading && !data ? (
                    <div className="w-full max-w-3xl">
                    </div>
                ) : (
                    title && (
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 whitespace-pre-line leading-tight">
                            {title}
                        </h1>
                    )
                )}

                {description && (
                    <p className="text-base md:text-lg max-w-4xl text-white mb-10 whitespace-pre-line">
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
                            className="inline-block bg-blue-800 hover:bg-blue-900 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
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
                        // Loading skeleton
                        if (loading && !data) {
                            return (
                                <div key={idx} className="px-2">
                                    <div className="h-10 md:h-12 w-20 mx-auto rounded bg-white/20 animate-pulse" />
                                    <div className="mt-3 h-4 w-24 mx-auto rounded bg-white/20 animate-pulse" />
                                </div>
                            );
                        }

                        // Get raw value + label
                        const rawValue =
                            it?.value?.[langKey] ||
                            it?.value?.en ||
                            it?.value?.km ||
                            "";

                        const label =
                            it?.label?.[langKey] ||
                            it?.label?.en ||
                            it?.label?.km ||
                            "";

                        const formatNumber = (val: any) => {
                            if (!val) return "";

                            // Extract number part (e.g. "1000+" → "1000")
                            const match = String(val).match(/\d+/);
                            if (!match) return val;

                            const number = Number(match[0]);
                            const formatted = number.toLocaleString(
                                langKey === "km" ? "km-KH" : "en-US"
                            );

                            // Keep suffix like "+" or "K"
                            const suffix = String(val).replace(match[0], "");

                            return formatted + suffix;
                        };

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
        </div>
    );
}