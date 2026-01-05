"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

const WorkingGroups16: React.FC = () => {
  const { language } = useLanguage();
  const lang = (language as Lang) ?? "en";
  const isKh = lang === "kh";

  const t = {
    en: {
      small: "What are",
      title: "Working Groups?",
      desc: (
        <>
          The Working Groups (WGs) are the core operational engine of the G-PSF.
          <br />
          <br />
          They provide structured platforms where government and private sector
          representatives meet regularly to identify constraints, propose
          solutions, and deliver practical policy and regulatory reforms.
        </>
      ),
    },
    kh: {
      small: "តើអ្វីទៅជា",
      title: "ក្រុមការងារ (WGs)?",
      desc: (
        <>
          ក្រុមការងារ (WGs) គឺជាម៉ាស៊ីនដំណើរការស្នូលរបស់ G-PSF។
          <br />
          <br />
          ក្រុមការងារ ផ្តល់វេទិកាសន្ទនារចនាសម្ព័ន្ធ ដែលតំណាងរដ្ឋាភិបាល និងវិស័យឯកជន
          ជួបពិភាក្សាជាប្រចាំ ដើម្បីកំណត់ឧបសគ្គ ស្នើដំណោះស្រាយ និងជំរុញកែទម្រង់
          គោលនយោបាយ និងបទប្បញ្ញត្តិដែលអាចអនុវត្តបានជាក់ស្តែង។
        </>
      ),
    },
  }[lang];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* LEFT */}
          <div className="lg:sticky lg:top-10">
            <p
              className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${
                isKh ? "khmer-font normal-case" : ""
              }`}
            >
              {t.small}
            </p>

            <h1
              className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${
                isKh ? "khmer-font" : ""
              }`}
            >
              {t.title}
            </h1>

            <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[440px] translate-x-0 sm:translate-x-8 md:translate-x-25" />

            <p
              className={`mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-25 ${
                isKh ? "khmer-font" : ""
              }`}
            >
              {t.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingGroups16;
