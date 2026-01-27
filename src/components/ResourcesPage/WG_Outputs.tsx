"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

// 1. Define an interface for the props
interface ArticleCardProps {
  icon: string;
  category: string;
  headline: string;
}

const WGOutputs = () => {
  return (
    <section className="bg-white py-16 px-4 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h3 className="text-[#1e2756] text-xl md:text-2xl font-semibold tracking-wide uppercase">
          Insights — Findings — Results
        </h3>
        <h2 className="text-[#1e2756] text-5xl md:text-6xl font-extrabold mt-2 mb-6">
          WG Outputs
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
          euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Featured Report */}
        <div className="relative group overflow-hidden rounded-sm min-h-[500px] lg:min-h-[600px] flex items-center justify-center p-8 text-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/image/resources_top.bmp"
              alt="Team Meeting"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-white/40" />
          </div>

          <div className="relative z-10 max-w-md">
            <div className="bg-[#1e2756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image
                src="/icon_Resources_page/icon1.png"
                alt="Icon"
                width={45}
                height={45}
              />
            </div>

            <p className="text-[#1e2756] font-bold uppercase tracking-wider mb-2">
              Manufacturing & SMEs
            </p>

            <h4 className="text-[#1e2756] text-4xl font-extrabold mb-4">
              Featured Report Headline
            </h4>

            <p className="text-gray-800 mb-8 font-medium">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy
              nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
            </p>

            <div className="flex flex-wrap justify-center gap-6 items-center">
              <button className="bg-[#f39c32] hover:bg-[#e68a1e] text-[#1e2756] cursor-pointer font-bold py-2 px-6 rounded flex items-center gap-2 transition-all">
                Download <ChevronRight size={16} />
              </button>

              <button className="text-[#1e2756] cursor-pointer font-bold flex items-center gap-1 hover:underline underline-offset-4">
                WG Profile <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Article Column */}
        <div className="flex flex-col gap-8">
          <ArticleCard
            icon="/icon_Resources_page/icon2.png"
            category="Banking & Financial Services"
            headline="Article Headline"
          />

          <ArticleCard
            icon="/icon_Resources_page/icon3.png"
            category="Law, Tax & Governance"
            headline="Article Headline"
          />
        </div>
      </div>
    </section>
  );
};

/* Reusable Article Card Component with TypeScript Props */
const ArticleCard = ({ icon, category, headline }: ArticleCardProps) => (
  <div className="border border-gray-200 p-10 flex flex-col items-center justify-center text-center flex-1">
    <div className="bg-[#1e2756] w-14 h-14 rounded-full flex items-center justify-center mb-4 overflow-hidden">
      <Image
        src={icon}
        alt={category}
        width={40}
        height={40}
        className="object-contain"
      />
    </div>

    <p className="text-[#1e2756] text-sm font-bold uppercase tracking-widest mb-1">
      {category}
    </p>

    <h4 className="text-[#1e2756] text-3xl font-bold mb-3">
      {headline}
    </h4>

    <p className="text-gray-700 text-sm max-w-sm mb-6">
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
      tincidunt ut laoreet dolore magna aliquam erat volutpat.
    </p>

    <button className="text-[#1e2756] cursor-pointer font-bold text-xs flex items-center gap-1 hover:underline">
      Download <ChevronRight size={14} />
    </button>
  </div>
);

export default WGOutputs;