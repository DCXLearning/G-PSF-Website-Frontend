// src/components/HomePage/WorkGroupsCarousel.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

interface WorkGroupItem {
  id: number;
  title: I18nText;
  iconUrl: string;
  slug?: string;
}

const ICON_BG = "#4C518D";

function buildWorkingGroupHref(slug?: string) {
  const cleanSlug = slug?.trim() ?? "";

  if (!cleanSlug) {
    return "/working-groups";
  }

  return `/working-groups/${encodeURIComponent(cleanSlug)}`;
}

// ✅ Convert 0-9999 to Khmer digits
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

  // ✅ Title 2 rows
  const titleRow1 = isKhmer ? `${numberText} ក្រុមការងារ` : `${numberText} ${groupWord}`;
  const titleRow2 = isKhmer ? `ធ្វើការសម្រាប់អ្នក` : `Working For You`;

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* ✅ Header (2 rows) */}
        <div className="text-center mb-10 md:mb-14">
          <h2
            className={`text-blue-950 font-extrabold leading-[1.05] ${isKhmer ? "khmer-font" : ""
              }`}
          >
            <span className="block text-4xl sm:text-5xl md:text-6xl">
              {titleRow1}
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl">
              {titleRow2}
            </span>
          </h2>
        </div>

        {/* ✅ Slider wrapper */}
        <div className="relative">
          {/* ✅ Prev/Next WITHOUT background circle */}
          <button
            aria-label="Previous"
            className="wg-prev absolute left-0 top-1/2 -translate-y-1/2 z-20
                        w-14 md:w-6 h-[260px]
                        flex items-center justify-center
                        bg-transparent"
          >
            <span className="text-blue-900 text-5xl md:text-8xl cursor-pointer font-semibold leading-none select-none">
              ‹
            </span>
          </button>

          <button
            aria-label="Next"
            className="wg-next absolute right-0 top-1/2 -translate-y-1/2 z-20
                        w-14 md:w-6 h-[260px]
                        flex items-center justify-center
                        bg-transparent"
          >
            <span className="text-blue-900 text-5xl md:text-8xl cursor-pointer font-semibold leading-none select-none">
              ›
            </span>
          </button>

          {/* ✅ space so arrows don't overlap cards */}
          <div className="px-4 md:px-0">
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{
                delay: 2200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{ prevEl: ".wg-prev", nextEl: ".wg-next" }}
              loop={groups.length > 6}
              spaceBetween={22}
              breakpoints={{
                0: { slidesPerView: 2 },
                480: { slidesPerView: 2.2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 6 },
              }}
              className="pb-2"
            >
              {groups.map((g) => {
                const title =
                  (
                    isKhmer ? g.title.km || g.title.en : g.title.en || g.title.km
                  )?.trim() || "";

                return (
                  <SwiperSlide key={g.id} className="py-3">
                    <Link
                      href={buildWorkingGroupHref(g.slug)}
                      className="
                        flex flex-col items-center justify-center
                        h-[210px] w-full
                        px-4 py-6
                        rounded-2xl
                        bg-gray-50
                        border border-gray-100
                        shadow-sm
                        hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]
                        transition
                      "
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

                      {/* ✅ Title max 2 lines */}
                      <p
                        className={`text-center font-semibold text-gray-900 leading-snug ${isKhmer ? "khmer-font" : ""
                          } line-clamp-2 max-w-[170px]`}
                        title={title}
                      >
                        {title}
                      </p>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-400 mt-6">
            {isKhmer ? "កំពុងផ្ទុក..." : "Loading..."}
          </p>
        )}
      </div>
    </section>
  );
}
