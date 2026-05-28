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

function TrustedBySkeleton() {
  return (
    <section className="relative mb-6 overflow-hidden bg-white pt-6 pb-25">
      <div className="container relative mx-auto max-w-7xl animate-pulse px-4">
        <div className="mx-auto mb-12 h-10 w-56 rounded bg-slate-200" />

        <div className="grid grid-cols-3 items-center gap-5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TrustedByCarousel: React.FC = () => {
  const { language } = useLanguage();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  const isKh = language === "kh";
  const titleFontClass = isKh ? "title-km" : "title-en";
  const bodyFontClass = isKh ? "body-km" : "body-en";

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
    return <TrustedBySkeleton />;
  }

  if (!logos.length) {
    return (
      <p className={`py-12 text-center text-gray-500 ${bodyFontClass}`}>
        {isKh ? "មិនមានឡូហ្គោ..." : "No logos found..."}
      </p>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-25 mb-6">
      <div className="container relative mx-auto max-w-7xl px-4">
        <h2 className={`mb-12 text-center text-blue-950 ${titleFontClass}`}>
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
