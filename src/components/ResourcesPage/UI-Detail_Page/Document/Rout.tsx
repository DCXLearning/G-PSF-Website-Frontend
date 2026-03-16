import React from "react";
import HeroBanner from "./HeroBanner";
import DocumentClientSection from "./DocumentClientSection";
import { API_URL } from "@/config/api";
import type { Publication } from "./FeaturedPublicationsClient";

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
};

function getText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickI18nText(value?: I18nText): string {
    return getText(value?.en) || getText(value?.km);
}

function formatDate(dateValue?: string | null): string {
    const raw = getText(dateValue);
    if (!raw) return "";

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        return raw;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function mapFeaturedPosts(response: FeaturedPostsResponse): Publication[] {
    const posts = response.data ?? [];
    const items: Publication[] = [];

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index];

        if (post.status !== "published") continue;
        if (post.isFeatured !== true) continue;

        const title = pickI18nText(post.title);
        if (!title) continue;

        const enUrl = getText(post.documents?.en?.url);
        const kmUrl = getText(post.documents?.km?.url);
        const coverUrl =
            getText(post.documentThumbnails?.en) ||
            getText(post.documentThumbnails?.km) ||
            getText(post.documents?.en?.thumbnailUrl) ||
            getText(post.documents?.km?.thumbnailUrl);

        items.push({
            id: post.id ?? index + 1,
            coverUrl,
            dateText: formatDate(post.publishedAt) || formatDate(post.createdAt),
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
        const response = await fetch(`${API_URL}/posts?isFeatured=true`, {
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