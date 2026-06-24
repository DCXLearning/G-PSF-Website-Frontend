import type { Metadata } from "next";
import RouterAbout from "@/components/UI-Router/RouterAbout";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gpsf.datacolabx.com"
).replace(/\/$/, "");

const PAGE_URL = `${SITE_URL}/about-us`;
const SITE_NAME = "GPSF Cambodia";
const TITLE_EN = "Council for the Development of Cambodia";
const TITLE_KM = "ក្រុមប្រឹក្សាអភិវឌ្ឍន៍កម្ពុជា (ក.អ.ក.)";
const DESCRIPTION_EN = "CDC Business Advocacy";

export const metadata: Metadata = {
  title: TITLE_EN,
  description: DESCRIPTION_EN,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE_EN,
    description: DESCRIPTION_EN,
    url: PAGE_URL,
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

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: TITLE_EN,
  alternateName: TITLE_KM,
  url: PAGE_URL,
  description: DESCRIPTION_EN,
  inLanguage: ["en-US", "km-KH"],
  isPartOf: {
    "@type": "WebSite",
    name: "Government-Private Sector Forum Cambodia (GPSF)",
    url: SITE_URL,
  },
  about: {
    "@type": "GovernmentOrganization",
    name: TITLE_EN,
    alternateName: TITLE_KM,
  },
};

export default function AboutUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd),
        }}
      />
      <RouterAbout />
    </>
  );
}
