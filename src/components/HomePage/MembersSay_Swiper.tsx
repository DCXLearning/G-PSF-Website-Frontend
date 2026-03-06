"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

type Testimonial = {
    id: number;
    rating: number;
    title: I18nText;
    quote: I18nText;
    authorName: I18nText;
    authorRole: I18nText;
    company: string;
    avatarUrl: string;
};

const CACHE_KEY = "members-say-slides-cache";

function readCache(): Testimonial[] {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCache(items: Testimonial[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    } catch {
        // ignore cache errors
    }
}

function TestimonialCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col h-full border border-gray-100 mx-auto animate-pulse">
            <div className="mb-6 flex justify-start items-center">
                <div className="h-8 w-36 bg-slate-200 rounded" />
            </div>

            <div className="h-8 w-2/3 bg-slate-200 rounded mb-4" />
            <div className="h-5 w-full bg-slate-200 rounded mb-2" />
            <div className="h-5 w-5/6 bg-slate-200 rounded mb-2" />
            <div className="h-5 w-3/4 bg-slate-200 rounded mb-10" />

            <div className="pt-6 flex items-center gap-4 border-t border-gray-100 mt-auto">
                <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                <div className="w-full">
                    <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    );
}

const MembersSaySwiperSlider: React.FC = () => {
    const { language } = useLanguage();
    const langKey: "en" | "km" = language === "kh" ? "km" : "en";
    const isKhmer = langKey === "km";

    const [mounted, setMounted] = useState(false);
    const [slides, setSlides] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached.length > 0) {
            setSlides(cached);
            setLoading(false);
        }

        let alive = true;

        async function load() {
            try {
                const res = await fetch("/api/home-page/members", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json = await res.json();
                if (!alive) return;

                const items = Array.isArray(json?.items) ? json.items : [];

                setSlides(items);
                writeCache(items);
            } catch (e) {
                if (!alive) return;
                console.error("Failed to load testimonials", e);
                // keep cached content, do not clear slides
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

    const smallHeading = isKhmer ? "មតិសមាជិក" : "Testimonials";
    const mainHeadingLine1 = isKhmer ? "អ្វីដែលសមាជិក" : "What G-PSF";
    const mainHeadingLine2 = isKhmer ? "និយាយ" : "Members Say";

    const showSkeleton = !mounted || (loading && slides.length === 0);

    return (
        <div className="bg-blue-950 pt-16 pb-20 px-4 sm:px-6 md:px-10 xl:px-0 relative">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h2
                    className={`text-xl font-bold text-white mb-4 ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {smallHeading}
                </h2>

                <h3
                    className={`text-3xl sm:text-4xl md:text-5xl text-white font-bold ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {mainHeadingLine1} <br />
                    {mainHeadingLine2}
                </h3>
            </div>

            {showSkeleton ? (
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <TestimonialCardSkeleton />
                        <div className="hidden md:block">
                            <TestimonialCardSkeleton />
                        </div>
                        <div className="hidden xl:block">
                            <TestimonialCardSkeleton />
                        </div>
                    </div>
                </div>
            ) : slides.length > 0 ? (
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    slidesPerView={1}
                    centeredSlides={true}
                    loop={false}
                    grabCursor={true}
                    spaceBetween={20}
                    pagination={{ clickable: true, el: ".custom-pagination" }}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        768: { slidesPerView: 2, spaceBetween: 25 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                        1200: { slidesPerView: 3.4, spaceBetween: 40 },
                    }}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    className="pb-12"
                >
                    {slides.map((t) => {
                        const rating = Math.max(0, Math.min(5, Number(t.rating || 5)));

                        const cardTitle = t.title?.[langKey] ?? t.title?.en ?? "";
                        const quote = t.quote?.[langKey] ?? t.quote?.en ?? "";
                        const name = t.authorName?.[langKey] ?? t.authorName?.en ?? "";
                        const role = t.authorRole?.[langKey] ?? t.authorRole?.en ?? "";
                        const company = t.company ?? "";

                        return (
                            <SwiperSlide key={t.id}>
                                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col h-full border border-gray-100 hover:shadow-2xl transition mx-auto">
                                    <div className="mb-6 flex justify-start items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-4xl ${i < rating ? "text-yellow-500" : "text-gray-300"
                                                    }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className="text-2xl ml-3 font-medium text-gray-800">
                                            {rating.toFixed(1)}
                                        </span>
                                    </div>

                                    {cardTitle && (
                                        <h3
                                            className={`text-2xl font-bold text-gray-900 mb-4 ${isKhmer ? "khmer-font" : ""
                                                }`}
                                        >
                                            {cardTitle}
                                        </h3>
                                    )}

                                    <p
                                        className={`text-gray-600 mb-10 flex-grow text-lg leading-relaxed ${isKhmer ? "khmer-font" : ""
                                            }`}
                                    >
                                        {quote}
                                    </p>

                                    <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                            <img
                                                src={t.avatarUrl || "/image/avatar-placeholder.png"}
                                                alt={name || "avatar"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className={`${isKhmer ? "khmer-font" : ""}`}>
                                            <p className="text-blue-950 text-2xl font-bold leading-tight">
                                                {name}
                                            </p>

                                            <p className="text-gray-700 text-base">
                                                {role}
                                                {company ? ` • ${company}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            ) : (
                <div className="text-center text-white/80 py-10">
                    {isKhmer ? "មិនមានទិន្នន័យ" : "No testimonials found"}
                </div>
            )}

            <div className="custom-pagination mt-6 flex justify-center space-x-2"></div>

            <style>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 16px;
          height: 16px;
          background-color: white !important;
          opacity: 1;
          border-radius: 9999px;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background-color: white !important;
          transform: scale(1.25);
        }
      `}</style>
        </div>
    );
};

export default MembersSaySwiperSlider;