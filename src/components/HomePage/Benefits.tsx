// components/Benefits.tsx
"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

// Define the type for each benefit item
interface Benefit {
    icon: string;
    titleEn: string;
    titleKh: string;
    descriptionEn: string;
    descriptionKh: string;
}

// Data for the benefits section (EN + KH)
const benefitsData: Benefit[] = [
    {
        icon: "/icon_home_page/Benefits1.svg",
        titleEn: "Direct Access to Policymakers",
        titleKh: "ចូលដំណើរការទៅកាន់អ្នកកំណត់នយោបាយដោយផ្ទាល់",
        descriptionEn:
            "Shape business-enabling laws and regulations through participation in sector-specific and cross-cutting Working Groups.",
        descriptionKh:
            "ចូលរួមបង្កើតច្បាប់ និងបទបញ្ជាដែលគាំទ្រដល់អាជីវកម្ម តាមរយៈការចូលរួមក្នុងក្រុមការងារជាក់លាក់តាមវិស័យ និងក្រុមការងារប្រសព្វវិស័យ។",
    },
    {
        icon: "/icon_home_page/Benefits2.svg",
        titleEn: "Gateway for Foreign Investors",
        titleKh: "ទ្វារសម្រាប់វិនិយោគិនបរទេស",
        descriptionEn:
            "Engage in dialogue chaired by the Prime Minister, giving businesses access to decision-makers.",
        descriptionKh:
            "ចូលរួមពិភាក្សាដែលដឹកនាំដោយនាយករដ្ឋមន្ត្រី បើកឱកាសឲ្យអាជីវកម្មចូលដំណើរការទៅកាន់អ្នកសម្រេចចិត្ត។",
    },
    {
        icon: "/icon_home_page/Benefits3.svg",
        titleEn: "Access to Reliable Information",
        titleKh: "ការចូលដំណើរការទិន្នន័យគួរឱ្យទុកចិត្ត",
        descriptionEn:
            "Align business priorities with the Royal Government of Cambodia’s Pentagonal Strategy (2023–2028) and industrial development.",
        descriptionKh:
            "រៀបចំអាទិភាពអាជីវកម្មឲ្យស្របតាមយុទ្ធសាស្ត្រប្រាំមុខ (២០២៣–២០២៨) របស់រាជរដ្ឋាភិបាលកម្ពុជា និងការអភិវឌ្ឍឧស្សាហកម្ម។",
    },
];

// BenefitCard component to display individual benefit items
interface BenefitCardProps {
    icon: string;
    title: string;
    description: string;
    isKhmer: boolean;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    isKhmer,
}) => (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-10">
        <div className="p-4 md:p-3 mt-6 text-blue-800 flex-shrink-0">
           <img
                src={icon}
                alt={title}
                className="w-16 h-16 object-contain"
            />
        </div>

        <div>
            <h3
                className={`text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 mb-2 ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {title}
            </h3>
            <p
                className={`text-gray-600 mb-4 leading-relaxed text-sm sm:text-base md:text-lg ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {description}
            </p>
            <button
                className={`px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#1B1D4E] rounded-full hover:bg-[#03057f] transition ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}
            </button>
        </div>
    </div>
);

// Benefits component that maps over the data
const Benefits: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const heading = isKhmer ? "អត្ថប្រយោជន៍ G-PSF" : "G-PSF\nBenefits";

    const description = isKhmer
        ? "G-PSF ត្រូវបានបង្កើតឡើងលើគោលការណ៍មូលដ្ឋានដែលធានាការស្របតាមយុទ្ធសាស្ត្រ ភាពចីរភាពរយៈពេលវែង និងការស្របគ្នានឹងចក្ខុវិស័យអភិវឌ្ឍន៍កម្ពុជា។ តម្លៃទាំងនេះបង្កើតនូវទុកចិត្ត ដែលធ្វើឲ្យការពិភាក្សារវាងរដ្ឋ និងវិស័យឯកជនមានប្រសិទ្ធភាព។"
        : "The G-PSF is built on core guiding principles that ensure strategic consistency, long-term sustainability, and alignment with Cambodia’s development vision. These values build trust that makes public–private dialogue effective.";

    // Split EN heading into 2 lines, but keep KH as single block
    const [headingLine1, headingLine2] = isKhmer
        ? [heading, ""]
        : ["G-PSF", "Benefits"];

    return (
        <section className="bg-white font-sans px-4 sm:px-8 md:px-16 lg:px-32 py-12 md:py-16">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                {/* LEFT SIDE */}
                <div className="mb-32 sm:mb-10 md:mb-0">
                    <h2
                        className={`text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-tight ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {isKhmer ? (
                            headingLine1
                        ) : (
                            <>
                                {headingLine1}
                                <br />
                                {headingLine2}
                            </>
                        )}
                    </h2>

                    <div className="mt-6 sm:mt-8 relative">
                        {/* Orange underline */}
                        <div className="absolute top-0 left-0 sm:left-4 md:left-28 w-20 sm:w-24 md:w-72 h-1 bg-orange-500 rounded-full mb-4"></div>

                        <p
                            className={`absolute top-0 left-0 sm:left-4 md:left-28 text-gray-700 text-sm sm:text-base md:text-xl leading-relaxed mt-6 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {description}
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {benefitsData.map((benefit, index) => (
                        <BenefitCard
                            key={index}
                            icon={benefit.icon}
                            title={isKhmer ? benefit.titleKh : benefit.titleEn}
                            description={isKhmer ? benefit.descriptionKh : benefit.descriptionEn}
                            isKhmer={isKhmer}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
