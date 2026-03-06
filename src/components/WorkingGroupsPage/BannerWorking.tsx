"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type HeroContent = {
    ctas?: any[];
    title?: I18n;
    subtitle?: I18n;
    description?: I18n;
    backgroundImages?: string[];
};

type Block = {
    id: number;
    type: string;
    posts?: Array<{
        id: number;
        content?: {
            en?: HeroContent;
            km?: HeroContent;
        };
    }>;
};

type ApiResponse = {
    success: boolean;
    data?: {
        blocks?: Block[];
    };
};

const DEFAULT_IMAGE = "/image/bannerworking.bmp";
const CACHE_KEY = "wg_banner_cache";

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return (primary || obj.en || obj.km || fallback).trim();
}

function cleanText(s?: string) {
    return (s || "").replace(/\n+/g, " ").trim();
}

function readCache(): { title: string; subtitle: string; imageUrl: string } | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            title: parsed?.title || "",
            subtitle: parsed?.subtitle || "",
            imageUrl: parsed?.imageUrl || DEFAULT_IMAGE,
        };
    } catch {
        return null;
    }
}

function writeCache(data: { title: string; subtitle: string; imageUrl: string }) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore cache errors
    }
}

function BannerSkeleton() {
    return (
        <section className="bg-white py-5 md:py-13 animate-pulse">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="h-10 sm:h-14 w-3/4 max-w-2xl mx-auto rounded" />
                    <div className="mt-4 h-6 w-5/6 max-w-2xl mx-auto rounded" />
                </div>
            </div>

            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px] bg-slate-200" />
            </div>
        </section>
    );
}

export default function BannerWorkingGroups() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) ?? "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const defaultTitle =
        uiLang === "kh"
            ? "សន្ទនាដែលផ្តល់លទ្ធផល"
            : "Dialogue That Delivers Results";

    const defaultSubtitle =
        uiLang === "kh"
            ? "ក្រុមការងារ ១៦ ដែលភ្ជាប់រដ្ឋាភិបាល និងវិស័យធុរកិច្ច ដើម្បីអនុវត្តកែទម្រង់ដែលអាចប្រើបានជាក់ស្តែង។"
            : "Sixteen Working Groups bringing government and business together to deliver practical reforms.";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached) {
            setTitle(cached.title);
            setSubtitle(cached.subtitle);
            setImageUrl(cached.imageUrl || DEFAULT_IMAGE);
            setLoading(false);
        }

        const controller = new AbortController();
        let alive = true;

        async function load() {
            try {
                const res = await fetch("/api/working-groups-page/section", {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json: ApiResponse = await res.json();
                if (!alive) return;

                const blocks = json?.data?.blocks ?? [];
                const hero = blocks.find((b) => b.type === "hero_banner");
                const post = hero?.posts?.[0];
                const content =
                    post?.content?.[apiLang] ?? post?.content?.en ?? post?.content?.km;

                const nextTitle = pickText(content?.title, apiLang, "");
                const nextSubtitle = cleanText(
                    pickText(content?.description, apiLang, "")
                );
                const nextImage = content?.backgroundImages?.[0] || DEFAULT_IMAGE;

                if (nextTitle) setTitle(nextTitle);
                if (nextSubtitle) setSubtitle(nextSubtitle);
                if (nextImage) setImageUrl(nextImage);

                writeCache({
                    title: nextTitle || title || "",
                    subtitle: nextSubtitle || subtitle || "",
                    imageUrl: nextImage || imageUrl || DEFAULT_IMAGE,
                });
            } catch (e: any) {
                if (e?.name !== "AbortError") {
                    console.error("Failed to fetch banner:", e);
                }
                // keep old cached/default content
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
            controller.abort();
        };
    }, [apiLang]);

    const finalTitle = useMemo(() => title || defaultTitle, [title, defaultTitle]);
    const finalSubtitle = useMemo(
        () => subtitle || defaultSubtitle,
        [subtitle, defaultSubtitle]
    );

    const showSkeleton = !mounted && !title && !subtitle;

    if (showSkeleton) {
        return <BannerSkeleton />;
    }

    return (
        <section className="bg-white py-5 md:py-13">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1
                        className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {finalTitle}
                    </h1>

                    <p
                        className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {finalSubtitle}
                    </p>
                </div>
            </div>

            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={imageUrl || DEFAULT_IMAGE}
                        alt="WG banner"
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
}