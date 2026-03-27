"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    slug?: string | null;
    title?: I18n;
    description?: I18n | null;
    coverImage?: string | null;
    content?: unknown;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n | null;
    settings?: { limit?: number } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY = "benefits_block_cache";

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function iconFallback(idx: number) {
    const map = [
        "/icon_home_page/Benefits1.svg",
        "/icon_home_page/Benefits2.svg",
        "/icon_home_page/Benefits3.svg",
        "/icon_home_page/Benefits4.svg",
    ];
    return map[idx % map.length];
}

function pickIcon(post: ApiPost, idx: number) {
    return post.coverImage || iconFallback(idx);
}

function buildDetailHref(post: ApiPost): string {
    const slug = post.slug?.trim() || "";
    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }
    return `/new-update/view-detail?id=${post.id}`;
}

function readCache(): ApiBlock | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(block: ApiBlock | null) {
    if (!block) return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(block));
    } catch {
        // ignore
    }
}

type BenefitCardProps = {
    icon: string;
    title: string;
    description: string;
    isKhmer: boolean;
    href: string;
    disabled?: boolean;
};

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    isKhmer,
    href,
    disabled,
}) => (
    <div
        className={`flex flex-col md:flex-row items-start gap-4 md:gap-10 ${disabled ? "pointer-events-none" : ""
            }`}
    >
        <div className="p-4 md:p-3 mt-6 flex-shrink-0">
            <Image
                src={icon}
                alt={title || "benefit"}
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
            />
        </div>

        <div className="flex-1">
            <h3
                className={`text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 mb-2 ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {title}
            </h3>

            <p
                className={`text-gray-600 mb-4 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {description}
            </p>

            <Link
                href={href}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                className={`inline-flex px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full hover:bg-[#03057f] transition ${isKhmer ? "khmer-font" : ""
                    } ${disabled ? "opacity-60" : ""}`}
            >
                {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
            </Link>
        </div>
    </div>
);

function BenefitCardSkeleton({
    idx,
    isKhmer,
}: {
    idx: number;
    isKhmer: boolean;
}) {
    return (
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-10 animate-pulse">
            <div className="p-4 md:p-3 mt-6 flex-shrink-0">
                <Image
                    src={iconFallback(idx)}
                    alt="benefit"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain opacity-50"
                />
            </div>

            <div className="flex-1">
                <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-slate-200 rounded mb-4" />
                <div
                    className={`inline-flex px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full opacity-50 ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
                </div>
            </div>
        </div>
    );
}

export default function Benefits() {
    const { language, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const isKhmer = uiLang === "kh";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached) {
            setBlock(cached);
            setLoading(false);
        }

        let alive = true;

        async function load() {
            try {
                setError(null);

                const res = await fetch("/api/home-page/benefit", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                const blocks = json?.data?.blocks || [];

                const picked =
                    blocks.find(
                        (b) =>
                            b?.enabled !== false &&
                            b?.type === "post_list" &&
                            (b?.id === 2 || b?.title?.en === "G-PSF Benefit")
                    ) || null;

                if (!alive) return;

                if (picked) {
                    setBlock(picked);
                    writeCache(picked);
                }
            } catch (err) {
                if (!alive) return;
                const message = err instanceof Error ? err.message : "Fetch failed";
                setError(message);
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, []);

    const limit = block?.settings?.limit ?? 4;

    const posts = useMemo(() => {
        const p = block?.posts || [];
        return p.slice(0, limit);
    }, [block, limit]);

    const heading = useMemo(() => {
        return {
            h: pickText(block?.title, uiLang),
            d: pickText(block?.description ?? undefined, uiLang),
        };
    }, [block, uiLang]);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    return (
        <section
            className={`bg-white px-4 sm:px-8 md:px-16 lg:px-34 py-12 md:py-16 ${fontClass}`}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                <div className="mb-32 sm:mb-25 md:mb-56">
                    <h2
                        className={`text-3xl w-80 sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-tight ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {heading.h || (isKhmer ? "អត្ថប្រយោជន៍ G-PSF" : "G-PSF Benefit")}
                    </h2>

                    <div className="mt-6 sm:mt-8 relative">
                        <div className="absolute top-0 left-0 sm:left-4 md:left-22 w-20 sm:w-24 md:w-72 h-1 bg-orange-500 rounded-full mb-4" />
                        <p
                            className={`absolute top-0 left-0 sm:left-4 md:left-22 text-gray-700 text-sm sm:text-base md:text-xl leading-relaxed mt-6 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {heading.d}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {showSkeleton ? (
                        Array.from({ length: limit }).map((_, idx) => (
                            <BenefitCardSkeleton key={idx} idx={idx} isKhmer={isKhmer} />
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((p, idx) => (
                            <BenefitCard
                                key={p.id}
                                icon={pickIcon(p, idx)}
                                title={pickText(p.title, uiLang) || "\u00A0"}
                                description={pickText(p.description ?? undefined, uiLang) || "\u00A0"}
                                isKhmer={isKhmer}
                                href={buildDetailHref(p)}
                            />
                        ))
                    ) : (
                        <p className="text-slate-600 text-sm">
                            {isKhmer ? "មិនមានទិន្នន័យ" : "No benefits found."}
                        </p>
                    )}

                    {showErrorOnly && <p className="text-red-600 text-sm">Failed: {error}</p>}
                </div>
            </div>
        </section>
    );
}