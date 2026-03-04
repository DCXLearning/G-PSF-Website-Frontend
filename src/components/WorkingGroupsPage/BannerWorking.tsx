"use client";

import React, { useEffect, useState } from "react";
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
    type: string; // "hero_banner"
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

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return (primary || obj.en || obj.km || fallback).trim();
}

function cleanText(s?: string) {
    return (s || "").replace(/\n+/g, " ").trim();
}

export default function BannerWorkingGroups() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) ?? "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("/image/bannerworking.bmp");

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);

                // ✅ use your Next API route proxy
                const res = await fetch("/api/working-groups-page/section", {
                    cache: "no-store",
                    signal: controller.signal,
                });

                const json: ApiResponse = await res.json();

                const blocks = json?.data?.blocks ?? [];
                const hero = blocks.find((b) => b.type === "hero_banner");
                const post = hero?.posts?.[0];

                const content =
                    post?.content?.[apiLang] ?? post?.content?.en ?? post?.content?.km;

                const t = pickText(content?.title, apiLang, "");
                const d = cleanText(pickText(content?.description, apiLang, ""));
                const bg = content?.backgroundImages?.[0];

                if (t) setTitle(t);
                if (d) setSubtitle(d);
                if (bg) setImageUrl(bg);
            } catch (e: any) {
                if (e?.name !== "AbortError") {
                    // keep defaults
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [apiLang]);

    const defaultTitle =
        uiLang === "kh" ? "សន្ទនាដែលផ្តល់លទ្ធផល" : "Dialogue That Delivers Results";

    const defaultSubtitle =
        uiLang === "kh"
            ? "ក្រុមការងារ ១៦ ដែលភ្ជាប់រដ្ឋាភិបាល និងវិស័យធុរកិច្ច ដើម្បីអនុវត្តកែទម្រង់ដែលអាចប្រើបានជាក់ស្តែង។"
            : "Sixteen Working Groups bringing government and business together to deliver practical reforms.";

    return (
        <section className="bg-white py-5 md:py-13">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1
                        className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {(title || defaultTitle) as string}
                    </h1>

                    <p
                        className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {(subtitle || defaultSubtitle) as string}
                    </p>

                    {loading ? (
                        <p className="mt-3 text-sm text-gray-500">
                            {uiLang === "kh" ? "កំពុងទាញទិន្នន័យ..." : "Loading..."}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* FULL-WIDTH BANNER */}
            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={imageUrl}
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