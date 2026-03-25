"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/app/context/LanguageContext";

const DARK_BLUE = "#1A1D42";

type MultiLangText =
  | string
  | {
      en?: string;
      km?: string;
      kh?: string;
    };

interface NewsItem {
  id: number | string;
  slug?: string;
  image: string;
  title: MultiLangText;
  description: MultiLangText;
  link: string;
}

interface ApiResponse {
  success?: boolean;
  heading?: MultiLangText;
  description?: MultiLangText;
  items?: NewsItem[];
  message?: string;
}

function getText(value: MultiLangText, isKhmer: boolean) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return isKhmer
    ? value?.km || value?.kh || value?.en || ""
    : value?.en || value?.km || value?.kh || "";
}

function NewsCardSkeleton() {
  return (
    <div
      className="bg-white overflow-hidden rounded-lg relative h-[450px] flex flex-col animate-pulse"
      style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
    >
      <div className="w-full h-[220px] bg-slate-200" />
      <div className="p-6">
        <div className="h-7 w-3/4 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-2" />
      </div>
    </div>
  );
}

export default function Update_News() {
  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const [heading, setHeading] = useState<MultiLangText>({
    en: "News & Updates",
    km: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
  });
  const [description, setDescription] = useState<MultiLangText>({ en: "", km: "" });
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function fetchNews() {
      try {
        const res = await fetch("/api/home-page/news-update", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const data: ApiResponse = await res.json();
        if (!alive) return;
        setHeading(data?.heading || { en: "News & Updates", km: "ព័ត៌មាន និងបច្ចុប្បន្នភាព" });
        setDescription(data?.description || { en: "", km: "" });
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        console.error("Failed to fetch Update_News:", error);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchNews();
    return () => { alive = false; };
  }, []);

  const descText = useMemo(() => getText(description, isKhmer), [description, isKhmer]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative pt-10 pb-8 overflow-hidden bg-white">
      {/* 1. Header Section */}
      <div className="text-center mb-16 relative z-10">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 ${isKhmer ? "khmer-font" : ""}`}>
          {getText(heading, isKhmer) || (isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates")}
        </h2>
        {/* {descText && (
          <p className={`mt-4 text-xl md:text-2xl text-gray-600 max-w-5xl px-3 mx-auto ${isKhmer ? "khmer-font" : ""}`}>
            {descText}
          </p>
        )} */}
      </div>

      {/* 2. Blue Background Layer (Bottom 60%) */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[48.99%] -z-0"
        style={{ backgroundColor: DARK_BLUE }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <NewsCardSkeleton />
            <div className="hidden sm:block"><NewsCardSkeleton /></div>
            <div className="hidden lg:block"><NewsCardSkeleton /></div>
            <div className="hidden lg:block"><NewsCardSkeleton /></div>
          </div>
        ) : (
          <>
            {/* 3. Swiper Section */}
            <Swiper
              modules={[Pagination]}
              slidesPerView={1}
              spaceBetween={24}
              pagination={{ 
                clickable: true,
                el: '.custom-news-pagination'
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="mb-6"
            >
              {items.map((item) => (
                <SwiperSlide key={item.id}>
                  <Link href={item.link} className="block h-full group">
                    <div
                      className="bg-white overflow-hidden rounded-xl h-[450px] border border-gray-500 shadow-sm flex flex-col transition-all duration-300 group-hover:-translate-y-2"
                      style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                    >
                      {/* Fixed Aspect Ratio for Images */}
                      <div className="w-full h-[220px] bg-slate-100 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/image/placeholder.png"}
                          alt="news"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className={`text-lg font-bold text-gray-800 mb-3 line-clamp-2 h-[56px] ${isKhmer ? "khmer-font leading-relaxed" : ""}`}>
                          {getText(item.title, isKhmer)}
                        </h3>
                        <p className={`text-gray-600 text-sm line-clamp-3 mb-4 ${isKhmer ? "khmer-font" : ""}`}>
                          {getText(item.description, isKhmer) || (isKhmer ? "មិនមានការពិពណ៌នា" : "No description available.")}
                        </p>
                        <div className={`mt-auto font-bold text-[#1A1D42] flex items-center gap-2 ${isKhmer ? "khmer-font" : ""}`}>
                          {isKhmer ? "មើលលម្អិត" : "View details"}
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 4. Custom Pagination Bullets (Capsule Shape) */}
            <div className="custom-news-pagination flex justify-center items-center mb-10 h-6"></div>

            {/* 5. See More Button */}
            <div className="flex justify-center relative z-20">
              <Link
                href="/new-update/see-more"
                className={`rounded-full bg-white px-10 py-3 text-lg font-bold text-[#1A1D42] shadow-xl transition-all hover:bg-gray-100 hover:scale-105 ${isKhmer ? "khmer-font" : ""}`}
              >
                {isKhmer ? "មើលបន្ថែម" : "See More"}
              </Link>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .custom-news-pagination .swiper-pagination-bullet {
          width: 16px;
          height: 16px;
          background-color: white !important;
          opacity: 1;
          margin: 0 6px !important;
          border-radius: 99px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: inline-block;
          cursor: pointer;
        }

        .custom-news-pagination .swiper-pagination-bullet-active {
          opacity: 1;
          background-color: white !important;
        }
        .swiper-wrapper {
          display: flex;
        }
        .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
}