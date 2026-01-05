"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type Objective = {
    id: number;
    title: string;
    description: string;
};

const objectivesByLang: Record<Lang, Objective[]> = {
    en: [
        {
            id: 1,
            title: "Secretariat & Government Coordination",
            description:
                "Serves as the government Secretariat of the G-PSF, coordinating Working Group activities and supporting the organisation of G-PSF plenaries and consultations.",
        },
        {
            id: 2,
            title: "Monitoring & Accountability",
            description:
                "Tracks policy issues, reform commitments, and implementation progress arising from Working Group discussions and G-PSF Plenaries to strengthen transparency and accountability.",
        },
        {
            id: 3,
            title: "Data Management & Institutional Support",
            description:
                "Supports institutional systems, reporting, and data management to ensure public–private dialogue delivers timely, results-oriented outcomes that improve Cambodia’s investment climate.",
        },
    ],
    kh: [
        {
            id: 1,
            title: "លេខាធិការដ្ឋាន និងសម្របសម្រួលរដ្ឋាភិបាល",
            description:
                "បំពេញតួនាទីជាលេខាធិការដ្ឋានរដ្ឋាភិបាលនៃ G-PSF ដោយសម្របសម្រួលសកម្មភាពក្រុមការងារ និងគាំទ្រការរៀបចំអង្គប្រជុំ Plenary និងការពិគ្រោះយោបល់របស់ G-PSF។",
        },
        {
            id: 2,
            title: "តាមដាន និងភាពទទួលខុសត្រូវ",
            description:
                "តាមដានបញ្ហាគោលនយោបាយ ការប្តេជ្ញាកែទម្រង់ និងវឌ្ឍនភាពអនុវត្តដែលកើតចេញពីការពិភាក្សាក្រុមការងារ និងអង្គប្រជុំ Plenary របស់ G-PSF ដើម្បីពង្រឹងភាពថ្លៃថ្នូរ និងភាពទទួលខុសត្រូវ។",
        },
        {
            id: 3,
            title: "ការគ្រប់គ្រងទិន្នន័យ និងការគាំទ្រស្ថាប័ន",
            description:
                "គាំទ្រប្រព័ន្ធស្ថាប័ន ការរាយការណ៍ និងការគ្រប់គ្រងទិន្នន័យ ដើម្បីធានាថាវេទិកាសន្ទនារដ្ឋ-ឯកជន ផ្តល់លទ្ធផលទាន់ពេល និងផ្អែកលើលទ្ធផល ដើម្បីកែលម្អបរិយាកាសវិនិយោគនៅកម្ពុជា។",
        },
    ],
};

// Bigger, clean hex node
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

const History: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t = {
        en: {
            badge: "About Us",
            hero: `For over 25 years, the G-PSF has
delivered trust-based reform
outcomes and strengthened
institutional capacity`,
            p1: `Established in 1999, the Government–Private Sector Forum (G-PSF) was created to rebuild trust and cooperation between the Royal Government of Cambodia and the private sector.`,
            p2: `Chaired by the Prime Minister, the G-PSF provides a structured platform for dialogue, enabling businesses and government institutions to jointly identify challenges and deliver practical policy and regulatory reforms.`,
            p3: `From its initial seven Working Groups in 1999, the G-PSF has expanded to 16 sectoral and cross-cutting Working Groups, reflecting Cambodia’s economic development and the growing complexity of reform priorities.`,
            p4: `Over more than two decades, the G-PSF has evolved into Cambodia’s primary public–private dialogue mechanism, expanding from seven to sixteen Working Groups and supporting sustained improvements to the business and investment environment.`,
            rightTitle: `Role of the
Council for the
Development of
Cambodia (CDC)`,
        },
        kh: {
            badge: "អំពីពួកយើង",
            hero: `អស់រយៈពេលជាង ២៥ ឆ្នាំ G-PSF បាន
ជំរុញលទ្ធផលកែទម្រង់ផ្អែកលើទំនុកចិត្ត
និងពង្រឹងសមត្ថភាពស្ថាប័ន`,
            p1: `បង្កើតឡើងនៅឆ្នាំ ១៩៩៩ វេទិការដ្ឋាភិបាល–វិស័យឯកជន (G-PSF) ត្រូវបានបង្កើតឡើង ដើម្បីស្ដារឡើងវិញនូវទំនុកចិត្ត និងកិច្ចសហប្រតិបត្តិការរវាងរាជរដ្ឋាភិបាលកម្ពុជា និងវិស័យឯកជន។`,
            p2: `ក្រោមអធិបតីភាពសម្តេចនាយករដ្ឋមន្ត្រី G-PSF ផ្តល់វេទិកាសន្ទនារចនាសម្ព័ន្ធ ដែលអនុញ្ញាតឱ្យវិស័យឯកជន និងស្ថាប័នរដ្ឋ រួមគ្នាកំណត់បញ្ហាប្រឈម និងដាក់ចេញកែទម្រង់គោលនយោបាយ និងបទប្បញ្ញត្តិដែលអាចអនុវត្តបាន។`,
            p3: `ចាប់ពីក្រុមការងារ ៧ ក្នុងឆ្នាំ ១៩៩៩ G-PSF បានពង្រីកដល់ ១៦ ក្រុមការងារតាមវិស័យ និងកាត់បន្ថយឧបសគ្គឆ្លងកាត់វិស័យ ដែលឆ្លុះបញ្ចាំងពីការអភិវឌ្ឍសេដ្ឋកិច្ចកម្ពុជា និងភាពស្មុគស្មាញកាន់តែខ្លាំងនៃអាទិភាពកែទម្រង់។`,
            p4: `ក្នុងរយៈពេលជាងពីរទសវត្សរ៍ G-PSF បានអភិវឌ្ឍទៅជាយន្តការសន្ទនារដ្ឋ–ឯកជនសំខាន់បំផុតរបស់កម្ពុជា ដោយពង្រីកពី ៧ ទៅ ១៦ ក្រុមការងារ និងគាំទ្រការកែលម្អបរិយាកាសធុរកិច្ច និងវិនិយោគឱ្យមានភាពបន្ត។`,
            rightTitle: `តួនាទីរបស់
ក្រុមប្រឹក្សាអភិវឌ្ឍន៍
កម្ពុជា (CDC)`,
        },
    }[lang];

    const objectivesData = objectivesByLang[lang];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <p
                    className={`text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider ${isKh ? "khmer-font normal-case" : ""
                        }`}
                >
                    {t.badge}
                </p>

                <h1
                    className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight whitespace-pre-line ${isKh ? "khmer-font" : ""
                        }`}
                >
                    {t.hero}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-1">
                        <div className="mt-20 h-1.5 bg-orange-500 w-67 sm:w-142 md:w-142 lg:w-[528px]" />

                        <p className={`mt-8 max-w-xl text-lg sm:text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""}`}>
                            {t.p1}
                        </p>

                        <p className={`mt-8 max-w-xl text-lg sm:text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""}`}>
                            {t.p2}
                        </p>

                        <p className={`mt-8 max-w-xl text-lg sm:text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""}`}>
                            {t.p3}
                        </p>

                        <p className={`mt-8 max-w-xl text-lg sm:text-lg leading-relaxed font-bold text-[#1e3a8a] ${isKh ? "khmer-font" : ""}`}>
                            {t.p4}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:pt-24 xl:pt-222">
                        <h2
                            className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 whitespace-pre-line ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            {t.rightTitle}
                        </h2>

                        <div className="relative">
                            <div className="absolute left-[22px] top-0 bottom-0 w-[4px] bg-orange-500" />

                            <div className="space-y-12">
                                {objectivesData.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3 className={`text-xl font-extrabold text-gray-900 ${isKh ? "khmer-font" : ""}`}>
                                                {obj.title}
                                            </h3>
                                            <p className={`mt-2 text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm ${isKh ? "khmer-font" : ""}`}>
                                                {obj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* end right */}
                </div>
            </div>
        </section>
    );
};

export default History;
