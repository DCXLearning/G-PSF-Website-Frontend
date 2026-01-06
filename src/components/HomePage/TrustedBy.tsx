'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Logo {
    id: number;
    title: string;
    url: string;
    link: string;
}


const TrustedByCarousel: React.FC = () => {
    const [logos, setLogos] = useState<Logo[]>([]);
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchLogos() {
            try {
                const res = await fetch('/api/logos'); // <-- fetch from Next.js API route
                const data = await res.json();

                if (data && data.data && Array.isArray(data.data.logos)) {
                    setLogos(data.data.logos);
                } else {
                    console.warn('No logos found', data);
                }
            } catch (err) {
                console.error('Failed to fetch logos', err);
            }
        }

        fetchLogos();
    }, []);

    if (!logos.length) {
        return <p className="text-center py-12 text-gray-500">Error Server...</p>;
    }

    return (
        <section className="py-16 mb-8 md:py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 relative">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-wider text-blue-900 mb-12 uppercase">
                    Trusted By
                </h2>

                <div className="relative">
                    {/* <div ref={prevRef} className="absolute left-0 top-1/2 p-2 bg-white/70 backdrop-blur-sm shadow-xl rounded-full text-blue-900 z-10 cursor-pointer" style={{ transform: 'translate(-50%, -50%)' }}>
                        ◀
                    </div>

                    <div ref={nextRef} className="absolute right-0 top-1/2 p-2 bg-white/70 backdrop-blur-sm shadow-xl rounded-full text-blue-900 z-10 cursor-pointer" style={{ transform: 'translate(50%, -50%)' }}>
                        ▶
                    </div> */}

                    <Swiper
                        modules={[Autoplay, Navigation]}
                        slidesPerView={3}
                        spaceBetween={40}
                        loop
                        speed={2700}
                        autoplay={{ delay: 0, disableOnInteraction: false }}
                        allowTouchMove={false}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper) => {
                            // Fix navigation refs
                            // @ts-ignore
                            swiper.params.navigation.prevEl = prevRef.current;
                            // @ts-ignore
                            swiper.params.navigation.nextEl = nextRef.current;
                        }}
                        breakpoints={{
                            236: { slidesPerView: 2, spaceBetween: 5 },
                            400: { slidesPerView: 3, spaceBetween: 20 },
                            640: { slidesPerView: 3, spaceBetween: 20 },
                            768: { slidesPerView: 3, spaceBetween: 30 },
                            1024: { slidesPerView: 5, spaceBetween: 40 },
                        }}
                        className="w-full"
                    >
                        {logos.map((logo) => (
                            <SwiperSlide key={logo.id} className="flex justify-center items-center">
                                <a href={logo.link} target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={logo.url}
                                        alt={logo.title}
                                        width={120}
                                        height={120}
                                        className="h-24 w-auto object-contain rounded-full"
                                    />
                                </a>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default TrustedByCarousel;
