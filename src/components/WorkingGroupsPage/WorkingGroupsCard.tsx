"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

interface WorkGroup {
    id: number;
    title: string;
    icon: string;
    href: string;
}
// size={32} className="md:w-10 md:h-10"
const makeWorkGroups = (): Record<Lang, WorkGroup[]> => ({
    en: [
        { id: 1, title: "Agriculture & Agro-Industry", icon: "/icon/Agriculture_&_Agro_industry.png", href: "/working-groups/list" },
        { id: 2, title: "Tourism", icon: "/icon/Tourisum.png", href: "/working_groups/list" },
        { id: 3, title: "Manufacturing & SMEs", icon: "/icon/Manfacturing_&_SMEs.png", href: "/working-groups/list" },
        { id: 4, title: "Law, Tax & Governance", icon: "/icon/Law_Tax_&_Governance.png", href: "/working-groups/list" },
        { id: 5, title: "Banking & Financial Services", icon: "/icon/Banking_&_Financial_Service.png", href: "/working-groups/list" },
        { id: 6, title: "Transportation & Infrastructure", icon: "/icon/Transportation_&_Infrastructure.png", href: "/working-groups/list" },
        { id: 7, title: "Export Processing & Trade Facilitation", icon: "/icon/Export_Processing_&_Trade_Facilitation.png", href: "/working-groups/list" },
        { id: 8, title: "Industrial Relations", icon: "/icon/Industrial_Relations.png", href: "/working-groups/list" },
        { id: 9, title: "Paddy-Rice", icon: "/icon/Paddy_Rice.png", href: "/working-groups/list" },
        { id: 10, title: "Energy & Mineral Resources", icon: "/icon/Energy_&_Mineral_Resources.png", href: "/working-groups/list" },
        { id: 11, title: "Education", icon: "/icon/Education.png", href: "/working-groups/list" },
        { id: 12, title: "Health", icon: "/icon/Health.png", href: "/working-groups/health" },
        { id: 13, title: "Construction & Real Estate", icon: "/icon/Constuction_&_Real_Estate.png", href: "/working-groups/list" },
        { id: 14, title: "Non-Banking Financial Services", icon: "/icon/Non_Banking_Financial_Services.png", href: "/working-groups/list" },
        { id: 15, title: "Digital Economy, Society & Telecommunications", icon: "/icon/Digital_Economy_Society_&_Telecommunications.png", href: "/working-groups/list" },
        { id: 16, title: "Land Administration, Security & Public Order", icon: "/icon/Land_Administration_Security_&_Public_Order.png", href: "/working-groups/list" },
    ],
    kh: [
        { id: 1, title: "Agriculture & Agro-Industry", icon: "/icon/Agriculture_&_Agro_industry.png", href: "/working-groups/list" },
        { id: 2, title: "Tourism", icon: "/icon/Tourisum.png", href: "/working_groups/list" },
        { id: 3, title: "Manufacturing & SMEs", icon: "/icon/Manfacturing_&_SMEs.png", href: "/working-groups/list" },
        { id: 4, title: "Law, Tax & Governance", icon: "/icon/Law_Tax_&_Governance.png", href: "/working-groups/list" },
        { id: 5, title: "Banking & Financial Services", icon: "/icon/Banking_&_Financial_Service.png", href: "/working-groups/list" },
        { id: 6, title: "Transportation & Infrastructure", icon: "/icon/Transportation_&_Infrastructure.png", href: "/working-groups/list" },
        { id: 7, title: "Export Processing & Trade Facilitation", icon: "/icon/Export_Processing_&_Trade_Facilitation.png", href: "/working-groups/list" },
        { id: 8, title: "Industrial Relations", icon: "/icon/Industrial_Relations.png", href: "/working-groups/list" },
        { id: 9, title: "Paddy-Rice", icon: "/icon/Paddy_Rice.png", href: "/working-groups/list" },
        { id: 10, title: "Energy & Mineral Resources", icon: "/icon/Energy_&_Mineral_Resources.png", href: "/working-groups/list" },
        { id: 11, title: "Education", icon: "/icon/Education.png", href: "/working-groups/list" },
        { id: 12, title: "Health", icon: "/icon/Health.png", href: "/working-groups/health" },
        { id: 13, title: "Construction & Real Estate", icon: "/icon/Constuction_&_Real_Estate.png", href: "/working-groups/list" },
        { id: 14, title: "Non-Banking Financial Services", icon: "/icon/Non_Banking_Financial_Services.png", href: "/working-groups/list" },
        { id: 15, title: "Digital Economy, Society & Telecommunications", icon: "/icon/Digital_Economy_Society_&_Telecommunications.png", href: "/working-groups/list" },
        { id: 16, title: "Land Administration, Security & Public Order", icon: "/icon/Land_Administration_Security_&_Public_Order.png", href: "/working-groups/list" },
    ],
});

export default function WorkGroupsGrid() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const workGroups = makeWorkGroups()[lang];

    const headerTitle = lang === "kh" ? "ក្រុមការងារ ១៦" : "16 Work Groups";
    const headerSub = lang === "kh" ? "ធ្វើការសម្រាប់អ្នក" : "Working For You";

    const flexLabel = lang === "kh" ? "ក្រុមការងារបត់បែន (WGs)" : "Flexible WGs";
    const flexTitle =
        lang === "kh"
            ? "អាចបង្កើតក្រុមការងារថ្មី បញ្ចូលជាក្រុមតែមួយ ឬរំលាយក្រុមការងារ ដោយផ្អែកលើការផ្លាស់ប្តូរស្ថានភាពសេដ្ឋកិច្ច និងតម្រូវការរបស់វិស័យនានា។"
            : "New Working Groups may be established, merged, or dissolved in response to changing economic conditions and sector needs.";

    return (
        <div className="bg-white">
            <div className="bg-gradient-to-br from-[#2B3175] to-[#3B55A4] py-10 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl px-4 mx-auto">
                    {/* Header */}
                    <header className="text-center mb-10 md:mb-16">
                        <h1
                            className={`text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {headerTitle}
                            <br />
                            <span className="opacity-90">{headerSub}</span>
                        </h1>
                    </header>

                    {/* Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {workGroups.map((group, index) => (
                            <Link
                                key={group.id}
                                href={group.href}
                                className={`group flex flex-col items-center justify-center aspect-square p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl transition-all duration-300 hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
                                    ${(index % 2 !== 0) ? "bg-[#d1d5db]" : "bg-white"}
                                    lg:${((Math.floor(index / 4) + (index % 4)) % 2 !== 0) ? "bg-[#d1d5db]" : "bg-white"}`}
                                aria-label={group.title}
                            >
                                <div className="bg-[#1E2257] text-white p-3 md:p-4 rounded-full mb-3 md:mb-5 shadow-inner transition-transform duration-300 group-hover:scale-110">
                                    <img src={group.icon} alt="" className="md:w-20 md:h-20"/>
                                </div>

                                <p
                                    className={`text-[#1a1a1a] text-center text-[10px] sm:text-sm md:text-base font-bold leading-tight max-w-[90%] ${isKh ? "khmer-font" : ""
                                        }`}
                                >
                                    {group.title}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Responsive title section */}
            <div className="max-w-7xl mx-auto px-4 md:px-4 py-8">
                <p
                    className={`text-xs md:text-sm font-semibold text-gray-500 mb-3 uppercase tracking-[0.2em] ${isKh ? "khmer-font normal-case" : ""
                        }`}
                >
                    {flexLabel}
                </p>

                <h2
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.2] max-w-[850px] ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {flexTitle}
                </h2>

                <div className="mt-8 h-1.5 w-24" />
            </div>
        </div>
    );
}
