"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
    en?: string;
    km?: string;
};

type ApiWorkingGroup = {
    id: number;
    title?: I18nText;
    iconUrl?: string;
    slug?: string;
};

type WorkingGroupsResponse = {
    items?: ApiWorkingGroup[];
};

type WorkingGroupCard = {
    id: number;
    title: string;
    iconUrl: string;
    href: string;
};

type WorkingGroupListCardsProps = {
    currentSlug?: string;
};

const ICON_BG = "#4C518D";

function getText(value?: string | null) {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickText(value: I18nText | undefined, apiLang: ApiLang) {
    if (!value) return "";

    const primary = apiLang === "km" ? getText(value.km) : getText(value.en);
    return primary || getText(value.en) || getText(value.km);
}

function buildCards(
    items: ApiWorkingGroup[],
    apiLang: ApiLang,
    currentSlug?: string
): WorkingGroupCard[] {
    const cleanCurrentSlug = getText(currentSlug);

    return items
        .filter((item) => getText(item.slug) !== cleanCurrentSlug)
        .map((item) => {
            const slug = getText(item.slug);

            return {
                id: item.id,
                title: pickText(item.title, apiLang),
                iconUrl: getText(item.iconUrl),
                href: slug ? `/working-groups/${slug}` : "/working-groups",
            };
        })
        .filter((item) => item.title);
}

export default function WorkingGroupListCards({
    currentSlug,
}: WorkingGroupListCardsProps) {
    const { language } = useLanguage();
    const lang: Lang = language === "kh" ? "kh" : "en";
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    const isKh = lang === "kh";

    const sliderRef = useRef<HTMLDivElement | null>(null);

    const [items, setItems] = useState<ApiWorkingGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadWorkingGroups() {
            try {
                setLoading(true);

                const response = await fetch("/api/working-groups", {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    setItems([]);
                    return;
                }

                const data = (await response.json()) as WorkingGroupsResponse;
                setItems(Array.isArray(data.items) ? data.items : []);
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setItems([]);
                }
            } finally {
                setLoading(false);
            }
        }

        void loadWorkingGroups();

        return () => {
            controller.abort();
        };
    }, []);

    const cards = useMemo(
        () => buildCards(items, apiLang, currentSlug),
        [apiLang, currentSlug, items]
    );

    const scrollSlide = (direction: "left" | "right") => {
        const slider = sliderRef.current;
        if (!slider) return;

        const scrollAmount = slider.clientWidth * 0.75;

        slider.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const emptyLabel = isKh ? "មិនទាន់មានក្រុមការងារ" : "No working groups found";
    const title = isKh ? "ក្រុមការងារតាមវិស័យផ្សេងទៀត" : "Related Working Groups";

    return (
        <section className="bg-white px-4 pb-20 pt-8 sm:px-6 md:px-10 lg:px-14">
            <div className="mx-auto max-w-7xl px-0 sm:px-4">
                <header className="mb-8 flex items-center justify-between gap-4 md:mb-12">
                    <h2
                        className={`text-2xl font-extrabold leading-tight text-blue-950 sm:text-4xl md:text-5xl ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {title}
                    </h2>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollSlide("left")}
                            className="flex h-12 w-12 items-center cursor-pointer justify-center rounded-full border border-slate-200 bg-white text-2xl font-bold text-blue-950 shadow-sm transition hover:bg-blue-950 hover:text-white"
                            aria-label="Previous slide"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollSlide("right")}
                            className="flex h-12 w-12 items-center cursor-pointer justify-center rounded-full border border-slate-200 bg-white text-2xl font-bold text-blue-950 shadow-sm transition hover:bg-blue-950 hover:text-white"
                            aria-label="Next slide"
                        >
                            ›
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div
                        ref={sliderRef}
                        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex h-[210px] min-w-[165px] snap-start animate-pulse flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 shadow-sm sm:min-w-[190px]"
                            >
                                <div className="mb-4 h-20 w-20 shrink-0 rounded-full bg-slate-200" />
                                <div className="flex h-[52px] flex-col items-center justify-center">
                                    <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
                                    <div className="h-4 w-20 rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : cards.length > 0 ? (
                    <div
                        ref={sliderRef}
                        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {cards.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="group flex h-[210px] min-w-[165px] snap-start flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center shadow-sm transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md sm:min-w-[190px]"
                            >
                                <span
                                    className="relative mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                                    style={{ backgroundColor: ICON_BG }}
                                >
                                    {item.iconUrl ? (
                                        <Image
                                            src={item.iconUrl}
                                            alt={item.title}
                                            fill
                                            unoptimized
                                            className="object-contain p-5"
                                            sizes="80px"
                                        />
                                    ) : null}
                                </span>

                                <div className="flex h-[52px] items-center justify-center">
                                    <span
                                        className={`m-0 line-clamp-2 max-w-[160px] text-center text-sm font-semibold leading-snug text-gray-900 sm:text-base ${
                                            isKh ? "khmer-font" : ""
                                        }`}
                                        title={item.title}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p
                        className={`text-center text-sm text-slate-500 ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {emptyLabel}
                    </p>
                )}
            </div>
        </section>
    );
}