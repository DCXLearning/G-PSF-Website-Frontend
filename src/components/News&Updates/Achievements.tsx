"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

const Achievements: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t = {
        en: {
            small: "Key",
            title: "Achievements",
            card: "linked to MIS interface showing key indicators infographics",
        },
        kh: {
            small: "ចំណុចសំខាន់",
            title: "សមិទ្ធផល",
            card: "ភ្ជាប់ទៅកាន់ផ្ទាំង MIS ដើម្បីបង្ហាញព័ត៌មានសង្ខេប និងអ៊ីនហ្វូក្រាហ្វិកនៃសូចនាករសំខាន់ៗ",
        },
    }[lang];

    return (
        <section className="bg-white py-8 md:py-12 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex flex-col items-start">
                    {/* HEADER SECTION */}
                    <div className="w-full">
                        <p
                            className={`text-gray-900 font-bold text-xl mb-1 ${isKh ? "khmer-font normal-case" : ""
                                }`}
                        >
                            {t.small}
                        </p>

                        <h1
                            className={`text-[#1a2b4b] text-5xl font-black mb-6 ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {t.title}
                        </h1>
                    </div>

                    {/* LINE */}
                    <div className="mt-5 mb-12 h-1.5 apsolute left- top-0 bg-orange-500 w-3/4 sm:w-full max-w-[440px] sm:ml-8 md:ml-20" />

                    {/* SQUARE CONTENT CARD */}
                    <div className="w-full flex justify-center sm:justify-start">
                        <div className="bg-[#A3C1AD] sm:ml-8 md:ml-20 rounded-[40px] aspect-square w-full h-110 max-w-[1090px] flex items-center justify-center p-6 md:p-30 shadow-sm">
                            <h3
                                className={`text-2xl sm:text-4xl md:text-6xl font-bold text-gray-800 text-center leading-snug w-full ${isKh ? "khmer-font" : ""
                                    }`}
                            >
                                {t.card}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Achievements;
