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
    { id: 1, title: "Adjusting the business and investment climate", description: "" },
    { id: 2, title: "Easing the compliance burden", description: "" },
    { id: 3, title: "Facilitating businesses under tax authorities", description: "" },
    { id: 4, title: "Trade facilitation under customs authority jurisdiction", description: "" },
    { id: 5, title: "Improving transportation and infrastructure", description: "" },
    { id: 6, title: "Rehabilitation and development of tourism", description: "" },
    { id: 7, title: "Developing agriculture and agro-industry", description: "" },
    { id: 8, title: "Banking and the finance sector", description: "" },
    { id: 9, title: "Mining and the energy sector", description: "" },
    { id: 10, title: "Construction and the real estate sector", description: "" },
    { id: 11, title: "Other issues", description: "" },
  ],
  kh: [
    { id: 1, title: "ការកែសម្រួលបរិយាកាសធុរកិច្ច និងការវិនិយោគ", description: "" },
    { id: 2, title: "ការសម្រាលបន្ទុកលើអនុលោមភាព", description: "" },
    { id: 3, title: "ការសម្រួលដល់ធុរកិច្ចក្រោមដែនសមត្ថកិច្ចពន្ធដារ", description: "" },
    { id: 4, title: "កិច្ចសម្រួលពាណិជ្ជកម្មក្រោមដែនសមត្ថកិច្ចគយ", description: "" },
    { id: 5, title: "ការលើកកម្ពស់ការដឹកជញ្ជូន និងហេដ្ឋារចនាសម្ព័ន្ធ", description: "" },
    { id: 6, title: "ការស្តារ និងការលើកស្ទួយការអភិវឌ្ឍវិស័យទេសចរណ៍", description: "" },
    { id: 7, title: "ការអភិវឌ្ឍវិស័យកសិកម្ម និងកសិឧស្សាហកម្ម", description: "" },
    { id: 8, title: "វិស័យធនាគារ និងហិរញ្ញវត្ថុ", description: "" },
    { id: 9, title: "វិស័យរ៉ែ និងថាមពល", description: "" },
    { id: 10, title: "វិស័យសំណង់ និងអចលនទ្រព្យ", description: "" },
    { id: 11, title: "បញ្ហាផ្សេងៗ", description: "" },
  ],
};

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

const PlenaryPage: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language === "kh" ? "kh" : "en") as Lang;

    const t = {
        en: {
            badge: "Plenary",
            title: "G-PSF\nPlenary",
            desc: `Roles and responsibilities of the plenary Allowing private sector to raise concerns and challenges seeking resolution and intervention from the Royal Government`,
            objectives: "The plenary is:",
        },
        kh: {
            badge: "កិច្ចប្រជុំពេញអង្គ",
            title: "កិច្ចប្រជុំពេញអង្គ\nG-PSF",
            desc: `អនុញ្ញាតឱ្យផ្នែកឯកជនលើកឡើងនូវសំណូមពរ និងបញ្ហាប្រឈម ដើម្បីស្នើសុំដំណោះស្រាយ និងអន្តរាគមន៍ពីផ្នែករាជរដ្ឋាភិបាល។`,
            objectives: "កិច្ចប្រជុំពេញអង្គគឺ៖",
        },
    }[lang];

    const data = objectivesData[lang];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    <div className="lg:sticky lg:top-40">
                        <h1
                            className={`whitespace-pre-line text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.title}
                        </h1>

                        <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[360px] translate-x-0 sm:translate-x-8 md:translate-x-32" />

                        <p
                            className={`whitespace-pre-line mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-32 ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.desc}
                        </p>
                    </div>

                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.objectives}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-6">
                                {data.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3
                                                className={`text-xl font-extrabold text-gray-900 ${
                                                    lang === "kh" ? "khmer-font" : ""
                                                }`}
                                            >
                                                {obj.title}
                                            </h3>

                                            {/* <p
                                                className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${
                                                    lang === "kh" ? "khmer-font" : ""
                                                }`}
                                            >
                                                {obj.description}
                                            </p> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlenaryPage;