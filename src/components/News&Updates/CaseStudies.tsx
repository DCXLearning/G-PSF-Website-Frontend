"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
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
    settings?: { sort?: string; limit?: number; categoryIds?: number[] } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY = "case-studies-block-cache";

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function pickDocUrl(post: ApiPost, apiLang: ApiLang) {
    const key = apiLang === "km" ? "km" : "en";
    return post.documents?.[key]?.url || post.document || post.link || "";
}

function pickThumbUrl(post: ApiPost, apiLang: ApiLang) {
    const key = apiLang === "km" ? "km" : "en";
    return post.documents?.[key]?.thumbnailUrl || post.documentThumbnail || "";
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
    } catch {}
}

function ButtonGroup({
    post,
    docUrl,
    t,
    isKh,
}: {
    post: ApiPost;
    docUrl: string;
    t: { download: string; viewDetail: string };
    isKh: boolean;
}) {
    const fontClass = isKh
        ? "khmer-font normal-case tracking-normal"
        : "airbnb-font uppercase tracking-widest";

    return (
        <div className="mt-auto flex flex-wrap items-center gap-4">
            <a
                href={docUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`
                    inline-flex items-center justify-center gap-2
                    rounded-md bg-[#f5a20a] px-5 py-2.5
                    text-[13px] font-bold !text-white no-underline
                    transition hover:bg-[#ea9805] hover:no-underline
                    ${!docUrl ? "pointer-events-none opacity-60" : ""}
                    ${fontClass}
                `}
            >
                <span>{t.download}</span>
                <span className="text-lg leading-none">›</span>
            </a>

            <Link
                href={buildDetailHref(post)}
                className={`
                    inline-flex items-center justify-center gap-2
                    rounded-md bg-[#1a2b4b] px-5 py-2.5
                    text-[13px] font-bold !text-white no-underline
                    transition hover:bg-[#111d35] hover:no-underline
                    ${fontClass}
                `}
            >
                <span>{t.viewDetail}</span>
                <span className="text-lg leading-none">›</span>
            </Link>
        </div>
    );
}

function SideCardSkeleton() {
    return (
        <div className="flex flex-1 animate-pulse flex-col justify-center bg-[#e9ecef] p-12">
            <div className="mb-3 h-4 w-32 rounded bg-slate-200" />
            <div className="mb-4 h-10 w-3/4 rounded bg-slate-200" />
            <div className="mb-2 h-4 w-full rounded bg-slate-200" />
            <div className="mb-8 h-4 w-full rounded bg-slate-200" />
            <div className="flex gap-6">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
        </div>
    );
}

function FeaturedSkeleton() {
    return (
        <div className="flex h-full animate-pulse flex-col bg-[#e9ecef] shadow-sm">
            <div className="flex min-h-[390px] flex-1 flex-col items-center justify-center bg-gray-200/50 p-12">
                <div className="flex w-full max-w-[360px] flex-col items-center justify-center border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-200" />
                </div>
            </div>

            <div className="bg-[#eceff1] p-10">
                <div className="mb-4 h-5 w-40 rounded bg-slate-200" />
                <div className="mb-4 h-12 w-3/4 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                <div className="mb-8 h-4 w-full rounded bg-slate-200" />
                <div className="flex gap-6">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

export default function CaseStudies() {
    return <CaseStudiesSection />;
}

type CaseStudiesSectionProps = {
    showSeeMoreButton?: boolean;
    showAllPosts?: boolean;
};

export function CaseStudiesSection({
    showSeeMoreButton = true,
    showAllPosts = false,
}: CaseStudiesSectionProps = {}) {
    const { language, apiLang } = useLanguage();

    const uiLang = (language as UiLang) ?? "en";
    const apiLanguage = (apiLang as ApiLang) ?? "en";

    const isKh = uiLang === "kh";

    const titleClass = isKh ? "title-km" : "title-en";
    const mainTitleClass = isKh ? "main-title-km" : "main-title-en";
    const bodyClass = isKh ? "body-km" : "body-en";
    const smallFontClass = isKh ? "khmer-font" : "airbnb-font";

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

                const res = await fetch("/api/newupdate-page/section", {
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
                            (b?.id === 24 || b?.title?.en === "Case Studies")
                    ) || null;

                if (!alive) return;

                if (picked) {
                    setBlock(picked);
                    writeCache(picked);
                }
            } catch (error) {
                if (!alive) return;
                setError(error instanceof Error ? error.message : "Fetch failed");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, []);

    const posts = useMemo(() => {
        const p = block?.posts || [];

        if (showAllPosts) return p;

        const limit = block?.settings?.limit ?? 3;
        return p.slice(0, limit);
    }, [block, showAllPosts]);

    const featured = posts[0];
    const side = posts.slice(1, 3);

    const t = useMemo(() => {
        return {
            header: uiLang === "kh" ? "ជោគជ័យដែលបានបង្ហាញ" : "Featured Success",
            title:
                pickText(block?.title, uiLang) ||
                (uiLang === "kh" ? "ករណីសិក្សា" : "Case Studies"),
            relatedPhoto: uiLang === "kh" ? "រូបថតដែលទាក់ទង" : "Related Photo",
            workingGroup: uiLang === "kh" ? "ឈ្មោះក្រុមការងារ" : "Working Group",
            download: uiLang === "kh" ? "ទាញយក" : "Download",
            viewDetail: uiLang === "kh" ? "មើលលម្អិត" : "View Detail",
            fallbackDesc:
                uiLang === "kh"
                    ? "ទទួលបានព័ត៌មានអំពីការអភិវឌ្ឍន៍សំខាន់ៗពី G-PSF រួមទាំងលទ្ធផលពេញអង្គ វឌ្ឍនភាពនៃក្រុមការងារ ការសង្ខេបគោលនយោបាយ និងកំណែទម្រង់ស្ថាប័ន។"
                    : "Stay informed on key developments from the G-PSF, including plenary outcomes, Working Group progress, policy briefs, and institutional reforms.",
        };
    }, [uiLang, block]);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;

    return (
        <section className="bg-white px-4 py-12 md:px-8">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-12">
                    <p className={`mb-1 text-[#1a2b4b] ${mainTitleClass}`}>
                        {t.header}
                    </p>

                    <h2
                        className={`
                            mb-6 text-[#1a2b4b]
                            !whitespace-normal !overflow-visible !text-clip
                            ${titleClass}
                        `}
                    >
                        {t.title}
                    </h2>

                    <div className="h-1.5 w-full max-w-[480px] bg-orange-500" />
                </div>

                {showErrorOnly && (
                    <div className="text-sm text-red-600">Failed: {error}</div>
                )}

                {showSkeleton ? (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <FeaturedSkeleton />
                        <div className="flex flex-col gap-8">
                            <SideCardSkeleton />
                            <SideCardSkeleton />
                        </div>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {featured && (
                            <div className="flex h-full flex-col bg-[#e9ecef] shadow-sm">
                                <div className="flex min-h-[390px] flex-1 flex-col items-center justify-center bg-gray-200/50 p-12">
                                    <div className="flex w-full max-w-[360px] flex-col items-center justify-center border border-gray-100 bg-white p-6 shadow-sm">
                                        {pickThumbUrl(featured, apiLanguage) ? (
                                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                                <Image
                                                    src={pickThumbUrl(featured, apiLanguage)}
                                                    alt="Related"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-50">
                                                <span
                                                    className={`
                                                        text-xs font-bold text-gray-400
                                                        ${
                                                            isKh
                                                                ? "khmer-font normal-case tracking-normal"
                                                                : "airbnb-font uppercase tracking-widest"
                                                        }
                                                    `}
                                                >
                                                    {t.relatedPhoto}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#eceff1] p-15">
                                    <span
                                        className={`
                                            mb-4 inline-block rounded-full bg-[#1a2b4b]
                                            px-3 py-1 text-[10px] font-bold text-white
                                            ${
                                                isKh
                                                    ? "khmer-font normal-case tracking-normal"
                                                    : "airbnb-font uppercase tracking-wider"
                                            }
                                        `}
                                    >
                                        {t.workingGroup}:{" "}
                                        {pickText(featured.category?.name, uiLang) || "—"}
                                    </span>

                                    <h3
                                        className={`
                                            mb-4 w-full text-[#1a2b4b]
                                            !whitespace-normal !overflow-visible !text-clip
                                            ${titleClass}
                                        `}
                                    >
                                        {pickText(featured.title, uiLang) || "—"}
                                    </h3>

                                    <p
                                        className={`
                                            mb-8 w-full text-gray-700
                                            text-justify [text-align-last:left]
                                            leading-[1.75]
                                            ${bodyClass}
                                        `}
                                    >
                                        {pickText(featured.description ?? undefined, uiLang) ||
                                            t.fallbackDesc}
                                    </p>

                                    <ButtonGroup
                                        post={featured}
                                        docUrl={pickDocUrl(featured, apiLanguage)}
                                        t={t}
                                        isKh={isKh}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-8">
                            {side.map((post) => {
                                const docUrl = pickDocUrl(post, apiLanguage);

                                return (
                                    <div
                                        key={post.id}
                                        className="flex flex-1 flex-col justify-center bg-[#e9ecef] p-15"
                                    >
                                        <div
                                            className={`
                                                mb-3 text-[13px] font-bold text-[#1a2b4b]
                                                ${
                                                    isKh
                                                        ? "khmer-font normal-case tracking-normal"
                                                        : "airbnb-font uppercase tracking-wider"
                                                }
                                            `}
                                        >
                                            {t.workingGroup}:{" "}
                                            {pickText(post.category?.name, uiLang) || "—"}
                                        </div>

                                        <h3
                                            className={`
                                                mb-4 w-full text-[#1a2b4b]
                                                !whitespace-normal !overflow-visible !text-clip
                                                ${titleClass}
                                            `}
                                        >
                                            {pickText(post.title, uiLang) || "—"}
                                        </h3>

                                        <p
                                            className={`
                                                mb-8 w-full text-gray-700
                                                text-justify [text-align-last:left]
                                                leading-[1.75]
                                                ${bodyClass}
                                            `}
                                        >
                                            {pickText(post.description ?? undefined, uiLang) ||
                                                t.fallbackDesc}
                                        </p>

                                        <ButtonGroup
                                            post={post}
                                            docUrl={docUrl}
                                            t={t}
                                            isKh={isKh}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className={`text-sm text-slate-600 ${bodyClass}`}>
                        No case studies found.
                    </div>
                )}

                {showSeeMoreButton && posts.length > 0 ? (
                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/case-studies"
                            className={`
                                rounded-lg bg-blue-950 px-6 py-2 font-semibold text-white
                                hover:bg-blue-900
                                ${smallFontClass}
                            `}
                        >
                            {isKh ? "មើលបន្ថែម" : "See More"}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}