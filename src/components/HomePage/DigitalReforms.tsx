// src/Components/UI-Homepage/DigitalReforms.tsx
"use client";  // Mark this as a Client Component for Next.js

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

// Define the type for each content item in the Swiper
interface ContentItem {
    titleEn: string;
    titleKh: string;
    contentEn: string;
    contentKh: string;
    icon: string; // still using emoji
}

// Sample data for the carousel (EN + KH)
const contentItems: ContentItem[] = [
    {
        titleEn: "Results & Achievements",
        titleKh: "លទ្ធផល និងសមិទ្ធិផល",
        contentEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        contentKh:
            "អត្ថបទគំរូសម្រាប់បង្ហាញលទ្ធផល និងសមិទ្ធិផល។ សូមបញ្ចូលមាតិកាពិតរបស់អ្នកនៅទីនេះ។",
        icon: "📊",
    },
    {
        titleEn: "Digital Reforms",
        titleKh: "កំណែទម្រង់ឌីជីថល",
        contentEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        contentKh:
            "អត្ថបទគំរូសម្រាប់ពិពណ៌នាកំណែទម្រង់ឌីជីថល។ សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
        icon: "💡",
    },
    {
        titleEn: "Policy Reform Tracker",
        titleKh: "តាមដានកំណែទម្រង់នយោបាយ",
        contentEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        contentKh:
            "អត្ថបទគំរូសម្រាប់តាមដានវឌ្ឍនភាពកំណែទម្រង់នយោបាយ។ សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
        icon: "💼",
    },
    {
        titleEn: "Work Group Meetings",
        titleKh: "ការប្រជុំក្រុមការងារ",
        contentEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        contentKh:
            "អត្ថបទគំរូសម្រាប់ពិពណ៌នាការប្រជុំក្រុមការងារ។ សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
        icon: "🤝",
    },
    {
        titleEn: "News & Updates",
        titleKh: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
        contentEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        contentKh:
            "អត្ថបទគំរូសម្រាប់ព័ត៌មាន និងបច្ចុប្បន្នភាព។ សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
        icon: "📰",
    },
];

// Define a custom dark blue color (similar to the image background)
const DARK_BLUE = "#1A1D42";

const DigitalReforms: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const subHeading = isKhmer ? "ព័ត៌មានអំពីកំណែទម្រង់" : "Policy Update";
    const mainHeading = isKhmer ? "កំណែទម្រង់ចុងក្រោយ" : "Latest Reforms";
    const description = isKhmer
        ? "អត្ថបទគំរូសម្រាប់ពិពណ៌នាកំណែទម្រង់ថ្មីៗ។ សូមបញ្ចូលអត្ថបទពិតរបស់អ្នកនៅទីនេះ។"
        : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.";

    return (
        <>
            {/* Header Section */}
            <div className="text-center mb-90 mt-20">
                <p
                    className={`text-xl font-medium text-indigo-600 uppercase tracking-wider ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {subHeading}
                </p>
                <h1
                    className={`text-6xl font-extrabold text-indigo-900 mt-2 ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {mainHeading}
                </h1>
                <p
                    className={`mt-4 text-2xl text-gray-500 max-w-4xl mx-auto ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {description}
                </p>
            </div>

            <div
                className="h-[220px] flex flex-col justify-end relative"
                style={{ backgroundColor: DARK_BLUE }}
            >
                <div className="container mx-auto px-4 max-w-7xl py-8">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={1}
                        spaceBetween={20}
                        navigation={false}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="custom-swiper-pagination-white"
                    >
                        {contentItems.map((item, index) => (
                            <SwiperSlide key={index} className="pb-15 pt-16 px-[10px]">
                                <div
                                    className="rounded-tl-[120px] bg-white overflow-hidden rounded-bl-[25px] rounded-br-[25px] relative pt-12 h-[390px] pb-10 flex flex-col"
                                    style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                                >
                                    {/* top banner bar */}
                                    <div
                                        className="absolute bg-blue-950 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-70"
                                        style={{ borderColor: "white" }}
                                    >
                                        <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                                            {item.icon}
                                        </div>
                                    </div>

                                    {/* circle icon */}
                                    <div className="w-25 h-25 relative rounded-[200px] ml-10 top-8 mb-6">
                                        <div className="bg-blue-950 w-25 h-25 border-white border-3 rounded-[200px] flex items-center justify-center text-white text-4xl">
                                            {item.icon}
                                        </div>
                                    </div>

                                    {/* text */}
                                    <div className="p-6 pt-10">
                                        <h3
                                            className={`text-xl font-bold text-gray-800 mb-4 ${isKhmer ? "khmer-font" : ""
                                                }`}
                                        >
                                            {isKhmer ? item.titleKh : item.titleEn}
                                        </h3>
                                        <p
                                            className={`text-gray-600 leading-relaxed text-base ${isKhmer ? "khmer-font" : ""
                                                }`}
                                        >
                                            {isKhmer ? item.contentKh : item.contentEn}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </>
    );
};

export default DigitalReforms;
