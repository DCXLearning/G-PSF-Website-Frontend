"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export default function HeroBanner() {
    const { language } = useLanguage();

    const content = {
        en: {
            title: "The Government-Private Sector Forum Plenary",
            subtitle: "Cambodia’s Highest Platform for Public-Private Solutions",
        },
        kh: {
            title: "កិច្ចប្រជុំពេញអង្គវេទិការាជរដ្ឋាភិបាល-ឯកជន",
            subtitle: "វេទិកាខ្ពស់បំផុតសម្រាប់ដំណោះស្រាយរវាងរដ្ឋ និងឯកជននៅកម្ពុជា",
        },
    };

    const t = content[language];

    return (
        <main className="bg-white">
            <section className="mx-auto max-w-[1500px] overflow-hidden bg-white shadow-2xl">

                {/* Title */}
                <div className="px-6 pt-10 pb-6 text-center sm:px-10 md:px-16">
                    <h1
                        className={`font-extrabold tracking-tight text-[#1f1f1f] 
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                        ${language === "kh" ? "khmer-font leading-relaxed" : ""}`}
                        >
                        {t.title}
                    </h1>

                    <p
                        className={`mt-4 text-gray-600 
                        text-sm sm:text-base md:text-xl lg:text-2xl
                        ${language === "kh" ? "khmer-font leading-relaxed" : ""}`}
                    >
                        {t.subtitle}
                    </p>
                </div>

                {/* Image */}
                <div className="relative w-full shadow-lg">
                    <div className="relative h-[260px] sm:h-[400px] md:h-[550px] lg:h-[700px] xl:h-[820px]">
                        <Image
                            src="/image/Subpages_plenary_mock_up.23.03.bmp"
                            alt="Plenary"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Light overlay */}
                    <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                </div>
            </section>
        </main>
    );
}