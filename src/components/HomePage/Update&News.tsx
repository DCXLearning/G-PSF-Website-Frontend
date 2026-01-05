"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

// Type for items
interface ContentItem {
  titleEn: string;
  titleKh: string;
  contentEn: string;
  contentKh: string;
  icon: string;
}

// EN + KH content
const contentItems: ContentItem[] = [
  {
    titleEn: "Results & Achievements",
    titleKh: "លទ្ធផល និងសមិទ្ធិផល",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "📊",
  },
  {
    titleEn: "Digital Reforms",
    titleKh: "កំណែទម្រង់ឌីជីថល",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "💡",
  },
  {
    titleEn: "Policy Reform Tracker",
    titleKh: "តាមដានកំណែទម្រង់នយោបាយ",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "💼",
  },
  {
    titleEn: "Work Group Meetings",
    titleKh: "ការប្រជុំក្រុមការងារ",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "🤝",
  },
  {
    titleEn: "News & Updates",
    titleKh: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "📰",
  },
  {
    titleEn: "Results & Achievements",
    titleKh: "លទ្ធផល និងសមិទ្ធិផល",
    contentEn:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.",
    contentKh:
      "អត្ថបទគំរូសម្រាប់បង្ហាញមាតិកាដោយសង្ខេប សូមបញ្ចូលមាតិកាពិតនៅទីនេះ។",
    icon: "📊",
  },
];

const DARK_BLUE = "#1A1D42";

const Update_News: React.FC = () => {
  const { language } = useLanguage();
  const isKhmer = language === "kh";

  const sectionTitle = isKhmer ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates";
  const sectionDescription = isKhmer
    ? "អត្ថបទគំរូសម្រាប់ការពិពណ៌នាព័ត៌មាន សូមបញ្ចូលអត្ថបទពិតរបស់អ្នកនៅទីនេះ។"
    : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet.";

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-80">
        <h2
          className={`text-5xl font-extrabold text-gray-900 ${
            isKhmer ? "khmer-font" : ""
          }`}
        >
          {sectionTitle}
        </h2>
        <p
          className={`mt-4 text-2xl text-gray-600 max-w-5xl px-3 mx-auto ${
            isKhmer ? "khmer-font" : ""
          }`}
        >
          {sectionDescription}
        </p>
      </div>

      {/* Background bar + Swiper */}
      <div
        className="h-[220px] flex flex-col justify-end relative"
        style={{ backgroundColor: DARK_BLUE }}
      >
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
            {contentItems.map((item, index) => (
              <SwiperSlide key={index} className="pb-12 pt-16">
                <div
                  className="bg-white overflow-hidden rounded-lg relative pt-12 h-[360px] flex flex-col transition-transform duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
                  style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                >
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-40 pt-5 rounded-full border-4 border-white"
                    style={{ backgroundColor: DARK_BLUE }}
                  >
                    <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                      {item.icon}
                    </div>
                  </div>

                  <div className="p-6 pt-10">
                    <h3
                      className={`text-xl font-bold text-gray-800 mb-4 ${
                        isKhmer ? "khmer-font" : ""
                      }`}
                    >
                      {isKhmer ? item.titleKh : item.titleEn}
                    </h3>
                    <p
                      className={`text-gray-600 leading-relaxed text-base ${
                        isKhmer ? "khmer-font" : ""
                      }`}
                    >
                      {isKhmer ? item.contentKh : item.contentEn}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Swiper pagination style */}
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
};

export default Update_News;
