import type { Metadata } from "next";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, slug } = await params;
    const post = await getNewsCmsPost(slug, id);

    if (!post) {
        return {
            title: "News & Updates",
            description: "Latest news and updates from G-PSF Cambodia.",
        };
    }

    const detailData = mapPostToDetail(post);
    const canonicalPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });

    return {
        title: detailData.title,
        description: buildMetadataDescription(detailData),
        alternates: {
            canonical: buildAbsoluteUrl(canonicalPath),
        },
        openGraph: {
            title: detailData.title,
            description: buildMetadataDescription(detailData),
            url: buildAbsoluteUrl(canonicalPath),
            siteName: NEWS_SITE_NAME,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: detailData.title,
            description: buildMetadataDescription(detailData),
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { id, slug } = await params;
    const post = await getNewsCmsPost(slug, id);

    if (!post) {
        notFound();
    }

    const canonicalPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });

    const expectedSlug = cleanText(post.slug);

    if (!expectedSlug || canonicalPath !== `/new-update/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`) {
        redirect(canonicalPath);
    }

    return <Rout detailData={mapPostToDetail(post)} />;
}
