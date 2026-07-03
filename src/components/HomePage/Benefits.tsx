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

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function renderHeadingText(text: string) {
    const normalizedText = text.replace(/\s+/g, " ").trim();
    const match = normalizedText.match(/^(.*?)(\s*\([^)]*\))$/);

    if (!match) return normalizedText;

    const title = match[1].trim();
    const shortName = match[2].trim();

    return (
        <>
            {title} <span className="inline-block">{shortName}</span>
        </>
    );
}

function buildDetailHref(post: ApiPost): string {
    const slug = post.slug?.trim() || "";

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function getImageSrc(src?: string | null) {
    if (!src || !src.trim()) return FALLBACK_ICON;
    return src;
}

function SafeBenefitImage({ src, alt }: { src?: string | null; alt: string }) {
    const [imgSrc, setImgSrc] = useState(getImageSrc(src));

    useEffect(() => {
        setImgSrc(getImageSrc(src));
    }, [src]);

    return (
        <div className="group relative flex h-22 w-22 items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <img
                src={imgSrc}
                alt={alt || "benefit"}
                width={52}
                height={52}
                className="relative z-10 h-[98px] w-[98px] object-contain transition-all duration-300 group-hover:scale-110"
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
};

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    isKhmer,
    href,
    disabled,
}) => {
    const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";
    const buttonFontClass = isKhmer ? "khmer-font" : "airbnb-font";

    return (
        <div
            className={`flex flex-col items-start gap-4 md:flex-row md:gap-10 ${
                disabled ? "pointer-events-none" : ""
            }`}
        >
            <div className="mt-6 flex-shrink-0 p-4 md:p-3">
                <SafeBenefitImage src={icon} alt={title || "benefit"} />
            </div>

            <div className="flex-1">
                <h3
                    className={`
                        mb-2 text-gray-900
                        !whitespace-normal !overflow-visible !text-clip
                        ${mainTitleFontClass}
                    `}
                >
                    {title}
                </h3>

                <p
                    className={`
                        mb-4 whitespace-pre-line text-gray-600
                        text-justify [text-align-last:left]
                        leading-[1.7]
                        ${bodyFontClass}
                    `}
                >
                    {description}
                </p>

                <Link
                    href={href}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    className={`
                        inline-flex rounded-full bg-[#1B1D4E] px-4 py-2
                        font-semibold text-white transition hover:bg-[#03057f] sm:px-5
                        ${buttonFontClass}
                        ${disabled ? "opacity-60" : ""}
                    `}
                >
                    {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
                </Link>
            </div>
        </div>
    );
};

function BenefitCardSkeleton({ isKhmer }: { isKhmer: boolean }) {
    const buttonFontClass = isKhmer ? "khmer-font" : "airbnb-font";

    return (
        <div className="flex animate-pulse flex-col items-start gap-4 md:flex-row md:gap-10">
            <div className="mt-6 flex-shrink-0 p-4 md:p-3">
                <div className="relative flex h-20 w-20 items-center justify-center">
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
                    className={`
                        inline-flex rounded-full bg-[#1B1D4E] px-4 py-2
                        font-semibold text-white opacity-50 sm:px-5
                        ${buttonFontClass}
                    `}
                >
                    {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
                </div>
            </div>
        </div>
    );
}

export default function Benefits() {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const isKhmer = uiLang === "kh";

    const titleFontClass = isKhmer ? "title-km" : "title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) {
                setBlock(JSON.parse(raw) as ApiBlock);
                setLoading(false);
            }
        } catch {}

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

                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(picked));
                    } catch {}
                }
            } catch (err) {
                if (!alive) return;
                setError(err instanceof Error ? err.message : "Fetch failed");
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
        return (block?.posts || []).slice(0, limit);
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
        <section className="bg-white py-12 md:py-16">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2 md:gap-13">
                <div className="mb-32 sm:mb-25 md:mb-56">
                    <h2
                        className={`
                            text-blue-950
                            max-w-[560px]
                            !text-left
                            !leading-[1.25]
                            break-words
                            ${titleFontClass}
                        `}
                    >
                        {renderHeadingText(
                            heading.h ||
                                (isKhmer
                                    ? "អត្ថប្រយោជន៍ G-PSF"
                                    : "G-PSF Benefit")
                        )}
                    </h2>

                    <div className="relative mt-6 sm:mt-8">
                        <div className="absolute left-0 top-0 mb-4 h-1 w-20 rounded-full bg-orange-500 sm:left-4 sm:w-24 md:left-19 md:w-72" />

                        <p
                            className={`
                                absolute left-0 top-0 mt-6 text-gray-700
                                sm:left-4 md:left-19
                                max-w-[560px]
                                text-justify [text-align-last:left]
                                leading-[1.7]
                                ${bodyFontClass}
                            `}
                        >
                            {heading.d}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {showSkeleton ? (
                        Array.from({ length: limit }).map((_, idx) => (
                            <BenefitCardSkeleton key={idx} isKhmer={isKhmer} />
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((p) => (
                            <BenefitCard
                                key={p.id}
                                icon={p.coverImage}
                                title={pickText(p.title, uiLang) || "\u00A0"}
                                description={
                                    pickText(p.description ?? undefined, uiLang) ||
                                    "\u00A0"
                                }
                                isKhmer={isKhmer}
                                href={buildDetailHref(p)}
                            />
                        ))
                    ) : (
                        <p className={`text-slate-600 ${bodyFontClass}`}>
                            {isKhmer ? "មិនមានទិន្នន័យ" : "No benefits found."}
                        </p>
                    )}

                    {showErrorOnly && (
                        <p className={`text-red-600 ${bodyFontClass}`}>
                            Failed: {error}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}