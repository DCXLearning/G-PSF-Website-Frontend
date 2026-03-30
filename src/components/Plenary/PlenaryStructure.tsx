"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
    en: {
        title: "G-PSF Plenary Structure",
        footer:
            "The G-PSF serves as a formal public-private dialogue (PPD) mechanism for policy engagement.",
        image: "/image/G-PSF_Issue_Resolution_Framework_EN.png",
        imageAlt: "G-PSF Plenary Structure English",
    },
    kh: {
        title: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
        footer:
            "G-PSF ជាយន្តការសន្ទនាផ្លូវការរវាងរដ្ឋ និងវិស័យឯកជន (PPD) សម្រាប់ការចូលរួមក្នុងការរៀបចំគោលនយោបាយ។",
        image: "/image/G-PSF_Issue_Resolution_Framework_KH.png",
        imageAlt: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
    },
};

export default function PlenaryStructure() {
    const { language } = useLanguage();

    const lang = language === "kh" ? "kh" : "en";
    const t = content[lang];

    return (
        <main className="py-12 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                <h1
                    className={`text-3xl md:text-4xl font-bold text-[#222] mb-6 ${lang === "kh" ? "khmer-font leading-relaxed" : ""
                        }`}
                >
                    {t.title}
                </h1>

                <div className="bg-white max-w-6xl mx-auto shadow-xl overflow-hidden">
                    <div className="h-14 bg-[#2c2f6b]" />

                    <div className="relative w-full flex justify-center bg-[#e7e5e5]">
                        <div className="relative w-full max-w-[1000px] h-[500px] md:h-[690px]">
                            <Image
                                src={t.image}
                                alt={t.imageAlt}
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-[#2c2f6b] text-white text-center py-6 px-6">
                        <p
                            className={`text-sm md:text-base ${lang === "kh" ? "khmer-font leading-relaxed" : "leading-relaxed"
                                }`}
                        >
                            {t.footer}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}