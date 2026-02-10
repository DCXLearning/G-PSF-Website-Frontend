"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

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

function formatDate(dateValue: string): string {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

const NewUpdateSection = ({ data }: NewUpdateSectionProps) => {
    const hasData = data.length > 0;

    return (
        <section className="relative bg-white overflow-hidden py-16">

            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-16 relative z-10">
                <p className="text-gray-900 font-bold text-3xl mb-1">Latest</p>
                <h2 className="text-[#1a2b4b] text-5xl font-extrabold mb-4">
                    News & Updates
                </h2>
                <div className="h-1.5 bg-orange-500 w-72" />
            </div>

            {/* Blue background */}
            <div className="absolute bottom-0 left-0 w-full h-[420px] bg-[#3b5998]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4">

                {hasData ? (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 5000 }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-32 relative
            [&_.swiper-pagination]:!absolute
            [&_.swiper-pagination]:!-bottom-0
            [&_.swiper-pagination]:!left-1/2
            [&_.swiper-pagination]:!-translate-x-1/2
            [&_.swiper-pagination-bullet]:!w-4
            [&_.swiper-pagination-bullet]:!h-4
            [&_.swiper-pagination-bullet]:!bg-orange-400
            [&_.swiper-pagination-bullet]:!opacity-40
            [&_.swiper-pagination-bullet-active]:!opacity-100"
                    >

                        {data.map((item) => (
                            <SwiperSlide key={item.id}>

                                <div className="bg-[#e9ecef] flex flex-col shadow-xl min-h-[500px]">

                                    {/* Image */}
                                    <div className="bg-white m-4 aspect-square relative overflow-hidden">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="px-6 pb-8 pt-2 flex flex-col grow">

                                        <span className="text-xs font-semibold text-[#1a2b4b] mb-2">
                                            {formatDate(item.createdAt)}
                                        </span>

                                        <span className="bg-[#1a2b4b] text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-3 uppercase">
                                            {item.group || "PRESS"}
                                        </span>

                                        {/* Title */}
                                        <h3 className="text-[#1a2b4b] text-xl font-bold uppercase mb-3 line-clamp-1 min-h-[28px]">
                                            {item.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-700 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                            {item.excerpt || "No description available."}
                                        </p>

                                        <button className="text-[#1a2b4b] text-xs font-bold flex items-center mt-auto">
                                            View details <span className="ml-1 text-lg">›</span>
                                        </button>

                                    </div>

                                </div>

                            </SwiperSlide>
                        ))}

                    </Swiper>
                ) : (
                    <div className="bg-[#e9ecef] text-center py-12 font-semibold">
                        No published news yet.
                    </div>
                )}

            </div>

        </section>
    );
};

export default NewUpdateSection;
