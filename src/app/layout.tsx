import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import { LanguageProvider } from "./context/LanguageContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "G-PSF Website",
  description: "Government-Private Sector Forum",
};

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

async function getInitialLanguage() {
  const cookieStore = await cookies();
  return cookieStore.get("app-language")?.value === "en" ? "en" : "kh";
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialLanguage = await getInitialLanguage();

  return (
    <html lang={initialLanguage === "kh" ? "km" : "en"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kantumruyPro.variable} font-sans antialiased`}
      >
        <LanguageProvider initialLanguage={initialLanguage}>
          <Header />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
        {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
      </body>
    </html>
  );
}
