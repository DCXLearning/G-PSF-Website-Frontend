"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

function BannerAboutSkeleton() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 animate-pulse text-center">
          <div className="mx-auto h-10 w-4/5 max-w-2xl rounded bg-slate-200 md:h-12" />
          <div className="mx-auto mt-4 h-5 w-3/5 max-w-xl rounded bg-slate-200" />
        </div>
      </div>

      <div className="h-[240px] w-full animate-pulse bg-slate-200 sm:h-[360px] md:h-[480px] lg:h-[675px]" />
    </section>
  );
}

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/about-us-page/banner", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(await res.text());

        if (alive) {
          setApi((await res.json()) as ApiResponse);
        }
      } catch {
        if (alive) {
          setApi(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
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

  const finalImage = imageUrl ?? content?.backgroundImages?.[0];
  const showSkeleton = loading && !title && !subtitle && !imageUrl;

  if (showSkeleton) {
    return <BannerAboutSkeleton />;
  }

  return (
    <section className="bg-white py-8">
      {/* Title + subtitle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1
            className={`
              text-[#1f1f1f]
              ${lang === "kh"
                ? "title-km khmer-font font-bold"
                : "title-en airbnb-font font-extrabold"
              }
            `}
          >
            {finalTitle}
          </h1>

          <p
            className={`
              mt-4 text-gray-600
              ${lang === "kh"
                ? "body-km khmer-font"
                : "body-en airbnb-font"
              }
            `}
          >
            {finalSubtitle}
          </p>
        </div>
      </div>

      {finalImage && (
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
      )}
    </section>
  );
};

export default BannerAbout;
