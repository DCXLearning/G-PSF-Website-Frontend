import type { Metadata } from "next";
import RouterHome from "@/components/UI-Router/RouterHome";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gpsf.datacolabx.com"
).replace(/\/$/, "");

const SITE_NAME = "GPSF Cambodia";
const TITLE_EN = "Government-Private Sector Forum Cambodia (GPSF)";
const TITLE_KM = "វេទិការដ្ឋាភិបាល-ផ្នែកឯកជន កម្ពុជា (GPSF)";
const DESCRIPTION_EN = "GPSF Cambodia official website";
const LOGO_URL = `${SITE_URL}/image/gpsf_logo.png`;

export const metadata: Metadata = {
  title: TITLE_EN,
  description: DESCRIPTION_EN,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: TITLE_EN,
    description: DESCRIPTION_EN,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    images: ["/image/gpsf_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_EN,
    description: DESCRIPTION_EN,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: TITLE_EN,
      alternateName: TITLE_KM,
      url: SITE_URL,
      description: DESCRIPTION_EN,
      logo: LOGO_URL,
    },
    {
      "@type": "WebSite",
      name: TITLE_EN,
      alternateName: TITLE_KM,
      url: SITE_URL,
      description: DESCRIPTION_EN,
      inLanguage: ["en-US", "km-KH"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
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
