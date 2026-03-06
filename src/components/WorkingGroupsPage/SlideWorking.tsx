"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowRight, ArrowLeft, UserCircle2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

import "swiper/css";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiItem = {
    name?: I18n;
    profileUrl?: string | null;
    description?: I18n;
};

type Block = {
    id: number;
    type: string;
    posts?: Array<{
        id: number;
        content?: {
            en?: { items?: ApiItem[] };
            km?: { items?: ApiItem[] };
        };
    }>;
};

type ApiResponse = {
    success: boolean;
    data?: {
        blocks?: Block[];
    };
};

interface CoChair {
    id: number;
    type: "empty" | "photo" | "card";
    name?: string;
    role?: string;
    profileUrl?: string | null;
}

const API_URL = "/api/working-groups-page/section";
const CACHE_KEY_PREFIX = "wg-cochairs-cache";

function getCacheKey(lang: Lang) {
    return `${CACHE_KEY_PREFIX}-${lang}`;
}

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return (primary || obj.en || obj.km || fallback).trim();
}

function cleanText(s?: string) {
    return (s || "").replace(/\n+/g, " ").trim();
}

function padWithEmpties(items: CoChair[], targetCount: number, startId = 10000) {
    const out = [...items];
    let id = startId;
    while (out.length < targetCount) out.push({ id: id++, type: "empty" });
    return out;
}

function readCache(lang: Lang): ApiItem[] {
    try {
        const raw = localStorage.getItem(getCacheKey(lang));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCache(lang: Lang, items: ApiItem[]) {
    try {
        localStorage.setItem(getCacheKey(lang), JSON.stringify(items));
    } catch {
        // ignore cache errors
    }
}

const CoChairCard = ({ chair, lang }: { chair: CoChair; lang: Lang }) => {
    if (chair.type === "empty") {
        return <div className="bg-gray-200 aspect-square w-full" />;
    }

    const isKh = lang === "kh";

    if (chair.type === "photo") {
        return (
            <div className="bg-[#1e3a8a] aspect-square w-full p-6 flex flex-col items-center justify-center text-white shadow-inner text-center">
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        {chair.profileUrl ? (
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 ring-white/20">
                                <Image
                                    src={chair.profileUrl}
                                    alt={chair.name || "Co-chair"}
                                    fill
                                    className="object-cover"
                                    sizes="(min-width: 768px) 128px, 96px"
                                />
                            </div>
                        ) : (
                            <UserCircle2
                                className="w-24 h-24 md:w-32 md:h-32 text-gray-300 opacity-90"
                                strokeWidth={1}
                            />
                        )}
                    </div>

                    <h3
                        className={`font-bold text-lg md:text-xl text-yellow-500 ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {chair.name || (isKh ? "ឈ្មោះសហអធិបតី" : "H.E. NAME NAME")}
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e3a8a] aspect-square w-full p-6 flex flex-col items-center justify-center text-white shadow-inner text-center">
            <h3
                className={`font-bold text-xl text-yellow-500 ${isKh ? "khmer-font" : ""
                    }`}
            >
                {chair.name || (isKh ? "ឈ្មោះ" : "Name")}
            </h3>

            {chair.role ? (
                <p className={`text-sm mt-2 opacity-90 ${isKh ? "khmer-font" : ""}`}>
                    {chair.role}
                </p>
            ) : null}
        </div>
    );
};

function CoChairSkeletonTile() {
    return (
        <div className="bg-[#1e3a8a] aspect-square w-full p-6 flex flex-col items-center justify-center text-white shadow-inner text-center animate-pulse">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 mb-4" />
            <div className="h-5 w-32 bg-white/20 rounded mb-2" />
            <div className="h-4 w-24 bg-white/15 rounded" />
        </div>
    );
}

export default function FullWidthSwiperLayout() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";

    const topSwiperRef = useRef<any>(null);
    const bottomSwiperRef = useRef<any>(null);

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<ApiItem[]>([]);

    useEffect(() => {
        setMounted(true);

        const cached = readCache(lang);
        if (cached.length > 0) {
            setItems(cached);
            setLoading(false);
        }

        const controller = new AbortController();
        let alive = true;

        async function load() {
            try {
                const res = await fetch(API_URL, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                const json: ApiResponse = await res.json();
                if (!alive) return;

                const blocks = json?.data?.blocks ?? [];
                const block = blocks.find((b) => b.type === "working_group_co_chairs");
                const post = block?.posts?.[0];

                const apiLang: ApiLang = lang === "kh" ? "km" : "en";

                const list =
                    post?.content?.[apiLang]?.items ??
                    post?.content?.en?.items ??
                    post?.content?.km?.items ??
                    [];

                const nextItems = Array.isArray(list) ? list : [];
                setItems(nextItems);
                writeCache(lang, nextItems);
            } catch (e: any) {
                if (e?.name !== "AbortError" && alive) {
                    // keep cached items, do not clear state
                    console.error("Failed to load co-chairs:", e);
                }
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
            controller.abort();
        };
    }, [lang]);

    const { topRowData, bottomRowData } = useMemo(() => {
        const apiLang: ApiLang = lang === "kh" ? "km" : "en";

        const mapped: CoChair[] = (items || []).map((it, idx) => ({
            id: idx + 1,
            type: "photo",
            name: pickText(it.name, apiLang, ""),
            role: cleanText(pickText(it.description, apiLang, "")),
            profileUrl: it.profileUrl || null,
        }));

        return {
            topRowData: padWithEmpties(
                mapped.map((x) => ({ ...x, type: "photo" as const })),
                6,
                20000
            ),
            bottomRowData: padWithEmpties(
                mapped.map((x) => ({ ...x, type: "card" as const })),
                7,
                30000
            ),
        };
    }, [items, lang]);

    const showSkeleton = !mounted || (loading && items.length === 0);

    return (
        <section className="py-10 w-full overflow-hidden bg-white">
            <div className="px-8 mb-12">
                <h1
                    className={`text-4xl md:text-5xl font-extrabold text-gray-900 ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {lang === "kh" ? "សហអធិបតីក្រុមការងារ" : "Working Group Co-Chairs"}
                </h1>
                <div className="mt-4 h-1.5 bg-orange-500 w-64" />
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex w-full items-stretch">
                    <div className="flex-1 overflow-hidden">
                        {showSkeleton ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                            </div>
                        ) : (
                            <Swiper
                                onSwiper={(s) => (topSwiperRef.current = s)}
                                modules={[Navigation]}
                                slidesPerView={1.5}
                                spaceBetween={4}
                                loop={true}
                                breakpoints={{
                                    640: { slidesPerView: 2.5 },
                                    1024: { slidesPerView: 4.5 },
                                    1440: { slidesPerView: 4 },
                                }}
                            >
                                {topRowData.map((item) => (
                                    <SwiperSlide key={item.id}>
                                        <CoChairCard chair={item} lang={lang} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>

                    <button
                        onClick={() => topSwiperRef.current?.slideNext()}
                        className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all z-10 w-[15%] md:w-[10%] lg:w-[15%]"
                        aria-label="Next"
                        type="button"
                    >
                        <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                </div>

                <div className="flex w-full flex-row-reverse items-stretch">
                    <div className="flex-1 overflow-hidden">
                        {showSkeleton ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                                <CoChairSkeletonTile />
                            </div>
                        ) : (
                            <Swiper
                                onSwiper={(s) => (bottomSwiperRef.current = s)}
                                modules={[Navigation]}
                                slidesPerView={1.5}
                                spaceBetween={4}
                                loop={true}
                                breakpoints={{
                                    640: { slidesPerView: 2.5 },
                                    1024: { slidesPerView: 4.5 },
                                    1440: { slidesPerView: 4 },
                                }}
                            >
                                {bottomRowData.map((item) => (
                                    <SwiperSlide key={item.id}>
                                        <CoChairCard chair={item} lang={lang} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>

                    <button
                        onClick={() => bottomSwiperRef.current?.slidePrev()}
                        className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all z-10 w-[15%] md:w-[10%] lg:w-[15%]"
                        aria-label="Prev"
                        type="button"
                    >
                        <ArrowLeft className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                </div>
            </div>
        </section>
    );
}