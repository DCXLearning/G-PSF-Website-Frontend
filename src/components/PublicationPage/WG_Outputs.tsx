/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    status?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    coverImage?: string | null;
    document?: string | null;
    documentThumbnail?: string | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string };
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
    link?: string | null;
    category?: {
        id: number;
        name?: I18n;
    } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    description?: I18n | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    data?: {
        blocks?: ApiBlock[];
    };
};

const CACHE_KEY = "wg-outputs-block-cache";

function containsKhmer(value?: string | null): boolean {
    return /[\u1780-\u17FF]/.test(value ?? "");
}

function pickText(
    obj: I18n | null | undefined,
    lang: "en" | "km",
    fallback = ""
) {
    if (!obj) return fallback;

    const primary = lang === "km" ? obj.km : obj.en;

    return primary || obj.en || obj.km || fallback;
}

function pickDocUrl(post: ApiPost, lang: "en" | "km") {
    return post.documents?.[lang]?.url || post.document || undefined;
}

function pickThumbUrl(post: ApiPost, lang: "en" | "km") {
    return (
        post.documents?.[lang]?.thumbnailUrl ||
        post.documentThumbnail ||
        post.coverImage ||
        undefined
    );
}

function getWGBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find((block) => block.id === 28) ||
        blocks.find((block) => block.type === "post_list") ||
        null
    );
}

function readCache(): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);

        if (!raw) return null;

        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(block: ApiBlock | null) {
    if (!block) return;

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(block));
    } catch {
        // ignore
    }
}

function sortPostsByLatest(posts: ApiPost[]) {
    return [...posts].sort((leftPost, rightPost) => {
        const leftDate = new Date(
            leftPost.publishedAt || leftPost.createdAt || leftPost.updatedAt || ""
        ).getTime();

        const rightDate = new Date(
            rightPost.publishedAt || rightPost.createdAt || rightPost.updatedAt || ""
        ).getTime();

        return rightDate - leftDate;
    });
}

type WGOutputsSectionProps = {
    showAllPosts?: boolean;
    showSeeMoreButton?: boolean;
};

export default function WGOutputs() {
    return <WGOutputsSection />;
}

export function WGOutputsSection({
    showAllPosts = false,
    showSeeMoreButton = true,
}: WGOutputsSectionProps = {}) {
    const { language, fontClass } = useLanguage();

    const uiLang: "en" | "kh" =
        String(language) === "kh" || String(language) === "km" ? "kh" : "en";

    const apiLang: "en" | "km" = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

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

                const res = await fetch("/api/resources-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error: ${res.status}`);

                const json: ApiResponse = await res.json();

                if (!alive) return;

                const wg = getWGBlock(json);

                if (wg) {
                    setBlock(wg);
                    writeCache(wg);
                }
            } catch (err: any) {
                if (!alive) return;

                setError(err?.message || "Fetch failed");
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

    const posts = useMemo(() => {
        const allPosts = block?.posts || [];

        const publishedPosts = allPosts.filter((post) =>
            post.status ? post.status === "published" : true
        );

        const sortedPosts = sortPostsByLatest(publishedPosts);

        return showAllPosts ? sortedPosts : sortedPosts.slice(0, 3);
    }, [block, showAllPosts]);

    const featured = posts[0];
    const sidePosts = posts.slice(1);

    const title = pickText(block?.title, apiLang, "WG Outputs");
    const desc = pickText(block?.description, apiLang, "");

    const sectionMainTitleClass = isKh ? "main-title-km" : "main-title-en";
    const sectionTitleClass = isKh || containsKhmer(title) ? "title-km" : "title-en";
    const sectionBodyClass = isKh || containsKhmer(desc) ? "body-km" : "body-en";

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    const featuredCategory = featured?.category
        ? pickText(featured.category.name, apiLang, "Category")
        : "Category";

    const featuredTitle = featured
        ? pickText(featured.title, apiLang, "Featured Report")
        : "—";

    const featuredDescription = featured
        ? pickText(featured.description || undefined, apiLang, "")
        : "";

    const featuredCategoryClass =
        isKh || containsKhmer(featuredCategory)
            ? "body-km normal-case"
            : "body-en uppercase";

    const featuredTitleClass =
        isKh || containsKhmer(featuredTitle) ? "title-km" : "title-en";

    const featuredDescriptionClass =
        isKh || containsKhmer(featuredDescription) ? "body-km" : "body-en";

    const actionClass = isKh ? "body-km normal-case" : "body-en uppercase";

    return (
        <section
            className={`mx-auto max-w-7xl bg-white px-4 py-16 ${
                fontClass || ""
            }`}
        >
            {/* Header */}
            <div className="mb-12 text-center">
                {/* Main title */}
                <h3 className={`text-[#1e2756] ${sectionMainTitleClass}`}>
                    {isKh
                        ? "ការយល់ដឹង — របកគំហើញ — លទ្ធផល"
                        : "Insights — Findings — Results"}
                </h3>

                {/* Title */}
                <h2 className={`mb-6 mt-2 text-[#1e2756] ${sectionTitleClass}`}>
                    {title}
                </h2>

                {/* Body */}
                {!!desc && (
                    <p className={`mx-auto max-w-3xl text-gray-700 ${sectionBodyClass}`}>
                        {desc}
                    </p>
                )}

                {showErrorOnly ? (
                    <p className="mt-4 text-red-600">{error}</p>
                ) : null}
            </div>

            {showSkeleton ? (
                <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="relative min-h-[500px] overflow-hidden rounded-sm border border-gray-100 bg-slate-100 lg:min-h-[600px]">
                        <div className="absolute inset-0 bg-slate-200" />

                        <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 h-16 w-16 rounded-full bg-slate-300" />
                            <div className="mb-3 h-4 w-28 rounded bg-slate-300" />
                            <div className="mb-4 h-10 w-3/4 rounded bg-slate-300" />
                            <div className="mb-2 h-4 w-full rounded bg-slate-300" />
                            <div className="mb-8 h-4 w-5/6 rounded bg-slate-300" />

                            <div className="flex gap-4">
                                <div className="h-10 w-32 rounded bg-slate-300" />
                                <div className="h-10 w-24 rounded bg-slate-300" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="flex flex-1 flex-col items-center justify-center border border-gray-200 p-10 text-center"
                            >
                                <div className="mb-4 h-14 w-14 rounded-full bg-slate-300" />
                                <div className="mb-2 h-4 w-24 rounded bg-slate-300" />
                                <div className="mb-3 h-8 w-2/3 rounded bg-slate-300" />
                                <div className="mb-2 h-4 w-4/5 rounded bg-slate-300" />
                                <div className="mb-6 h-4 w-3/5 rounded bg-slate-300" />

                                <div className="flex gap-5">
                                    <div className="h-4 w-20 rounded bg-slate-300" />
                                    <div className="h-4 w-16 rounded bg-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Featured */}
                    <div className="group relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-sm border border-gray-100 p-8 text-center lg:min-h-[600px]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={
                                    featured
                                        ? pickThumbUrl(featured, apiLang) ||
                                          "/image/resources_top.bmp"
                                        : "/image/resources_top.bmp"
                                }
                                alt="Featured"
                                fill
                                className="object-cover opacity-50"
                                priority
                            />

                            <div className="absolute inset-0 bg-white/40" />
                        </div>

                        <div className="relative z-10 max-w-md">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#1e2756]">
                                <Image
                                    src={featured?.coverImage || "/icon_Resources_page/icon1.png"}
                                    alt="Icon"
                                    width={45}
                                    height={45}
                                    className="object-contain"
                                />
                            </div>

                            <p
                                className={`mb-2 font-bold tracking-wider text-[#1e2756] ${featuredCategoryClass}`}
                            >
                                {featuredCategory}
                            </p>

                            <h4
                                className={`mb-4 line-clamp-3 text-[#1e2756] ${featuredTitleClass}`}
                                title={featuredTitle}
                            >
                                {featuredTitle}
                            </h4>

                            <p
                                className={`mb-8 line-clamp-4 font-medium text-gray-800 ${featuredDescriptionClass}`}
                            >
                                {featuredDescription}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-6">
                                {featured && pickDocUrl(featured, apiLang) ? (
                                    <a
                                        href={pickDocUrl(featured, apiLang)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex cursor-pointer items-center gap-2 rounded bg-[#f39c32] px-6 py-2 font-bold text-[#1e2756] transition-all hover:bg-[#e68a1e] ${actionClass}`}
                                    >
                                        {isKh ? "ទាញយក" : "Download"}
                                        <ChevronRight size={16} />
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className={`flex cursor-not-allowed items-center gap-2 rounded bg-gray-200 px-6 py-2 font-bold text-gray-500 ${actionClass}`}
                                    >
                                        {isKh ? "ទាញយក" : "Download"}
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Cards */}
                    <div className="flex flex-col gap-8">
                        {sidePosts.map((post) => (
                            <ArticleCard
                                key={post.id}
                                icon={post.coverImage || "/icon_Resources_page/icon2.png"}
                                category={
                                    post.category
                                        ? pickText(post.category.name, apiLang, "Category")
                                        : "Category"
                                }
                                headline={pickText(post.title, apiLang, "Article")}
                                description={pickText(
                                    post.description || undefined,
                                    apiLang,
                                    ""
                                )}
                                downloadUrl={pickDocUrl(post, apiLang)}
                                isKh={isKh}
                            />
                        ))}

                        {sidePosts.length === 0 ? (
                            <ArticleCard
                                icon="/icon_Resources_page/icon2.png"
                                category="—"
                                headline="No more posts"
                                description="Add more published posts in the WG Outputs block."
                                isKh={isKh}
                            />
                        ) : null}
                    </div>
                </div>
            )}

            {showSeeMoreButton && posts.length > 0 ? (
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/wg-outputs"
                        className={`rounded-md bg-[#1e2756] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#161d44] ${actionClass}`}
                    >
                        {isKh ? "មើលបន្ថែម" : "See More"}
                    </Link>
                </div>
            ) : null}
        </section>
    );
}

function ArticleCard({
    icon,
    category,
    headline,
    description,
    downloadUrl,
    isKh,
}: {
    icon?: string;
    category: string;
    headline: string;
    description?: string;
    downloadUrl?: string;
    isKh: boolean;
}) {
    const categoryClass =
        isKh || containsKhmer(category)
            ? "body-km normal-case"
            : "body-en uppercase";

    // This is the circled title in your screenshot.
    // Use title-km/title-en, not main-title-km/main-title-en.
    const headlineClass =
        isKh || containsKhmer(headline) ? "title-km" : "title-en";

    const descriptionClass =
        isKh || containsKhmer(description || "") ? "body-km" : "body-en";

    const actionClass = isKh ? "body-km normal-case" : "body-en uppercase";

    return (
        <div className="flex flex-1 flex-col items-center justify-center border border-gray-200 p-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1e2756]">
                <Image
                    src={icon || "/icon_Resources_page/icon2.png"}
                    alt={category}
                    width={40}
                    height={40}
                    className="object-contain"
                />
            </div>

            <p className={`mb-1 font-bold tracking-widest text-[#1e2756] ${categoryClass}`}>
                {category}
            </p>

            <h4
                className={`mb-3 line-clamp-2 text-[#1e2756] ${headlineClass}`}
                title={headline}
            >
                {headline}
            </h4>

            <p className={`mb-6 line-clamp-3 max-w-sm text-gray-700 ${descriptionClass}`}>
                {description || ""}
            </p>

            <div className="flex items-center gap-5">
                {downloadUrl ? (
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex cursor-pointer items-center gap-1 font-bold text-[#1e2756] hover:underline ${actionClass}`}
                    >
                        {isKh ? "ទាញយក" : "Download"}
                        <ChevronRight size={14} />
                    </a>
                ) : (
                    <span
                        className={`flex items-center gap-1 font-bold text-gray-400 ${actionClass}`}
                    >
                        {isKh ? "ទាញយក" : "Download"}
                        <ChevronRight size={14} />
                    </span>
                )}
            </div>
        </div>
    );
}