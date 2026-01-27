"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
// import { Trophy, DollarSign, BarChart, LucideIcon } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

interface Slide {
    rating: string;
    titleEn: string;
    titleKh: string;
    subtitleEn: string;
    subtitleKh: string;
    descriptionEn: string;
    descriptionKh: string;
    shortTextEn: string;
    shortTextKh: string;
    icon: string;
}

const slides: Slide[] = [
    {
        rating: "5.0",
        titleEn: "Digital Reforms",
        titleKh: "កំណែទម្រង់ឌីជីថល",
        subtitleEn: "Digital Reforms",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់ពិពណ៌នាកំណែទម្រង់ឌីជីថល។ សូមបញ្ចូលមាតិកាពិតរបស់អ្នកនៅទីនេះ។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "អត្ថបទគំរូសម្រាប់ពិពណ៌នាក្រៅប្រធានបទ។",
        icon: "",
    },
    {
        rating: "5.0",
        titleEn: "Digital Reform",
        titleKh: "កំណែទម្រង់ឌីជីថល",
        subtitleEn: "Digital Reform",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់ការចែករំលែកបទពិសោធន៍អំពីកំណែទម្រង់ឌីជីថល។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "សូមបញ្ចូលសេចក្តីសង្ខេបពិតរបស់អ្នកនៅទីនេះ។",
        icon: "",
    },
    {
        rating: "5.0",
        titleEn: "Digital Reform Insights",
        titleKh: "ចំណេះដឹងអំពីកំណែទម្រង់ឌីជីថល",
        subtitleEn: "Digital Reform",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់បង្ហាញចំណេះដឹង និងទស្សនៈរបស់សមាជិកអំពីកំណែទម្រង់។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "អត្ថបទគំរូបង្ហាញសេចក្តីសង្ខេប។",
        icon: "",
    },
    {
        rating: "5.0",
        titleEn: "Member Experience",
        titleKh: "បទពិសោធន៍សមាជិក",
        subtitleEn: "Digital Reform",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់បង្ហាញបទពិសោធន៍ពិតរបស់សមាជិក G-PSF។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "សូមបញ្ចូលសេចក្តីសង្ខេបអំពីបទពិសោធន៍សមាជិក។",
        icon: "",
    },
    {
        rating: "5.0",
        titleEn: "Digital Reforms",
        titleKh: "កំណែទម្រង់ឌីជីថល",
        subtitleEn: "Digital Reforms",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់ពិពណ៌នាកំណែទម្រង់ឌីជីថល។ សូមបញ្ចូលមាតិកាពិតរបស់អ្នកនៅទីនេះ។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "អត្ថបទគំរូសម្រាប់ពិពណ៌នាក្រៅប្រធានបទ។",
        icon: "",
    },
    {
        rating: "5.0",
        titleEn: "Digital Reform",
        titleKh: "កំណែទម្រង់ឌីជីថល",
        subtitleEn: "Digital Reform",
        subtitleKh: "កំណែទម្រង់ឌីជីថល",
        descriptionEn:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
        descriptionKh:
            "អត្ថបទគំរូសម្រាប់ការចែករំលែកបទពិសោធន៍អំពីកំណែទម្រង់ឌីជីថល។",
        shortTextEn: "Lorem ipsum dolor sit amet,",
        shortTextKh: "សូមបញ្ចូលសេចក្តីសង្ខេបពិតរបស់អ្នកនៅទីនេះ។",
        icon: "",
    },
];

const MembersSaySwiperSlider: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const smallHeading = isKhmer ? "លទ្ធផលបន្ថែម" : "More Results";
    const mainHeadingLine1 = isKhmer ? "អ្វីដែលសមាជិក" : "What G-PSF";
    const mainHeadingLine2 = isKhmer ? "G-PSF និយាយ" : "Members Say";

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

            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={1}
                centeredSlides={true}
                loop={false}
                grabCursor={true}
                spaceBetween={20}
                pagination={{
                    clickable: true,
                    el: ".custom-pagination",
                }}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 25 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                    1200: { slidesPerView: 3.4, spaceBetween: 40 },
                }}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                className="pb-12"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col h-full border border-gray-100 hover:shadow-2xl transition mx-auto">
                            {/* Rating */}
                            <div className="mb-6 flex justify-start items-center">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-4xl ${i < parseInt(slide.rating)
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                                <span className="text-2xl ml-2">{slide.rating}</span>
                            </div>

                            {/* Title */}
                            <h3
                                className={`text-2xl font-bold text-gray-800 mb-6 ${isKhmer ? "khmer-font" : ""
                                    }`}
                            >
                                {isKhmer ? slide.titleKh : slide.titleEn}
                            </h3>

                            {/* Description */}
                            <p
                                className={`text-gray-600 mb-8 flex-grow ${isKhmer ? "khmer-font" : ""
                                    }`}
                            >
                                {isKhmer ? slide.descriptionKh : slide.descriptionEn}
                            </p>

                            {/* Footer – icon + subtitle + short text */}
                            <div className="pt-6 flex items-center gap-4">
                                <div className="bg-gray-500 w-12 h-12 p-4 rounded-full flex items-center justify-center">
                                    {/* add icon */}
                                </div>
                                <div>
                                    <p
                                        className={`text-blue-950 text-2xl font-bold ${isKhmer ? "khmer-font" : ""
                                            }`}
                                    >
                                        {isKhmer ? slide.subtitleKh : slide.subtitleEn}
                                    </p>
                                    <p
                                        className={`text-lg text-gray-800 ${isKhmer ? "khmer-font" : ""
                                            }`}
                                    >
                                        {isKhmer ? slide.shortTextKh : slide.shortTextEn}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Pagination below Swiper */}
            <div className="custom-pagination mt-6 flex justify-center space-x-2"></div>

            {/* TailwindCSS for white bullets */}
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
