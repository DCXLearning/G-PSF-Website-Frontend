"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
    en: {
        title: "G-PSF Plenary Structure",
        image: "/image/G-PSF_Issue_Resolution_Framework_EN.png",
        imageAlt: "G-PSF Plenary Structure English",
    },
    kh: {
        title: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
        image: "/image/G-PSF_Issue_Resolution_Framework_KH.png",
        imageAlt: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
    },
};

function normalizeLang(language: unknown): "en" | "kh" {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

export default function PlenaryStructure() {
    const { language } = useLanguage();

    const lang = normalizeLang(language);
    const t = content[lang];

    const titleFontClass =
        lang === "kh"
            ? "title-km khmer-font font-bold"
            : "title-en airbnb-font font-extrabold";

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="mb-8 text-center md:mb-10">
                    <h1
                        className={`
                            text-gray-900
                            ${titleFontClass}
                        `}
                    >
                        {t.title}
                    </h1>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:p-4 md:p-5 lg:p-6">
                    <div className="relative h-[240px] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:h-[360px] md:h-[480px] lg:h-[720px]">
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
            </div>
        </section>
    );
}