"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
    en: {
        title: "G-PSF Plenary Structure",
        footer: "The G-PSF serves as a formal public-private dialogue (PPD) mechanism for policy engagement.",
        image: "/image/G-PSF_Issue_Resolution_Framework_EN.png",
        imageAlt: "G-PSF Plenary Structure English",
    },
    kh: {
        title: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
        footer: "G-PSF ជាយន្តការសន្ទនាផ្លូវការរវាងរដ្ឋ និងវិស័យឯកជន (PPD) សម្រាប់ការចូលរួមក្នុងការរៀបចំគោលនយោបាយ។",
        image: "/image/G-PSF_Issue_Resolution_Framework_KH.png",
        imageAlt: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
    },
};

export default function PlenaryStructure() {
    const { language } = useLanguage();
    const lang = language === "kh" ? "kh" : "en";
    const t = content[lang];

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">

                {/* Title */}
                <div className="text-center mb-8 md:mb-10">
                    <h1
                        className={`text-3xl sm:text-5xl font-bold text-gray-900 ${
                            lang === "kh" ? "khmer-font leading-relaxed" : ""
                        }`}
                    >
                        {t.title}
                    </h1>
                </div>

                {/* Frame (MATCH Flow Page) */}
                <div className="border border-slate-200 rounded-2xl bg-white p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">

                    {/* Image Container */}
                    <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[720px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">

                        <Image
                            src={t.image}
                            alt={t.imageAlt}
                            fill
                            priority
                            className="object-cover p-4"
                            sizes="(max-width: 768px) 100vw, 1200px"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p
                        className={`text-sm md:text-base max-w-3xl mx-auto text-gray-600 ${
                            lang === "kh"
                                ? "khmer-font leading-relaxed"
                                : "leading-relaxed"
                        }`}
                    >
                        {t.footer}
                    </p>
                </div>
            </div>
        </section>
    );
}