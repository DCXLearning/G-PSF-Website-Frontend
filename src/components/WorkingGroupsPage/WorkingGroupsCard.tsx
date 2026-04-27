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

type MultiLang = string | { en?: string; km?: string };

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

/* Khmer Number */
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
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as GridApiResponse;
    } catch {
        return null;
    }
}

function writeCache(data: GridApiResponse) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
}

function getText(value: MultiLang | null | undefined, lang: ApiLang): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || "";
}

function WorkGroupCardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center aspect-square p-3 rounded-2xl md:rounded-[1.8rem] shadow-xl bg-white animate-pulse">
            <div className="bg-[#1E2257] p-2 md:p-3 rounded-full mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-white/20" />
            </div>

            <div className="h-3 w-16 md:w-20 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-12 md:w-16 bg-slate-200 rounded" />
        </div>
    );
}

export default function WorkGroupsGrid() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";
    const apiLang: ApiLang = isKh ? "km" : "en";

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
                if (!res.ok) throw new Error((json as any)?.error || "Fetch error");

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
                const res = await fetch(
                    "/api/working-groups-page/section?slug=working-groups",
                    {
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                    }
                );

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

    /* FIX NUMBER ONLY */
    const count = total || workGroups.length;

    const numberText = isKh
        ? toKhmerNumber(count)
        : count.toLocaleString("en-US");

    const headerTitle = isKh
        ? `ក្រុមការងារតាមវិស័យទាំង ${numberText}`
        : `${numberText} ${count === 1 ? "Working Group" : "Working Groups"}`;

    const showSkeleton = !mounted || (loadingGrid && items.length === 0);
    const showErrorOnly = !showSkeleton && items.length === 0 && !!error;

    return (
        <div className="bg-white">
            <div className="bg-gradient-to-br from-[#2B3175] to-[#3B55A4] py-10 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl px-4 mx-auto">
                    <header className="text-center mb-8 md:mb-12">
                        <h1
                            className={`text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {headerTitle}
                        </h1>

                        {showErrorOnly ? (
                            <div className="mt-4 text-white/80 text-sm">
                                {isKh ? `មានបញ្ហា៖ ${error}` : `Error: ${error}`}
                            </div>
                        ) : null}
                    </header>

                    {/* 6 Cards per row on desktop, smaller cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                        {showSkeleton ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <WorkGroupCardSkeleton key={i} />
                            ))
                        ) : workGroups.length > 0 ? (
                            workGroups.map((group, index) => {
                                /* FIX gray/white pattern for 6 columns */
                                const isGray =
                                    (Math.floor(index / 6) + (index % 6)) % 2 !== 0;

                                return (
                                    <Link
                                        key={group.id}
                                        href={group.href}
                                        className={`group flex flex-col items-center justify-center aspect-square p-3 rounded-2xl md:rounded-[1.8rem] shadow-xl transition-all duration-300 hover:scale-[1.03]
                                        focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
                                        ${isGray ? "bg-[#d1d5db]" : "bg-white"}`}
                                        aria-label={group.title}
                                    >
                                        <div className="bg-[#1E2257] text-white p-2 md:p-3 rounded-full mb-2 md:mb-3 shadow-inner transition-transform duration-300 group-hover:scale-110">
                                            <img
                                                src={group.icon}
                                                alt=""
                                                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
                                            />
                                        </div>

                                        <p
                                            className={`text-[#1a1a1a] text-center text-[9px] sm:text-[10px] md:text-xs lg:text-[13px] font-bold leading-tight max-w-[92%] ${
                                                isKh ? "khmer-font" : ""
                                            }`}
                                        >
                                            {group.title}
                                        </p>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center text-white/90 py-8">
                                {isKh ? "មិនមានក្រុមការងារ" : "No work groups found"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-4 py-8">
                <p
                    className={`text-lg md:text-2xl font-semibold text-gray-900 mb-3 ${
                        isKh ? "khmer-font normal-case" : ""
                    }`}
                >
                    {loadingFlex ? "..." : flexLabel}
                </p>

                <h2
                    className={`text-4xl md:text-5xl font-bold text-gray-900 leading-[1.2] max-w-[850px] ${
                        isKh ? "khmer-font" : ""
                    }`}
                >
                    {loadingFlex ? "..." : flexTitle}
                </h2>

                <div className="mt-8 h-1.5 w-24" />
            </div>
        </div>
    );
}