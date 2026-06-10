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

function pickText(obj: I18n | null | undefined, lang: "en" | "km", fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return primary || obj.en || obj.km || fallback;
}

function pickDocUrl(post: ApiPost, lang: "en" | "km") {
    return post.documents?.[lang]?.url || post.document || undefined;
}

function pickThumbUrl(post: ApiPost, lang: "en" | "km") {
    return post.documents?.[lang]?.thumbnailUrl || post.documentThumbnail || post.coverImage || undefined;
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
    return [...posts].sort((a, b) => {
        const aDate = new Date(a.publishedAt || a.createdAt || a.updatedAt || "").getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || b.updatedAt || "").getTime();
        return bDate - aDate;
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
    const { language } = useLanguage();

    const uiLang: "en" | "kh" =
        String(language) === "kh" || String(language) === "km" ? "kh" : "en";

    const apiLang: "en" | "km" = uiLang === "kh" ? "km" : "en";
    const isKh = uiLang === "kh";

    const wrapperFontClass = isKh ? "khmer-font" : "airbnb-font";
    const bodyClass = isKh ? "body-km" : "body-en";
    const titleClass = isKh ? "title-km" : "title-en";
    const smallTitleClass = isKh ? "main-title-km" : "main-title-en";

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

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    const featuredCategory = featured?.category
        ? pickText(featured.category.name, apiLang, "Category")
        : "Category";

    const featuredTitle = featured ? pickText(featured.title, apiLang, "Featured Report") : "—";

    const featuredDescription = featured
        ? pickText(featured.description || undefined, apiLang, "")
        : "";

    return (
        <section className={`mx-auto max-w-7xl bg-white px-4 py-16 ${wrapperFontClass}`}>
            <div className="mb-12 text-center">
                <h3 className={`text-[#1e2756] ${smallTitleClass}`}>
                    {isKh ? "ការយល់ដឹង — របកគំហើញ — លទ្ធផល" : "Insights — Findings — Results"}
                </h3>

                <h2 className={`mb-6 mt-2 text-[#1e2756] ${titleClass}`}>{title}</h2>

                {!!desc && <p className={`mx-auto max-w-3xl text-gray-700 ${bodyClass}`}>{desc}</p>}

                {showErrorOnly ? <p className={`mt-4 text-red-600 ${bodyClass}`}>{error}</p> : null}
            </div>

            {showSkeleton ? (
                <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="relative min-h-[500px] overflow-hidden border border-gray-100 bg-slate-100 lg:min-h-[600px]">
                        <div className="absolute inset-0 bg-slate-200" />
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
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="group relative flex min-h-[500px] items-center justify-center overflow-hidden border border-gray-100 p-8 text-center lg:min-h-[600px]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={
                                    featured
                                        ? pickThumbUrl(featured, apiLang) || "/image/resources_top.bmp"
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

                            <p className={`mb-2 tracking-wider text-[#1e2756] ${bodyClass} !font-bold`}>
                                {featuredCategory}
                            </p>

                            <h4
                                className={`
                                mx-auto mb-4 max-w-full
                                ${containsKhmer(featuredTitle) ? "title-km" : "title-en"}
                                line-clamp-3
                                !overflow-hidden
                                text-center text-[#1e2756]
                                `}
                                title={featuredTitle}
                            >
                                {featuredTitle}
                            </h4>

                            <p className={`mb-8 line-clamp-6 text-gray-800 ${bodyClass}`}>
                                {featuredDescription}
                            </p>

                            {featured && pickDocUrl(featured, apiLang) ? (
                                <a
                                    href={pickDocUrl(featured, apiLang)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`
                                        inline-flex w-full max-w-[320px] items-center justify-center gap-2
                                        rounded-md bg-[#f5a20a] px-6 py-2.5
                                        text-center !text-white no-underline
                                        transition hover:bg-[#ea9805] hover:no-underline
                                        ${bodyClass} !font-bold
                                    `}
                                >
                                    <span>{isKh ? "ទាញយក" : "Downloadg"}</span>
                                    <ChevronRight size={16} />
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className={`
                                        inline-flex w-full max-w-[320px] cursor-not-allowed items-center justify-center gap-2
                                        rounded-md bg-gray-300 px-6 py-2.5
                                        text-center !text-white
                                        ${bodyClass} !font-bold
                                    `}
                                >
                                    <span>{isKh ? "មិនមានឯកសារ" : "No document"}</span>
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {sidePosts.map((post) => (
                            <ArticleCard
                                key={post.id}
                                icon={post.coverImage || "/icon_Resources_page/icon2.png"}
                                category={post.category ? pickText(post.category.name, apiLang, "Category") : "Category"}
                                headline={pickText(post.title, apiLang, "Article")}
                                description={pickText(post.description || undefined, apiLang, "")}
                                downloadUrl={pickDocUrl(post, apiLang)}
                                isKh={isKh}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showSeeMoreButton && posts.length > 0 ? (
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/wg-outputs"
                        className={`rounded-md bg-blue-950 px-5 py-1.5 text-white transition-colors hover:bg-blue-900 ${bodyClass} !font-bold !text-white`}
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
    const bodyClass = isKh ? "body-km" : "body-en";
    const cardTitleClass = isKh || containsKhmer(headline) ? "title-km" : "title-en";

    return (
        <div className={`flex flex-1 flex-col items-center justify-center border border-gray-200 p-10 text-center ${isKh ? "khmer-font" : "airbnb-font"}`}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1e2756]">
                <Image
                    src={icon || "/icon_Resources_page/icon2.png"}
                    alt={category}
                    width={40}
                    height={40}
                    className="object-contain"
                />
            </div>

            <p className={`mb-1 tracking-widest text-[#1e2756] ${bodyClass} !font-bold`}>
                {category}
            </p>

            <h4
                className={`
                    mb-3 max-w-full
                    ${cardTitleClass}
                    line-clamp-2
                    !overflow-hidden
                    text-center text-[#1e2756]
                    `}
                title={headline}
            >
                {headline}
            </h4>

            <p className={`mb-6 line-clamp-3 max-w-sm text-gray-700 ${bodyClass}`}>
                {description || ""}
            </p>

            <div className="flex w-full justify-center">
    {downloadUrl ? (
        <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className={`
                inline-flex w-full max-w-[320px]
                items-center justify-center gap-2
                rounded-md bg-[#f5a20a] px-6 py-2.5
                text-center !text-white no-underline
                transition hover:bg-[#ea9805] hover:no-underline
                ${bodyClass} !font-bold
            `}
        >
            <span>{isKh ? "ទាញយក" : "Download"}</span>
            <ChevronRight size={16} />
        </a>
    ) : (
        <button
            type="button"
            disabled
            className={`
                inline-flex w-full max-w-[320px]
                cursor-not-allowed items-center justify-center gap-2
                rounded-md bg-gray-300 px-6 py-2.5
                text-center !text-white
                ${bodyClass} !font-bold
            `}
        >
            <span>{isKh ? "មិនមានឯកសារ" : "No document"}</span>
            <ChevronRight size={16} />
        </button>
    )}
</div>
        </div>
    );
}