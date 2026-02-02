"use client"; // Required for Next.js App Router

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface NewsItem {
    id: number;
    date: string;
    headline: string;
    excerpt: string;
}

const newsData: NewsItem[] = [
    { id: 1, date: "October 2025", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
    { id: 2, date: "August 2025", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
    { id: 3, date: "February 2024", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
    { id: 4, date: "October 2025", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
    { id: 5, date: "August 2025", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
    // { id: 6, date: "February 2024", headline: "Policy Headline", excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy." },
];

const Policy_Documents = () => {
    return (
        <section className="relative bg-white font-sans overflow-hidden py-16">
            {/* Header */}
            <div className="max-w-5xl mx-auto text-center px-4 mb-16 relative z-10">
                <p className="text-gray-900 font-bold text-3xl md:text-4xl mb-1">Core Policies & Frameworks</p>
                <h2 className="text-[#1a2b4b] text-5xl md:text-6xl font-semibold mb-4">
                    Policy Documents
                </h2>
                <p className="text-gray-900 font-semibold text-xl md:text-2xl">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
                    euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                </p>
            </div>

            {/* BLUE BACKGROUND DECORATION */}
            <div className="absolute bottom-0 left-0 w-full h-[350px] bg-[#3b5998] z-0"></div>

            {/* SLIDER CONTAINER */}
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{ delay: 5000 }}
                    pagination={{
                        clickable: true,
                        el: ".custom-pagination",
                    }}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    className="pb-20"
                >
                    {newsData.map((item) => (
                        <SwiperSlide key={item.id} className="h-full">
                            <div className="bg-[#e9ecef] flex flex-col shadow-xl h-full min-h-[500px]">
                                {/* Image / Placeholder */}
                                <div className="bg-white m-4 aspect-square flex flex-col items-center justify-center border border-gray-100">
                                    <div className="w-35 h-35 text-gray-300">
                                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-500 font-medium text-lg mt-2 w-35 text-center px-4">
                                        Screenshot of document cover page
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="px-6 pb-8 pt-2 flex flex-col grow">
                                    <span className="text-[#1a2b4b] text-xs font-semibold mb-3">
                                        {item.date}
                                    </span>
                                    <h3 className="text-[#1a2b4b] text-2xl font-bold mb-3 uppercase">
                                        {item.headline}
                                    </h3>
                                    <p className="text-gray-700 text-sm mb-6 flex-grow">
                                        {item.excerpt}
                                    </p>
                                    <button className="text-[#1a2b4b] text-xs font-bold flex items-center hover:underline uppercase tracking-wider">
                                        Download <span className="ml-1 text-lg">›</span>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Pagination Dots */}
                <div className="custom-pagination flex justify-center gap-3 mt-4"></div>
            </div>

            {/* Global CSS for Custom Pagination (Add to globals.css or use style tag) */}
            <style jsx global>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 16px;
          height: 16px;
          background-color: #fb923c !important; /* orange-400 */
          opacity: 0.6;
          margin: 0 6px;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
        </section>
    );
};

export default Policy_Documents;