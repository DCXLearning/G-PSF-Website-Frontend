"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
    en?: string;
    km?: string;
};

type CTAItem = {
    href?: string;
    label?: I18nText;
};

type HeroContentLang = {
    ctas?: CTAItem[];
    title?: I18nText;
    subtitle?: I18nText;
    description?: I18nText;
    backgroundImages?: string[];
};

type PostItem = {
    id: number;
    title?: I18nText;
    slug?: string;
    description?: I18nText | null;
    content?: {
        en?: HeroContentLang;
        km?: HeroContentLang;
    };
};

type BlockItem = {
    id: number;
    type: string;
    title?: I18nText;
    description?: I18nText | null;
    posts?: PostItem[];
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data?: {
        page?: I18nText;
        slug?: string;
        blocks?: BlockItem[];
    };
};

const PLACEHOLDER_IMAGE_URL = "/image/bannerSubmission.bmp";

function pickText(value: I18nText | null | undefined, lang: UiLang): string {
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    return value?.[apiLang] || value?.en || value?.km || "";
}

const SubmissionForm: React.FC = () => {
    const { language } = useLanguage();
    const lang: UiLang = language === "kh" ? "kh" : "en";

    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    "/api/working-groups-page/section?slug=working-groups",
                    {
                        cache: "no-store",
                    }
                );

                const json: ApiResponse = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch hero banner:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    const bannerData = useMemo(() => {
        const blocks = data?.data?.blocks ?? [];

        const heroBlock =
            blocks.find((block) => block.id === 39 && block.type === "hero_banner") ||
            null;

        const post = heroBlock?.posts?.[0];
        const content =
            lang === "kh" ? post?.content?.km || post?.content?.en : post?.content?.en;

        const title =
            pickText(content?.title, lang) ||
            (lang === "en"
                ? "Submit an Issue for Reform"
                : "ដាក់ស្នើបញ្ហាសម្រាប់ការកែទម្រង់");

        const rawDescription = pickText(content?.description, lang);
        const description =
            rawDescription && rawDescription !== "." ? rawDescription : "";

        const cta = content?.ctas?.[0];

        const buttonLabel =
            pickText(cta?.label, lang) ||
            (lang === "en" ? "Submission Form" : "ទម្រង់ដាក់ស្នើ");

        const buttonHref = cta?.href || "/contact-us";
        const backgroundImage = content?.backgroundImages?.[0] || PLACEHOLDER_IMAGE_URL;

        return {
            title,
            description,
            buttonLabel,
            buttonHref,
            backgroundImage,
        };
    }, [data, lang]);

    return (
        <section className="relative mb-27 mt-25 min-h-[560px] overflow-hidden bg-gray-100">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bannerData.backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-gray-900/50" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[560px] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
                <h2
                    className={`mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl lg:text-6xl ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {loading ? "Loading..." : bannerData.title}
                </h2>

                {bannerData.description ? (
                    <p
                        className={`mb-8 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base md:text-xl ${lang === "kh" ? "khmer-font" : ""
                            }`}
                    >
                        {bannerData.description}
                    </p>
                ) : null}

                <a
                    href={bannerData.buttonHref}
                    className={`inline-flex items-center justify-center rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-xl transition duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 sm:px-8 sm:py-3 md:px-12 md:py-4 md:text-lg ${lang === "kh" ? "khmer-font" : ""
                        }`}
                >
                    {bannerData.buttonLabel}
                </a>
            </div>
        </section>
    );
};

export default SubmissionForm;