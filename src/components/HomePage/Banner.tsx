// components/HeroBanner.tsx
"use client";

import { useLanguage } from "@/app/context/LanguageContext";

interface Stat {
  value: string;
  labelEn: string;
  labelKh: string;
}

const stats: Stat[] = [
  { value: "1,200", labelEn: "TOTAL MEMBERS", labelKh: "សមាជិកសរុប" },
  { value: "90%", labelEn: "RESOLUTION RATE", labelKh: "អត្រាដោះស្រាយបញ្ហា" },
  { value: "63", labelEn: "POLICY REFORMS", labelKh: "កំណែទម្រង់នយោបាយ" },
];

const PLACEHOLDER_IMAGE_URL = "/image/Banner.bmp";

const HeroBanner: React.FC = () => {
  const { language } = useLanguage(); // get current language

  const topLine =
    language === "en"
      ? "Your seat at Cambodia’s highest reform table."
      : "កន្លែងរបស់អ្នកនៅលើតុពិភាក្សាការកែទម្រង់កំពូលរបស់កម្ពុជា។";

  const titleLine1 =
    language === "en" ? "Cambodia Works" : "កម្ពុជាដំណើរការល្អ";
  const titleLine2 =
    language === "en" ? "Better Together" : "នៅពេលធ្វើការរួមគ្នា";

  const paragraph =
    language === "en"
      ? "Join 1,200+ voices driving Cambodia’s economic transformation while turning conversation into action through the trusted G-PSF mechanism."
      : "ចូលរួមជាមួយសំឡេងជាង ១,២០០ ដើម្បីជំរុញការផ្លាស់ប្តូរសេដ្ឋកិច្ចកម្ពុជា ហើយបម្លែងការពិភាក្សាឲ្យក្លាយជាចលនា តាមរយៈមេកានិ즘 G-PSF ដែលអាចទុកចិត្តបាន។";

  const buttonLabel =
    language === "en"
      ? "Latest Digital Reforms"
      : "កំណែទម្រង់ឌីជីថលចុងក្រោយ";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-gray-100">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-gray-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-36 sm:pb-44 max-w-5xl w-full">
        {/* Top line */}
        <p
          className={`text-base sm:text-lg md:text-3xl text-white font-light tracking-wide mb-4 sm:mb-6 ${
            language === "kh" ? "khmer-font" : ""
          }`}
        >
          {topLine}
        </p>

        {/* Title */}
        <h1
          className={`text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-snug ${
            language === "kh" ? "khmer-font" : ""
          }`}
        >
          {titleLine1}
          <br />
          {titleLine2}
        </h1>

        {/* Paragraph */}
        <p
          className={`text-sm sm:text-base md:text-lg text-white font-light max-w-3xl mb-8 sm:mb-12 ${
            language === "kh" ? "khmer-font" : ""
          }`}
        >
          {paragraph}
        </p>

        {/* Button */}
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 md:py-4 px-4 sm:px-8 md:px-12 rounded-2xl shadow-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base md:text-lg ${
            language === "kh" ? "khmer-font" : ""
          }`}
          onClick={() => console.log("CTA Clicked")}
        >
          {buttonLabel}
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="max-w-[1120px] mx-auto absolute bottom-0 w-full py-4 sm:py-6 border-t-[5px] border-white px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-8 text-white">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center w-full sm:w-auto">
              <div className="border-t-2 border-white w-12 mb-2 sm:mb-3"></div>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold mb-1">
                {stat.value}
              </p>
              <p
                className={`text-xs sm:text-sm md:text-base tracking-widest uppercase ${
                  language === "kh" ? "khmer-font" : ""
                }`}
              >
                {language === "en" ? stat.labelEn : stat.labelKh}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
