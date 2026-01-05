"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { Building2, UserCircle2, Landmark, Users2 } from "lucide-react";

type Lang = "en" | "kh";

type Stakeholder = {
    title: string;
    description: string;
    icon: React.ReactNode;
};

const stakeholdersByLang: Record<Lang, Stakeholder[]> = {
    en: [
        {
            title: "Line ministries & government agencies relevant to the sector",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
            icon: <Building2 className="w-10 h-10 text-white" />,
        },
        {
            title: "Private sector co-chairs & Working Group members",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
            icon: <UserCircle2 className="w-10 h-10 text-white" />,
        },
        {
            title: "Business Membership Organisations & chambers of commerce",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
            icon: <Landmark className="w-10 h-10 text-white" />,
        },
        {
            title: "Technical experts, sub-committees, or task forces",
            description:
                "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore",
            icon: <Users2 className="w-10 h-10 text-white" />,
        },
    ],
    kh: [
        {
            title: "ក្រសួង/ស្ថាប័នរដ្ឋដែលពាក់ព័ន្ធនឹងវិស័យ",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក។",
            icon: <Building2 className="w-10 h-10 text-white" />,
        },
        {
            title: "សហអធិបតីវិស័យឯកជន និងសមាជិកក្រុមការងារ",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក។",
            icon: <UserCircle2 className="w-10 h-10 text-white" />,
        },
        {
            title: "អង្គការសមាជិកធុរកិច្ច និងសភាពាណិជ្ជកម្ម",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក។",
            icon: <Landmark className="w-10 h-10 text-white" />,
        },
        {
            title: "អ្នកជំនាញបច្ចេកទេស អនុគណៈកម្មការ ឬក្រុមការងារពិសេស",
            description:
                "សេចក្ដីពណ៌នាគំរូ (Khmer) — សូមប្ដូរទៅអត្ថបទពិតរបស់អ្នក។",
            icon: <Users2 className="w-10 h-10 text-white" />,
        },
    ],
};

const Participates: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t = {
        en: {
            title: "Who Participates",
            subtitle: "Working Group meetings bring together a broad range of stakeholders.",
        },
        kh: {
            title: "អ្នកចូលរួម",
            subtitle: "អង្គប្រជុំក្រុមការងារ រួមបញ្ចូលភាគីពាក់ព័ន្ធជាច្រើនប្រភេទ។",
        },
    }[lang];

    const stakeholders = stakeholdersByLang[lang];

    return (
        <section className="relative bg-white pt-16 pb-0 cursor-pointer">
            <div className="container mx-auto px-4 text-center mb-12">
                <h2
                    className={`text-5xl md:text-6xl font-bold text-[#1e234a] mb-4 ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {t.title}
                </h2>

                <p
                    className={`text-xl text-gray-500 font-medium ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {t.subtitle}
                </p>
            </div>

            {/* Background Container for the dark section */}
            <div className="relative">
                <div className="absolute bottom-0 w-full h-[150px] bg-[#1e234a]" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stakeholders.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl hover:translate-y-[-1.5%] transition-all overflow-hidden p-8 shadow-2xl flex flex-col items-start text-left h-full border border-gray-100"
                            >
                                {/* Icon Container */}
                                <div className="w-full h-25 flex justify-center -mt-12 mb-10">
                                    <div className="bg-[#1e234a] p-8 rounded-b-[100px] rounded-t-sm shadow-md">
                                        {item.icon}
                                    </div>
                                </div>

                                <h3
                                    className={`text-2xl font-bold text-[#3a475a] mb-4 leading-tight min-h-[4rem] ${isKh ? "khmer-font" : ""
                                        }`}
                                >
                                    {item.title}
                                </h3>

                                <p className={`text-gray-600 text-lg leading-relaxed ${isKh ? "khmer-font" : ""}`}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Continuing the dark section */}
            <div className="bg-[#1e234a] h-24 w-full" />
        </section>
    );
};

export default Participates;
