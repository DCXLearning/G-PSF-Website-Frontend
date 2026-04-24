import React from "react";
import HeroBanner from "./HeroBanner";
import DocumentClientSection from "./DocumentClientSection";
import { API_URL } from "@/config/api";
import type { Publication } from "./FeaturedPublicationsClient";
import { formatLocalizedDate } from "@/utils/localizedDate";

type I18nText = {
    en?: string;
    km?: string;
};

type ApiDocumentFile = {
    url?: string;
    thumbnailUrl?: string;
} | null;

type ApiPost = {
    id?: number;
    title?: I18nText;
    description?: I18nText;
    status?: string;
    isFeatured?: boolean;
    documents?: {
        en?: ApiDocumentFile;
        km?: ApiDocumentFile;
    };
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    };
    publishedAt?: string | null;
    createdAt?: string;
};

type FeaturedPostsResponse = {
    success?: boolean;
    message?: string;
    data?: ApiPost[];
    items?: ApiPost[];
};

function getText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickI18nText(value?: I18nText): string {
    return getText(value?.en) || getText(value?.km);
}

function getPostTimestamp(post: ApiPost): number {
    const rawDate = getText(post.publishedAt) || getText(post.createdAt);

    if (!rawDate) {
        return 0;
    }

    const timestamp = new Date(rawDate).getTime();

    if (Number.isNaN(timestamp)) {
        return 0;
    }

    return timestamp;
}

function mapFeaturedPosts(response: FeaturedPostsResponse): Publication[] {
    const postList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.items)
          ? response.items
          : [];
    const posts = [...postList]
        .filter((post) => post.status === "published" && post.isFeatured === true)
        .sort((firstPost, secondPost) => getPostTimestamp(secondPost) - getPostTimestamp(firstPost))
        .slice(0, 4);
    const items: Publication[] = [];

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index];

        const title = pickI18nText(post.title);
        if (!title) continue;

        const enUrl = getText(post.documents?.en?.url);
        const kmUrl = getText(post.documents?.km?.url);
        const coverUrl =
            getText(post.documentThumbnails?.en) ||
            getText(post.documentThumbnails?.km) ||
            getText(post.documents?.en?.thumbnailUrl) ||
            getText(post.documents?.km?.thumbnailUrl);
        const dateValue = getText(post.publishedAt) || getText(post.createdAt);

        items.push({
            id: post.id ?? index + 1,
            coverUrl,
            dateText: formatLocalizedDate(dateValue),
            dateValue,
            title,
            excerpt: pickI18nText(post.description),
            enUrl,
            kmUrl,
        });
    }

    return items;
}

async function getFeaturedPublications(): Promise<Publication[]> {
    if (!API_URL) {
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/posts?pageId=12&isFeatured=true`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const json = (await response.json()) as FeaturedPostsResponse;
        return mapFeaturedPosts(json);
    } catch {
        return [];
    }
}

export default async function Rout() {
    const featuredItems = await getFeaturedPublications();

    return (
        <div>
            <HeroBanner />
            <DocumentClientSection featuredItems={featuredItems} />
        </div>
    );
}
