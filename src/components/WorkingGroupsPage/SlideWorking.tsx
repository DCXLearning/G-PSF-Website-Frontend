"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowLeft, ArrowRight, UserCircle2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

import "swiper/css";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type CoChairItem = {
    name?: I18n;
    profileUrl?: string | null;
    description?: I18n;
};

type Block = {
    id: number;
    type: string;
    title?: I18n;
    posts?: Array<{
        id: number;
        content?: {
            en?: { items?: CoChairItem[] };
            km?: { items?: CoChairItem[] };
        };
    }>;
};

type ApiResponse = {
    success: boolean;
    data?: {
        page?: I18n;
        slug?: string;
        blocks?: Block[];
    };
};

function pickText(obj: I18n | undefined, lang: ApiLang, fallback = "") {
    if (!obj) return fallback;
    const primary = lang === "km" ? obj.km : obj.en;
    return (primary && primary.trim()) || (obj.en && obj.en.trim()) || fallback;
}

function uiToApiLang(ui: UiLang): ApiLang {
    return ui === "kh" ? "km" : "en";
}

function safeArr<T>(v: any): T[] {
    return Array.isArray(v) ? v : [];
}

/* ================= CARDS ================= */

function PhotoCard({
    name,
    profileUrl,
}: {
    name: string;
    profileUrl?: string | null;
}) {
    return (
        <div className="bg-[#1e3a8a] w-full aspect-square flex flex-col items-center justify-center text-white text-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                {profileUrl ? (
                    <Image
                        src={profileUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="112px"
                    />
                ) : (
                    <UserCircle2 className="w-16 h-16 text-gray-200 opacity-90" strokeWidth={1} />
                )}
            </div>

            <h3 className="mt-4 font-extrabold text-yellow-500 text-lg md:text-xl line-clamp-2 px-2">
                {name}
            </h3>
        </div>
    );
}

function TextCard({
    name,
    description,
    isKh,
}: {
    name: string;
    description: string;
    isKh: boolean;
}) {
    return (
        <div className="bg-[#1e3a8a] w-full aspect-square flex flex-col items-center justify-center text-white text-center px-6">
            <h3
                className={`font-extrabold text-yellow-500 text-lg md:text-xl ${isKh ? "khmer-font" : ""
                    }`}
            >
                {name}
            </h3>

            <p
                className={`mt-3 text-sm md:text-base opacity-90 line-clamp-5 ${isKh ? "khmer-font" : ""
                    }`}
            >
                {description || (isKh ? "មិនមានពណ៌នា" : "No description")}
            </p>
        </div>
    );
}

function EmptyCell() {
    return <div className="bg-gray-200 w-full aspect-square" />;
}

/* ================= MAIN ================= */

export default function WorkingGroupCoChairsSwiper() {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const apiLang = uiToApiLang(uiLang);
    const isKh = uiLang === "kh";

    const API_URL = "https://api-gpsf.datacolabx.com/api/v1/pages/working-groups/section";

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<CoChairItem[]>([]);
    const [title, setTitle] = useState("Working Group Co-Chairs");

    const topSwiperRef = useRef<any>(null);
    const bottomSwiperRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;
        async function run() {
            try {
                setLoading(true);
                const res = await fetch(API_URL, { cache: "no-store" });
                const json: ApiResponse = await res.json();
                if (!mounted) return;

                const blocks = safeArr<Block>(json?.data?.blocks);
                const wgBlock = blocks.find((b) => b.type === "working_group_co_chairs");
                const blockTitle = pickText(wgBlock?.title, apiLang, "Working Group Co-Chairs");
                setTitle(blockTitle);

                const post = wgBlock?.posts?.[0];
                const list = apiLang === "km"
                    ? safeArr<CoChairItem>(post?.content?.km?.items)
                    : safeArr<CoChairItem>(post?.content?.en?.items);

                setItems(list);
            } catch {
                if (!mounted) return;
                setItems([]);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }
        run();
        return () => { mounted = false; };
    }, [apiLang]);

    const normalized = useMemo(() => {
        return items.map((it, idx) => {
            const name = pickText(it.name, apiLang, `Co-Chair ${idx + 1}`);
            const desc = pickText(it.description, apiLang, "");
            return { id: idx + 1, name, desc, profileUrl: it.profileUrl || null };
        });
    }, [items, apiLang]);

    const PAD = 4;

    const paddedTop = useMemo(() => {
        return [
            ...normalized.map((x) => ({ ...x, kind: "photo" as const })),
            ...Array.from({ length: PAD }, (_, i) => ({ id: 1000 + i, kind: "empty" as const })),
        ];
    }, [normalized]);

    const paddedBottom = useMemo(() => {
        return [
            ...normalized.map((x) => ({ ...x, kind: "text" as const })),
            ...Array.from({ length: PAD }, (_, i) => ({ id: 3000 + i, kind: "empty" as const })),
        ];
    }, [normalized]);

    return (
        <section className="py-10 w-full overflow-hidden bg-white">
            <div className="px-8 mb-12">
                <h1 className={`text-4xl md:text-5xl font-extrabold text-gray-900 ${isKh ? "khmer-font" : ""}`}>
                    {title}
                </h1>
                <div className="mt-4 h-1.5 bg-orange-500 w-64" />
            </div>

            {loading && <div className="px-8 text-gray-600">{isKh ? "កំពុងផ្ទុក..." : "Loading..."}</div>}

            {normalized.length > 0 && (
                <div className="flex flex-col gap-1 mt-6">
                    {/* ===== TOP ROW (Button on Right) ===== */}
                    <div className="flex w-full items-stretch">
                        <div className="flex-1 overflow-hidden">
                            <Swiper
                                onSwiper={(s) => (topSwiperRef.current = s)}
                                modules={[Navigation]}
                                slidesPerView={1.5}
                                spaceBetween={4}
                                loop={paddedTop.length > 4}
                                breakpoints={{
                                    640: { slidesPerView: 2.5 },
                                    1024: { slidesPerView: 4.5 },
                                    1440: { slidesPerView: 4 },
                                }}
                            >
                                {paddedTop.map((it: any) => (
                                    <SwiperSlide key={it.id} className="!h-auto flex">
                                        {it.kind === "empty" ? (
                                            <EmptyCell />
                                        ) : (
                                            <PhotoCard name={it.name} profileUrl={it.profileUrl} />
                                        )}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <button
                            onClick={() => topSwiperRef.current?.slideNext()}
                            className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all h-auto w-[15%] md:w-[10%] lg:w-[15%]"
                        >
                            <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
                        </button>
                    </div>

                    {/* ===== BOTTOM ROW (Button on Left) ===== */}
                    <div className="flex w-full flex-row-reverse items-stretch">
                        <div className="flex-1 overflow-hidden">
                            <Swiper
                                onSwiper={(s) => (bottomSwiperRef.current = s)}
                                modules={[Navigation]}
                                slidesPerView={1.5}
                                spaceBetween={4}
                                loop={paddedBottom.length > 4}
                                breakpoints={{
                                    640: { slidesPerView: 2.5 },
                                    1024: { slidesPerView: 4.5 },
                                    1440: { slidesPerView: 4 },
                                }}
                            >
                                {paddedBottom.map((it: any) => (
                                    <SwiperSlide key={it.id} className="!h-auto flex">
                                        {it.kind === "empty" ? (
                                            <EmptyCell />
                                        ) : (
                                            <TextCard name={it.name} description={it.desc} isKh={isKh} />
                                        )}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <button
                            onClick={() => bottomSwiperRef.current?.slidePrev()}
                            className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all h-auto w-[15%] md:w-[10%] lg:w-[15%]"
                        >
                            <ArrowLeft className="w-8 h-8 md:w-12 md:h-12" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}