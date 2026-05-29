"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/app/context/LanguageContext";

const DARK_BLUE = "#1A1D42";

type MultiLangText =
    | string
    | {
        en?: string;
        km?: string;
        kh?: string;
    };

type NewsItem = {
    id: number;
    image: string;
    title: MultiLangText;
    description: MultiLangText;
    link: string;
};

function getText(value: MultiLangText, isKhmer: boolean) {
    if (!value) return "";
    if (typeof value === "string") return value;

    return isKhmer
        ? value.km || value.kh || value.en || ""
        : value.en || value.km || value.kh || "";
}

const STATIC_NEWS: NewsItem[] = [
    {
        id: 1,
        image: "/image/news-1.jpg",
        title: {
            km: 'កិច្ចប្រជុំក្រុមការងារ ក្រុម "ក" ផ្នែកពន្ធដារ និងគយ',
            en: "Working Group Meeting on Tax and Customs",
        },
        description: {
            km: "មិនមានការពិពណ៌នា",
            en: "No description available",
        },
        link: "/new-update",
    },
    {
        id: 2,
        image: "/image/news-2.jpg",
        title: {
            km: "ឧបនាយករដ្ឋមន្ត្រី ស៊ុន ចាន់ថុល អញ្ជើញចូលរួមពិធី",
            en: "Deputy Prime Minister Attends the Event",
        },
        description: {
            km: "នៅថ្ងៃពុធស្តីពីការចូលរួមរបស់វិស័យឯកជន នៅកម្ពុជា...",
            en: "Members of the private sector joined the event...",
        },
        link: "/new-update",
    },
    {
        id: 3,
        image: "/image/news-3.jpg",
        title: {
            km: "អគ្គលេខាធិការ គិត ម៉េង ថ្លែងសុន្ទរកថាបើកកម្មវិធី",
            en: "Secretary General Gives Opening Remarks",
        },
        description: {
            km: "បើកវេទិកាសាធារណៈ ដែលផ្តោតលើវិស័យឯកជន និងការអភិវឌ្ឍ...",
            en: "Opening forum focused on private sector development...",
        },
        link: "/new-update",
    },
    {
        id: 4,
        image: "/image/news-4.jpg",
        title: {
            km: "G-PSF Brings Significant Progress",
            en: "G-PSF Brings Significant Progress",
        },
        description: {
            km: "Members of the leadership team take a group photo...",
            en: "Members of the leadership team take a group photo...",
        },
        link: "/new-update",
    },
];

export default function Update_News() {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const titleFontClass = isKhmer ? "title-km" : "title-en";
    const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";
    const buttonFontClass = isKhmer ? "khmer-font" : "airbnb-font";

    return (
        <section className="relative overflow-hidden bg-white pb-8 pt-10">
            <div className="relative z-10 mb-16 text-center">
                <h2 className={`text-gray-900 ${titleFontClass}`}>
                    {isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates"}
                </h2>
            </div>

            <div
                className="absolute bottom-0 left-0 h-[48.99%] w-full -z-0"
                style={{ backgroundColor: DARK_BLUE }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Swiper
                    modules={[Pagination]}
                    pagination={{
                        clickable: true,
                        el: ".news-static-pagination",
                    }}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 4,
                        },
                    }}
                    className="!overflow-visible"
                >
                    {STATIC_NEWS.map((item) => (
                        <SwiperSlide key={item.id}>
                            <article
                                className="relative flex h-[450px] flex-col overflow-hidden rounded-lg bg-white"
                                style={{
                                    boxShadow: "0 7px 15px rgba(0,0,0,0.4)",
                                }}
                            >
                                <div className="h-[220px] w-full overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={getText(item.title, isKhmer)}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <h3
                                        className={`line-clamp-2 text-gray-900 ${mainTitleFontClass}`}
                                    >
                                        {getText(item.title, isKhmer)}
                                    </h3>

                                    <p
                                        className={`mt-4 line-clamp-2 text-gray-500 ${bodyFontClass}`}
                                    >
                                        {getText(item.description, isKhmer)}
                                    </p>

                                    <div className="mt-auto pt-6">
                                        <Link
                                            href={item.link}
                                            className={`inline-flex items-center gap-2 font-bold text-[#111633] ${buttonFontClass}`}
                                        >
                                            {isKhmer ? "មើលលម្អិត" : "Read More"}
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="news-static-pagination mt-8 flex justify-center gap-2" />

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/new-update"
                        className={`rounded-full bg-white px-10 py-3 font-bold text-[#111633] shadow-sm transition hover:bg-slate-100 ${buttonFontClass}`}
                    >
                        {isKhmer ? "មើលបន្ថែម" : "View More"}
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                .news-static-pagination .swiper-pagination-bullet {
                    width: 14px;
                    height: 14px;
                    background: white;
                    opacity: 1;
                    margin: 0 5px !important;
                }

                .news-static-pagination .swiper-pagination-bullet-active {
                    background: white;
                    opacity: 1;
                }
            `}</style>
        </section>
    );
}