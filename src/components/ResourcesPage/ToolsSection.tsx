"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };
type ApiLang = "en" | "km";
type UiLang = "en" | "kh";

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;

    coverImage?: string | null;

    document?: string | null;
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
    settings?: { limit?: number; categoryIds?: number[] } | null;
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const pickText = (i18n: I18n | null | undefined, lang: UiLang) =>
    (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";

function pickDocUrl(post: ApiPost, apiLang: ApiLang) {
    const key = apiLang === "km" ? "km" : "en";
    return post.documents?.[key]?.url || post.document || post.link || "";
}

export default function ToolsSection() {
    const { language, apiLang, fontClass } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/resources-page/section", {
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
                            (b?.id === 29 || b?.title?.en === "Templates & Forms")
                    ) || null;

                if (mounted) setBlock(picked);
            } catch (e: any) {
                if (mounted) setError(e?.message || "Fetch failed");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const posts = useMemo(() => {
        const p = block?.posts || [];
        const limit = block?.settings?.limit ?? 3;
        return p.slice(0, limit);
    }, [block]);

    return (
        <section className={`bg-white py-20 px-4 ${fontClass}`}>
            <div className="max-w-6xl mx-auto text-center">
                {/* Header */}
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e1e4b] uppercase tracking-tight">
                    {pickText(block?.title, language) || "Templates & Forms"}
                </h2>

                <h1 className="text-5xl md:text-6xl font-bold text-[#1e1e4b] mt-2 mb-6">
                    Tools
                </h1>

                <p className="max-w-3xl mx-auto text-[#1e1e4b] text-xl leading-relaxed mb-16">
                    {pickText(block?.description, language) ||
                        "Download standard templates and forms to support Working Group operations and documentation."}
                </p>

                {/* States */}
                {loading && <div className="text-slate-600 text-sm">Loading…</div>}

                {!loading && error && (
                    <div className="text-red-600 text-sm">Failed to load: {error}</div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="text-slate-600 text-sm">No templates found.</div>
                )}

                {/* Grid */}
                {!loading && !error && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {posts.map((post) => {
                            const docUrl = pickDocUrl(post, apiLang);

                            return (
                                <div
                                    key={post.id}
                                    className="flex flex-col items-center rounded-2xl p-6 transition hover:shadow-lg"
                                >
                                    {/* Icon */}
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg overflow-hidden">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={pickText(post.title, language) || "icon"}
                                                width={56}
                                                height={56}
                                                className="w-12 h-12 object-contain"
                                            />
                                        ) : (
                                            <span className="text-white text-xs">PDF</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <span className="text-slate-900 font-bold mb-2">
                                        {pickText(post.category?.name, language) || "Template"}
                                    </span>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">
                                        {pickText(post.title, language) || "Untitled"}
                                    </h3>

                                    <p className="text-[#1e1e4b] text-sm leading-6 mb-8 px-2 line-clamp-4">
                                        {pickText(post.description, language) || "—"}
                                    </p>

                                    {/* Download */}
                                    <a
                                        href={docUrl || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`hover:underline flex items-center gap-2 px-8 py-2 border border-orange-400 text-slate-800 text-sm font-bold rounded-lg hover:bg-orange-50 transition-colors ${!docUrl ? "pointer-events-none opacity-50" : ""
                                            }`}
                                    >
                                        Download <span className="text-xs">›</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}