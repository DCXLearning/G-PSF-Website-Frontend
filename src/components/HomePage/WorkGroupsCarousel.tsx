// src/Components/UI-Homepage/WorkGroupsCarousel.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

interface WorkGroup {
    id: number;
    nameEn: string;
    nameKh: string;
    icon: string;
}

const workGroups: WorkGroup[] = [
    {
        id: 1,
        nameEn: "Agriculture & Agro-Industry",
        nameKh: "កសិកម្ម និងឧស្សាហកម្មកសិកម្ម",
        icon: "🌿",
    },
    {
        id: 2,
        nameEn: "Tourism",
        nameKh: "ទេសចរណ៍",
        icon: "🧳",
    },
    {
        id: 3,
        nameEn: "Manufacturing & SMEs",
        nameKh: "ផលិតកម្ម និងសហគ្រាសតូច និងមធ្យម",
        icon: "🏭",
    },
    {
        id: 4,
        nameEn: "Law, Tax & Governance",
        nameKh: "ច្បាប់ ពន្ធ និងការគ្រប់គ្រងរដ្ឋបាល",
        icon: "⚖️",
    },
    {
        id: 5,
        nameEn: "Banking & Financial Services",
        nameKh: "ធនាគារ និងសេវាហិរញ្ញវត្ថុ",
        icon: "🏦",
    },
    {
        id: 6,
        nameEn: "Transportation & Infrastructure",
        nameKh: "ដឹកជញ្ជូន និងហេដ្ឋារចនាសម្ព័ន្ធ",
        icon: "🚌",
    },
    {
        id: 7,
        nameEn: "Healthcare",
        nameKh: "សុខាភិបាល",
        icon: "🏥",
    },
    {
        id: 8,
        nameEn: "Education",
        nameKh: "អប់រំ",
        icon: "🎓",
    },
];

const ICON_BG = "#4C518D";

const WorkGroupsCarousel: React.FC = () => {
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
        null
    );

    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const headingEnLine1 = "16 Work Groups";
    const headingEnLine2 = "Working For You";

    const headingKhLine1 = "ក្រុមការងារ ១៦ ក្រុម";
    const headingKhLine2 = "កំពុងធ្វើការសម្រាប់អ្នក";

    // Assign navigation elements after refs exist
    useEffect(() => {
        if (swiperInstance && prevRef.current && nextRef.current) {
            const navigation = swiperInstance.params.navigation as any;
            navigation.prevEl = prevRef.current;
            navigation.nextEl = nextRef.current;

            swiperInstance.navigation.destroy();
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();
        }
    }, [swiperInstance]);

    return (
        <div className="py-20 bg-white relative">
            <div className="container mx-auto px-4 max-w-7xl relative">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2
                        className={`text-4xl md:text-6xl font-extrabold text-blue-950 ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {isKhmer ? (
                            <>
                                {headingKhLine1}
                                <br />
                                {headingKhLine2}
                            </>
                        ) : (
                            <>
                                {headingEnLine1}
                                <br />
                                {headingEnLine2}
                            </>
                        )}
                    </h2>
                </div>

                {/* Prev Arrow */}
                <div
                    ref={prevRef}
                    className="absolute -left-0 top-1/2 -translate-y-1/14 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-blue-900 z-10 cursor-pointer select-none"
                >
                    ‹
                </div>

                {/* Next Arrow */}
                <div
                    ref={nextRef}
                    className="absolute -right-0 top-1/2 -translate-y-1/14 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-blue-900 z-10 cursor-pointer select-none"
                >
                    ›
                </div>

                {/* Swiper */}
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    slidesPerView={1}
                    spaceBetween={20}
                    loop
                    autoplay={{ delay: 2000, disableOnInteraction: false }}
                    onSwiper={(swiper) => setSwiperInstance(swiper)}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    breakpoints={{
                        368: { slidesPerView: 2, spaceBetween: 30 },
                        640: { slidesPerView: 3, spaceBetween: 10 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 20 },
                        1280: { slidesPerView: 6, spaceBetween: 30 },
                    }}
                    className="pb-12 pt-4"
                >
                    {workGroups.map((group) => (
                        <SwiperSlide key={group.id}>
                            <div
                                className="group flex flex-col items-center justify-center h-[190px] p-4 rounded-xl shadow-lg transition-transform duration-500 transform hover:shadow-2xl hover:scale-105 cursor-pointer"
                                style={{
                                    backgroundColor:
                                        group.id % 2 === 0 ? "#F5F6F7" : "#E9ECF0",
                                }}
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 p-2 transition-transform duration-500 transform group-hover:rotate-12 group-hover:scale-110"
                                    style={{ backgroundColor: ICON_BG }}
                                >
                                    {group.icon}
                                </div>
                                <p
                                    className={`text-base text-center font-semibold text-gray-800 leading-snug px-2 ${isKhmer ? "khmer-font" : ""
                                        }`}
                                >
                                    {isKhmer ? group.nameKh : group.nameEn}
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default WorkGroupsCarousel;
