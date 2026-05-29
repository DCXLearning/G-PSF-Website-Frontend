"use client";

import { useLanguage } from "@/app/context/LanguageContext";

const HERO_STATIC_DATA = {
    backgroundImage: "/image/Banner.bmp",

    subtitle: {
        en: "The 19th Government-Private Sector Forum",
        km: "វេទិការាជរដ្ឋាភិបាល-ផ្នែកឯកជន លើកទី១៩",
    },

    description: {
        en: "Peace Palace, 13 November 2023",
        km: "វិមានសន្តិភាព ថ្ងៃទី១៣ ខែវិច្ឆិកា ឆ្នាំ២០២៣",
    },
};

export default function HeroBanner() {
    const { language } = useLanguage();

    const langKey: "en" | "km" = language === "kh" ? "km" : "en";
    const isKh = langKey === "km";

    const titleFontClass = isKh
        ? "khmer-font text-[22px] leading-[42px] md:text-[34px] md:leading-[58px] lg:text-[42px] lg:leading-[68px]"
        : "text-[28px] leading-[40px] md:text-[44px] md:leading-[56px] lg:text-[54px] lg:leading-[68px]";

    const descriptionFontClass = isKh
        ? "khmer-font text-[14px] leading-[30px] md:text-[18px] md:leading-[36px]"
        : "text-[15px] leading-[28px] md:text-[20px] md:leading-[34px]";

    return (
        <section className="relative min-h-[620px] w-full overflow-hidden bg-slate-900 md:min-h-[720px] lg:min-h-[790px]">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${HERO_STATIC_DATA.backgroundImage})`,
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Bottom Soft Shadow */}
            <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/45 via-black/15 to-transparent" />

            {/* Center Content */}
            <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 md:min-h-[720px] lg:min-h-[790px] lg:px-8">
                <h1
                    className={`max-w-5xl font-extrabold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] ${titleFontClass}`}
                >
                    {HERO_STATIC_DATA.subtitle[langKey]}
                </h1>

                <p
                    className={`mt-4 max-w-3xl font-medium text-white/95 drop-shadow-[0_3px_7px_rgba(0,0,0,0.5)] ${descriptionFontClass}`}
                >
                    {HERO_STATIC_DATA.description[langKey]}
                </p>
            </div>
        </section>
    );
}