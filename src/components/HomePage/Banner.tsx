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

                if (!res.ok) throw new Error("Failed to fetch");

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
                    console.error("HeroBanner error:", err);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        void loadData();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, []);

    const langKey: "en" | "km" = language === "kh" ? "km" : "en";

    const hero = data?.hero;

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
        <div className="relative flex min-h-[680px] flex-col overflow-hidden bg-gray-100 md:min-h-[500px] lg:min-h-[650px]">
            {/* Background Image */}
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-bottom bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/25" />
            </div>
            
            {/* Hero Content */}
            <div
                className={`relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-24 text-center md:pt-32 ${langKey === "km" ? "khmer-font" : ""
                    }`}
            >
                {subtitle && (
                    <p className="mb-5 whitespace-pre-line text-lg font-medium text-white md:text-5xl">
                        {subtitle}
                    </p>
                )}

                {description && (
                    <p className="mb-8 max-w-4xl whitespace-pre-line text-base text-white md:text-2xl">
                        {description}
                    </p>
                )}

                {!!ctaLabel && !loading && (
                    <div className="mt-4 flex justify-center">
                        {isExternal ? (
                            <a
                                href={ctaHref}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden"
                            >
                                {ctaLabel}
                            </a>
                        ) : (
                            <Link href={ctaHref} className="hidden">
                                {ctaLabel}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Section */}
            <div className="relative z-20 mt-auto px-4 pb-8">
                <div className="mx-auto max-w-6xl">
                    <div className="h-[2px] bg-white/80" />

                    <div className="py-6">
                        <div className="grid grid-cols-3 text-center text-white">
                            {(loading && !data ? Array.from({ length: 3 }) : statsItems.slice(0, 3)).map(
                                (it: any, idx) => {
                                    if (loading && !data) {
                                        return (
                                            <div key={idx} className="px-2">
                                                <div className="mx-auto h-10 w-20 animate-pulse rounded bg-white/20" />
                                                <div className="mx-auto mt-3 h-4 w-24 animate-pulse rounded bg-white/20" />
                                            </div>
                                        );
                                    }

                                    const rawValue =
                                        it?.value?.[langKey] || it?.value?.en || it?.value?.km || "";

                                    const label =
                                        it?.label?.[langKey] || it?.label?.en || it?.label?.km || "";

                                    const formatNumber = (val: any) => {
                                        if (!val) return "";

                                        const match = String(val).match(/\d+/);
                                        if (!match) return val;

                                        const number = Number(match[0]);
                                        const formatted = number.toLocaleString(
                                            langKey === "km" ? "km-KH" : "en-US"
                                        );

                                        const suffix = String(val).replace(match[0], "");
                                        return formatted + suffix;
                                    };

                                    return (
                                        <div key={idx} className="px-2">
                                            <div className="text-2xl font-bold md:text-4xl">
                                                {formatNumber(rawValue)}
                                            </div>
                                            <div className="mt-2 text-xs uppercase tracking-wider md:text-sm">
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