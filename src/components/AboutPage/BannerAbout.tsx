"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export interface BannerAboutProps {
  // optional overrides (if you pass these, they will be used)
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const BannerAbout = ({
  title,
  subtitle,
  imageUrl = "/image/BannerAbout.bmp",
  imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
  const { language } = useLanguage();

  const defaultTitle =
    language === "kh"
      ? "វេទិការាជរដ្ឋាភិបាល–វិស័យឯកជន (G-PSF)"
      : "Government–Private Sector Forum (G-PSF)";

  const defaultSubtitle =
    language === "kh"
      ? "យន្តការសន្ទនារវាងរដ្ឋ និងឯកជនកំពូលរបស់កម្ពុជា"
      : "Cambodia’s peak public–private dialogue mechanism";

  return (
    <section className="bg-white py-5 md:py-13">
      {/* Title + subtitle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1
            className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${
              language === "kh" ? "khmer-font" : ""
            }`}
          >
            {title ?? defaultTitle}
          </h1>

          <p
            className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${
              language === "kh" ? "khmer-font" : ""
            }`}
          >
            {subtitle ?? defaultSubtitle}
          </p>
        </div>
      </div>

      {/* FULL-WIDTH BANNER */}
      <div className="w-full">
        <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default BannerAbout;
