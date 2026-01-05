"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export interface BannerAboutProps {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageAlt?: string;
}

const NewUpdate = ({
    title,
    subtitle,
    imageUrl = "/image/BannerNews_Updates.bmp",
    imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
    const { language } = useLanguage();

    const defaultTitle =
        language === "kh"
            ? "តាមដានការសន្ទនា ការសម្រេចចិត្ត និងកំណែទម្រង់"
            : "Tracking dialogue, decisions, and reforms";

    const defaultSubtitle =
        language === "kh"
            ? "ទទួលបានព័ត៌មានអំពីការអភិវឌ្ឍន៍សំខាន់ៗពី G-PSF រួមទាំងលទ្ធផលពេញអង្គ វឌ្ឍនភាពនៃក្រុមការងារ ការសង្ខេបគោលនយោបាយ និងកំណែទម្រង់ស្ថាប័ន។"
            : "Stay informed on key developments from the G-PSF, including plenary outcomes, Working Group progress, policy briefs, and institutional reforms.";

    return (
        <section className="bg-white py-5 md:py-13">
            {/* Title + subtitle */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1
                        className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${language === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {title ?? defaultTitle}
                    </h1>

                    <p
                        className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${language === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {subtitle ?? defaultSubtitle}
                    </p>
                </div>
            </div>

            {/* FULL-WIDTH BANNER */}
            <div className="w-full">
                <div className="relative w-full mt-20 h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px] shadow-[0_-15px_30px_rgba(0,0,0,0.20),0_15px_30px_rgba(0,0,0,0.20)]">
                    <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default NewUpdate;
