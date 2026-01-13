"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const PLACEHOLDER_IMAGE_URL = "/image/Banner.bmp";

export default function HeroBanner() {
  const { language } = useLanguage();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch("/api/home-post")
      .then((res) => res.json())
      .then(setPost)
      .catch(console.error);
  }, []);

  if (!post) return null;

  const c = post.content.content;

  // CMS → UI
  const topLine = c[0]?.content?.[0]?.text || "";
  const titleLine1 = c[1]?.content?.[0]?.text || "";
  const titleLine2 = c[1]?.content?.[2]?.text || "";
  const paragraph = c[2]?.content?.[0]?.text || "";

  const stats = [
    {
      value: c[3]?.content?.[0]?.text,
      labelEn: c[4]?.content?.[0]?.text,
      labelKh: c[4]?.content?.[0]?.text, // later you can add Khmer in CMS
    },
    {
      value: c[5]?.content?.[0]?.text,
      labelEn: c[6]?.content?.[0]?.text,
      labelKh: c[6]?.content?.[0]?.text,
    },
    {
      value: c[7]?.content?.[0]?.text,
      labelEn: c[8]?.content?.[0]?.text,
      labelKh: c[8]?.content?.[0]?.text,
    },
  ];

  const bgImage = post.images?.[0]?.url || PLACEHOLDER_IMAGE_URL;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-gray-100">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gray-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-36 max-w-5xl w-full">
        <p className="text-base sm:text-lg md:text-3xl text-white mb-6">
          {topLine}
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6">
          {titleLine1}
          <br />
          {titleLine2}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white max-w-3xl mb-12">
          {paragraph}
        </p>

        <button className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-3 px-10 rounded-2xl shadow-xl">
          {post.title}
        </button>
      </div>

      {/* Stats */}
      <div className="max-w-[1120px] mx-auto absolute bottom-0 w-full py-6 border-t-[5px] border-white px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-white">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="border-t-2 border-white w-12 mb-3"></div>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-sm tracking-widest uppercase">
                {language === "en" ? stat.labelEn : stat.labelKh}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
