/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import PublicationDocumentsBrowser, {
    type PublicationDocumentItem,
    type PublicationDocumentLanguage,
} from "@/components/PublicationPage/See-More/PublicationDocumentsBrowser";
import {
    getPublicationViewMoreConfig,
    type PublicationCategoryViewMoreConfig,
} from "@/components/PublicationPage/See-More/publicationViewMoreConfig";
import { formatLocalizedDate } from "@/utils/localizedDate";

type UiLang = "en" | "kh";

export type PublicationCategoryViewMoreProps = {
    categoryId: PublicationCategoryViewMoreConfig["categoryId"];
    pageTitle: PublicationCategoryViewMoreConfig["pageTitle"];
    badgeText: PublicationCategoryViewMoreConfig["badgeText"];
};

type ApiPost = {
    id: number;
    title?: { en?: string; km?: string } | string | null;
    description?: { en?: string; km?: string } | string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    isPublished?: boolean;
    coverImage?: string | null;
    documentThumbnail?: string | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    } | null;
    documents?: {
        en?: { url?: string | null; thumbnailUrl?: string | null } | null;
        km?: { url?: string | null; thumbnailUrl?: string | null } | null;
    } | null;
};

type ApiResponse = {
    data?: ApiPost[];
    items?: ApiPost[];
};

function pickText(value: any, lang: UiLang): string {
    if (typeof value === "string") return value;
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || "";
}

function normalizeFileUrl(value?: string | null): string {
    const url = typeof value === "string" ? value.trim() : "";

    if (url.startsWith("/https://") || url.startsWith("/http://")) {
        return url.slice(1);
    }

    return url;
}

function buildDownloadHref(value?: string | null): string {
    const fileUrl = normalizeFileUrl(value);

    if (!fileUrl) {
        return "";
    }

    return `/api/download?url=${encodeURIComponent(fileUrl)}`;
}

function buildLanguages(post: ApiPost): PublicationDocumentLanguage[] {
    return [
        buildDownloadHref(post.documents?.en?.url)
            ? {
                  label: "English",
                  href: buildDownloadHref(post.documents?.en?.url),
              }
            : null,
        buildDownloadHref(post.documents?.km?.url)
            ? {
                  label: "Khmer",
                  href: buildDownloadHref(post.documents?.km?.url),
              }
            : null,
    ].filter(Boolean) as PublicationDocumentLanguage[];
}

function pickThumbnail(post: ApiPost, lang: UiLang) {
    return (
        normalizeFileUrl(post.documentThumbnails?.[lang === "kh" ? "km" : "en"]) ||
        normalizeFileUrl(post.documentThumbnails?.en) ||
        normalizeFileUrl(post.documentThumbnails?.km) ||
        normalizeFileUrl(post.documents?.[lang === "kh" ? "km" : "en"]?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.en?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.km?.thumbnailUrl) ||
        normalizeFileUrl(post.documentThumbnail) ||
        normalizeFileUrl(post.coverImage) ||
        null
    );
}

export default function PublicationCategoryViewMore({
    categoryId,
    pageTitle,
    badgeText,
}: PublicationCategoryViewMoreProps) {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";

    const [items, setItems] = useState<PublicationDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/posts/category/${categoryId}`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || `API error ${response.status}`);
                }

                const json = (await response.json()) as ApiResponse;
                const posts = Array.isArray(json.data)
                    ? json.data
                    : Array.isArray(json.items)
                      ? json.items
                      : [];

                const mappedItems = posts
                    .filter((post) => post.isPublished !== false)
                    .sort((leftPost, rightPost) => {
                        const leftDate = new Date(
                            leftPost.publishedAt || leftPost.createdAt || ""
                        ).getTime();
                        const rightDate = new Date(
                            rightPost.publishedAt || rightPost.createdAt || ""
                        ).getTime();

                        return rightDate - leftDate;
                    })
                    .map((post) => ({
                        id: post.id,
                        title: pickText(post.title, uiLang),
                        description: pickText(post.description, uiLang),
                        image: pickThumbnail(post, uiLang),
                        date: formatLocalizedDate(post.publishedAt || post.createdAt, uiLang),
                        languages: buildLanguages(post),
                    }));

                if (!active) {
                    return;
                }

                setItems(mappedItems);
            } catch (loadError: any) {
                if (!active) {
                    return;
                }

                setError(loadError?.message || "Failed to load data.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            active = false;
        };
    }, [categoryId, uiLang]);

    const fallbackConfig = getPublicationViewMoreConfig(categoryId);
    const pageTitleText = (pageTitle || fallbackConfig.pageTitle)[uiLang];
    const badgeTextValue = (badgeText || fallbackConfig.badgeText)[uiLang];

    return (
        <PublicationDocumentsBrowser
            title={pageTitleText}
            badgeText={badgeTextValue}
            items={items}
            loading={loading}
            error={error}
        />
    );
}
