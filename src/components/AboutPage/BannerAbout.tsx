"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

type ApiResponse = {
  success: boolean;
  data?: {
    blocks?: Array<{
      type: string; // "hero_banner"
      enabled: boolean;
      posts?: Array<{
        content?: {
          en?: {
            title?: I18nText;
            subtitle?: I18nText;
            backgroundImages?: string[];
          };
          km?: {
            title?: I18nText;
            subtitle?: I18nText;
            backgroundImages?: string[];
          };
        };
      }>;
    }>;
  };
};

export interface BannerAboutProps {
  // optional overrides (if you pass these, they will be used)
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
}

function pickText(v?: I18nText, lang?: "en" | "kh") {
  if (!v) return undefined;
  return lang === "kh" ? v.km || v.en : v.en || v.km;
}

const BannerAbout = ({
  title,
  subtitle,
  imageUrl,
  imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
  const { language } = useLanguage();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  // ✅ defaults (fallback)
  const defaultTitle =
    lang === "kh"
      ? "វេទិការាជរដ្ឋាភិបាល–វិស័យឯកជន (G-PSF)"
      : "Government–Private Sector Forum (G-PSF)";

  const defaultSubtitle =
    lang === "kh"
      ? "យន្តការសន្ទនារវាងរដ្ឋ និងឯកជនកំពូលរបស់កម្ពុជា"
      : "Cambodia’s peak public–private dialogue mechanism";

  const defaultImage = "/image/BannerAbout.bmp";

  // ✅ API state
  const [api, setApi] = useState<ApiResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        //  IMPORTANT: your route is /api-about/banner
        const res = await fetch("/api-about/banner", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        setApi((await res.json()) as ApiResponse);
      } catch {
        setApi(null);
      }
    })();
  }, []);

  const hero = useMemo(() => {
    const blocks = api?.data?.blocks ?? [];
    return blocks.find((b) => b.type === "hero_banner" && b.enabled);
  }, [api]);

  const content = useMemo(() => {
    const post = hero?.posts?.[0];
    return lang === "kh" ? post?.content?.km : post?.content?.en;
  }, [hero, lang]);

  // ✅ final values (priority: props -> API -> defaults)
  const finalTitle = title ?? pickText(content?.title, lang) ?? defaultTitle;
  const finalSubtitle =
    subtitle ?? pickText(content?.subtitle, lang) ?? defaultSubtitle;
  const finalImage =
    imageUrl ?? content?.backgroundImages?.[0] ?? defaultImage;

  return (
    <section className="bg-white py-5 md:py-13">
      {/* Title + subtitle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1
            className={`text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900 ${
              lang === "kh" ? "khmer-font" : ""
            }`}
          >
            {finalTitle}
          </h1>

          <p
            className={`mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-gray-900 ${
              lang === "kh" ? "khmer-font" : ""
            }`}
          >
            {finalSubtitle}
          </p>
        </div>
      </div>

      {/* FULL-WIDTH BANNER */}
      <div className="w-full">
        <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
          <Image
            src={finalImage}
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