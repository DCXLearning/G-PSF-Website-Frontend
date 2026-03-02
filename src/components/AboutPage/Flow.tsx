//  src/components/About/Flow.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18n = { en?: string; km?: string };

type Block = {
    id: number;
    type: string; // "post_list"
    title?: I18n; // "Reform Flow"
    posts?: Array<{
        id: number;
        title?: I18n; // "The G-PSF Escalatory Model"
        coverImage?: string; // image URL
    }>;
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: Block[];
    };
};

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

export default function Flow() {
    const { language } = useLanguage();
    const uiLang: UiLang = (language as UiLang) || "en";
    const apiLang: ApiLang = uiLang === "kh" ? "km" : "en";

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);

                // ✅ your endpoint
                const res = await fetch("/api-about/about", { cache: "no-store" });
                const json: ApiResponse = await res.json();

                if (!alive) return;

                if (!res.ok || !json?.success) {
                    setBlocks([]);
                    return;
                }

                setBlocks(json?.data?.blocks || []);
            } catch {
                if (!alive) return;
                setBlocks([]);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, []);

    const view = useMemo(() => {
        // ✅ Find Reform Flow block (post_list id 16 in your example)
        const reform = blocks.find(
            (b) => b.type === "post_list" && (b.title?.en || "").toLowerCase().includes("reform")
        );

        const subtitle = pickText(reform?.title, apiLang, uiLang === "kh" ? "លំហូរកំណែទម្រង់" : "Reform Flow");
        const post = reform?.posts?.[0];

        const title = pickText(post?.title, apiLang, uiLang === "kh" ? "គំរូលំដាប់កម្រិត G-PSF" : "The G-PSF Escalatory Model");
        const imageUrl = post?.coverImage || "/image/s.png";

        return { subtitle, title, imageUrl };
    }, [blocks, apiLang, uiLang]);

    return (
        <section className="bg-white py-5 md:py-7">
            {/* Title + subtitle */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <p className={`mt-3 max-w-2xl mx-auto text-xl font-bold sm:text-3xl text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""}`}>
                        {loading ? (uiLang === "kh" ? "កំពុងផ្ទុក..." : "Loading...") : view.subtitle}
                    </p>

                    <h1 className={`text-3xl sm:text-5xl font-bold text-gray-900 ${uiLang === "kh" ? "khmer-font" : ""}`}>
                        {loading ? "" : view.title}
                    </h1>
                </div>
            </div>

            {/* FULL-WIDTH IMAGE */}
            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={view.imageUrl}
                        alt={view.title || "Reform Flow"}
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
}