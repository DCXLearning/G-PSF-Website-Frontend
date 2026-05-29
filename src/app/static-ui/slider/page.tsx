/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/navigation";

import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

interface WorkGroupItem {
    id: number;
    title: I18nText;
    iconUrl: string;
    slug?: string;
}

const ICON_BG = "#4C518D";

const STATIC_GROUPS: WorkGroupItem[] = [
    { id: 1, title: { en: "Paddy Rice", km: "ស្រូវអង្ករ" }, iconUrl: "/icon/working-group-1.png", slug: "paddy-rice" },
    { id: 2, title: { en: "Energy & Mineral Resources", km: "ថាមពល និងរ៉ែ" }, iconUrl: "/icon/working-group-2.png", slug: "energy-mineral-resources" },
    { id: 3, title: { en: "Education", km: "អប់រំ" }, iconUrl: "/icon/working-group-3.png", slug: "education" },
    { id: 4, title: { en: "Health", km: "សុខាភិបាល" }, iconUrl: "/icon/working-group-4.png", slug: "health" },
    { id: 5, title: { en: "Construction & Real Estate", km: "សំណង់ និងអចលនទ្រព្យ" }, iconUrl: "/icon/working-group-5.png", slug: "construction-real-estate" },
    { id: 6, title: { en: "Non-Banking Financial Services", km: "សេវាហិរញ្ញវត្ថុមិនមែនធនាគារ" }, iconUrl: "/icon/working-group-6.png", slug: "non-banking-financial-services" },
];

function buildWorkingGroupHref(slug?: string) {
    const cleanSlug = slug?.trim() ?? "";
    if (!cleanSlug) return "/working-groups";
    return `/working-groups/${encodeURIComponent(cleanSlug)}`;
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

export default function WorkGroupsCarousel() {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const total = 16;
    const groupWord = !isKhmer && total === 1 ? "Work Group" : "Working Groups";
    const numberText = isKhmer ? toKhmerNumber(total) : String(total);

    const titleRow1 = isKhmer
        ? `ក្រុមការងារតាមវិស័យទាំង ${numberText}`
        : `${numberText} ${groupWord}`;

    const sectionTitleFontClass = isKhmer ? "title-km" : "title-en";
    const cardTitleFontClass = isKhmer
        ? "workgroup-card-title workgroup-card-title-km"
        : "workgroup-card-title workgroup-card-title-en";

    return (
        <section className="bg-white py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 text-center md:mb-14">
                    <h2 className={`text-blue-950 ${sectionTitleFontClass}`}>
                        <span className="block">{titleRow1}</span>
                    </h2>
                </div>

                <div className="relative">
                    <button
                        ref={prevRef}
                        aria-label="Previous"
                        className="absolute left-0 top-1/2 z-20 flex h-[260px] w-14 -translate-y-1/2 items-center justify-center bg-transparent md:w-6"
                    >
                        <span className="cursor-pointer text-5xl font-semibold text-blue-900 md:text-8xl">
                            ‹
                        </span>
                    </button>

                    <button
                        ref={nextRef}
                        aria-label="Next"
                        className="absolute right-0 top-1/2 z-20 flex h-[260px] w-14 -translate-y-1/2 items-center justify-center bg-transparent md:w-6"
                    >
                        <span className="cursor-pointer text-5xl font-semibold text-blue-900 md:text-8xl">
                            ›
                        </span>
                    </button>

                    <div className="px-4 md:px-0">
                        <Swiper
                            modules={[Autoplay, Navigation]}
                            autoplay={{
                                delay: 2200,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                            }}
                            onBeforeInit={(swiper) => {
                                if (typeof swiper.params.navigation !== "boolean") {
                                    swiper.params.navigation!.prevEl = prevRef.current;
                                    swiper.params.navigation!.nextEl = nextRef.current;
                                }
                            }}
                            loop={STATIC_GROUPS.length > 6}
                            spaceBetween={22}
                            breakpoints={{
                                0: { slidesPerView: 2 },
                                480: { slidesPerView: 2.2 },
                                640: { slidesPerView: 3 },
                                1024: { slidesPerView: 6 },
                            }}
                        >
                            {STATIC_GROUPS.map((g) => {
                                const title =
                                    (isKhmer
                                        ? g.title.km || g.title.en
                                        : g.title.en || g.title.km
                                    )?.trim() || "";

                                return (
                                    <SwiperSlide key={g.id} className="py-3">
                                        <Link
                                            href={buildWorkingGroupHref(g.slug)}
                                            className="flex h-[210px] w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 shadow-sm transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md"
                                        >
                                            <div
                                                className="mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                                                style={{ backgroundColor: ICON_BG }}
                                            >
                                                <img
                                                    src={g.iconUrl || "/icon/placeholder.png"}
                                                    alt={title}
                                                    className="h-10 w-10 object-contain"
                                                />
                                            </div>

                                            <div className="flex h-[64px] w-full items-center justify-center overflow-hidden">
                                                <p
                                                    className={`${cardTitleFontClass} m-0 w-full max-w-[170px] overflow-hidden whitespace-normal break-words text-center font-bold leading-[30px] text-gray-900 line-clamp-2`}
                                                    title={title}
                                                >
                                                    {title}
                                                </p>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
}