// ✅ components/CaseStudies.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    // UI uses "kh", API uses "km"
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

export default function CaseStudies() {
    const { language, apiLang, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const apiLanguage = (apiLang as ApiLang) ?? "en";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // ✅ use your proxy route
                const res = await fetch("/api/newupdate-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                const blocks = json?.data?.blocks || [];

                // ✅ Case Studies block id 24
                const picked =
                    blocks.find(
                        (b) =>
                            b?.enabled !== false &&
                            b?.type === "post_list" &&
                            (b?.id === 24 || b?.title?.en === "Case Studies")
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

    const featured = posts[0];
    const side = posts.slice(1, 3);

    const t = useMemo(() => {
        return {
            header: uiLang === "kh" ? "ជោគជ័យដែលបានបង្ហាញ" : "Featured Success",
            title: pickText(block?.title, uiLang) || (uiLang === "kh" ? "ករណីសិក្សា" : "Case Studies"),
            relatedPhoto: uiLang === "kh" ? "រូបថតដែលទាក់ទង" : "Related Photo",
            workingGroup: uiLang === "kh" ? "ឈ្មោះក្រុមការងារ" : "Working Group",
            download: uiLang === "kh" ? "ទាញយក" : "Download",
            fallbackDesc:
                uiLang === "kh"
                    ? "ទទួលបានព័ត៌មានអំពីការអភិវឌ្ឍន៍សំខាន់ៗពី G-PSF រួមទាំងលទ្ធផលពេញអង្គ វឌ្ឍនភាពនៃក្រុមការងារ ការសង្ខេបគោលនយោបាយ និងកំណែទម្រង់ស្ថាប័ន។"
                    : "Stay informed on key developments from the G-PSF, including plenary outcomes, Working Group progress, policy briefs, and institutional reforms.",
        };
    }, [uiLang, block]);

    return (
        <section className={`bg-white py-12 px-4 md:px-8 ${fontClass}`}>
            <div className="max-w-7xl px-4 mx-auto">
                {/* Header Section */}
                <div className="mb-12">
                    <p className={`text-[#1a2b4b] text-xl font-bold mb-1 ${uiLang === "kh" ? "khmer-font" : ""}`}>
                        {t.header}
                    </p>
                    <h2 className={`text-[#1a2b4b] text-5xl font-black mb-6 leading-tight ${uiLang === "kh" ? "khmer-font" : ""}`}>
                        {t.title}
                    </h2>
                    <div className="w-full max-w-[480px] h-1.5 bg-orange-500"></div>
                </div>

                {/* States */}
                {loading && <div className="text-slate-600 text-sm">Loading…</div>}
                {!loading && error && <div className="text-red-600 text-sm">Failed: {error}</div>}
                {!loading && !error && posts.length === 0 && (
                    <div className="text-slate-600 text-sm">No case studies found.</div>
                )}

                {/* Grid Container */}
                {!loading && !error && posts.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: Featured */}
                        {featured && (
                            <div className="bg-[#e9ecef] flex flex-col h-full shadow-sm">
                                <div className="bg-gray-200/50 flex-1 flex flex-col items-center justify-center p-12 min-h-[390px]">
                                    <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center w-full max-w-[360px]">
                                        {pickThumbUrl(featured, apiLanguage) ? (
                                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                                                <Image
                                                    src={pickThumbUrl(featured, apiLanguage)}
                                                    alt="Related"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] w-full bg-gray-50 flex items-center justify-center">
                                                <span className="text-gray-400 font-bold text-xs tracking-widest uppercase">
                                                    {t.relatedPhoto}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-10 bg-[#eceff1]">
                                    <span className={`inline-block bg-[#1a2b4b] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                        {t.workingGroup}: {pickText(featured.category?.name, uiLang) || "—"}
                                    </span>

                                    <h3 className={`text-[#1a2b4b] text-4xl khmer-font font-black mb-4 leading-tight ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                        {pickText(featured.title, uiLang) || "—"}
                                    </h3>

                                    <p className={`text-gray-700 text-sm khmer-font leading-relaxed mb-8 max-w-md ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                        {pickText(featured.description ?? undefined, uiLang) || t.fallbackDesc}
                                    </p>

                                    <a
                                        href={pickDocUrl(featured, apiLanguage) || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`text-[#1a2b4b] text-xs font-bold flex items-center hover:text-orange-600 transition-colors uppercase tracking-widest ${!pickDocUrl(featured, apiLanguage) ? "pointer-events-none opacity-60" : ""
                                            } ${uiLang === "kh" ? "khmer-font" : ""}`}
                                    >
                                        {t.download} <span className="ml-2 text-lg">›</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* RIGHT: 2 small cards */}
                        <div className="flex flex-col gap-8">
                            {side.map((post) => {
                                const docUrl = pickDocUrl(post, apiLanguage);

                                return (
                                    <div key={post.id} className="bg-[#e9ecef] p-12 flex-1 flex flex-col justify-center">
                                        <div className={`text-[#1a2b4b] text-[10px] font-bold mb-3 uppercase tracking-wider ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                            {t.workingGroup}: {pickText(post.category?.name, uiLang) || "—"}
                                        </div>

                                        <h3 className={`text-[#1a2b4b] text-3xl khmer-font font-black mb-4 leading-tight ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                            {pickText(post.title, uiLang) || "—"}
                                        </h3>

                                        <p className={`text-gray-700 khmer-font text-sm leading-relaxed mb-8 max-w-sm ${uiLang === "kh" ? "khmer-font" : ""}`}>
                                            {pickText(post.description ?? undefined, uiLang) || t.fallbackDesc}
                                        </p>

                                        <a
                                            href={docUrl || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`text-[#1a2b4b] text-xs font-bold flex items-center hover:text-orange-600 transition-colors uppercase mt-auto tracking-widest ${!docUrl ? "pointer-events-none opacity-60" : ""
                                                } ${uiLang === "kh" ? "khmer-font" : ""}`}
                                        >
                                            {t.download} <span className="ml-2 text-lg">›</span>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}