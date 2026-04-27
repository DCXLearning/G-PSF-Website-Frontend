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
        // ignore cache write errors
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
    if (isPrimary) {
        return (
            <div className="p-8 rounded-tl-[120px] rounded-br-[120px] bg-blue-950 shadow-2xl text-white min-h-[300px] flex flex-col justify-between transform hover:scale-[1.02] transition duration-300 ease-in-out">
                <div className="text-center mb-4">
                    {icon ? (
                        <img
                            src={icon}
                            alt={title}
                            className="w-14 h-14 mx-auto mb-4 filter brightness-0 invert"
                        />
                    ) : (
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/10" />
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${isKhmer ? "khmer-font" : ""}`}>
                        {title}
                    </h3>

                    <p className={`text-lg opacity-90 ${isKhmer ? "khmer-font" : ""}`}>
                        {description}
                    </p>
                </div>

                <div className="text-center mt-4">
                    <Link
                        href={href}
                        className={`inline-flex items-center justify-center mx-auto text-sm font-semibold opacity-80 hover:opacity-100 ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {isKhmer ? "ស្វែងយល់បន្ថែម" : "LEARN MORE"}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 rounded-tl-[120px] rounded-br-[120px] shadow-xl border border-gray-100 min-h-[280px] flex flex-col justify-between relative overflow-hidden transform hover:scale-[1.02] transition duration-300 ease-in-out">
            <div className="pt-4 text-center mb-4">
                {icon ? (
                    <img src={icon} alt={title} className="w-12 h-12 mx-auto mb-4" />
                ) : (
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100" />
                )}

                <h3 className={`text-2xl font-bold mb-2 ${isKhmer ? "khmer-font" : ""}`}>
                    {title}
                </h3>

                <p className={`text-lg text-gray-600 ${isKhmer ? "khmer-font" : ""}`}>
                    {description}
                </p>
            </div>

            <div className="text-center mt-4">
                <Link
                    href={href}
                    className={`inline-flex items-center justify-center mx-auto text-sm font-semibold text-indigo-900 hover:text-indigo-700 ${isKhmer ? "khmer-font" : ""
                        }`}
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
            className={`animate-pulse p-8 rounded-tl-[120px] rounded-br-[120px] min-h-[280px] flex flex-col justify-between ${primary ? "bg-blue-950 text-white min-h-[300px]" : "shadow-xl border border-gray-100"
                }`}
        >
            <div className="pt-4 text-center mb-4">
                <div
                    className={`w-14 h-14 mx-auto mb-4 rounded-full ${primary ? "bg-white/15" : "bg-gray-200"
                        }`}
                />
                <div
                    className={`h-7 w-2/3 mx-auto rounded mb-3 ${primary ? "bg-white/15" : "bg-gray-200"
                        }`}
                />
                <div
                    className={`h-5 w-5/6 mx-auto rounded mb-2 ${primary ? "bg-white/15" : "bg-gray-200"
                        }`}
                />
                <div
                    className={`h-5 w-3/4 mx-auto rounded ${primary ? "bg-white/15" : "bg-gray-200"
                        }`}
                />
            </div>

            <div className="text-center mt-4">
                <div
                    className={`h-4 w-28 mx-auto rounded ${primary ? "bg-white/15" : "bg-gray-200"
                        }`}
                />
            </div>
        </div>
    );
}

export default function GrowthVision() {
    const { language } = useLanguage();
    const isKhmer = language === "kh";
    const langKey: "en" | "km" = isKhmer ? "km" : "en";

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
        <div className="container mx-auto px-4 max-w-7xl py-16 relative">
            <h2
                className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-12 ${isKhmer ? "khmer-font" : ""
                    }`}
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
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {showEmpty && (
                <div className="text-gray-600">
                    {isKhmer ? "មិនមានទិន្នន័យ Growth Vision ទេ" : "No Growth Vision items found"}
                </div>
            )}

            {showSkeleton ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:hidden">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton primary />
                    </div>

                    <div className="relative mb-34 hidden xl:block h-[700px]">
                        <div className="absolute top-32 left-0 w-91">
                            <CardSkeleton />
                        </div>
                        <div className="absolute top-[22%] -translate-y-1/2 left-1/2 -translate-x-1/2 w-91 z-10">
                            <CardSkeleton primary />
                        </div>
                        <div className="absolute top-0 -translate-y-2/5 right-0 w-91">
                            <CardSkeleton />
                        </div>
                        <div className="absolute bottom-0 top-139 left-0 w-91">
                            <CardSkeleton />
                        </div>
                        <div className="absolute bottom-0 top-106 left-1/2 -translate-x-1/2 w-91">
                            <CardSkeleton />
                        </div>
                        <div className="absolute bottom-28 right-0 w-91">
                            <CardSkeleton />
                        </div>
                    </div>
                </>
            ) : items.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:hidden">
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

                    <div className="relative mb-34 hidden xl:block h-[700px]">
                        {secondary[0] && (
                            <div className="absolute top-32 left-0 w-91">
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
                            <div className="absolute top-[22%] -translate-y-1/2 left-1/2 -translate-x-1/2 w-91 z-10">
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
                            <div className="absolute top-0 -translate-y-2/5 right-0 w-91">
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
                            <div className="absolute bottom-0 top-139 left-0 w-91">
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
                            <div className="absolute bottom-0 top-106 left-1/2 -translate-x-1/2 w-91">
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