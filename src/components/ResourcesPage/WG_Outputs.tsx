"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
// import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;

    status?: string;
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

function pickText(obj: I18n | null | undefined, lang: "en" | "km", fallback = "") {
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

/** ---------- UI ---------- */
export default function WGOutputs() {
    // If you have language context:
    // const { language } = useLanguage(); // "en" | "kh"
    // const apiLang: "en" | "km" = language === "kh" ? "km" : "en";

    // ✅ Khmer from API
    const apiLang: "en" | "km" = "km";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/resources-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error: ${res.status}`);

                const json: ApiResponse = await res.json();
                if (!alive) return;

                const blocks = json?.data?.blocks || [];

                const wg =
                    blocks.find((b) => b.id === 28) ||
                    blocks.find((b) => b.type === "post_list") ||
                    null;

                setBlock(wg);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Fetch failed");
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
        const arr = block?.posts || [];
        return arr.filter((p) => (p.status ? p.status === "published" : true));
    }, [block]);

    const featured = posts[0];
    const sidePosts = posts.slice(1, 3);

    const title = pickText(block?.title, apiLang, "WG Outputs");
    const desc = pickText(block?.description, apiLang, "");

    return (
        <section className="bg-white py-16 px-4 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="text-center mb-12">
                <h3 className="text-[#1e2756] text-xl md:text-2xl font-semibold tracking-wide uppercase">
                    Insights — Findings — Results
                </h3>

                {/* ✅ Force Kantumruy Pro for Khmer title */}
                <h2 className="text-[#1e2756] text-5xl md:text-6xl font-semibold mt-2 mb-6 khmer-font">
                    {title}
                </h2>

                {!!desc && (
                    <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
                        {desc}
                    </p>
                )}

                {loading && <p className="text-gray-500 mt-4">Loading...</p>}
                {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Featured */}
                <div className="relative group overflow-hidden rounded-sm min-h-[500px] lg:min-h-[600px] flex items-center justify-center p-8 text-center border border-gray-100">
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
                        <div className="bg-[#1e2756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                            <Image
                                src={featured?.coverImage || "/icon_Resources_page/icon1.png"}
                                alt="Icon"
                                width={45}
                                height={45}
                                className="object-contain"
                            />
                        </div>

                        <p className="text-[#1e2756] font-bold uppercase tracking-wider mb-2">
                            {featured?.category
                                ? pickText(featured.category.name, apiLang, "Category")
                                : "Category"}
                        </p>

                        <h4 className="text-[#1e2756] text-3xl md:text-4xl khmer-font font-extrabold mb-4 line-clamp-3">
                            {featured ? pickText(featured.title, apiLang, "Featured Report") : "—"}
                        </h4>

                        <p className="text-gray-800 mb-8 khmer-font font-medium line-clamp-4">
                            {featured ? pickText(featured.description || undefined, apiLang, "") : ""}
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 items-center">
                            {featured && pickDocUrl(featured, apiLang) ? (
                                <a
                                    href={pickDocUrl(featured, apiLang)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#f39c32] hover:bg-[#e68a1e] text-[#1e2756] cursor-pointer font-bold py-2 px-6 rounded flex items-center gap-2 transition-all"
                                >
                                    Download <ChevronRight size={16} />
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="bg-gray-200 text-gray-500 font-bold py-2 px-6 rounded flex items-center gap-2 cursor-not-allowed"
                                >
                                    Download <ChevronRight size={16} />
                                </button>
                            )}

                            {featured?.slug ? (
                                <Link
                                    href={`/resources/${featured.slug}`}
                                    className="text-[#1e2756] cursor-pointer font-bold flex items-center gap-1 hover:underline underline-offset-4"
                                >
                                    WG Profile <ChevronRight size={16} />
                                </Link>
                            ) : featured?.link ? (
                                <a
                                    href={featured.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1e2756] cursor-pointer font-bold flex items-center gap-1 hover:underline underline-offset-4"
                                >
                                    WG Profile <ChevronRight size={16} />
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Right: Cards */}
                <div className="flex flex-col gap-8">
                    {sidePosts.map((p) => (
                        <ArticleCard
                            key={p.id}
                            icon={p.coverImage || "/icon_Resources_page/icon2.png"}
                            category={p.category ? pickText(p.category.name, apiLang, "Category") : "Category"}
                            headline={pickText(p.title, apiLang, "Article")}
                            description={pickText(p.description || undefined, apiLang, "")}
                            downloadUrl={pickDocUrl(p, apiLang)}
                            slug={p.slug}
                            link={p.link}
                        />
                    ))}

                    {sidePosts.length === 0 && (
                        <ArticleCard
                            icon="/icon_Resources_page/icon2.png"
                            category="—"
                            headline="No more posts"
                            description="Add more published posts in the WG Outputs block."
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

/** ---------- Card ---------- */
function ArticleCard({
    icon,
    category,
    headline,
    description,
    downloadUrl,
    slug,
    link,
}: {
    icon?: string;
    category: string;
    headline: string;
    description?: string;
    downloadUrl?: string;
    slug?: string | null;
    link?: string | null;
}) {
    return (
        <div className="border border-gray-200 p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="bg-[#1e2756] w-14 h-14 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                <Image
                    src={icon || "/icon_Resources_page/icon2.png"}
                    alt={category}
                    width={40}
                    height={40}
                    className="object-contain"
                />
            </div>

            <p className="text-[#1e2756] text-sm font-bold uppercase tracking-widest mb-1">
                {category}
            </p>

            <h4 className="text-[#1e2756] text-2xl khmer-font md:text-3xl font-bold mb-3 line-clamp-2">
                {headline}
            </h4>

            <p className="text-gray-700 khmer-font text-sm max-w-sm mb-6 line-clamp-3">
                {description || ""}
            </p>

            <div className="flex items-center gap-5">
                {downloadUrl ? (
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1e2756] cursor-pointer font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                        Download <ChevronRight size={14} />
                    </a>
                ) : (
                    <span className="text-gray-400 font-bold text-xs flex items-center gap-1">
                        Download <ChevronRight size={14} />
                    </span>
                )}

                {slug ? (
                    <Link
                        href={`/resources/${slug}`}
                        className="text-[#1e2756] cursor-pointer font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                        View <ChevronRight size={14} />
                    </Link>
                ) : link ? (
                    <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1e2756] cursor-pointer font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                        View <ChevronRight size={14} />
                    </a>
                ) : null}
            </div>
        </div>
    );
}