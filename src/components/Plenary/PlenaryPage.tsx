"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type Objective = {
    id: number;
    title: string;
    description: string;
};

const objectivesData: Record<Lang, Objective[]> = {
    en: [
        {
            id: 1,
            title: "A Cabinet-level meeting",
            description:
                "The plenary operates at Cabinet level, ensuring alignment with national priorities and enabling coordinated action across ministries.",
        },
        {
            id: 2,
            title: "Chaired by the Prime Minister",
            description:
                "Led by the Prime Minister, the plenary benefits from strong executive oversight and the authority to drive timely decisions.",
        },
        {
            id: 3,
            title: "The highest authority within the G-PSF framework",
            description:
                "As the top decision-making body, the plenary serves as the final escalation point for unresolved issues, shaping policy and reform outcomes.",
        },
        {
            id: 4,
            title: "The G-PSF Plenary serves as the final decision-making platform",
            description: "",
        },
    ],
    kh: [
        {
            id: 1,
            title: "កិច្ចប្រជុំថ្នាក់គណៈរដ្ឋមន្ត្រី",
            description:
                "កិច្ចប្រជុំពេញអង្គដំណើរការនៅថ្នាក់គណៈរដ្ឋមន្ត្រី ដើម្បីធានាការសម្របសម្រួលជាមួយអាទិភាពជាតិ និងអនុញ្ញាតឱ្យមានសកម្មភាពសម្របសម្រួលរវាងក្រសួងនានា។",
        },
        {
            id: 2,
            title: "ដឹកនាំដោយនាយករដ្ឋមន្ត្រី",
            description:
                "ក្រោមការដឹកនាំរបស់នាយករដ្ឋមន្ត្រី កិច្ចប្រជុំពេញអង្គទទួលបានការត្រួតពិនិត្យថ្នាក់ដឹកនាំខ្ពស់ និងសិទ្ធិអំណាចក្នុងការជំរុញការសម្រេចចិត្តឱ្យបានទាន់ពេលវេលា។",
        },
        {
            id: 3,
            title: "អាជ្ញាធរខ្ពស់បំផុតក្នុងក្របខណ្ឌ G-PSF",
            description:
                "ក្នុងនាមជាស្ថាប័នសម្រេចចិត្តកំពូល កិច្ចប្រជុំពេញអង្គជាចំណុចចុងក្រោយសម្រាប់លើកបញ្ហាដែលមិនទាន់ដោះស្រាយ និងកំណត់ទិសដៅគោលនយោបាយ និងលទ្ធផលកំណែទម្រង់។",
        },
        {
            id: 4,
            title: "កិច្ចប្រជុំពេញអង្គ G-PSF ជាវេទិកាចុងក្រោយសម្រាប់ការសម្រេចចិត្ត",
            description: "",
        },
    ],
};

const HexNode = () => (
    <div className="relative w-12 h-12 flex items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>
        <span className="absolute w-3.5 h-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

const PlenaryPage: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language === "kh" ? "kh" : "en") as Lang;

    const t = {
        en: {
            badge: "Plenary",
            title: "G-PSF\nPlenary",
            desc: `The Government-Private Sector Forum (G-PSF) Plenary is Cambodia’s
                    highest-level platform for public-private dialogue.

                    The institution brings together senior government leaders and private sector
                    representatives to resolve critical economic and business issues, driving reforms
                    that improve the national investment climate for Cambodia.`,
            objectives: "The plenary is:",
        },
        kh: {
            badge: "កិច្ចប្រជុំពេញអង្គ",
            title: "កិច្ចប្រជុំពេញអង្គ\nG-PSF",
            desc: `កិច្ចប្រជុំពេញអង្គនៃវេទិការាជរដ្ឋាភិបាល-ផ្នែកឯកជន (G-PSF) គឺជាវេទិកាថ្នាក់ខ្ពស់បំផុត
                    សម្រាប់កិច្ចសន្ទនារវាងរដ្ឋ និងឯកជន។

                    ស្ថាប័ននេះប្រមូលផ្តុំថ្នាក់ដឹកនាំជាន់ខ្ពស់របស់រាជរដ្ឋាភិបាល និងតំណាងវិស័យឯកជន
                    ដើម្បីដោះស្រាយបញ្ហាសេដ្ឋកិច្ច និងធុរកិច្ចសំខាន់ៗ និងជំរុញកំណែទម្រង់
                    ដែលធ្វើឱ្យប្រសើរឡើងនូវបរិយាកាសវិនិយោគសម្រាប់កម្ពុជា។`,
            objectives: "កិច្ចប្រជុំពេញអង្គគឺ៖",
        },
    }[lang];

    const data = objectivesData[lang];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    <div className="lg:sticky lg:top-10">
                        <h1
                            className={`whitespace-pre-line text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.title}
                        </h1>

                        <div className="mt-5 h-1.5 bg-orange-500 w-56 sm:w-72 md:w-96 lg:w-[360px] translate-x-0 sm:translate-x-8 md:translate-x-32" />

                        <p
                            className={`whitespace-pre-line mt-8 max-w-md text-lg sm:text-xl leading-relaxed font-bold text-[#1e3a8a] translate-x-0 sm:translate-x-8 md:translate-x-32 ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.desc}
                        </p>
                    </div>

                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 ${
                                lang === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {t.objectives}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[23px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {data.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3
                                                className={`text-xl font-extrabold text-gray-900 ${
                                                    lang === "kh" ? "khmer-font" : ""
                                                }`}
                                            >
                                                {obj.title}
                                            </h3>

                                            <p
                                                className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${
                                                    lang === "kh" ? "khmer-font" : ""
                                                }`}
                                            >
                                                {obj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlenaryPage;