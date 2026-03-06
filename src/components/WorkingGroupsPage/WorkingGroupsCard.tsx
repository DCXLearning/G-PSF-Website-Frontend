/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type ApiWG = {
    id: number;
    title: { en: string; km: string };
    iconUrl: string;
    slug: string;
};

type ApiResponse = {
    total: number;
    items: ApiWG[];
};

type WorkGroupUI = {
    id: number;
    title: string;
    icon: string;
    href: string;
};

const CACHE_KEY = "working_groups_grid_cache";

function readCache(): ApiResponse | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ApiResponse;
    } catch {
        return null;
    }
}

function writeCache(data: ApiResponse) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore cache errors
    }
}

function WorkGroupCardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center aspect-square p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl bg-white animate-pulse">
            <div className="bg-[#1E2257] p-3 md:p-4 rounded-full mb-3 md:mb-5">
                <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-white/20" />
            </div>

            <div className="h-4 w-20 md:w-28 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-16 md:w-24 bg-slate-200 rounded" />
        </div>
    );
}

export default function WorkGroupsGrid() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";
    const apiLang: ApiLang = isKh ? "km" : "en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [total, setTotal] = useState<number>(0);
    const [items, setItems] = useState<ApiWG[]>([]);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached) {
            setTotal(Number(cached?.total ?? 0));
            setItems(Array.isArray(cached?.items) ? cached.items : []);
            setLoading(false);
        }

        let alive = true;

        async function load() {
            try {
                setError("");

                const res = await fetch("/api/working-groups", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = (await res.json()) as ApiResponse;
                if (!res.ok) throw new Error((json as any)?.error || "Fetch error");

                if (!alive) return;

                const nextData: ApiResponse = {
                    total: Number(json?.total ?? 0),
                    items: Array.isArray(json?.items) ? json.items : [],
                };

                setTotal(nextData.total);
                setItems(nextData.items);
                writeCache(nextData);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load");
                // keep cached items, do not clear state
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

    const workGroups: WorkGroupUI[] = useMemo(() => {
        return items.map((g) => ({
            id: g.id,
            title: (g.title?.[apiLang] || g.title?.en || "").trim(),
            icon: g.iconUrl || "/icon/default.png",
            href: g.slug ? `/working-groups/${g.slug}` : "/working-groups",
        }));
    }, [items, apiLang]);

    const headerTitle = isKh
        ? `ក្រុមការងារ ${total || workGroups.length}`
        : `${total || workGroups.length} Work Groups`;

    const headerSub = isKh ? "ធ្វើការសម្រាប់អ្នក" : "Working For You";

    const flexLabel = isKh ? "ក្រុមការងារបត់បែន (WGs)" : "Flexible WGs";
    const flexTitle = isKh
        ? "អាចបង្កើតក្រុមការងារថ្មី បញ្ចូលជាក្រុមតែមួយ ឬរំលាយក្រុមការងារ ដោយផ្អែកលើការផ្លាស់ប្តូរស្ថានភាពសេដ្ឋកិច្ច និងតម្រូវការរបស់វិស័យនានា។"
        : "New Working Groups may be established, merged, or dissolved in response to changing economic conditions and sector needs.";

    const showSkeleton = !mounted || (loading && items.length === 0);
    const showErrorOnly = !showSkeleton && items.length === 0 && !!error;

    return (
        <div className="bg-white">
            <div className="bg-gradient-to-br from-[#2B3175] to-[#3B55A4] py-10 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl px-4 mx-auto">
                    {/* Header */}
                    <header className="text-center mb-10 md:mb-16">
                        <h1
                            className={`text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {headerTitle}
                            <br />
                            <span className="opacity-90">{headerSub}</span>
                        </h1>

                        {showErrorOnly ? (
                            <div className="mt-4 text-white/80 text-sm">
                                {isKh ? `មានបញ្ហា៖ ${error}` : `Error: ${error}`}
                            </div>
                        ) : null}
                    </header>

                    {/* Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {showSkeleton ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <WorkGroupCardSkeleton key={i} />
                            ))
                        ) : workGroups.length > 0 ? (
                            workGroups.map((group, index) => {
                                // no window usage here
                                const isGray = (Math.floor(index / 4) + (index % 4)) % 2 !== 0;

                                return (
                                    <Link
                                        key={group.id}
                                        href={group.href}
                                        className={`group flex flex-col items-center justify-center aspect-square p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl transition-all duration-300 hover:scale-[1.03]
                    focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
                    ${isGray ? "bg-[#d1d5db]" : "bg-white"}`}
                                        aria-label={group.title}
                                    >
                                        <div className="bg-[#1E2257] text-white p-3 md:p-4 rounded-full mb-3 md:mb-5 shadow-inner transition-transform duration-300 group-hover:scale-110">
                                            <img
                                                src={group.icon}
                                                alt=""
                                                className="w-10 h-10 md:w-20 md:h-20 object-contain"
                                            />
                                        </div>

                                        <p
                                            className={`text-[#1a1a1a] text-center text-[10px] sm:text-sm md:text-base font-bold leading-tight max-w-[90%] ${isKh ? "khmer-font" : ""
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

            {/* Responsive title section */}
            <div className="max-w-7xl mx-auto px-4 md:px-4 py-8">
                <p
                    className={`text-lg md:text-2xl font-semibold text-gray-900 mb-3 ${isKh ? "khmer-font normal-case" : ""
                        }`}
                >
                    {flexLabel}
                </p>

                <h2
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-[1.2] max-w-[850px] ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {flexTitle}
                </h2>

                <div className="mt-8 h-1.5 w-24" />
            </div>
        </div>
    );
}