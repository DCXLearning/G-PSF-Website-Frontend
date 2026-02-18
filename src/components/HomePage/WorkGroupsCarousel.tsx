// src/components/HomePage/WorkGroupsCarousel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

interface WorkGroupItem {
  id: number;
  title: I18nText;
  iconUrl: string;
  slug?: string;
}

const ICON_BG = "#4C518D";

// ✅ Convert 0-9999 to Khmer digits (simple digit mapping)
function toKhmerNumber(n: number) {
  const map: Record<string, string> = {
    "0": "០",
    "1": "១",
    "2": "២",
    "3": "៣",
    "4": "៤",
    "5": "៥",
    "6": "៦",
    "7": "៧",
    "8": "៨",
    "9": "៩",
  };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}

export default function WorkGroupsCarousel() {
  const [groups, setGroups] = useState<WorkGroupItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const { language } = useLanguage();
  const isKhmer = language === "kh";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/working-groups", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          console.error(data?.error || "Failed to fetch working groups");
          return;
        }

        setTotal(Number(data?.total ?? 0));
        setGroups(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        console.error("Failed to load work groups", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ✅ plural/singular (English)
  const groupWord = !isKhmer && total === 1 ? "Work Group" : "Work Groups";

  // ✅ number text (Khmer digits if Khmer)
  const numberText = isKhmer ? toKhmerNumber(total) : String(total);

  // ✅ heading in ONE line:
  // Example total=2 => "2 Work Groups Working For You"
  const headingText = isKhmer
    ? `${numberText} ក្រុមការងារ ធ្វើការសម្រាប់អ្នក`
    : `${numberText} ${groupWord} Working For You`;

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-4xl md:text-6xl w-90 md:w-[512px] mx-auto font-extrabold text-blue-950 ${
              isKhmer ? "khmer-font" : ""
            }`}
          >
            {headingText}
          </h2>
        </div>

        {/* Slider wrapper */}
        <div className="relative px-10 md:px-14">
          {/* Arrows */}
          <div className="wg-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 text-7xl text-blue-900 cursor-pointer select-none">
            ‹
          </div>
          <div className="wg-next absolute right-0 top-1/2 -translate-y-1/2 z-10 text-7xl text-blue-900 cursor-pointer select-none">
            ›
          </div>

          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{ prevEl: ".wg-prev", nextEl: ".wg-next" }}
            loop={groups.length > 6}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.2 },
              480: { slidesPerView: 2.2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 6 },
            }}
            className="pb-12"
          >
            {groups.map((g) => {
              const title =
                (isKhmer ? g.title.km || g.title.en : g.title.en || g.title.km)?.trim() || "";

              return (
                <SwiperSlide key={g.id}>
                  <a
                    href={g.slug ? `/${g.slug}` : "#"}
                    className="flex flex-col items-center p-4 rounded-xl shadow hover:scale-105 transition bg-gray-50"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: ICON_BG }}
                    >
                      <img
                        src={g.iconUrl || "/icon/placeholder.png"}
                        alt={title}
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    <p className={`text-center font-semibold ${isKhmer ? "khmer-font" : ""}`}>
                      {title}
                    </p>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {loading && <p className="text-center text-gray-400">Loading...</p>}
      </div>
    </div>
  );
}