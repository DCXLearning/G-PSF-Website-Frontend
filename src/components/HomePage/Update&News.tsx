"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useLanguage } from "@/app/context/LanguageContext";

const DARK_BLUE = "#1A1D42";

interface NewsItem {
  id: number;
  slug: string;
  icon: string;
  title: { en: string; km: string };
  description: { en: string; km: string };
}

export default function Update_News() {
  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const [items, setItems] = useState<NewsItem[]>([]);
  const [heading, setHeading] = useState("");
  const [descText, setDescText] = useState("");

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news-update", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          console.error(data?.error || "API error");
          return;
        }

        setHeading(data?.heading ?? "");
        setDescText(isKhmer ? data?.description?.km ?? "" : data?.description?.en ?? "");
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        console.error("Failed to fetch news", err);
      }
    }

    fetchNews();
  }, [isKhmer]);

  return (
    <>
      <div className="text-center mb-80">
        <h2 className={`text-5xl font-extrabold text-gray-900 ${isKhmer ? "khmer-font" : ""}`}>
          {heading || (isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates")}
        </h2>

        <p className={`mt-4 text-2xl text-gray-600 max-w-5xl px-3 mx-auto ${isKhmer ? "khmer-font" : ""}`}>
          {descText ||
            (isKhmer
              ? "អត្ថបទគំរូសម្រាប់ការពិពណ៌នាព័ត៌មាន សូមបញ្ចូលអត្ថបទពិតរបស់អ្នក។"
              : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit...")}
        </p>
      </div>

      <div className="h-[220px] flex flex-col justify-end relative" style={{ backgroundColor: DARK_BLUE }}>
        <div className="container mx-auto px-4 max-w-7xl py-8">
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
                    <h3 className={`text-xl font-bold text-gray-800 mb-4 ${isKhmer ? "khmer-font" : ""}`}>
                      {isKhmer ? item.title.km : item.title.en}
                    </h3>
                    <p className={`text-gray-600 leading-relaxed text-base ${isKhmer ? "khmer-font" : ""}`}>
                      {isKhmer ? item.description.km : item.description.en}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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