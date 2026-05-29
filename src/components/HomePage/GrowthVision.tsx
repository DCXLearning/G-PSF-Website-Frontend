// src/Components/UI-Homepage/GrowthVision.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type ApiPost = {
    status: string;
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n;
    coverImage?: string | null;
    createdAt?: string;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n;
    settings?: {
        limit?: number;
        categoryIds?: number[];
        sort?: string;
    } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        slug?: string;
        page?: I18n;
        blocks?: ApiBlock[];
    };
};

type UIItem = {
    id: number;
    title: string;
    description: string;
    icon: string;
    href: string;
};

const CACHE_KEY_PREFIX = "growth-vision-items-cache";

function pickText(obj: I18n | undefined, lang: "en" | "km") {
    if (!obj) return "";
    return (lang === "km" ? obj.km : obj.en) || obj.en || obj.km || "";
}

function normalizeImage(src?: string | null) {
    if (!src) return "";
    return src;
}

function buildDetailHref(post: ApiPost): string {
    const slug = post.slug?.trim() || "";

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function getCacheKey(langKey: "en" | "km") {
    return `${CACHE_KEY_PREFIX}-${langKey}`;
}

function readCache(langKey: "en" | "km"): UIItem[] {
    try {
        const raw = sessionStorage.getItem(getCacheKey(langKey));
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCache(langKey: "en" | "km", items: UIItem[]) {
    try {
        sessionStorage.setItem(getCacheKey(langKey), JSON.stringify(items));
    } catch {

    }
}

function pickGrowthVisionBlock(blocks: ApiBlock[]) {
    return (
        blocks.find((b) => b.id === 10) ||
        blocks.find(
            (b) => b.type === "post_list" && (b.settings?.categoryIds || []).includes(7)
        ) ||
        null
    );
}

function Card({
    title,
    icon,
    description,
    isPrimary,
    isKhmer,
    href,
}: {
    title: string;
    icon: string;
    description: string;
    isPrimary?: boolean;
    isKhmer?: boolean;
    href: string;
}) {
    const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";
    const buttonFontClass = isKhmer ? "khmer-font" : "airbnb-font";

    if (isPrimary) {
        return (
            <div className="flex min-h-[300px] transform flex-col justify-between rounded-br-[120px] rounded-tl-[120px] bg-blue-950 p-8 text-white shadow-2xl transition duration-300 ease-in-out hover:scale-[1.02]">
                <div className="mb-4 text-center">
                    {icon ? (
                        <img
                            src={icon}
                            alt={title}
                            className="mx-auto mb-4 h-14 w-14 brightness-0 invert filter"
                        />
                    ) : (
                        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/10" />
                    )}

                    <h3
                        className={`
                            mb-2 text-white
                            !whitespace-normal !overflow-visible !text-clip
                            ${mainTitleFontClass}
                        `}
                    >
                        {title}
                    </h3>

                    <p className={`text-white/90 ${bodyFontClass}`}>
                        {description}
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link
                        href={href}
                        className={`
                            mx-auto inline-flex items-center justify-center
                            font-semibold opacity-80 hover:opacity-100
                            ${buttonFontClass}
                        `}
                    >
                        {isKhmer ? "ស្វែងយល់បន្ថែម" : "LEARN MORE"}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[280px] transform flex-col justify-between overflow-hidden rounded-br-[120px] rounded-tl-[120px] border border-gray-100 p-8 shadow-xl transition duration-300 ease-in-out hover:scale-[1.02]">
            <div className="mb-4 pt-4 text-center">
                {icon ? (
                    <img src={icon} alt={title} className="mx-auto mb-4 h-12 w-12" />
                ) : (
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100" />
                )}

                <h3
                    className={`
                        mb-2 text-gray-900
                        !whitespace-normal !overflow-visible !text-clip
                        ${mainTitleFontClass}
                    `}
                >
                    {title}
                </h3>

                <p className={`text-gray-600 ${bodyFontClass}`}>
                    {description}
                </p>
            </div>

            <div className="mt-4 text-center">
                <Link
                    href={href}
                    className={`
                        mx-auto inline-flex items-center justify-center
                        font-semibold text-indigo-900 hover:text-indigo-700
                        ${buttonFontClass}
                    `}
                >
                    {isKhmer ? "ស្វែងយល់បន្ថែម" : "LEARN MORE"}
                </Link>
            </div>
        </div>
    );
}

function CardSkeleton({ primary = false }: { primary?: boolean }) {
    return (
        <div
            className={`
                flex min-h-[280px] animate-pulse flex-col justify-between
                rounded-br-[120px] rounded-tl-[120px] p-8
                ${primary ? "min-h-[300px] bg-blue-950 text-white" : "border border-gray-100 shadow-xl"}
            `}
        >
            <div className="mb-4 pt-4 text-center">
                <div
                    className={`
                        mx-auto mb-4 h-14 w-14 rounded-full
                        ${primary ? "bg-white/15" : "bg-gray-200"}
                    `}
                />

                <div
                    className={`
                        mx-auto mb-3 h-7 w-2/3 rounded
                        ${primary ? "bg-white/15" : "bg-gray-200"}
                    `}
                />

                <div
                    className={`
                        mx-auto mb-2 h-5 w-5/6 rounded
                        ${primary ? "bg-white/15" : "bg-gray-200"}
                    `}
                />

                <div
                    className={`
                        mx-auto h-5 w-3/4 rounded
                        ${primary ? "bg-white/15" : "bg-gray-200"}
                    `}
                />
            </div>

            <div className="mt-4 text-center">
                <div
                    className={`
                        mx-auto h-4 w-28 rounded
                        ${primary ? "bg-white/15" : "bg-gray-200"}
                    `}
                />
            </div>
        </div>
    );
}

export default function GrowthVision() {
    const { language } = useLanguage();

    const isKhmer = language === "kh";
    const langKey: "en" | "km" = isKhmer ? "km" : "en";

    const titleFontClass = isKhmer ? "title-km" : "title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState<UIItem[]>([]);

    const headingEnLine1 = "Align With Cambodia’s";
    const headingEnLine2 = "Growth Vision";
    const headingKhLine1 = "សម្របអាជីវកម្មរបស់អ្នក";
    const headingKhLine2 = "ឲ្យស្របតាមចក្ខុវិស័យកំណើនកម្ពុជា";

    useEffect(() => {
        setMounted(true);

        const cached = readCache(langKey);

        if (cached.length > 0) {
            setItems(cached);
            setLoading(false);
        }

        let alive = true;

        async function run() {
            try {
                setError("");

                const res = await fetch("/api/home-page/growth-vision", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = (await res.json()) as ApiResponse;

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || `Request failed: ${res.status}`);
                }

                const blocks = json?.data?.blocks || [];
                const gv = pickGrowthVisionBlock(blocks);
                const posts = gv?.posts || [];

                const mapped: UIItem[] = posts
                    .filter((p) => p?.status !== "draft")
                    .map((p) => ({
                        id: p.id,
                        title: pickText(p.title, langKey) || "Untitled",
                        description: pickText(p.description, langKey) || "",
                        icon: normalizeImage(p.coverImage),
                        href: buildDetailHref(p),
                    }));

                if (!alive) return;

                setItems(mapped);
                writeCache(langKey, mapped);
            } catch (error) {
                if (!alive) return;

                const message =
                    error instanceof Error ? error.message : "Failed to load Growth Vision";

                setError(message);
            } finally {
                if (!alive) return;

                setLoading(false);
            }
        }

        run();

        return () => {
            alive = false;
        };
    }, [langKey]);

    const { primary, secondary } = useMemo(() => {
        if (items.length === 0) {
            return { primary: null as UIItem | null, secondary: [] as UIItem[] };
        }

        const policy = items.find((i) => i.title.toLowerCase().includes("policy"));
        const primary = policy || items[0];
        const secondary = items.filter((i) => i.id !== primary.id);

        return { primary, secondary };
    }, [items]);

    const showSkeleton = !mounted || (loading && items.length === 0);
    const showErrorOnly = !showSkeleton && items.length === 0 && !!error;
    const showEmpty = !showSkeleton && !error && items.length === 0;

    return (
        <div className="container relative mx-auto max-w-7xl px-4 py-16">
            <h2
                className={`
                    mb-12 whitespace-pre-line text-gray-900
                    ${titleFontClass}
                `}
            >
                {isKhmer ? (
                    <>
                        {headingKhLine1}
                        <br />
                        {headingKhLine2}
                    </>
                ) : (
                    <>
                        {headingEnLine1}
                        <br />
                        {headingEnLine2}
                    </>
                )}
            </h2>

            {showErrorOnly && (
                <div
                    className={`
                        rounded-xl border border-red-200 bg-red-50 p-4 text-red-700
                        ${bodyFontClass}
                    `}
                >
                    {error}
                </div>
            )}

            {showEmpty && (
                <div className={`text-gray-600 ${bodyFontClass}`}>
                    {isKhmer
                        ? "មិនមានទិន្នន័យ Growth Vision ទេ"
                        : "No Growth Vision items found"}
                </div>
            )}

            {showSkeleton ? (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton primary />
                    </div>

                    <div className="relative mb-34 hidden h-[700px] xl:block">
                        <div className="absolute left-0 top-32 w-91">
                            <CardSkeleton />
                        </div>

                        <div className="absolute left-1/2 top-[22%] z-10 w-91 -translate-x-1/2 -translate-y-1/2">
                            <CardSkeleton primary />
                        </div>

                        <div className="absolute right-0 top-0 w-91 -translate-y-2/5">
                            <CardSkeleton />
                        </div>

                        <div className="absolute bottom-0 left-0 top-139 w-91">
                            <CardSkeleton />
                        </div>

                        <div className="absolute bottom-0 left-1/2 top-106 w-91 -translate-x-1/2">
                            <CardSkeleton />
                        </div>

                        <div className="absolute bottom-28 right-0 w-91">
                            <CardSkeleton />
                        </div>
                    </div>
                </>
            ) : items.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
                        {[...secondary, ...(primary ? [primary] : [])].map((card) => (
                            <Card
                                key={card.id}
                                title={card.title}
                                icon={card.icon}
                                description={card.description}
                                isPrimary={primary?.id === card.id}
                                isKhmer={isKhmer}
                                href={card.href}
                            />
                        ))}
                    </div>

                    <div className="relative mb-34 hidden h-[700px] xl:block">
                        {secondary[0] && (
                            <div className="absolute left-0 top-32 w-91">
                                <Card
                                    title={secondary[0].title}
                                    icon={secondary[0].icon}
                                    description={secondary[0].description}
                                    isKhmer={isKhmer}
                                    href={secondary[0].href}
                                />
                            </div>
                        )}

                        {primary && (
                            <div className="absolute left-1/2 top-[22%] z-10 w-91 -translate-x-1/2 -translate-y-1/2">
                                <Card
                                    title={primary.title}
                                    icon={primary.icon}
                                    description={primary.description}
                                    isPrimary
                                    isKhmer={isKhmer}
                                    href={primary.href}
                                />
                            </div>
                        )}

                        {secondary[1] && (
                            <div className="absolute right-0 top-0 w-91 -translate-y-2/5">
                                <Card
                                    title={secondary[1].title}
                                    icon={secondary[1].icon}
                                    description={secondary[1].description}
                                    isKhmer={isKhmer}
                                    href={secondary[1].href}
                                />
                            </div>
                        )}

                        {secondary[2] && (
                            <div className="absolute bottom-0 left-0 top-139 w-91">
                                <Card
                                    title={secondary[2].title}
                                    icon={secondary[2].icon}
                                    description={secondary[2].description}
                                    isKhmer={isKhmer}
                                    href={secondary[2].href}
                                />
                            </div>
                        )}

                        {secondary[3] && (
                            <div className="absolute bottom-0 left-1/2 top-106 w-91 -translate-x-1/2">
                                <Card
                                    title={secondary[3].title}
                                    icon={secondary[3].icon}
                                    description={secondary[3].description}
                                    isKhmer={isKhmer}
                                    href={secondary[3].href}
                                />
                            </div>
                        )}

                        {secondary[4] && (
                            <div className="absolute bottom-28 right-0 w-91">
                                <Card
                                    title={secondary[4].title}
                                    icon={secondary[4].icon}
                                    description={secondary[4].description}
                                    isKhmer={isKhmer}
                                    href={secondary[4].href}
                                />
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}