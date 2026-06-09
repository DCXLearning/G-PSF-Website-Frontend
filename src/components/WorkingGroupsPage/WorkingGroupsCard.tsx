/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type ApiWG = {
    id: number;
    title: { en?: string; km?: string };
    iconUrl: string;
    slug: string;
};

type GridApiResponse = {
    total: number;
    items: ApiWG[];
};

type MultiLang = string | { en?: string; km?: string; kh?: string };

type SectionBlock = {
    id: number;
    type: string;
    title?: MultiLang;
    description?: MultiLang | null;
};

type SectionApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        blocks?: SectionBlock[];
    };
};

type WorkGroupUI = {
    id: number;
    title: string;
    icon: string;
    href: string;
};

const CACHE_KEY = "working_groups_grid_cache";

function normalizeLang(language: unknown): Lang {
    const value = String(language || "en").toLowerCase();
    return value === "kh" || value === "km" ? "kh" : "en";
}

function toKhmerNumber(n: number) {
    const map: Record<string, string> = {
        "0": "០",
        "1": "១",
        "2": "២",
        "3": "៣",
        "4": "៤",
        "5": "៥",
        "6": "៦",
        "7": "៧",
        "8": "៨",
        "9": "៩",
    };

    return String(n).replace(/[0-9]/g, (d) => map[d]);
}

function readCache(): GridApiResponse | null {
    try {
        if (typeof window === "undefined") return null;

        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;

        return JSON.parse(raw) as GridApiResponse;
    } catch {
        return null;
    }
}

function writeCache(data: GridApiResponse) {
    try {
        if (typeof window === "undefined") return;
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore cache error
    }
}

function getText(value: MultiLang | null | undefined, lang: ApiLang): string {
    if (!value) return "";
    if (typeof value === "string") return value;

    return value[lang] || value.km || value.kh || value.en || "";
}

function WorkGroupCardSkeleton() {
    return (
        <div className="flex aspect-square animate-pulse flex-col items-center rounded-2xl bg-white p-3 shadow-xl md:rounded-[1.8rem]">
            <div className="flex h-[62%] w-full items-end justify-center pb-2">
                <div className="rounded-full bg-[#1E2257] p-2 md:p-3">
                    <div className="h-8 w-8 rounded-full bg-white/20 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14" />
                </div>
            </div>

            <div className="flex h-[38%] w-full flex-col items-center justify-start overflow-hidden pt-2">
                <div className="mb-2 h-3 w-16 rounded bg-slate-200 md:w-20" />
                <div className="h-3 w-12 rounded bg-slate-200 md:w-16" />
            </div>
        </div>
    );
}

export default function WorkGroupsGrid() {
    const { language } = useLanguage();

    const lang = normalizeLang(language);
    const isKh = lang === "kh";
    const apiLang: ApiLang = isKh ? "km" : "en";

    const wrapperFontClass = isKh ? "khmer-font" : "airbnb-font";
    const titleFontClass = isKh ? "title-km" : "title-en";
    const bodyFontClass = isKh ? "body-km" : "body-en";
    const labelFontClass = isKh ? "body-km" : "body-en";
    const cardTextFontClass = isKh ? "body-km" : "body-en";

    const [mounted, setMounted] = useState(false);
    const [loadingGrid, setLoadingGrid] = useState(true);
    const [loadingFlex, setLoadingFlex] = useState(true);

    const [error, setError] = useState<string>("");
    const [total, setTotal] = useState<number>(0);
    const [items, setItems] = useState<ApiWG[]>([]);

    const [flexLabel, setFlexLabel] = useState("Flexible WGs");
    const [flexTitle, setFlexTitle] = useState(
        "New Working Groups may be established, merged, or dissolved in response to changing economic conditions and sector needs."
    );

    useEffect(() => {
        setMounted(true);

        const cached = readCache();

        if (cached) {
            setTotal(Number(cached?.total ?? 0));
            setItems(Array.isArray(cached?.items) ? cached.items : []);
            setLoadingGrid(false);
        }

        let alive = true;

        async function loadGrid() {
            try {
                setError("");

                const res = await fetch("/api/working-groups", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = (await res.json()) as GridApiResponse;

                if (!res.ok) {
                    throw new Error((json as any)?.error || "Fetch error");
                }

                if (!alive) return;

                const nextData: GridApiResponse = {
                    total: Number(json?.total ?? 0),
                    items: Array.isArray(json?.items) ? json.items : [],
                };

                setTotal(nextData.total);
                setItems(nextData.items);
                writeCache(nextData);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load");
            } finally {
                if (!alive) return;
                setLoadingGrid(false);
            }
        }

        async function loadFlexibleBlock() {
            try {
                const res = await fetch("/api/working-groups-page/section?slug=working-groups", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = (await res.json()) as SectionApiResponse;

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || "Failed to fetch flexible block");
                }

                const block44 = json?.data?.blocks?.find(
                    (item) => item.id === 44 && item.type === "text_block"
                );

                if (!alive || !block44) return;

                const nextLabel = getText(block44.title, apiLang).trim();
                const nextTitle = getText(block44.description, apiLang).trim();

                if (nextLabel) setFlexLabel(nextLabel);
                if (nextTitle) setFlexTitle(nextTitle);
            } catch (e) {
                console.error("Failed to load block 44:", e);
            } finally {
                if (!alive) return;
                setLoadingFlex(false);
            }
        }

        loadGrid();
        loadFlexibleBlock();

        return () => {
            alive = false;
        };
    }, [apiLang]);

    const workGroups: WorkGroupUI[] = useMemo(() => {
        return items.map((g) => ({
            id: g.id,
            title: (g.title?.[apiLang] || g.title?.en || "").trim(),
            icon: g.iconUrl || "/icon/default.png",
            href: g.slug ? `/working-groups/${g.slug}` : "/working-groups",
        }));
    }, [items, apiLang]);

    const count = total || workGroups.length;

    const numberText = isKh ? toKhmerNumber(count) : count.toLocaleString("en-US");

    const headerTitle = isKh
        ? `ក្រុមការងារតាមវិស័យទាំង ${numberText}`
        : `${numberText} ${count === 1 ? "Working Group" : "Working Groups"}`;

    const showSkeleton = !mounted || (loadingGrid && items.length === 0);
    const showErrorOnly = !showSkeleton && items.length === 0 && !!error;

    return (
        <div className={`bg-white ${wrapperFontClass}`}>
            <div className="bg-gradient-to-br from-[#2B3175] to-[#3B55A4] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl px-4">
                    <header className="mb-8 text-center md:mb-12">
                        <h1 className={`!text-white ${titleFontClass}`}>{headerTitle}</h1>

                        {showErrorOnly ? (
                            <div className={`mt-4 text-white/80 ${bodyFontClass}`}>
                                {isKh ? `មានបញ្ហា៖ ${error}` : `Error: ${error}`}
                            </div>
                        ) : null}
                    </header>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6 lg:gap-5">
                        {showSkeleton ? (
                            Array.from({ length: 12 }).map((_, i) => <WorkGroupCardSkeleton key={i} />)
                        ) : workGroups.length > 0 ? (
                            workGroups.map((group, index) => {
                                const isGray = (Math.floor(index / 6) + (index % 6)) % 2 !== 0;

                                return (
                                    <Link
                                        key={group.id}
                                        href={group.href}
                                        className={`
                      group flex aspect-square flex-col items-center rounded-2xl p-3 shadow-xl
                      transition-all duration-300 hover:scale-[1.03]
                      focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
                      md:rounded-[1.8rem]
                      ${isGray ? "bg-[#d1d5db]" : "bg-white"}
                    `}
                                        aria-label={group.title}
                                    >
                                        <div className="flex h-[62%] w-full items-end justify-center pb-2">
                                            <div className="rounded-full bg-[#1E2257] p-2 text-white shadow-inner transition-transform duration-300 group-hover:scale-110 md:p-3">
                                                <img
                                                    src={group.icon}
                                                    alt=""
                                                    className="h-8 w-8 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex h-[38%] w-full items-start justify-center overflow-hidden pt-1">
                                            <p
                                                className={`
                                                ${cardTextFontClass}
                                                mx-auto w-full max-w-[92%]
                                                text-center text-[#1a1a1a]
                                                !font-medium !leading-[28px]
                                                line-clamp-2 overflow-hidden
                                                whitespace-normal break-words
                                                `}
                                                title={group.title}
                                            >
                                                {group.title}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className={`col-span-full py-8 text-center text-white/90 ${bodyFontClass}`}>
                                {isKh ? "មិនមានក្រុមការងារ" : "No work groups found"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-4">
                <p className={`mb-3 text-gray-900 ${labelFontClass} !font-bold`}>
                    {loadingFlex ? "..." : flexLabel}
                </p>

                <h2 className={`max-w-[850px] text-gray-900 ${titleFontClass}`}>
                    {loadingFlex ? "..." : flexTitle}
                </h2>

                <div className="mt-8 h-1.5 w-24" />
            </div>
        </div>
    );
}