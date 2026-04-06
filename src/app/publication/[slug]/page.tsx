import type { Metadata } from "next";
import { cookies } from "next/headers";
import PublicationPageViewMore from "@/components/PublicationPage/See-More/PublicationPageViewMore";

type PageProps = {
    params: { slug: string } | Promise<{ slug: string }>;
};

type I18n = {
    en?: string;
    km?: string;
};

type UiLang = "en" | "kh";

type PageDetailResponse = {
    success?: boolean;
    data?: {
        title?: I18n | null;
        slug?: string | null;
        seo?: {
            metaTitle?: I18n | null;
            metaDescription?: I18n | null;
        } | null;
    } | null;
};

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

function pickLocalizedText(
    value: I18n | null | undefined,
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

async function getPublicationPageDetail(slug: string) {
    const apiBase = (
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        FALLBACK_API_BASE
    ).replace(/\/$/, "");

    const response = await fetch(`${apiBase}/pages/${encodeURIComponent(slug)}`, {
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as PageDetailResponse;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const pageSlug = resolvedParams.slug;
    const preferredLanguage = await getPreferredLanguage();
    const pageDetail = await getPublicationPageDetail(pageSlug);
    const pageData = pageDetail?.data;

    const title =
        pickLocalizedText(pageData?.seo?.metaTitle, preferredLanguage) ||
        pickLocalizedText(pageData?.title, preferredLanguage) ||
        "Publication";

    const description =
        pickLocalizedText(pageData?.seo?.metaDescription, preferredLanguage) ||
        `${title} - G-PSF Website`;

    return {
        title,
        description,
    };
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const pageSlug = resolvedParams.slug;

    return <PublicationPageViewMore pageSlug={pageSlug} />;
}
