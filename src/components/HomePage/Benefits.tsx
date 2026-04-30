/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    slug?: string | null;
    title?: I18n;
    description?: I18n | null;
    coverImage?: string | null;
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
const FALLBACK_ICON = "/icon_home_page/Benefits1.svg";

const ICON_THEMES = [
    { bg: "from-[#FAFDFF] via-[#F3F9FF] to-[#E8F4FF]", shadow: "shadow-[#3B82C3]/15", ring: "ring-[#3B82C3]/10" },
    { bg: "from-[#FFFCF7] via-[#FFF7EC] to-[#FFEBD0]", shadow: "shadow-[#F59E0B]/15", ring: "ring-[#F59E0B]/10" },
    { bg: "from-[#FAFFFC] via-[#F3FFF8] to-[#E5FAEF]", shadow: "shadow-[#10B981]/15", ring: "ring-[#10B981]/10" },
    { bg: "from-[#FDFCFF] via-[#F8F1FF] to-[#F0E5FF]", shadow: "shadow-[#8B5CF6]/15", ring: "ring-[#8B5CF6]/10" },
    { bg: "from-[#FFFBFB] via-[#FFF3F3] to-[#FFE8E8]", shadow: "shadow-[#EF4444]/15", ring: "ring-[#EF4444]/10" },
    { bg: "from-[#FAFEFF] via-[#F1FDFF] to-[#E0FAFE]", shadow: "shadow-[#06B6D4]/15", ring: "ring-[#06B6D4]/10" },
    { bg: "from-[#FFFCF9] via-[#FFF5ED] to-[#FFE8D6]", shadow: "shadow-[#F97316]/15", ring: "ring-[#F97316]/10" },
    { bg: "from-[#FBFCFF] via-[#F4F6FF] to-[#E7EAFF]", shadow: "shadow-[#6366F1]/15", ring: "ring-[#6366F1]/10" },
    { bg: "from-[#FFFBFD] via-[#FFF3FA] to-[#FDE8F3]", shadow: "shadow-[#EC4899]/15", ring: "ring-[#EC4899]/10" },
    { bg: "from-[#FCFFF9] via-[#F6FFF2] to-[#EAFBE2]", shadow: "shadow-[#22C55E]/15", ring: "ring-[#22C55E]/10" },
];

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
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
        //
    }
}

function getImageSrc(src?: string | null) {
    if (!src || !src.trim()) return FALLBACK_ICON;
    return src;
}

type SafeBenefitImageProps = {
    src?: string | null;
    alt: string;
    index: number;
};

function SafeBenefitImage({ src, alt, index }: SafeBenefitImageProps) {
    const [imgSrc, setImgSrc] = useState(getImageSrc(src));
    const theme = ICON_THEMES[index % ICON_THEMES.length];

    useEffect(() => {
        setImgSrc(getImageSrc(src));
    }, [src]);

    return (
        <div
            className={`group relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b ${theme.bg} shadow-lg ${theme.shadow} ring-1 ${theme.ring} transition-all duration-300 hover:-translate-y-1 hover:scale-105`}
        >
            <img
                src={imgSrc}
                alt={alt || "benefit"}
                width={52}
                height={52}
                className="relative z-10 h-[52px] w-[52px] object-contain drop-shadow-md transition-all duration-300 group-hover:scale-110"
                onError={() => setImgSrc(FALLBACK_ICON)}
            />
        </div>
    );
}

type BenefitCardProps = {
    icon?: string | null;
    title: string;
    description: string;
    isKhmer: boolean;
    href: string;
    disabled?: boolean;
    index: number;
};

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    isKhmer,
    href,
    disabled,
    index,
}) => (
    <div
        className={`flex flex-col items-start gap-4 md:flex-row md:gap-10 ${
            disabled ? "pointer-events-none" : ""
        }`}
    >
        <div className="mt-6 flex-shrink-0 p-4 md:p-3">
            <SafeBenefitImage src={icon} alt={title || "benefit"} index={index} />
        </div>

        <div className="flex-1">
            <h3
                className={`mb-2 text-xl font-semibold text-gray-900 sm:text-2xl md:text-2xl ${
                    isKhmer ? "khmer-font" : ""
                }`}
            >
                {title}
            </h3>

            <p
                className={`mb-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg ${
                    isKhmer ? "khmer-font" : ""
                }`}
            >
                {description}
            </p>

            <Link
                href={href}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                className={`inline-flex rounded-full bg-[#1B1D4E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#03057f] sm:px-5 sm:text-base ${
                    isKhmer ? "khmer-font" : ""
                } ${disabled ? "opacity-60" : ""}`}
            >
                {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
            </Link>
        </div>
    </div>
);

function BenefitCardSkeleton({ isKhmer, index }: { isKhmer: boolean; index: number }) {
    const theme = ICON_THEMES[index % ICON_THEMES.length];

    return (
        <div className="flex animate-pulse flex-col items-start gap-4 md:flex-row md:gap-10">
            <div className="mt-6 flex-shrink-0 p-4 md:p-3">
                <div
                    className={`relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b ${theme.bg} shadow-lg ${theme.shadow} ring-1 ${theme.ring}`}
                >
                    <img
                        src={FALLBACK_ICON}
                        alt="benefit"
                        width={52}
                        height={52}
                        className="h-[52px] w-[52px] object-contain opacity-50"
                    />
                </div>
            </div>

            <div className="flex-1">
                <div className="mb-3 h-7 w-2/3 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                <div className="mb-2 h-4 w-5/6 rounded bg-slate-200" />
                <div className="mb-4 h-4 w-2/3 rounded bg-slate-200" />

                <div
                    className={`inline-flex rounded-full bg-[#1B1D4E] px-4 py-2 text-sm font-semibold text-white opacity-50 sm:px-5 sm:text-base ${
                        isKhmer ? "khmer-font" : ""
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

                const json: ApiResponse = await res.json();

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || `API error ${res.status}`);
                }

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
        <section className={`bg-white px-4 py-12 sm:px-8 md:px-16 md:py-16 lg:px-34 ${fontClass}`}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
                <div className="mb-32 sm:mb-25 md:mb-56">
                    <h2
                        className={`w-70 text-4xl font-bold leading-tight text-gray-900 md:text-5xl ${
                            isKhmer ? "khmer-font" : ""
                        }`}
                    >
                        {heading.h || (isKhmer ? "អត្ថប្រយោជន៍ G-PSF" : "G-PSF Benefit")}
                    </h2>

                    <div className="relative mt-6 sm:mt-8">
                        <div className="absolute left-0 top-0 mb-4 h-1 w-20 rounded-full bg-orange-500 sm:left-4 sm:w-24 md:left-22 md:w-72" />
                        <p
                            className={`absolute left-0 top-0 mt-6 text-sm leading-relaxed text-gray-700 sm:left-4 sm:text-base md:left-22 md:text-xl ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        >
                            {heading.d}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {showSkeleton ? (
                        Array.from({ length: limit }).map((_, idx) => (
                            <BenefitCardSkeleton key={idx} isKhmer={isKhmer} index={idx} />
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((p, idx) => (
                            <BenefitCard
                                key={p.id}
                                index={idx}
                                icon={p.coverImage}
                                title={pickText(p.title, uiLang) || "\u00A0"}
                                description={pickText(p.description ?? undefined, uiLang) || "\u00A0"}
                                isKhmer={isKhmer}
                                href={buildDetailHref(p)}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-slate-600">
                            {isKhmer ? "មិនមានទិន្នន័យ" : "No benefits found."}
                        </p>
                    )}

                    {showErrorOnly && <p className="text-sm text-red-600">Failed: {error}</p>}
                </div>
            </div>
        </section>
    );
}