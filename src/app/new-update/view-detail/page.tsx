import type { Metadata } from "next";
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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
    const slug = cleanText(resolvedSearchParams.slug) || undefined;
    const id = cleanText(resolvedSearchParams.id) || undefined;
    const detailData = await getNewsDetailData(slug, id);

    if (!detailData) {
        return {
            title: "News & Updates",
            description: "Latest news and updates from G-PSF Cambodia.",
        };
    }

    const description = buildMetadataDescription(detailData);
    const shareImageUrl = buildShareImageUrl(detailData.heroImage);

    return {
        title: detailData.title,
        description,
        alternates: {
            canonical: detailData.shareUrl,
        },
        openGraph: {
            title: detailData.title,
            description,
            url: detailData.shareUrl,
            siteName: NEWS_SITE_NAME,
            type: "article",
            images: [
                {
                    url: shareImageUrl,
                    secureUrl: shareImageUrl,
                    alt: detailData.title,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: detailData.title,
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

    const detailData = mapPostToDetail(post);

    return <Rout detailData={detailData} />;
}
