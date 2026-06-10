"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/app/context/LanguageContext";
import { FaArrowRight } from "react-icons/fa6";

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

function cleanText(value?: string) {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function getText(value: MultiLangText, isKhmer: boolean) {
  if (!value) return "";
  if (typeof value === "string") return cleanText(value);

  return isKhmer
    ? cleanText(value?.km) || cleanText(value?.kh) || cleanText(value?.en)
    : cleanText(value?.en) || cleanText(value?.km) || cleanText(value?.kh);
}

function getDescriptionText(value: MultiLangText, isKhmer: boolean) {
  return getText(value, isKhmer);
}

function NewsCardSkeleton() {
  return (
    <div
      className="relative flex h-[450px] animate-pulse flex-col overflow-hidden rounded-lg bg-white"
      style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
    >
      <div className="h-[220px] w-full bg-slate-200" />

      <div className="p-6">
        <div className="mb-4 h-7 w-3/4 rounded bg-slate-200" />
        <div className="mb-2 h-4 w-full rounded bg-slate-200" />
        <div className="mb-2 h-4 w-5/6 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function Update_News() {
  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const titleFontClass = isKhmer ? "title-km" : "title-en";
  const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
  const bodyFontClass = isKhmer ? "body-km" : "body-en";
  const buttonFontClass = isKhmer ? "khmer-font" : "airbnb-font";
  const noDescriptionText = isKhmer
    ? "មិនមានការពិពណ៌នា។"
    : "No description available.";

  const [heading, setHeading] = useState<MultiLangText>({
    en: "News & Updates",
    km: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
  });

  const [description, setDescription] = useState<MultiLangText>({
    en: "",
    km: "",
  });

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

        setHeading(
          data?.heading || {
            en: "News & Updates",
            km: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
          }
        );

        setDescription(data?.description || { en: "", km: "" });
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        console.error("Failed to fetch Update_News:", error);

        if (alive) {
          setItems([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      alive = false;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white pb-8 pt-10">
      <div className="relative z-10 mb-16 text-center">
        <h2 className={`text-gray-900 ${titleFontClass}`}>
          {getText(heading, isKhmer) ||
            (isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates")}
        </h2>
      </div>
      <div
        className="absolute bottom-0 left-0 h-[48.99%] w-full -z-0"
        style={{ backgroundColor: DARK_BLUE }}
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        ) : (
          <>
            <Swiper
              modules={[Pagination]}
              slidesPerView={1}
              spaceBetween={24}
              pagination={{
                clickable: true,
                el: ".custom-news-pagination",
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="mb-6"
            >
              {items.map((item) => {
                const descriptionText = getDescriptionText(item.description, isKhmer);

                return (
                  <SwiperSlide key={item.id}>
                    <Link href={item.link} className="group block h-full">
                      <div
                        className="flex h-[450px] flex-col overflow-hidden rounded-xl border border-gray-500 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-2"
                        style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                      >
                        <div className="h-[220px] w-full flex-shrink-0 overflow-hidden bg-slate-100">
                          <img
                            src={item.image || "/image/placeholder.png"}
                            alt={getText(item.title, isKhmer) || "news"}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <h3
                            className={`
                              mb-3 h-[64px] line-clamp-2 text-gray-800
                              !whitespace-normal !overflow-hidden !text-clip
                              ${mainTitleFontClass}
                            `}
                          >
                            {getText(item.title, isKhmer)}
                          </h3>

                          <p
                            className={`
                              mb-4 line-clamp-2 text-gray-600
                              ${bodyFontClass}
                            `}
                          >
                            {descriptionText || noDescriptionText}
                          </p>

                          <div
                            className={`
                              mt-auto inline-flex w-fit items-center gap-2
                              rounded-full border border-orange-500
                              px-3 py-1
                              text-[12px] font-bold text-orange-600
                              no-underline transition
                              hover:border-[#1D4ED8]
                              hover:bg-[#EFF6FF]
                              hover:text-[#1D4ED8]
                              ${isKhmer ? "khmer-font" : "airbnb-font"}
                            `}
                            >
                            {isKhmer ? "អានបន្ថែម" : "View Detail"}
                            <FaArrowRight className="h-3 w-3" />
                        </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="custom-news-pagination mb-10 flex h-6 items-center justify-center" />

            <div className="relative z-20 flex justify-center">
              <Link
                href="/new-update/see-more"
                className={`
                  rounded-full bg-white px-10 py-3 font-bold text-[#1A1D42]
                  shadow-xl transition-all hover:scale-105 hover:bg-gray-100
                  ${buttonFontClass}
                `}
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
