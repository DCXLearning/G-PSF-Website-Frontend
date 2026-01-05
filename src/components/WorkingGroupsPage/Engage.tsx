"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type Objective = {
    id: number;
    title: string;
    description: string;
};

const objectivesByLang: Record<Lang, Objective[]> = {
    en: [
        {
            id: 1,
            title: "Participate",
            description:
                "Engage through your Business Membership Organisation or chamber to have your voice heard at the policy level.",
        },
        {
            id: 2,
            title: "Contribute",
            description:
                "Provide issues and evidence through Private Sector Working Groups (PSWGs) to drive regulatory change.",
        },
        {
            id: 3,
            title: "Engage",
            description:
                "Join consultations, technical discussions, and Working Group meetings to shape economic conditions.",
        },
    ],
    kh: [
        {
            id: 1,
            title: "ចូលរួម",
            description:
                "ចូលរួមតាមរយៈអង្គការសមាជិកធុរកិច្ច ឬសមាគម/សភាពាណិជ្ជកម្ម ដើម្បីឱ្យសំឡេងរបស់អ្នកត្រូវបានស្តាប់នៅកម្រិតគោលនយោបាយ។",
        },
        {
            id: 2,
            title: "ចូលរួមចំណែក",
            description:
                "ផ្តល់បញ្ហា និងភស្តុតាងតាមរយៈក្រុមការងារវិស័យឯកជន (PSWGs) ដើម្បីជំរុញការកែប្រែបទប្បញ្ញត្តិ និងកំណែទម្រង់។",
        },
        {
            id: 3,
            title: "សហការនិងពិភាក្សា",
            description:
                "ចូលរួមការពិគ្រោះយោបល់ ការពិភាក្សាបច្ចេកទេស និងអង្គប្រជុំក្រុមការងារ ដើម្បីរួមចំណែកកំណត់លក្ខខណ្ឌសេដ្ឋកិច្ច។",
        },
    ],
};

const HexNode = () => (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 100" className="w-12 h-12">
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

const Engage: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const titlePrefix = lang === "kh" ? "របៀប" : "How To";
    const titleHighlight = lang === "kh" ? "ចូលរួម" : "Engage";

    const objectivesData = objectivesByLang[lang];

    return (
        <section className="bg-white mt-5 sm:mt-5 md:mt-10 lg:mt-15 py-8 md:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 flex justify-center lg:justify-end">
                <div className="w-full lg:w-1/2">
                    {/* Title */}
                    <h2
                        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-10 md:mb-14 tracking-tight ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {titlePrefix}{" "}
                        <span className="text-[#1e3a8a]">{titleHighlight}</span>
                    </h2>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[23px] top-1 bottom-0 w-[3px] bg-orange-500" />

                        <div className="space-y-10 sm:space-y-12">
                            {objectivesData.map((obj) => (
                                <div
                                    key={obj.id}
                                    className="relative flex items-start gap-5 sm:gap-6"
                                >
                                    <HexNode />

                                    <div className="pt-1 max-w-md">
                                        <h3
                                            className={`text-lg sm:text-xl md:text-2xl font-bold text-gray-900 hover:text-[#1e3a8a] transition-colors ${isKh ? "khmer-font" : ""
                                                }`}
                                        >
                                            {obj.title}
                                        </h3>

                                        <p
                                            className={`mt-2 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed ${isKh ? "khmer-font" : ""
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
            </div>
        </section>
    );
};

export default Engage;
