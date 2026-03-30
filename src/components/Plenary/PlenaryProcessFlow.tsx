"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const steps = [
    {
        image: "/image/Subpages_plenary_mock_up.bmp",
        alt: "Collaborate",
    },
    {
        image: "/image/Subpages_plenary_mock2.bmp",
        alt: "Implement",
    },
    {
        image: "/image/Subpages_plenary_mock_up.23.bmp",
        alt: "Innovate",
    },
    {
        image: "/image/Subpages_plenary_mock_up.23.03df.bmp",
        alt: "Evaluate",
    },
];

export default function PlenaryProcessFlow() {
    const { language } = useLanguage();
    const lang = language === "kh" ? "kh" : "en";

    const t = {
        en: {
            footer:
                "The G-PSF Plenary is more than a discussion forum—it is a results-driven governance mechanism.",
        },
        kh: {
            footer:
                "កិច្ចប្រជុំពេញអង្គ G-PSF មិនត្រឹមតែជាវេទិកាពិភាក្សាប៉ុណ្ណោះទេ ប៉ុន្តែជាយន្តការគ្រប់គ្រងផ្អែកលើលទ្ធផលជាក់ស្តែង។",
        },
    };

    return (
        <section className="w-full bg-[#efefef]">
            <div className="mx-auto max-w-7xl px-4 py-10 md:px4 md:py-12">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4 md:gap-6">
                            <div className="flex flex-col items-center">
                                <div className="flex h-[150px] w-[190px] items-center justify-center md:h-[180px] md:w-[210px]">
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={step.image}
                                            alt={step.alt}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <ChevronRight
                                    className="hidden h-12 w-12 text-[#8c8c8c] md:block"
                                    strokeWidth={3}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#20266d] px-4 py-14 md:py-20">
                <p
                    className={`mx-auto max-w-7xl text-center text-lg font-medium leading-relaxed text-white md:text-[26px] ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {t[lang].footer}
                </p>
            </div>
        </section>
    );
}