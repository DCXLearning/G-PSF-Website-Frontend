"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

interface Logo {
  id: number;
  title: string;
  url: string;
  link: string;
}

const TrustedByCarousel: React.FC = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchLogos = async () => {
      try {
        setLoading(true);

        // Optional: check localStorage first
        const cached = localStorage.getItem("trusted-logos");
        if (cached) {
          const parsed: Logo[] = JSON.parse(cached);
          if (alive && parsed.length) {
            setLogos(parsed);
          }
        }

        const res = await fetch("/api/home-page/logos", { cache: "no-store" });
        const json = await res.json();

        if (!alive) return;

        const fetched: Logo[] = json?.data?.logos ?? [];
        setLogos(fetched);

        // Save to localStorage to reduce flicker next time
        localStorage.setItem("trusted-logos", JSON.stringify(fetched));
      } catch (e) {
        console.error("Failed to fetch logos", e);
        if (alive) setLogos([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchLogos();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-center py-12 text-gray-500">Loading logos...</p>
    );
  }

  if (!logos.length) {
    return (
      <p className="text-center py-12 text-gray-500">No logos found...</p>
    );
  }

  return (
    <section className="py-6 pb-24 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-wider text-blue-950 mb-12 uppercase">
          Trusted By
        </h2>

        <Swiper
          modules={[Autoplay]}
          slidesPerView={3}
          spaceBetween={40}
          loop={logos.length > 3}
          speed={3000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          allowTouchMove={false}
          breakpoints={{
            236: { slidesPerView: 2, spaceBetween: 5 },
            400: { slidesPerView: 3, spaceBetween: 20 },
            640: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 4, spaceBetween: 30 },
            1024: { slidesPerView: 5, spaceBetween: 40 },
            1280: { slidesPerView: 6, spaceBetween: 50 },
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
                  unoptimized
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TrustedByCarousel;