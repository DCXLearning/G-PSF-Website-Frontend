"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export default function PlenaryStructure() {
    const { language } = useLanguage();

    const t = {
        en: {
            title: "G-PSF Plenary Structure",
            footer:
                "The G-PSF serves as a formal public–private dialogue (PPD) mechanism for policy engagement.",
        },
        kh: {
            title: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
            footer:
                "G-PSF ជាវេទិកាសម្រាប់ការសន្ទនារវាងរដ្ឋ និងឯកជន (PPD) សម្រាប់ការចូលរួមក្នុងគោលនយោបាយ។",
        },
    };

    const lang = language === "kh" ? "kh" : "en";

    return (
        <main className="py-12 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* Title */}
                <h1
                    className={`text-3xl md:text-4xl font-bold text-[#222] mb-6 ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {t[lang].title}
                </h1>

                {/* Card */}
                <div className="bg-white max-w-6xl mx-auto shadow-xl overflow-hidden">

                    {/* Top bar */}
                    <div className="h-14 bg-[#2c2f6b]" />

                    {/* Image Diagram */}
                    <div className="relative w-full flex justify-center bg-[#e7e5e5]">
                        <div className="relative w-full max-w-[900px] h-[500px] md:h-[700px]">
                            <Image
                                src="/image/Subpages_plenary_mock_up.23.031.bmp"
                                alt="Plenary Structure"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#2c2f6b] text-white text-center py-6 px-6">
                        <p
                            className={`text-sm md:text-base ${lang === "kh" ? "khmer-font leading-relaxed" : ""
                                }`}
                        >
                            {t[lang].footer}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}