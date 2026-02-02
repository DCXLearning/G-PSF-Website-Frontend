"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper"; // Import type for better DX
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ImFilePdf } from "react-icons/im";
import { Navigation } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import { MdKeyboardArrowRight } from "react-icons/md";

import "swiper/css";

type Lang = "en" | "kh";

interface CoChair {
    id: number;
    name?: string;
    role?: string;
    Title?: string;
    type: "empty" | "photo" | "card";
}

// RESTORED DATA
const topRowData: CoChair[] = [
    { id: 1, type: "empty" },
    { id: 2, type: "photo", name: "Semester Report 2025 January - June", Title: "Lorem ipsum dolor sit amet, elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore" },
    { id: 3, type: "empty" },
    { id: 4, type: "photo", name: "Semester Report 2025 January - June", Title: "Lorem ipsum dolor sit amet, elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore" },
];

const bottomRowData: CoChair[] = [
    { id: 5, type: "photo", name: "Semester Report 2025 January - June", Title: "Lorem ipsum dolor sit amet, elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore" },
    { id: 6, type: "empty" },
    { id: 7, type: "photo", name: "Semester Report 2025 January - June", Title: "Lorem ipsum dolor sit amet, elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore" },
    { id: 8, type: "empty" },
];

const CoChairCard = ({ chair, lang }: { chair: CoChair; lang: Lang }) => {
    // Balanced aspect ratio for better mobile visibility
    const cardStyle = "aspect-square md:aspect-[4/3] w-full flex items-center text-white transition-all overflow-hidden";

    if (chair.type === "empty") {
        // Hide empty placeholders on mobile to save space, show on desktop for layout
        return <div className={`bg-gray-100 hidden md:block ${cardStyle}`} />;
    }

    return (
        <div className={`bg-[#1e3a8a] ${cardStyle}`}>
            <div className="flex flex-col justify-center gap-2 md:gap-4 text-left px-4 md:px-8">
                <h3 className={`font-bold text-xs md:text-xl lg:text-2xl leading-tight line-clamp-2 ${lang === "kh" ? "khmer-font" : ""}`}>
                    {chair.name}
                </h3>

                <p className="text-[10px] md:text-sm opacity-90 line-clamp-3">
                    {chair.Title}
                </p>

                <div className="flex items-center gap-2 mt-1 md:mt-2">
                    <div className="bg-yellow-500 p-1 md:p-2 rounded-lg shrink-0">
                        <ImFilePdf className="w-4 h-4 md:w-8 md:h-8 text-white" />
                    </div>
                    <button className="text-white text-[10px] md:text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap">
                        {lang === "kh" ? "ទាញយក" : "Download"} <MdKeyboardArrowRight className="text-base md:text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function FullWidthSwiperLayout() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";

    // Use proper Swiper types instead of any
    const topSwiperRef = useRef<SwiperType | null>(null);
    const bottomSwiperRef = useRef<SwiperType | null>(null);

    const swiperConfig = {
        modules: [Navigation],
        spaceBetween: 4,
        loop: true,
        slidesPerView: 2, // Partial view on mobile to indicate scrollability
        breakpoints: {
            768: { slidesPerView: 2 },
        },
    };

    const navBtnStyle = "bg-[#2b45a2] hover:bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 w-12 md:w-[20%] lg:w-[32.9%] transition-colors";

    return (
        <section className="py-8 md:py-16 max-w-7xl px-4 mx-auto overflow-hidden bg-white">
            <div className="max-w-4xl text-center mx-auto mb-8 md:mb-12 px-4">
                <h3 className={`text-lg md:text-2xl font-medium mb-2 text-[#1e1e4b] ${lang === "kh" ? "khmer-font" : ""}`}>
                    {lang === "kh" ? "សហអធិបតីក្រុមការងារ" : "Biannual Term Progress"}
                </h3>
                <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-[#1e1e4b]">Semester Reports</h1>
                <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.
                </p>
            </div>

            <div className="flex flex-col gap-1 md:gap-1.5">
                {/* Row 1: Slide Next */}
                <div className="flex w-full gap-1 md:gap-1.5 items-stretch">
                    <div className="flex-1 overflow-hidden">
                        <Swiper {...swiperConfig} onSwiper={(s) => (topSwiperRef.current = s)}>
                            {topRowData.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <CoChairCard chair={item} lang={lang} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <button onClick={() => topSwiperRef.current?.slideNext()} className={navBtnStyle} aria-label="Next">
                        <ArrowRight className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl" />
                    </button>
                </div>

                {/* Row 2: Slide Prev */}
                <div className="flex w-full flex-row-reverse gap-1 md:gap-1.5 items-stretch">
                    <div className="flex-1 overflow-hidden">
                        <Swiper {...swiperConfig} onSwiper={(s) => (bottomSwiperRef.current = s)}>
                            {bottomRowData.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <CoChairCard chair={item} lang={lang} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <button onClick={() => bottomSwiperRef.current?.slidePrev()} className={navBtnStyle} aria-label="Previous">
                        <ArrowLeft className="w-6 h-6 md:w-10 md:h-10 border-2 border-white rounded-3xl" />
                    </button>
                </div>
            </div>
        </section>
    );
}