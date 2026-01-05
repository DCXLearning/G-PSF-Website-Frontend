// src/Components/StatsBar.tsx
"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export interface KeyStat {
    value: string;
    labelEn: string;
    labelKh: string;
    trend?: string; // Optional: Trend for percentage change
    color: string; // CSS class for the text color (e.g., text-green-500)
}

// Sample data for the stats
export const keyStats: KeyStat[] = [
    {
        value: "1,268",
        labelEn: "Total Projects",
        labelKh: "គម្រោងសរុប",
        trend: "2.3%",
        color: "text-green-500",
    },
    {
        value: "63",
        labelEn: "Sector Focus",
        labelKh: "វិស័យផ្តោតអាទិភាព",
        trend: "0.5%",
        color: "text-blue-500",
    },
    {
        value: "91.4%",
        labelEn: "Completion Rate",
        labelKh: "អត្រាបញ្ចប់",
        trend: "1.1%",
        color: "text-yellow-500",
    },
    {
        value: "48",
        labelEn: "Active Zones",
        labelKh: "តំបន់សកម្ម",
        trend: "3.5%",
        color: "text-red-500",
    },
];

// Type the props of the StatItem component
interface StatItemProps {
    value: string;
    label: string;
    isKhmer: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, isKhmer }) => (
    <div className="flex flex-col items-center justify-center p-3 border-5 border-dashed border-indigo-900 m-0">
        <div className="text-5xl lg:text-4xl font-extrabold text-indigo-900">
            {value}
        </div>
        <div
            className={`text-base lg:text-lg text-indigo-900 font-medium tracking-wider mt-2 opacity-90 text-center ${isKhmer ? "khmer-font" : ""
                }`}
        >
            {label}
        </div>
    </div>
);

const StatsBar: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const descriptionText = isKhmer
        ? "អត្ថបទគំរូ សម្រាប់ពិពណ៌នាស្ថಿತಿ សូមបញ្ចូលអត្ថបទពិតនៅទីនេះ។"
        : "There are many variations of passages of Lorem Ipsum available.";

    return (
        <section className="w-full bg-white py-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <p
                    className={`text-center text-gray-600 mb-12 text-lg ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {descriptionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {keyStats.map((stat: KeyStat, index: number) => (
                        <StatItem
                            key={index}
                            value={stat.value}
                            label={isKhmer ? stat.labelKh : stat.labelEn}
                            isKhmer={isKhmer}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;
