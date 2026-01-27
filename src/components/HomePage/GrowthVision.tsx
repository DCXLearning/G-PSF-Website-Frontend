// src/Components/UI-Homepage/GrowthVision.tsx
"use client";

import React from "react";

import { useLanguage } from "@/app/context/LanguageContext";

interface GrowthVisionItem {
    titleEn: string;
    titleKh: string;
    icon: string;
    descriptionEn: string;
    descriptionKh: string;
    colorClass?: string;
    isPrimary?: boolean;
}

const growthVisionData: GrowthVisionItem[] = [
    {
        titleEn: "Market Data",
        titleKh: "ទិន្នន័យទីផ្សារ",
        icon: "/icon_home_page/Growth_Vision3.svg",
        descriptionEn:
            "Access practical insights and trends to support better business and policy decisions.",
        descriptionKh:
            "ចូលដំណើរការទិន្នន័យ និងនិន្នាការសំខាន់ៗ ដើម្បីគាំទ្រដល់ការសម្រេចចិត្តអាជីវកម្ម និងនយោបាយបានល្អប្រសើរជាងមុន។",
        colorClass: "bg-blue-500",
    },
    {
        titleEn: "Engagement",
        titleKh: "ការចូលរួមពិភាក្សា",
        icon: "/icon_home_page/Growth_Vision1.svg",
        descriptionEn:
            "Connect directly with Working Groups and share private sector perspectives.",
        descriptionKh:
            "តភ្ជាប់ជាមួយក្រុមការងារផ្សេងៗ និងបង្ហាញទស្សនៈរបស់វិស័យឯកជនដោយផ្ទាល់។",
        colorClass: "bg-purple-500",
    },
    {
        titleEn: "Policy Updates",
        titleKh: "ព័ត៌មានកំណែទម្រង់នយោបាយ",
        icon: "/icon_home_page/Growth_Vision2.svg",
        descriptionEn:
            "Stay informed on ongoing reforms, new regulations, and implementation progress.",
        descriptionKh:
            "ទាន់សម័យជានិច្ចអំពីកំណែទម្រង់ថ្មីៗ ច្បាប់ និងបទបញ្ជា និងវឌ្ឍនភាពអនុវត្ត។",
        isPrimary: true,
    },
    {
        titleEn: "Labor Law & Visa",
        titleKh: "ច្បាប់ការងារ និងវីសា",
        icon: "/icon_home_page/Growth_Vision5.svg",
        descriptionEn:
            "Understand key provisions on labor, employment, and entry requirements for workers.",
        descriptionKh:
            "យល់ដឹងច្បាស់អំពីច្បាប់ការងារ ការជួលបុគ្គលិក និងលក្ខខណ្ឌចូលប្រទេសសម្រាប់កម្មករ។",
        colorClass: "bg-yellow-500",
    },
    {
        titleEn: "G-PSF Training",
        titleKh: "ការបណ្តុះបណ្តាល G-PSF",
        icon: "/icon_home_page/Growth_Vision4.svg",
        descriptionEn:
            "Build capacity to participate effectively in public–private dialogue.",
        descriptionKh:
            "បង្កើនសមត្ថភាពដើម្បីចូលរួមក្នុងកិច្ចពិភាក្សារដ្ឋ–ឯកជនបានប្រសិទ្ធភាព។",
        colorClass: "bg-indigo-500",
    },
    {
        titleEn: "Tourism Toolkit",
        titleKh: "ឧបករណ៍គាំទ្របទពិសោធន៍ទេសចរណ៍",
        icon: "/icon_home_page/Growth_Vision6.svg",
        descriptionEn:
            "Use practical tools and templates to strengthen tourism-related services.",
        descriptionKh:
            "ប្រើឧបករណ៍ និងគំរូឯកសារអនុវត្ត ដើម្បីបង្កើនគុណភាពសេវាកម្មទាក់ទងនឹងទេសចរណ៍។",
        colorClass: "bg-red-500",
    },
];

interface CardProps {
    title: string;
    icon: string;
    description: string;
    isPrimary?: boolean;
    isKhmer?: boolean;
}

const Card: React.FC<CardProps> = ({
    title,
    icon,
    description,
    isPrimary,
    isKhmer,
}) => {
    if (isPrimary) {
        return (
            <div className="p-8 rounded-tl-[120px] rounded-br-[120px] bg-blue-950 shadow-2xl text-white min-h-[300px] flex flex-col justify-between transform hover:scale-[1.02] transition duration-300 ease-in-out">
                <div className="text-center mb-4">
                    {/* ICON */}
                    <img
                        src={icon}
                        alt={title}
                        className="w-14 h-14 mx-auto mb-4 filter brightness-0 invert"
                    />

                    <h3
                        className={`text-2xl font-bold mb-2 ${
                            isKhmer ? "khmer-font" : ""
                        }`}
                    >
                        {title}
                    </h3>

                    <p
                        className={`text-lg opacity-90 ${
                            isKhmer ? "khmer-font" : ""
                        }`}
                    >
                        {description}
                    </p>
                </div>

                <div className="text-center mt-4">
                    <button
                        className={`flex items-center justify-center mx-auto text-sm font-semibold opacity-80 hover:opacity-100 ${
                            isKhmer ? "khmer-font" : ""
                        }`}
                    >
                        {isKhmer ? "ស្វែងយល់បន្ថែម" : "LEARN MORE"}
                    </button>
                </div>
            </div>
        );
    }

    // NORMAL CARD
    return (
        <div className="p-8 rounded-tl-[120px] rounded-br-[120px] shadow-xl border border-gray-100 min-h-[280px] flex flex-col justify-between relative overflow-hidden transform hover:scale-[1.02] transition duration-300 ease-in-out">
            <div className="pt-4 text-center mb-4">
                {/* ICON */}
                <img
                    src={icon}
                    alt={title}
                    className="w-12 h-12 mx-auto mb-4"
                />

                <h3
                    className={`text-2xl font-bold mb-2 ${
                        isKhmer ? "khmer-font" : ""
                    }`}
                >
                    {title}
                </h3>

                <p
                    className={`text-lg text-gray-600 ${
                        isKhmer ? "khmer-font" : ""
                    }`}
                >
                    {description}
                </p>
            </div>

            <div className="text-center mt-4">
                <button
                    className={`flex items-center justify-center mx-auto text-sm font-semibold text-indigo-900 hover:text-indigo-700 ${
                        isKhmer ? "khmer-font" : ""
                    }`}
                >
                    {isKhmer ? "ស្វែងយល់បន្ថែម" : "LEARN MORE"}
                </button>
            </div>
        </div>
    );
};


const GrowthVision: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const headingEnLine1 = "Align With Cambodia’s";
    const headingEnLine2 = "Growth Vision";

    const headingKhLine1 = "សម្របអាជីវកម្មរបស់អ្នក";
    const headingKhLine2 = "ឲ្យស្របតាមចក្ខុវិស័យកំណើនកម្ពុជា";

    const primaryCard = growthVisionData.find((d) => d.isPrimary)!;
    const secondaryCards = growthVisionData.filter((d) => !d.isPrimary);

    return (
        <div className="container mx-auto px-4 max-w-7xl py-16 relative">
            <h2
                className={`text-5xl font-extrabold text-indigo-900 mb-12 ${isKhmer ? "khmer-font" : ""
                    }`}
            >
                {isKhmer ? (
                    <>
                        {headingKhLine1}
                        <br />
                        {headingKhLine2}
                    </>
                ) : (
                    <>
                        {headingEnLine1}
                        <br />
                        {headingEnLine2}
                    </>
                )}
            </h2>

            {/* GRID FOR MOBILE / TABLET / LAPTOP (<1400px) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:hidden">
                {[...secondaryCards, primaryCard].map((card, idx) => (
                    <Card
                        key={idx}
                        title={isKhmer ? card.titleKh : card.titleEn}
                        icon={card.icon}
                        description={
                            isKhmer ? card.descriptionKh : card.descriptionEn
                        }
                        isPrimary={card.isPrimary}
                        isKhmer={isKhmer}
                    />
                ))}
            </div>

            {/* ABSOLUTE LAYOUT FOR BIG DESKTOP (>=1400px) */}
            <div className="relative mb-34 hidden xl:block h-[700px]">
                {/* Left Top */}
                <div className="absolute top-32 left-0 w-91">
                    <Card
                        title={
                            isKhmer
                                ? secondaryCards.find((c) => c.titleEn === "Engagement")!
                                    .titleKh
                                : secondaryCards.find((c) => c.titleEn === "Engagement")!
                                    .titleEn
                        }
                        icon={secondaryCards.find((c) => c.titleEn === "Engagement")!.icon}
                        description={
                            isKhmer
                                ? secondaryCards.find((c) => c.titleEn === "Engagement")!
                                    .descriptionKh
                                : secondaryCards.find((c) => c.titleEn === "Engagement")!
                                    .descriptionEn
                        }
                        isKhmer={isKhmer}
                    />
                </div>

                {/* Center Primary */}
                <div className="absolute top-[22%] -translate-y-1/2 left-1/2 -translate-x-1/2 w-91 z-10">
                    <Card
                        title={isKhmer ? primaryCard.titleKh : primaryCard.titleEn}
                        icon={primaryCard.icon}
                        description={
                            isKhmer ? primaryCard.descriptionKh : primaryCard.descriptionEn
                        }
                        isPrimary
                        isKhmer={isKhmer}
                    />
                </div>

                {/* Right Top */}
                <div className="absolute top-0 -translate-y-2/5 right-0 w-91">
                    <Card
                        title={
                            isKhmer
                                ? secondaryCards.find((c) => c.titleEn === "Market Data")!
                                    .titleKh
                                : secondaryCards.find((c) => c.titleEn === "Market Data")!
                                    .titleEn
                        }
                        icon={secondaryCards.find((c) => c.titleEn === "Market Data")!.icon}
                        description={
                            isKhmer
                                ? secondaryCards.find((c) => c.titleEn === "Market Data")!
                                    .descriptionKh
                                : secondaryCards.find((c) => c.titleEn === "Market Data")!
                                    .descriptionEn
                        }
                        isKhmer={isKhmer}
                    />
                </div>

                {/* Left Bottom */}
                <div className="absolute bottom-0 top-139 left-0 w-91">
                    <Card
                        title={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "G-PSF Training"
                                )!.titleKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "G-PSF Training"
                                )!.titleEn
                        }
                        icon={
                            secondaryCards.find(
                                (c) => c.titleEn === "G-PSF Training"
                            )!.icon
                        }
                        description={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "G-PSF Training"
                                )!.descriptionKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "G-PSF Training"
                                )!.descriptionEn
                        }
                        isKhmer={isKhmer}
                    />
                </div>

                {/* Center Bottom */}
                <div className="absolute bottom-0 top-106 left-1/2 -translate-x-1/2 w-91">
                    <Card
                        title={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "Labor Law & Visa"
                                )!.titleKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "Labor Law & Visa"
                                )!.titleEn
                        }
                        icon={
                            secondaryCards.find(
                                (c) => c.titleEn === "Labor Law & Visa"
                            )!.icon
                        }
                        description={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "Labor Law & Visa"
                                )!.descriptionKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "Labor Law & Visa"
                                )!.descriptionEn
                        }
                        isKhmer={isKhmer}
                    />
                </div>

                {/* Right Bottom */}
                <div className="absolute bottom-28 right-0 w-91">
                    <Card
                        title={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "Tourism Toolkit"
                                )!.titleKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "Tourism Toolkit"
                                )!.titleEn
                        }
                        icon={
                            secondaryCards.find(
                                (c) => c.titleEn === "Tourism Toolkit"
                            )!.icon
                        }
                        description={
                            isKhmer
                                ? secondaryCards.find(
                                    (c) => c.titleEn === "Tourism Toolkit"
                                )!.descriptionKh
                                : secondaryCards.find(
                                    (c) => c.titleEn === "Tourism Toolkit"
                                )!.descriptionEn
                        }
                        isKhmer={isKhmer}
                    />
                </div>
            </div>
        </div>
    );
};

export default GrowthVision;
