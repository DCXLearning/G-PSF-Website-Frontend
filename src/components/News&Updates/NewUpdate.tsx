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
import { FaArrowRight } from "react-icons/fa";

type LocalizedText = {
    en?: string;
    km?: string;
};

export type NewsUpdateCard = {
    id: number;
    slug: string;
    createdAt: string;
    category?: LocalizedText;
    group?: string;
    title: LocalizedText;
    excerpt: LocalizedText;
    imageUrl: string;
};

export interface NewUpdateSectionProps {
    data: NewsUpdateCard[];
}

function pickLocalizedText(
    value: LocalizedText | undefined,
    isKh: boolean,
    fallback: string
) {
    if (!value) {
        return fallback;
    }

    const primaryText = isKh ? value.km : value.en;

    return primaryText || value.en || value.km || fallback;
}

function getCategoryFallback(group: string | undefined, isKh: boolean) {
    const cleanGroup = group?.trim() ?? "";

    if (isKh) {
        return cleanGroup.toLowerCase() === "press" || !cleanGroup
            ? "សារព័ត៌មាន"
            : cleanGroup;
    }

    return cleanGroup || "PRESS";
}

const NewUpdateSection = ({ data }: NewUpdateSectionProps) => {
    const { language } = useLanguage();
    const hasData = data.length > 0;
    const isKh = language === "kh";

    const titleClass = isKh ? "title-km" : "title-en";
    const mainTitleClass = isKh ? "main-title-km" : "main-title-en";
    const bodyClass = isKh ? "body-km" : "body-en";
    const noDescriptionText = isKh
        ? "មិនមានការពិពណ៌នា។"
        : "No description available.";

    return (
        <section className="relative overflow-hidden bg-white py-16">
            <div className="relative z-10 mx-auto mb-16 max-w-7xl px-4">
                <p className={`mb-1 text-gray-900 ${mainTitleClass}`}>
                    {isKh ? "ថ្មីៗបំផុត" : "Latest"}
                </p>

                <h2 className={`mb-4 text-[#1a2b4b] ${titleClass}`}>
                    {isKh ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates"}
                </h2>

                <div className="h-1.5 w-72 bg-orange-500" />
            </div>

            <div className="absolute bottom-0 left-0 h-[350px] w-full bg-[#3b5998]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4">
                {hasData ? (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            el: ".custom-pagination",
                        }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="new-update-swiper pb-20"
                    >
                        {data.map((item) => {
                            const categoryLabel = pickLocalizedText(
                                item.category,
                                isKh,
                                getCategoryFallback(item.group, isKh)
                            );
                            const titleText = pickLocalizedText(
                                item.title,
                                isKh,
                                isKh ? "គ្មានចំណងជើង" : "Untitled"
                            );
                            const cleanExcerpt = pickLocalizedText(
                                item.excerpt,
                                isKh,
                                ""
                            ).trim();
                            const hasExcerpt =
                                cleanExcerpt.length > 0 && cleanExcerpt !== ".";
                            const descriptionText = hasExcerpt
                                ? cleanExcerpt
                                : noDescriptionText;

                            const detailHref = {
                                pathname: "/new-update/view-detail",
                                query: item.slug
                                    ? {
                                        slug: item.slug,
                                        id: String(item.id),
                                    }
                                    : {
                                        id: String(item.id),
                                    },
                            };

                            return (
                                <SwiperSlide key={item.id} className="!h-auto">
                                    <Link
                                        href={detailHref}
                                        className="group block h-full focus:outline-none"
                                    >
                                        <article className="flex h-full min-h-[500px] flex-col rounded-2xl bg-[#e9ecef] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

                                            <div className="relative m-4 aspect-square overflow-hidden rounded-2xl bg-white">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={titleText}
                                                        fill
                                                        className="object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex grow flex-col px-6 pb-8 pt-2">
                                                <span className={`mb-2 text-[#1a2b4b] ${bodyClass}`}>
                                                    {formatLocalizedDate(
                                                        item.createdAt,
                                                        isKh ? "kh" : "en"
                                                    )}
                                                </span>

                                                <span
                                                    className={`
                                                        mb-3 w-fit rounded-full bg-[#1a2b4b]
                                                        px-3 py-1 text-[10px] font-bold uppercase text-white
                                                        ${isKh ? "khmer-font" : "airbnb-font"}
                                                    `}
                                                >
                                                    {categoryLabel}
                                                </span>

                                                <h3
                                                    className={`
                                                        mb-3 min-h-[28px] text-[#1a2b4b]
                                                        group-hover:underline
                                                        ${mainTitleClass}
                                                    `}
                                                    title={titleText}
                                                >
                                                    {titleText}
                                                </h3>

                                                <p
                                                    className={`
                                                        mb-6 min-h-[40px] line-clamp-2 text-gray-700
                                                        ${bodyClass}
                                                    `}
                                                >
                                                    {descriptionText}
                                                </p>

                                                <div
                                                    className={`
                                                        mt-auto inline-flex w-fit items-center gap-2
                                                        rounded-full border border-orange-500
                                                        px-3 py-1
                                                        text-[12px] font-bold text-orange-600
                                                        no-underline transition
                                                        hover:border-[#1D4ED8]
                                                        hover:bg-[#EFF6FF]
                                                        hover:text-[#1D4ED8]
                                                        ${isKh ? "khmer-font" : "airbnb-font"}
                                                    `}
                                                >
                                                    {isKh ? "អានបន្ថែម" : "View details"}
                                                    <FaArrowRight className="h-3 w-3" />
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

                {hasData && (
                    <div className="custom-pagination mt-4 flex justify-center gap-3" />
                )}

                {hasData && (
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/new-update/see-more"
                            className={`
                                rounded-md bg-blue-950 px-5 py-2 font-semibold text-white
                                transition hover:bg-blue-900
                                ${isKh ? "khmer-font" : "airbnb-font"}
                            `}
                        >
                            {isKh ? "មើលបន្ថែម" : "See More"}
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .new-update-swiper .swiper-wrapper {
                    align-items: stretch;
                }

                .new-update-swiper .swiper-slide {
                    height: auto;
                    display: flex;
                }

                .new-update-swiper .swiper-slide > a {
                    width: 100%;
                    height: 100%;
                }

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
