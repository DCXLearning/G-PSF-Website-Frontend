"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type Objective = {
    id: number;
    title: string;
    description: string;
};

const objectivesData: Record<Lang, Objective[]> = {
    en: [
        {
            id: 1,
            title: "Objective 1",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
        },
        {
            id: 2,
            title: "Objective 2",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
        },
        {
            id: 3,
            title: "Objective 3",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
        },
    ],
    kh: [
        {
            id: 1,
            title: "គោលបំណងទី ១",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក ដើម្បីបង្ហាញគោលបំណងនៃ G-PSF។",
        },
        {
            id: 2,
            title: "គោលបំណងទី ២",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក ដើម្បីបង្ហាញគោលបំណងនៃ G-PSF។",
        },
        {
            id: 3,
            title: "គោលបំណងទី ៣",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក ដើម្បីបង្ហាញគោលបំណងនៃ G-PSF។",
        },
    ],
};

// Bigger, clean hex node
const HexNode = () => (
    <div className="relative w-12 h-12 flex items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>
        <span className="absolute w-3.5 h-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

const AboutUs: React.FC = () => {
    const { language } = useLanguage();

    const t = {
        en: {
            badge: "About Us",
            title: "What is the G-PSF?",
            desc: `The G-PSF is a structured dialogue platform chaired by the Prime
Minister of Cambodia, bringing together senior government officials
and private sector leaders to address policy and regulatory
constraints affecting economic growth.`,
            objectives: "Objectives",
        },
        kh: {
            badge: "អំពីពួកយើង",
            title: "G-PSF គឺជាអ្វី?",
            desc: `G-PSF គឺជាវេទិកាសន្ទនារចនាសម្ព័ន្ធ ដែលមានសម្តេចនាយករដ្ឋមន្ត្រីកម្ពុជាជាអធិបតី
នាំមកជួបជុំមន្ត្រីរាជការជាន់ខ្ពស់ និងមេដឹកនាំវិស័យឯកជន
ដើម្បីដោះស្រាយបញ្ហាគោលនយោបាយ និងបទប្បញ្ញត្តិ
ដែលជាឧបសគ្គដល់កំណើនសេដ្ឋកិច្ច។`,
            objectives: "គោលបំណង",
        },
    }[language as Lang];

    const data = objectivesData[language as Lang];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-10">
                        <p
                            className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${language === "kh" ? "khmer-font normal-case" : ""
                                }`}
                        >
                            {t.badge}
                        </p>

                        <h1
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${language === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {t.title}
                        </h1>

                        <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[360px] translate-x-0 sm:translate-x-8 md:translate-x-25" />

                        <p
                            className={`mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-25 ${language === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {t.desc}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 ${language === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {t.objectives}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {data.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3
                                                className={`text-xl font-extrabold text-gray-900 ${language === "kh" ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {obj.title}
                                            </h3>

                                            <p
                                                className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${language === "kh" ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {obj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* end right */}
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
