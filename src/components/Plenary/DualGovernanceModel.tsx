"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    LuClipboardList,
    LuFileSearch,
    LuTarget,
    LuFileBadge,
} from "react-icons/lu";

export default function DualGovernanceModel() {
    const { language } = useLanguage();

    const t = {
        en: {
            title: "A Dual Public–Private Governance Model",
            desc:
                "The effectiveness of the G-PSF Plenary stems from a combination of strong political authority, structured escalation processes, continuous stakeholder engagement, and clear implementation and monitoring mechanisms.",
            intro:
                "The G-PSF Plenary uses a co-governance approach, bringing together:",
            gov: "The Royal Government of Cambodia",
            private: "The Private Sector, represented by:",
            ccc: "Cambodian Chamber of Commerce (CCC)",
            bmo: "Business Membership Organizations (BMOs)",
            wg: "Working Groups (WGs)",
            platform: "A co-governed platform",
            platformTail: "bridging government & business",
            d1: "Decisions are formally recorded and assigned for implementation",
            d2: "CDC monitors implementation progress",
            d3: "Ministries and stakeholders are held accountable",
            d4: "Progress is reported and reviewed regularly",
            footer:
                "This structure ensures that policy decisions reflect real business needs while maintaining strong government leadership.",
            photo: "Photo",
        },
        kh: {
            title: "គំរូគ្រប់គ្រងរួមរវាងរដ្ឋ និងឯកជន",
            desc:
                "ប្រសិទ្ធភាពនៃកិច្ចប្រជុំពេញអង្គ G-PSF កើតចេញពីការរួមបញ្ចូលគ្នានៃអំណាចនយោបាយរឹងមាំ ប្រព័ន្ធដោះស្រាយបញ្ហាជាប្រព័ន្ធ ការចូលរួមជាបន្តបន្ទាប់របស់ភាគីពាក់ព័ន្ធ និងយន្តការអនុវត្ត និងតាមដានច្បាស់លាស់។",
            intro:
                "កិច្ចប្រជុំពេញអង្គ G-PSF ប្រើវិធីសាស្ត្រគ្រប់គ្រងរួម ដោយរួមបញ្ចូល៖",
            gov: "រាជរដ្ឋាភិបាលកម្ពុជា",
            private: "វិស័យឯកជន តំណាងដោយ៖",
            ccc: "សភាពាណិជ្ជកម្មកម្ពុជា (CCC)",
            bmo: "អង្គការសមាជិកអាជីវកម្ម (BMOs)",
            wg: "ក្រុមការងារ (WGs)",
            platform: "វេទិកាគ្រប់គ្រងរួម",
            platformTail: "ដែលភ្ជាប់រដ្ឋ និងវិស័យឯកជន",
            d1: "សេចក្ដីសម្រេចត្រូវបានកត់ត្រាជាផ្លូវការ និងចាត់ចែងសម្រាប់អនុវត្ត",
            d2: "CDC តាមដានវឌ្ឍនភាពនៃការអនុវត្ត",
            d3: "ក្រសួង និងភាគីពាក់ព័ន្ធទទួលខុសត្រូវ",
            d4: "វឌ្ឍនភាពត្រូវបានរាយការណ៍ និងពិនិត្យឡើងវិញជាប្រចាំ",
            footer:
                "រចនាសម្ព័ន្ធនេះធានាថាសេចក្ដីសម្រេចគោលនយោបាយឆ្លុះបញ្ចាំងតាមតម្រូវការពិតនៃអាជីវកម្ម ខណៈរក្សាទុកភាពដឹកនាំរឹងមាំពីរដ្ឋាភិបាល។",
            photo: "រូបភាព",
        },
    };

    const lang = language === "kh" ? "kh" : "en";
    const text = t[lang];

    return (
        <section className="w-full bg-white">
            <div className="mx-auto">
                <div className="overflow-hidden">
                    {/* TOP */}
                <div className="px-4 py-10 md:px-33">
                    <h2 className={`text-3xl md:text-5xl font-extrabold text-gray-800 ${lang === "kh" ? "khmer-font" : ""}`}>
                        A Dual Public–Private <br /> Governance Model
                    </h2>

                    <div className="mt-6 w-90 border-t-5 border-orange-500 translate-x-0 sm:translate-x-8 md:translate-x-32" />

                    <p className="mt-4 max-w-sm text-xl text-[#1f3d6d] leading-relaxed translate-x-0 sm:translate-x-8 md:translate-x-32">
                        The effectiveness of the G-PSF Plenary stems from a combination of strong political authority, structured escalation processes, continuous stakeholder engagement, and clear implementation and monitoring mechanisms.
                    </p>
                </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* LEFT IMAGE */}
                        <div className="relative h-[300px] md:h-[420px] bg-gray-300 flex items-center justify-center">
                            <Image
                                src="/image/photo-placeholder-1.png"
                                alt={text.photo}
                                fill
                                className="object-cover"
                            />
                            <span className="relative z-10 text-4xl text-gray-500">
                                {text.photo}
                            </span>
                        </div>

                        {/* RIGHT TEXT */}
                        <div className="bg-gray-100 px-6 py-10 md:px-10">
                            <p
                                className={`text-lg md:text-2xl font-semibold text-gray-800 ${lang === "kh" ? "khmer-font leading-relaxed" : ""
                                    }`}
                            >
                                <span className="text-orange-500">The G-PSF Plenary</span>{" "}
                                {text.intro}
                            </p>

                            <ul
                                className={`mt-6 space-y-4 text-lg md:text-2xl text-gray-700 ${lang === "kh" ? "khmer-font leading-relaxed" : ""
                                    }`}
                            >
                                <li className="flex gap-3">
                                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                    <span>{text.gov}</span>
                                </li>

                                <li className="flex gap-3">
                                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                    <div>
                                        <p>{text.private}</p>
                                        <ul className="mt-2 ml-4 space-y-1 text-base md:text-xl">
                                            <li>› {text.ccc}</li>
                                            <li>› {text.bmo}</li>
                                            <li>› {text.wg}</li>
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* BOTTOM LEFT */}
                        <div className="bg-white px-6 py-10 md:px-8 lg:px-10">
                            <p
                                className={`text-base font-semibold leading-relaxed text-gray-800 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                                    }`}
                            >
                                <span className="text-orange-500">{text.platform}</span>{" "}
                                {text.platformTail}
                            </p>

                            <div className="mt-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <LuClipboardList className="mt-1 shrink-0 text-[34px] text-black md:text-[42px]" />
                                    <p
                                        className={`text-base font-semibold leading-relaxed text-gray-800 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        {text.d1}
                                    </p>
                                </div>

                                <div className="flex items-start gap-4">
                                    <LuFileSearch className="mt-1 shrink-0 text-[34px] text-black md:text-[42px]" />
                                    <p
                                        className={`text-base font-semibold leading-relaxed text-gray-800 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        {text.d2}
                                    </p>
                                </div>

                                <div className="flex items-start gap-4">
                                    <LuTarget className="mt-1 shrink-0 text-[34px] text-black md:text-[42px]" />
                                    <p
                                        className={`text-base font-semibold leading-relaxed text-gray-800 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        {text.d3}
                                    </p>
                                </div>

                                <div className="flex items-start gap-4">
                                    <LuFileBadge className="mt-1 shrink-0 text-[34px] text-black md:text-[42px]" />
                                    <p
                                        className={`text-base font-semibold leading-relaxed text-gray-800 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        {text.d4}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="relative h-[300px] md:h-[420px] bg-gray-300 flex items-center justify-center">
                            <Image
                                src="/image/photo-placeholder-2.png"
                                alt={text.photo}
                                fill
                                className="object-cover"
                            />
                            <span className="relative z-10 text-4xl text-gray-500">
                                {text.photo}
                            </span>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="bg-[#1f2468] py-6 px-4 text-center">
                        <p
                            className={`text-white text-sm md:text-base ${lang === "kh" ? "khmer-font leading-relaxed" : ""
                                }`}
                        >
                            {text.footer}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}