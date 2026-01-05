"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// បន្ថែម UserCircle2 សម្រាប់រូប Placeholder
import { ArrowRight, ArrowLeft, UserCircle2 } from "lucide-react"; 
import { Navigation } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import { Sprout } from "lucide-react";

import "swiper/css";

type Lang = "en" | "kh";

interface CoChair {
    id: number;
    name?: string;
    role?: string;
    type: "empty" | "photo" | "card";
}

const topRowData: CoChair[] = [
    { id: 2, type: "empty" },
    { id: 3, type: "empty" },
    { id: 4, type: "empty" },
    { id: 5, type: "photo", name: "Mr. Orngkea Sela" }, // បន្ថែមឈ្មោះដើម្បីបង្ហាញក្រោម Icon
    { id: 6, type: "empty" },
    { id: 7, type: "empty" },
];

const bottomRowData: CoChair[] = [
    { id: 10, type: "card", name: "[Name of co-chair]", role: "Input brief description of Working Group from WG profile page for this text." },
    { id: 11, type: "empty" },
    { id: 12, type: "empty" },
    { id: 13, type: "empty" },
    { id: 14, type: "empty" },
    { id: 15, type: "empty" },
    { id: 16, type: "empty" },
];

const CoChairCard = ({ chair, lang }: { chair: CoChair; lang: Lang }) => {
    if (chair.type === "empty") return <div className="bg-gray-200 aspect-square w-full" />;

    return (
        <div className="bg-[#1e3a8a] aspect-square w-full p-6 flex flex-col items-center justify-center text-white shadow-inner text-center">
            
            {/* បង្ហាញ Icon រាងមូលពណ៌ប្រផេះ ដូចរូបភាពឧទាហរណ៍ */}
            {chair.type === "photo" ? (
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        <UserCircle2 
                            className="w-24 h-24 md:w-32 md:h-32 text-gray-300 opacity-90" 
                            strokeWidth={1} 
                        />
                    </div>
                    <h3 className={`font-bold text-lg md:text-xl text-yellow-500 ${lang === "kh" ? "khmer-font" : ""}`}>
                        {chair.name || (lang === "kh" ? "ឈ្មោះសហអធិបតី" : "H.E. NAME NAME")}
                    </h3>
                </div>
            ) : (
                <>
                    <Sprout size={32} className="md:w-15 md:h-15" />
                    <h3 className={`font-bold text-xl text-yellow-500 ${lang === "kh" ? "khmer-font" : ""}`}>
                        {chair.name || "Name"}
                    </h3>
                    {chair.role && <p className="text-sm mt-2 opacity-90">{chair.role}</p>}
                </>
            )}
        </div>
    );
};

export default function FullWidthSwiperLayout() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";

    const topSwiperRef = useRef<any>(null);
    const bottomSwiperRef = useRef<any>(null);

    return (
        <section className="py-10 w-full overflow-hidden bg-white">
            {/* Title Section */}
            <div className="px-8 mb-12">
                <h1 className={`text-4xl md:text-5xl font-extrabold text-gray-900 ${lang === "kh" ? "khmer-font" : ""}`}>
                    {lang === "kh" ? "សហអធិបតីក្រុមការងារ" : "Working Group Co-Chairs"}
                </h1>
                <div className="mt-4 h-1.5 bg-orange-500 w-64" />
            </div>

            <div className="flex flex-col gap-1">
                {/* Top Row */}
                <div className="flex w-full items-stretch">
                    <div className="flex-1 overflow-hidden">
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
                    </div>
                    <button
                        onClick={() => topSwiperRef.current?.slideNext()}
                        className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all z-10 w-[15%] md:w-[10%] lg:w-[15%]"
                    >
                        <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                </div>

                {/* Bottom Row */}
                <div className="flex w-full flex-row-reverse items-stretch">
                    <div className="flex-1 overflow-hidden">
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
                    </div>
                    <button
                        onClick={() => bottomSwiperRef.current?.slidePrev()}
                        className="bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 transition-all z-10 w-[15%] md:w-[10%] lg:w-[15%]"
                    >
                        <ArrowLeft className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                </div>
            </div>
        </section>
    );
}