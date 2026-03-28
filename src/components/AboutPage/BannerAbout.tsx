/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18nText = { en?: string; km?: string };

type ApiResponse = {
  success: boolean;
  data?: {
    blocks?: Array<{
      type: string;
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
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
}

function pickText(v?: I18nText, lang?: "en" | "kh") {
  if (!v) return undefined;
  return lang === "kh" ? v.km || v.en : v.en || v.km;
}

const AUTO_SLIDE_MS = 5000;

const BannerAbout = ({
  title,
  subtitle,
  imageUrl,
  imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
  const { language } = useLanguage();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  const defaultTitle =
    lang === "kh"
      ? "វេទិការាជរដ្ឋាភិបាល–វិស័យឯកជន (G-PSF)"
      : "Government–Private Sector Forum (G-PSF)";

  const defaultSubtitle =
    lang === "kh"
      ? "យន្តការសន្ទនារវាងរដ្ឋ និងឯកជនកំពូលរបស់កម្ពុជា"
      : "Cambodia’s peak public–private dialogue mechanism";

  const [api, setApi] = useState<ApiResponse | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/about-us-page/banner", {
          cache: "no-store",
        });

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

  const finalTitle = title ?? pickText(content?.title, lang) ?? defaultTitle;
  const finalSubtitle =
    subtitle ?? pickText(content?.subtitle, lang) ?? defaultSubtitle;

  const slides = useMemo(() => {
    if (imageUrl?.trim()) return [imageUrl];

    const apiImages =
      content?.backgroundImages?.filter(
        (img) => typeof img === "string" && img.trim()
      ) ?? [];

    return apiImages;
  }, [imageUrl, content?.backgroundImages]);

  const validSlides = useMemo(() => {
    return slides.filter((img) => !brokenImages[img]);
  }, [slides, brokenImages]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [validSlides.length]);

  useEffect(() => {
    if (validSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validSlides.length);
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [validSlides]);

  const goPrev = () => {
    if (validSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  };

  const goNext = () => {
    if (validSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % validSlides.length);
  };

  const handleImageError = (src: string) => {
    setBrokenImages((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <section className="bg-white py-5 md:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-10">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 ${
              lang === "kh" ? "khmer-font" : ""
            }`}
          >
            {finalTitle}
          </h1>

          <p
            className={`mt-3 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-900 ${
              lang === "kh" ? "khmer-font" : ""
            }`}
          >
            {finalSubtitle}
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[360px] lg:h-[700px] overflow-hidden bg-white">
          {validSlides.length > 0 ? (
            <>
              {validSlides.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={img}
                    alt={imageAlt}
                    className="w-full h-full object-cover md:object-cover object-center"
                    onError={() => handleImageError(img)}
                  />
                </div>
              ))}

              {validSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous slide"
                    className="absolute cursor-pointer left-2 md:left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-800 shadow hover:bg-white transition"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next slide"
                    className="absolute cursor-pointer right-2 md:right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-800 shadow hover:bg-white transition"
                  >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              {/* No image available */}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerAbout;