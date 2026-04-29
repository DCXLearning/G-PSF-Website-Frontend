"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";
import "swiper/css";
import "swiper/css/pagination";

export type NewsUpdateCard = {
    id: number;
    slug: string;
    createdAt: string;
    group: string;
    title: string;
    excerpt: string;
    imageUrl: string;
};

export interface NewUpdateSectionProps {
    data: NewsUpdateCard[];
}

const NewUpdateSection = ({ data }: NewUpdateSectionProps) => {
    const { language } = useLanguage();
    const hasData = data.length > 0;
    const isKh = language === "kh";

    return (
        <section className="relative overflow-hidden bg-white py-16">
            {/* Header */}
            <div className="relative z-10 mx-auto mb-16 max-w-7xl px-4">
                <p className={`mb-1 text-3xl font-bold text-gray-900 ${isKh ? "khmer-font" : ""}`}>
                    {/* Switch the section heading text by the current site language. */}
                    {isKh ? "ថ្មីៗបំផុត" : "Latest"}
                </p>
                <h2 className={`mb-4 text-5xl font-bold text-[#1a2b4b] ${isKh ? "khmer-font" : ""}`}>
                    {isKh ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates"}
                </h2>
                <div className="h-1.5 w-72 bg-orange-500" />
            </div>

            {/* Background */}
            <div className="absolute bottom-0 left-0 h-[350px] w-full bg-[#3b5998]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4">
                {hasData ? (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        pagination={{ clickable: true, el: ".custom-pagination" }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-20"
                    >
                        {data.map((item) => {
                            const detailHref = {
                                pathname: "/new-update/view-detail",
                                query: item.slug
                                    ? { slug: item.slug, id: String(item.id) }
                                    : { id: String(item.id) },
                            };

                            return (
                                <SwiperSlide key={item.id}>
                                    <Link
                                        href={detailHref}
                                        className="group block h-full focus:outline-none"
                                    >
                                        <article className="flex min-h-[500px] rounded-2xl h-full flex-col bg-[#e9ecef] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                                            {/* Image */}
                                            <div className="relative m-4 rounded-2xl aspect-square overflow-hidden bg-white">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex grow flex-col px-6 pb-8 pt-2">
                                                <span className="mb-2 text-xs font-semibold text-[#1a2b4b]">
                                                    {formatLocalizedDate(item.createdAt, isKh ? "kh" : "en")}
                                                </span>

                                                <span className="mb-3 w-fit rounded-full bg-[#1a2b4b] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                                    {item.group || "PRESS"}
                                                </span>

                                                <h3 className="khmer-font mb-3 min-h-[28px] line-clamp-1 text-xl font-bold uppercase text-[#1a2b4b] group-hover:underline">
                                                    {item.title}
                                                </h3>

                                                <p className="khmer-font mb-6 min-h-[40px] line-clamp-2 text-sm text-gray-700">
                                                    {item.excerpt || "No description available."}
                                                </p>

                                                <div className={`mt-auto flex items-center text-xs font-bold text-[#1a2b4b] ${isKh ? "khmer-font" : ""}`}>
                                                    {isKh ? "មើលលម្អិត" : "View details"}
                                                    <span className="ml-2 text-lg transition-transform duration-300 group-hover:translate-x-1">
                                                        ›
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                ) : (
                    <div className="bg-[#e9ecef] py-12 text-center font-semibold">
                        No published news yet.
                    </div>
                )}

                {/* Pagination */}
                {hasData && <div className="custom-pagination mt-4 flex justify-center gap-3" />}

                {/* Bottom See More */}
                {hasData && (
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/new-update/see-more"
                            className={`rounded-md bg-blue-950 px-5 py-2 font-semibold text-white transition hover:bg-blue-900 ${isKh ? "khmer-font" : ""}`}
                        >
                            {isKh ? "មើលបន្ថែម" : "See More"}
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-pagination .swiper-pagination-bullet {
                width: 14px;
                height: 14px;
                background: #fb923c;
                opacity: 0.5;
                }

                .custom-pagination .swiper-pagination-bullet-active {
                opacity: 1;
                }
            `}</style>
        </section>
    );
};

export default NewUpdateSection;
