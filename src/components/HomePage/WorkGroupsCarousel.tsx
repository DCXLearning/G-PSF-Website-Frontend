// src/components/HomePage/WorkGroupsCarousel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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
const CACHE_KEY = "workGroupsCache";

function buildWorkingGroupHref(slug?: string) {
  const cleanSlug = slug?.trim() ?? "";
  if (!cleanSlug) return "/working-groups";
  return `/working-groups/${encodeURIComponent(cleanSlug)}`;
}

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

function readCache(): { items: WorkGroupItem[]; total: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      total: Number(parsed?.total ?? 0),
    };
  } catch {
    return null;
  }
}

function writeCache(items: WorkGroupItem[], total: number) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        items,
        total,
      })
    );
  } catch {
    // ignore cache errors
  }
}

function WorkGroupCardSkeleton() {
  return (
    <div
      className="flex flex-col items-center justify-center
      h-[210px] w-full px-4 py-6 rounded-2xl
      bg-gray-50 border border-gray-100 shadow-sm animate-pulse"
    >
      <div className="w-20 h-20 rounded-full mb-4 bg-slate-200" />
      <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
    </div>
  );
}

export default function WorkGroupsCarousel() {
  const [mounted, setMounted] = useState(false);
  const [groups, setGroups] = useState<WorkGroupItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);

    const cached = readCache();
    if (cached) {
      setGroups(cached.items);
      setTotal(cached.total);
      setLoading(false);
    }

    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/working-groups", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data?.error || "Failed to fetch working groups");
          return;
        }

        if (!alive) return;

        const items = Array.isArray(data?.items) ? data.items : [];
        const totalCount = Number(data?.total ?? 0);

        setGroups(items);
        setTotal(totalCount);
        writeCache(items, totalCount);
      } catch (e) {
        if (!alive) return;
        console.error("Failed to load work groups", e);
        // keep cached content, do not clear state
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const groupWord = !isKhmer && total === 1 ? "Work Group" : "Work Groups";
  const numberText = isKhmer ? toKhmerNumber(total) : String(total);

  const titleRow1 = isKhmer
    ? `${numberText} ក្រុមការងារ`
    : `${numberText} ${groupWord}`;

  const titleRow2 = isKhmer ? `ធ្វើការសម្រាប់អ្នក` : `Working For You`;

  const showSkeleton = !mounted || (loading && groups.length === 0);

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2
            className={`text-blue-950 font-bold leading-[1.05] ${
              isKhmer ? "khmer-font" : ""
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

        <div className="relative">
          {/* Prev */}
          <button
            ref={prevRef}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20
            w-14 md:w-6 h-[260px] flex items-center justify-center bg-transparent"
          >
            <span className="text-blue-900 text-5xl md:text-8xl cursor-pointer font-semibold">
              ‹
            </span>
          </button>

          {/* Next */}
          <button
            ref={nextRef}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20
            w-14 md:w-6 h-[260px] flex items-center justify-center bg-transparent"
          >
            <span className="text-blue-900 text-5xl md:text-8xl cursor-pointer font-semibold">
              ›
            </span>
          </button>

          <div className="px-4 md:px-0">
            {showSkeleton ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[22px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <WorkGroupCardSkeleton key={i} />
                ))}
              </div>
            ) : groups.length > 0 ? (
              <Swiper
                modules={[Autoplay, Navigation]}
                autoplay={{
                  delay: 2200,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                onBeforeInit={(swiper) => {
                  if (typeof swiper.params.navigation !== "boolean") {
                    swiper.params.navigation!.prevEl = prevRef.current;
                    swiper.params.navigation!.nextEl = nextRef.current;
                  }
                }}
                loop={groups.length > 6}
                spaceBetween={22}
                breakpoints={{
                  0: { slidesPerView: 2 },
                  480: { slidesPerView: 2.2 },
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 6 },
                }}
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
                        className="flex flex-col items-center justify-center
                        h-[210px] w-full px-4 py-6 rounded-2xl
                        bg-gray-50 border border-gray-100 shadow-sm
                        hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]
                        transition"
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

                        <p
                          className={`text-center font-semibold text-gray-900 leading-snug ${
                            isKhmer ? "khmer-font" : ""
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
            ) : (
              <div className="text-center text-gray-400 py-10">
                {isKhmer ? "មិនមានក្រុមការងារ" : "No work groups found"}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}