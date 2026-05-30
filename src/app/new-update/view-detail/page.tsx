import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Rout from "@/components/News&Updates/list-New&Update/Rout";
import {
    NEWS_SITE_NAME,
    buildMetadataDescription,
    buildShareImageUrl,
    cleanText,
    getNewsCmsPost,
    getNewsDetailData,
    mapPostToDetail,
} from "@/lib/newsUpdateDetail";
import { buildNewsDetailPath } from "@/utils/newsDetail";

type SearchParams = {
    slug?: string;
    id?: string;
};

type PageProps = {
    searchParams?: SearchParams | Promise<SearchParams>;
};

type Locale = "en" | "km";

type LocalizedText = {
    en?: string | null;
    km?: string | null;
    kh?: string | null;
};

function isLocalizedText(value: unknown): value is LocalizedText {
    return typeof value === "object" && value !== null;
}

function toPlainText(
    value: unknown,
    locale: Locale = "km",
    fallback = ""
): string {
    if (!value) {
        return fallback;
    }

    if (typeof value === "string") {
        return cleanText(value) || fallback;
    }

    if (isLocalizedText(value)) {
        if (locale === "km") {
            return (
                cleanText(value.km) ||
                cleanText(value.kh) ||
                cleanText(value.en) ||
                fallback
            );
        }

        return (
            cleanText(value.en) ||
            cleanText(value.km) ||
            cleanText(value.kh) ||
            fallback
        );
    }

    return fallback;
}

async function getCurrentLocale(): Promise<Locale> {
    const cookieStore = await cookies();

    const locale =
        cookieStore.get("NEXT_LOCALE")?.value ||
        cookieStore.get("language")?.value ||
        cookieStore.get("locale")?.value ||
        "km";

    return locale === "en" ? "en" : "km";
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const locale = await getCurrentLocale();
    const resolvedSearchParams = await Promise.resolve(searchParams ?? {});

    const slug = cleanText(resolvedSearchParams.slug) || undefined;
    const id = cleanText(resolvedSearchParams.id) || undefined;

    const detailData = await getNewsDetailData(slug, id, locale);

    if (!detailData) {
        return {
            title:
                locale === "km"
                    ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព"
                    : "News & Updates",
            description:
                locale === "km"
                    ? "ព័ត៌មាន និងបច្ចុប្បន្នភាពថ្មីៗពី G-PSF Cambodia។"
                    : "Latest news and updates from G-PSF Cambodia.",
        };
    }

    const title = toPlainText(
        detailData.title,
        locale,
        locale === "km" ? "ព័ត៌មាន និងបច្ចុប្បន្នភាព" : "News & Updates"
    );

    const description = toPlainText(
        buildMetadataDescription(detailData),
        locale,
        locale === "km"
            ? "ព័ត៌មាន និងបច្ចុប្បន្នភាពថ្មីៗពី G-PSF Cambodia។"
            : "Latest news and updates from G-PSF Cambodia."
    );

    const heroImage = cleanText(detailData.heroImage) || "";
    const shareImageUrl = buildShareImageUrl(heroImage);
    const canonicalUrl = detailData.shareUrl;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: NEWS_SITE_NAME,
            type: "article",
            images: [
                {
                    url: shareImageUrl,
                    secureUrl: shareImageUrl,
                    alt: title,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [shareImageUrl],
        },
        other: {
            "og:image": shareImageUrl,
            "og:image:secure_url": shareImageUrl,
            "og:image:width": "1200",
            "og:image:height": "630",
            "twitter:image": shareImageUrl,
        },
    };
}

export default async function Page({ searchParams }: PageProps) {
    const locale = await getCurrentLocale();
    const resolvedSearchParams = await Promise.resolve(searchParams ?? {});

    const slug = cleanText(resolvedSearchParams.slug) || undefined;
    const id = cleanText(resolvedSearchParams.id) || undefined;

    if (!slug && !id) {
        notFound();
    }

    const post = await getNewsCmsPost(slug, id);

    if (!post) {
        notFound();
    }

    const canonicalPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });

    if (
        canonicalPath.startsWith("/new-update/") &&
        !canonicalPath.startsWith("/new-update/view-detail")
    ) {
        redirect(canonicalPath);
    }

    const detailData = mapPostToDetail(post, locale);

    return <Rout detailData={detailData} />;
}