// components/Benefits.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";

type I18nText = { en?: string; km?: string };

type BenefitItem = {
    id: number;
    slug: string;
    icon: string;
    title: I18nText;
    description: I18nText;
};

type BenefitsResponse = {
    headingLine1: I18nText;
    headingLine2: I18nText;
    description: I18nText;
    items: BenefitItem[];
};

interface BenefitCardProps {
    icon: string;
    title: string;
    description: string;
    isKhmer: boolean;
    href: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    isKhmer,
    href,
}) => (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-10">
        <div className="p-4 md:p-3 mt-6 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={icon || "/icon_home_page/Benefits1.svg"}
                alt={title}
                className="w-16 h-16 object-contain"
            />
        </div>

        <div className="flex-1">
            <h3
                className={`text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 mb-2 ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {title}
            </h3>

            <p
                className={`text-gray-600 mb-4 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {description}
            </p>

            <Link
                href={href}
                className={`inline-flex px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full hover:bg-[#03057f] transition ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
            </Link>
        </div>
    </div>
);

const Benefits: React.FC = () => {
    const { language } = useLanguage();
    const langKey: "en" | "km" = language === "kh" ? "km" : "en";
    const isKhmer = langKey === "km";

    const [data, setData] = useState<BenefitsResponse | null>(null);

    useEffect(() => {
        fetch("/api/benefits")
            .then((res) => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) return null;

    // ✅ heading from API
    const heading1 = data.headingLine1?.[langKey] ?? data.headingLine1?.en ?? "";
    const heading2 = data.headingLine2?.[langKey] ?? data.headingLine2?.en ?? "";

    const descText = data.description?.[langKey] ?? data.description?.en ?? "";

    return (
        <section className="bg-white font-sans px-4 sm:px-8 md:px-16 lg:px-32 py-12 md:py-16">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                {/* LEFT */}
                <div className="mb-32 sm:mb-10 md:mb-0">
                    <h2
                        className={`text-3xl w-70 sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-tight ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {heading1}
                        
                    </h2>

                    <div className="mt-6 sm:mt-8 relative">
                        <div className="absolute top-0 left-0 sm:left-4 md:left-28 w-20 sm:w-24 md:w-72 h-1 bg-orange-500 rounded-full mb-4"></div>

                        <p
                            className={`absolute top-0 left-0 sm:left-4 md:left-28 text-gray-700 text-sm sm:text-base md:text-xl leading-relaxed mt-6 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {descText}
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {data.items.map((benefit) => {
                        const title = benefit.title?.[langKey] ?? benefit.title?.en ?? "";
                        const description =
                            benefit.description?.[langKey] ?? benefit.description?.en ?? "";

                        return (
                            <BenefitCard
                                key={benefit.id}
                                icon={benefit.icon}
                                title={title}
                                description={description}
                                isKhmer={isKhmer}
                                href={`/posts/${benefit.slug}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
