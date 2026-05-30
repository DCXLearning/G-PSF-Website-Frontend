import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Rout from "@/components/News&Updates/list-New&Update/Rout";
import {
    NEWS_SITE_NAME,
    buildMetadataDescription,
    cleanText,
    getNewsCmsPost,
    mapPostToDetail,
} from "@/lib/newsUpdateDetail";
import { buildAbsoluteUrl } from "@/utils/socialShare";
import { buildNewsDetailPath } from "@/utils/newsDetail";

type PageProps = {
    params: Promise<{
        id: string;
        slug: string;
    }>;
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
    params,
}: PageProps): Promise<Metadata> {
    const { id, slug } = await params;
    const locale = await getCurrentLocale();

    const post = await getNewsCmsPost(slug, id);

    if (!post) {
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

    const detailData = mapPostToDetail(post, locale);

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

    const canonicalPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });

    const canonicalUrl = buildAbsoluteUrl(canonicalPath);

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
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { id, slug } = await params;
    const locale = await getCurrentLocale();

    const post = await getNewsCmsPost(slug, id);

    if (!post) {
        notFound();
    }

    const canonicalPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });

    const expectedSlug = cleanText(post.slug);

    if (
        !expectedSlug ||
        canonicalPath !==
            `/new-update/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`
    ) {
        redirect(canonicalPath);
    }

    return <Rout detailData={mapPostToDetail(post, locale)} />;
}