import type { Metadata } from "next";
import { cookies } from "next/headers";
import RouterHome from "@/components/UI-Router/RouterHome";

type UiLang = "en" | "kh";

type I18nText = {
  en?: string;
  km?: string;
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gpsf.datacolabx.com"
).replace(/\/$/, "");

const HOME_SEO = {
  metaTitle: {
    en: "G-PSF Cambodia | Government-Private Sector Forum",
    km: "G-PSF Cambodia | វេទិការាជរដ្ឋាភិបាល និងឯកជន",
  },
  metaDescription: {
    en: "G-PSF Cambodia is the official Government-Private Sector Forum, connecting government and businesses to improve policies, resolve issues, and support economic growth.",
    km: "G-PSF Cambodia ជាវេទិកាភ្ជាប់រវាងរដ្ឋាភិបាល និងវិស័យឯកជន ដើម្បីដោះស្រាយបញ្ហា និងអភិវឌ្ឍន៍គោលនយោបាយសេដ្ឋកិច្ច។",
  },
} satisfies {
  metaTitle: I18nText;
  metaDescription: I18nText;
};

function pickLocalizedText(
  value: I18nText | undefined,
  language: UiLang,
  fallback = "",
) {
  const primaryKey = language === "kh" ? "km" : "en";
  const secondaryKey = language === "kh" ? "en" : "km";

  return value?.[primaryKey] || value?.[secondaryKey] || fallback;
}

async function getPreferredLanguage(): Promise<UiLang> {
  const cookieStore = await cookies();
  return cookieStore.get("app-language")?.value === "en" ? "en" : "kh";
}

export async function generateMetadata(): Promise<Metadata> {
  const preferredLanguage = await getPreferredLanguage();
  const title = pickLocalizedText(
    HOME_SEO.metaTitle,
    preferredLanguage,
    "G-PSF Cambodia",
  );
  const description = pickLocalizedText(
    HOME_SEO.metaDescription,
    preferredLanguage,
    "Official G-PSF Cambodia website.",
  );

  return {
    title,
    description,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "G-PSF Cambodia",
      type: "website",
      locale: preferredLanguage === "kh" ? "km_KH" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const preferredLanguage = await getPreferredLanguage();
  const title = pickLocalizedText(
    HOME_SEO.metaTitle,
    preferredLanguage,
    "G-PSF Cambodia",
  );
  const description = pickLocalizedText(
    HOME_SEO.metaDescription,
    preferredLanguage,
    "Official G-PSF Cambodia website.",
  );

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "G-PSF Cambodia",
        url: SITE_URL,
        description,
      },
      {
        "@type": "WebSite",
        name: title,
        url: SITE_URL,
        description,
        inLanguage: preferredLanguage === "kh" ? "km-KH" : "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <RouterHome />
    </>
  );
}
