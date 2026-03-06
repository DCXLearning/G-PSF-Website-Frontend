"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronRight, Hexagon } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type AnnualItem = {
    name?: I18n;
    year?: string;
    keyPoints?: I18n[];
    documentFile?: string | null;
    documentThumbnail?: string | null;
};

type ApiPost = {
    id: number;
    title?: I18n;
    content?: {
        en?: { items?: AnnualItem[] };
        km?: { items?: AnnualItem[] };
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
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

const CACHE_KEY_PREFIX = "annual-reports-block-cache";

function pickText(i18n: I18n | null | undefined, lang: UiLang) {
    return (lang === "kh" ? i18n?.km : i18n?.en) || i18n?.en || i18n?.km || "";
}

function getCacheKey(apiLanguage: ApiLang) {
    return `${CACHE_KEY_PREFIX}-${apiLanguage}`;
}

function readCache(apiLanguage: ApiLang): ApiBlock | null {
    try {
        const raw = sessionStorage.getItem(getCacheKey(apiLanguage));
        if (!raw) return null;
        return JSON.parse(raw) as ApiBlock;
    } catch {
        return null;
    }
}

function writeCache(apiLanguage: ApiLang, block: ApiBlock | null) {
    if (!block) return;
    try {
        sessionStorage.setItem(getCacheKey(apiLanguage), JSON.stringify(block));
    } catch {
        // ignore
    }
}

function pickAnnualReportsBlock(json: ApiResponse): ApiBlock | null {
    const blocks = json?.data?.blocks || [];

    return (
        blocks.find(
            (b) =>
                b?.enabled !== false &&
                (b?.type === "annual_reports" || b?.id === 31)
        ) || null
    );
}

export default function AnnualReports() {
    const { language, apiLang, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const apiLanguage = (apiLang as ApiLang) ?? "en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [block, setBlock] = useState<ApiBlock | null>(null);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(apiLanguage);
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

                if (!res.ok) throw new Error(`API error ${res.status}`);

                const json = (await res.json()) as ApiResponse;
                if (!alive) return;

                const picked = pickAnnualReportsBlock(json);

                if (picked) {
                    setBlock(picked);
                    writeCache(apiLanguage, picked);
                }
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
    }, [apiLanguage]);

    const items = useMemo<AnnualItem[]>(() => {
        const posts = block?.posts || [];
        const key = apiLanguage === "km" ? "km" : "en";

        const out: AnnualItem[] = [];
        for (const p of posts) {
            const list = p?.content?.[key]?.items || [];
            out.push(...list);
        }
        return out;
    }, [block, apiLanguage]);

    const showSkeleton = !mounted || (loading && !block);
    const showErrorOnly = !showSkeleton && !block && !!error;
    const showEmpty = !showSkeleton && !error && items.length === 0;

    return (
        <section className={`bg-[#3b5998] py-12 px-4 sm:py-20 ${fontClass}`}>
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {pickText(block?.title, uiLang) || "Annual Reports"}
                    </h2>

                    <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
                        {pickText(block?.description ?? undefined, uiLang) ||
                            "Turning conversation into action through Cambodia trusted G-PSF mechanism. See the reform progress by the Royal Government of Cambodia line ministries."}
                    </p>

                    {showErrorOnly ? (
                        <div className="text-red-200 text-center mt-4">Failed: {error}</div>
                    ) : null}
                </div>

                {showSkeleton ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-pulse">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white p-3 md:p-4 shadow-2xl flex flex-col h-full"
                            >
                                <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 flex-grow">
                                    <div className="w-full h-full bg-slate-200" />

                                    <div className="absolute inset-x-0 bottom-0 top-[35%] bg-white/60 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between border-t border-white/20">
                                        <div>
                                            <div className="h-4 w-16 bg-slate-300 rounded mb-3" />
                                            <div className="h-8 w-3/4 bg-slate-300 rounded mb-4" />

                                            <div className="space-y-3">
                                                {Array.from({ length: 4 }).map((__, i) => (
                                                    <div key={i} className="flex items-center">
                                                        <div className="w-3 h-3 mr-2 rounded-full bg-slate-300 shrink-0" />
                                                        <div className="h-4 w-full bg-slate-300 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-10 w-full bg-slate-300 rounded mt-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className="text-white/80 text-center">No annual reports found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {items.map((it, index) => {
                            const year = it.year || "—";
                            const name = pickText(it.name, uiLang) || "Annual Report";
                            const points = (it.keyPoints || [])
                                .map((p) => pickText(p, uiLang))
                                .filter(Boolean);
                            const docUrl = it.documentFile || "";
                            const thumb = it.documentThumbnail || "";

                            return (
                                <div
                                    key={`${year}-${index}`}
                                    className="bg-white p-3 md:p-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 flex-grow">
                                        {thumb ? (
                                            <Image
                                                src={thumb}
                                                alt={`${year} Annual Report`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100" />
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 top-[35%] bg-white/40 md:bg-white/60 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between border-t border-white/20">
                                            <div>
                                                <h3 className="text-gray-500 text-sm md:text-base font-semibold uppercase tracking-wider">
                                                    {year}
                                                </h3>

                                                <p className="text-[#3b5998] text-xl md:text-2xl font-extrabold mb-4 line-clamp-2">
                                                    {name}
                                                </p>

                                                <ul className="space-y-2 md:space-y-3">
                                                    {(points.length ? points : ["—", "—", "—", "—"])
                                                        .slice(0, 4)
                                                        .map((pt, i) => (
                                                            <li
                                                                key={i}
                                                                className="flex items-center text-gray-700 text-xs md:text-sm font-medium"
                                                            >
                                                                <Hexagon className="w-3 h-3 mr-2 text-[#3b5998] fill-[#3b5998]/10 shrink-0" />
                                                                <span className="line-clamp-1">{pt}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>

                                            <a
                                                href={docUrl || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`w-full mt-3 md:mt-5 bg-[#f39c12] hover:bg-[#e67e22] text-white py-2 px-3 rounded transition-all flex items-center justify-center group ${!docUrl ? "pointer-events-none opacity-60" : ""
                                                    }`}
                                            >
                                                <span>{uiLang === "kh" ? "ទាញយក" : "Download"}</span>
                                                <ChevronRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}