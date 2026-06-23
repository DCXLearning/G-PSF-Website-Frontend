"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

const Achievements: React.FC = () => {
    const { language } = useLanguage();

    const lang: Lang =
        String(language || "en").toLowerCase() === "kh" ||
        String(language || "en").toLowerCase() === "km"
            ? "kh"
            : "en";

    const isKh = lang === "kh";

    const t = {
        en: {
            small: "Key",
            title: "Achievements",
            card: "Linked to MIS interface showing key indicators infographics",
        },
        kh: {
            small: "ចំណុចសំខាន់",
            title: "សមិទ្ធផល",
            card: "ភ្ជាប់ទៅកាន់ផ្ទាំង MIS ដើម្បីបង្ហាញព័ត៌មានសង្ខេប និងអ៊ីនហ្វូក្រាហ្វិកនៃសូចនាករសំខាន់ៗ",
        },
    }[lang];

    const titleFontClass = isKh
        ? "title-km khmer-font font-bold"
        : "title-en airbnb-font font-extrabold";

    const bodyFontClass = isKh
        ? "body-km khmer-font"
        : "body-en airbnb-font";

    const labelFontClass = isKh
        ? "body-km khmer-font !font-bold normal-case"
        : "body-en airbnb-font !font-bold tracking-[0.7px]";

    return (
        <section className="overflow-hidden bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex flex-col items-start">
                    <div className="w-full">
                        <p
                            className={`mb-2 text-gray-900 ${labelFontClass}`}
                            style={{ fontWeight: 700 }}
                        >
                            {t.small}
                        </p>

                        <h1 className={`text-gray-900 ${titleFontClass}`}>
                            {t.title}
                        </h1>
                    </div>

                    <div className="mt-5 mb-12 h-[7px] w-3/4 max-w-[300px] bg-orange-500 sm:w-full" />

                    <div className="flex w-full justify-center">
                        <div className="flex aspect-square h-120 w-full max-w-[850px] items-center justify-center rounded-[40px] bg-[#A3C1AD] p-6 shadow-sm sm:ml-8 md:ml-20 md:p-30">
                            <h3
                                className={`
                                    w-full text-center text-gray-800
                                    ${isKh ? "title-km khmer-font" : "title-en airbnb-font"}
                                `}
                                style={{ fontWeight: 700 }}
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