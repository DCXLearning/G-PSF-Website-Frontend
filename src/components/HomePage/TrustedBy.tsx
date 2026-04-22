"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import "swiper/css";

interface Logo {
  id: number;
  title: string;
  url: string;
  link: string;
}

const TrustedByCarousel: React.FC = () => {
  const { language } = useLanguage();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const isKh = language === "kh";

  useEffect(() => {
    let alive = true;

    const fetchLogos = async () => {
      try {
        setLoading(true);

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
    return <p className="py-12 text-center text-gray-500">Loading logos...</p>;
  }

  if (!logos.length) {
    return <p className="py-12 text-center text-gray-500">No logos found...</p>;
  }

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-25">
      <div className="container relative mx-auto max-w-7xl px-4">
        <h2
          className={`mb-12 text-center text-3xl font-bold tracking-wider text-blue-950 md:text-4xl ${
            isKh ? "khmer-font normal-case" : "uppercase"
          }`}
        >
          {isKh ? "ជឿទុកចិត្តដោយ" : "Trusted By"}
        </h2>

        <Swiper
          modules={[Autoplay, Mousewheel]}
          slidesPerView={3}
          spaceBetween={40}
          loop={logos.length > 3}
          speed={3000}
          autoplay={{
            delay: 900,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          allowTouchMove={true}
          simulateTouch={true}
          grabCursor={true}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: false,
          }}
          breakpoints={{
            236: { slidesPerView: 2, spaceBetween: 10 },
            400: { slidesPerView: 3, spaceBetween: 20 },
            640: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 4, spaceBetween: 30 },
            1024: { slidesPerView: 5, spaceBetween: 40 },
            1280: { slidesPerView: 6, spaceBetween: 50 },
          }}
          className="trusted-by-swiper w-full"
        >
          {logos.map((logo) => (
            <SwiperSlide
              key={logo.id}
              className="flex items-center justify-center"
            >
              <a
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <Image
                  src={logo.url}
                  alt={logo.title}
                  width={120}
                  height={120}
                  className="h-24 w-auto rounded-full object-contain transition-transform duration-300 hover:scale-100"
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