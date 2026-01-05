// components/HeroBanner.tsx
"use client";

import { useLanguage } from "@/app/context/LanguageContext";

const PLACEHOLDER_IMAGE_URL = "/image/city.jpg";

const Start: React.FC = () => {
    const { language } = useLanguage(); // get current language

    const topLine =
        language === "en"
            ? "Need to raise an issue for WG 4?"
            : "តើអ្នកមានបញ្ហាដែលត្រូវលើកឡើងសម្រាប់ WG 4 ដែរឬទេ?";
    const buttonLabel =
        language === "en"
            ? "Start Submission"
            : "ដាក់ស្នើឥឡូវនេះ";

    return (
        <div className="relative mb-0 opacity-110 min-h-130 flex flex-col items-center justify-start overflow-hidden bg-gray-100">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
            >
                <div className="absolute inset-0 bg-gray-900/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-68 pb-3 sm:pb-2 max-w-5xl w-full">
                {/* Top line */}
                <p
                    className={`text-base sm:text-lg md:text-5xl text-white font-medium tracking-wide mb-4 sm:mb-6 ${language === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {topLine}
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

export default Start;
