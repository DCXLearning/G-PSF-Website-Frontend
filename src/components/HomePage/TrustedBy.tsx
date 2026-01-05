'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface PartnerLogo {
    id: number;
    name: string;
    logoSrc: string;
}

const trustedPartners: PartnerLogo[] = [
    { id: 1, name: 'Ministry 1', logoSrc: '/image/lg-1.png' }, 
    { id: 2, name: 'Ministry 2', logoSrc: '/image/l-2.png' },
    { id: 3, name: 'Cambodia Sea Transport', logoSrc: '/image/l-3.png' },
    { id: 4, name: 'Other Group', logoSrc: '/image/l-4.png' },
    { id: 5, name: 'Another Government Entity', logoSrc: '/image/l-5.png' },
    { id: 6, name: 'Financial Group', logoSrc: '/image/l-2.png' },
];

const TrustedByCarousel: React.FC = () => {
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-16 mb-8 md:py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl sm:px-6 lg:px-8 relative">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-wider text-blue-900 mb-12 uppercase">
                    Trusted By
                </h2>

                <div className="relative">
                    {/* Prev */}
                    <div
                        ref={prevRef}
                        className="absolute left-0 top-1/2 p-2 bg-white/70 backdrop-blur-sm shadow-xl rounded-full text-blue-900 z-10 cursor-pointer"
                        style={{ transform: 'translate(-50%, -50%)' }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </div>

                    {/* Next */}
                    <div
                        ref={nextRef}
                        className="absolute right-0 top-1/2 p-2 bg-white/70 backdrop-blur-sm shadow-xl rounded-full text-blue-900 z-10 cursor-pointer"
                        style={{ transform: 'translate(50%, -50%)' }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>

                    <Swiper
                        modules={[Autoplay, Navigation]}
                        slidesPerView={3} // Default for large screens
                        spaceBetween={40}
                        loop={true}
                        speed={2700}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: false,
                        }}
                        allowTouchMove={false}
                        breakpoints={{
                            236: { 
                                slidesPerView: 2,
                                spaceBetween: 5,
                            },
                            
                            400: { 
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            640: { // For screens 640px and up (mobile devices)
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            768: { // For screens 768px and up (tablets)
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                            1024: { // For screens 1024px and up (desktops)
                                slidesPerView: 5,
                                spaceBetween: 40,
                            },
                        }}
                        className="w-full"
                    >
                        {trustedPartners.map((partner) => (
                            <SwiperSlide
                                key={partner.id}
                                style={{ width: "200px" }}   // MAKE EXACT SIZE
                                className="flex justify-center items-center bg-transparent" // Removed background
                            >
                                <div className="flex justify-center items-center bg-transparent">
                                    <Image
                                        src={partner.logoSrc}
                                        alt={partner.name}
                                        width={120}
                                        height={120}
                                        className="h-24 w-auto opacity-100 rounded-[100%] transition-all duration-500"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default TrustedByCarousel;
