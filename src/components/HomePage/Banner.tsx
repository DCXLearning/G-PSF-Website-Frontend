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
const CACHE_KEY = "home-post-cache";

export default function HeroBanner() {
    const { language } = useLanguage();

    const [data, setData] = useState<HomePostApi | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const loadData = async () => {
            try {
                // 1. read cache first
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (!ignore) {
                        setData(parsed);
                        setLoading(false);
                    }
                    return;
                }

                // 2. fetch only if no cache
                setLoading(true);

                const res = await fetch("/api/home-page/home-post", {
                    cache: "no-store",
                    signal: controller.signal,
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
                    console.error(err);
                    if (!ignore) setData(null);
                }
            } finally {
                if (!ignore) setLoading(false);
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
    const title = hero?.title?.[langKey] ?? hero?.title?.en ?? "";
    const subtitle = hero?.subtitle?.[langKey] ?? hero?.subtitle?.en ?? "";
    const description = hero?.description?.[langKey] ?? hero?.description?.en ?? "";

    const bgImage = hero?.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

    const cta = hero?.ctas?.[0];
    const ctaLabel = cta?.label?.[langKey] ?? cta?.label?.en ?? "";
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
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Loading overlay */}
            {loading && !data && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                </div>
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
                        <div className="h-10 md:h-14 w-4/5 mx-auto rounded-lg animate-pulse" />
                        <div className="mt-4 h-10 md:h-14 w-3/5 mx-auto rounded-lg animate-pulse" />
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
                            className="inline-block bg-blue-900 hover:bg-blue-800 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
                        >
                            {ctaLabel}
                        </a>
                    ) : (
                        <Link
                            href={ctaHref}
                            className="inline-block bg-blue-900 hover:bg-blue-800 font-semibold text-white px-8 py-4 rounded-3xl shadow-xl transition"
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

                                    const value = it?.value?.[langKey] ?? it?.value?.en ?? "";
                                    const label = it?.label?.[langKey] ?? it?.label?.en ?? "";

                                    return (
                                        <div key={idx} className="px-2">
                                            <div className="text-2xl md:text-4xl font-extrabold">{value}</div>
                                            <div className="mt-2 text-xs uppercase tracking-wider">{label}</div>
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