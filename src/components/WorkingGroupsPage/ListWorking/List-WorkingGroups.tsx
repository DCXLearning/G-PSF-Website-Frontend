// components/HeroBanner.tsx
"use client";

import { useLanguage } from "@/app/context/LanguageContext";

const PLACEHOLDER_IMAGE_URL = "/image/bannerpdf.bmp";

const ListWorkingGroups: React.FC = () => {
    const { language } = useLanguage(); // get current language

    const titleLine =
        language === "en"
            ? "Working Group Profile"
            : "ព័ត៌មានអំពីក្រុមការងារ";

    const topLine =
        language === "en"
            ? "Lay, Tex & Governance"
            : "ច្បាប់ បទប្បញ្ញត្តិ និងប្រព័ន្ធអភិបាលកិច្ច";

    const textLabel =
        language === "en"
            ? "Cross-cutting reform affecting business regulatoin, taxation, and Governance "
            : "ការកែទម្រង់ឆ្លងកាត់វិស័យ ដែលមានផលប៉ះពាល់ដល់ការគ្រប់គ្រងអាជីវកម្ម ពន្ធដារ និងអភិបាលកិច្ច";

    const buttonLabel =
        language === "en"
            ? "Download WG Brief"
            : "ទាញយកសង្ខេប WG";

    return (
        <div className="relative mb-0 opacity-110 min-h-180 flex flex-col items-center justify-start overflow-hidden bg-gray-100">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
            >
                <div className="absolute inset-0 bg-gray-900/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-68 pb-3 sm:pb-2 max-w-5xl w-full">
                <p
                    className={`text-base sm:text-lg md:text-2xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${language === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {titleLine}
                </p>
                {/* Top line */}
                <p
                    className={`text-base sm:text-lg md:text-5xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${language === "kh" ? "khmer-font" : ""
                        }`}
                >
                    <span className="bg-white px-5 py-1 rounded-full text-gray-800 font-bold text-sm md:text-4xl">WG: 4</span> <span> </span>
                    {topLine}
                </p>
                <p
                    className={`text-base sm:text-lg md:text-2xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${language === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {textLabel}
                </p>
                {/* Button */}
                <button
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 md:py-4 px-4 sm:px-8 md:px-12 rounded-2xl shadow-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base md:text-lg ${language === "kh" ? "khmer-font" : ""
                        }`}
                    onClick={() => console.log("CTA Clicked")}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default ListWorkingGroups;
