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

const MembersSaySwiperSlider: React.FC = () => {
    const { language } = useLanguage(); // "en" | "kh"
    const langKey: "en" | "km" = language === "kh" ? "km" : "en";
    const isKhmer = langKey === "km";

    const [slides, setSlides] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch("/api/members")
            .then((res) => res.json())
            .then((json) => setSlides(json?.items ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const smallHeading = isKhmer ? "មតិសមាជិក" : "Testimonials";
    const mainHeadingLine1 = isKhmer ? "អ្វីដែលសមាជិក" : "What G-PSF";
    const mainHeadingLine2 = isKhmer ? "និយាយ" : "Members Say";

    return (
        <div className="bg-blue-950 pt-16 pb-20 px-4 sm:px-6 md:px-10 xl:px-0 relative">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h2 className={`text-xl font-bold text-white mb-4 ${isKhmer ? "khmer-font" : ""}`}>
                    {smallHeading}
                </h2>

                <h3 className={`text-3xl sm:text-4xl md:text-5xl text-white font-bold ${isKhmer ? "khmer-font" : ""}`}>
                    {mainHeadingLine1} <br />
                    {mainHeadingLine2}
                </h3>
            </div>

            {loading && (
                <div className="text-center text-white/80 py-10">
                    {isKhmer ? "កំពុងផ្ទុក..." : "Loading..."}
                </div>
            )}

            {!loading && slides.length === 0 && (
                <div className="text-center text-white/80 py-10">
                    {isKhmer ? "មិនមានទិន្នន័យ" : "No testimonials found"}
                </div>
            )}

            {!loading && slides.length > 0 && (
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
                                    {/* Rating */}
                                    <div className="mb-6 flex justify-start items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-4xl ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className="text-2xl ml-3 font-medium text-gray-800">
                                            {rating.toFixed(1)}
                                        </span>
                                    </div>

                                    {/* ✅ Title (Digital Reforms) */}
                                    {cardTitle && (
                                        <h3 className={`text-2xl font-bold text-gray-900 mb-4 ${isKhmer ? "khmer-font" : ""}`}>
                                            {cardTitle}
                                        </h3>
                                    )}

                                    {/* ✅ Quote (paragraph) */}
                                    <p className={`text-gray-600 mb-10 flex-grow text-lg leading-relaxed ${isKhmer ? "khmer-font" : ""}`}>
                                        {quote}
                                    </p>

                                    {/* Footer: avatar + name + role/company */}
                                    <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            )}

            {/* Pagination below Swiper */}
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
