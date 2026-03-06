"use client";

import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useLanguage } from "@/app/context/LanguageContext";

const DARK_BLUE = "#1A1D42";
const CACHE_KEY = "news_update_cache";

interface NewsItem {
  id: number;
  slug: string;
  icon: string;
  title: { en: string; km: string };
  description: { en: string; km: string };
}

interface NewsCacheShape {
  heading?: string;
  items?: NewsItem[];
  description?: { en?: string; km?: string };
}

function readCache(): NewsCacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewsCacheShape;
  } catch {
    return null;
  }
}

function writeCache(data: NewsCacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore cache write errors
  }
}

function NewsCardSkeleton() {
  return (
    <div
      className="bg-white overflow-hidden rounded-lg relative pt-12 h-[360px] flex flex-col animate-pulse"
      style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-40 pt-5 rounded-full border-4 border-white"
        style={{ backgroundColor: DARK_BLUE }}
      >
        <div className="flex items-center justify-center w-full h-[160px]">
          <div className="w-13 h-13 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="p-6 pt-10">
        <div className="h-7 w-3/4 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function Update_News() {
  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const [mounted, setMounted] = useState(false);
  const [heading, setHeading] = useState("");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [description, setDescription] = useState<{ en?: string; km?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const cached = readCache();
    if (cached) {
      setHeading(cached.heading || "");
      setItems(Array.isArray(cached.items) ? cached.items : []);
      setDescription(cached.description || {});
      setLoading(false);
    }

    let alive = true;

    async function fetchNews() {
      try {
        const res = await fetch("/api/home-page/news-update", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data?.error || "API error");
          return;
        }

        if (!alive) return;

        const nextData: NewsCacheShape = {
          heading: data?.heading ?? "",
          items: Array.isArray(data?.items) ? data.items : [],
          description: data?.description ?? {},
        };

        setHeading(nextData.heading || "");
        setItems(nextData.items || []);
        setDescription(nextData.description || {});
        writeCache(nextData);
      } catch (err) {
        if (!alive) return;
        console.error("Failed to fetch news", err);
        // keep cached content, do not clear state
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchNews();

    return () => {
      alive = false;
    };
  }, []);

  const descText = useMemo(() => {
    return isKhmer ? description?.km || "" : description?.en || "";
  }, [description, isKhmer]);

  const showSkeleton = !mounted || (loading && items.length === 0);

  return (
    <>
      {/* HEADER */}
      <div className="text-center mb-80">
        <h2
          className={`text-5xl font-extrabold text-gray-900 ${
            isKhmer ? "khmer-font" : ""
          }`}
        >
          {heading || (isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates")}
        </h2>

        <p
          className={`mt-4 text-2xl text-gray-600 max-w-5xl px-3 mx-auto ${
            isKhmer ? "khmer-font" : ""
          }`}
        >
          {descText ||
            (isKhmer
              ? "អត្ថបទគំរូសម្រាប់ការពិពណ៌នាព័ត៌មាន សូមបញ្ចូលអត្ថបទពិតរបស់អ្នក។"
              : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit...")}
        </p>
      </div>

      {/* SLIDER */}
      <div
        className="h-[220px] flex flex-col justify-end relative"
        style={{ backgroundColor: DARK_BLUE }}
      >
        <div className="container mx-auto px-4 max-w-7xl py-8">
          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <NewsCardSkeleton />
              <div className="hidden sm:block">
                <NewsCardSkeleton />
              </div>
              <div className="hidden lg:block">
                <NewsCardSkeleton />
              </div>
              <div className="hidden lg:block">
                <NewsCardSkeleton />
              </div>
            </div>
          ) : items.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={20}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="custom-swiper-pagination-white"
            >
              {items.map((item) => (
                <SwiperSlide key={item.id} className="pb-12 pt-16">
                  <div
                    className="bg-white overflow-hidden rounded-lg relative pt-12 h-[360px] flex flex-col transition-transform duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
                    style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-40 pt-5 rounded-full border-4 border-white"
                      style={{ backgroundColor: DARK_BLUE }}
                    >
                      <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                        <img
                          src={item.icon || "/image/placeholder.png"}
                          alt=""
                          className="w-13 h-13 filter brightness-0 invert"
                        />
                      </div>
                    </div>

                    <div className="p-6 pt-10">
                      <h3
                        className={`text-xl font-bold text-gray-800 mb-4 ${
                          isKhmer ? "khmer-font" : ""
                        }`}
                      >
                        {isKhmer ? item.title.km : item.title.en}
                      </h3>

                      <p
                        className={`text-gray-600 leading-relaxed text-base ${
                          isKhmer ? "khmer-font" : ""
                        }`}
                      >
                        {isKhmer ? item.description.km : item.description.en}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div
              className={`text-center text-white/80 py-10 ${
                isKhmer ? "khmer-font" : ""
              }`}
            >
              {isKhmer ? "មិនមានព័ត៌មាន" : "No news found"}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-swiper-pagination-white .swiper-pagination-bullet {
          width: 16px;
          height: 16px;
          background-color: white !important;
          opacity: 1;
        }
        .custom-swiper-pagination-white .swiper-pagination-bullet-active {
          background-color: white !important;
        }
      `}</style>
    </>
  );
}