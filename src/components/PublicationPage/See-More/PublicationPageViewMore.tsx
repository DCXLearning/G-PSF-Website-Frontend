/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import PublicationDocumentsBrowser, {
    type PublicationDocumentItem,
    type PublicationDocumentLanguage,
} from "@/components/PublicationPage/See-More/PublicationDocumentsBrowser";
import { getContentLanguageLabel } from "@/utils/languageLabels";
import { formatLocalizedDate } from "@/utils/localizedDate";

type UiLang = "en" | "kh";
type I18n = {
    en?: string;
    km?: string;
};

type ApiPost = {
    id: number;
    title?: I18n | string | null;
    description?: I18n | string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    status?: string | null;
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
    category?: {
        id?: number;
        name?: I18n | null;
    } | null;
};

type ApiBlock = {
    id?: number;
    type?: string;
    title?: I18n | string | null;
    description?: I18n | string | null;
    orderIndex?: number;
    enabled?: boolean;
    settings?: {
        sort?: string | null;
        limit?: number | null;
        categoryIds?: number[];
    } | null;
    posts?: ApiPost[];
};

type CategoryPostsResponse = {
    data?: ApiPost[];
    items?: ApiPost[];
};

type ApiCategory = {
    id?: number;
    name?: I18n | null;
};

type CategoriesResponse = {
    data?: ApiCategory[];
    items?: ApiCategory[];
};

type ApiPage = {
    title?: I18n | string | null;
    description?: I18n | string | null;
    slug?: string | null;
};

type ApiResponse = {
    success?: boolean;
    data?: {
        page?: ApiPage | I18n | null;
        title?: I18n | string | null;
        description?: I18n | string | null;
        slug?: string | null;
        blocks?: ApiBlock[];
    };
};

type PublicationPageViewMoreProps = {
    pageSlug: string;
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

function formatSlugLabel(slug: string) {
    return slug
        .split("-")
        .filter((part) => part.length > 0)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function buildLanguages(post: ApiPost, lang: UiLang): PublicationDocumentLanguage[] {
    return [
        buildDownloadHref(post.documents?.km?.url)
            ? {
                  label: getContentLanguageLabel("km", lang),
                  href: buildDownloadHref(post.documents?.km?.url),
              }
            : null,
        buildDownloadHref(post.documents?.en?.url)
            ? {
                  label: getContentLanguageLabel("en", lang),
                  href: buildDownloadHref(post.documents?.en?.url),
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

function getPrimaryPostListBlock(blocks: ApiBlock[]): ApiBlock | null {
    const sortedBlocks = [...blocks].sort(
        (leftBlock, rightBlock) => (leftBlock.orderIndex ?? 0) - (rightBlock.orderIndex ?? 0)
    );

    return (
        sortedBlocks.find(
            (block) =>
                block.enabled !== false &&
                block.type === "post_list" &&
                Array.isArray(block.posts) &&
                block.posts.length > 0
        ) ||
        sortedBlocks.find(
            (block) => block.enabled !== false && block.type === "post_list"
        ) ||
        sortedBlocks.find(
            (block) =>
                Array.isArray(block.posts) &&
                block.posts.length > 0
        ) ||
        null
    );
}

function isPublishedPost(post: ApiPost) {
    if (post.isPublished === false) {
        return false;
    }

    if (typeof post.status === "string") {
        return post.status.toLowerCase() === "published";
    }

    return true;
}

function getPostsFromResponse(response: CategoryPostsResponse) {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    return [];
}

function getCategoriesFromResponse(response: CategoriesResponse) {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    return [];
}

function sortPosts(posts: ApiPost[], sortValue?: string | null) {
    const normalizedSort = (sortValue || "latest").trim().toLowerCase();
    const sortedPosts = [...posts].sort((leftPost, rightPost) => {
        const leftDate = new Date(
            leftPost.publishedAt || leftPost.createdAt || ""
        ).getTime();
        const rightDate = new Date(
            rightPost.publishedAt || rightPost.createdAt || ""
        ).getTime();

        return rightDate - leftDate;
    });

    if (normalizedSort === "oldest") {
        return sortedPosts.reverse();
    }

    return sortedPosts;
}

export default function PublicationPageViewMore({
    pageSlug,
}: PublicationPageViewMoreProps) {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";

    const [title, setTitle] = useState("");
    const [badgeText, setBadgeText] = useState("");
    const [description, setDescription] = useState("");
    const [items, setItems] = useState<PublicationDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadPage() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/pages/section?slug=${encodeURIComponent(pageSlug)}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || `API error ${response.status}`);
                }

                const json = (await response.json()) as ApiResponse;
                const blocks = Array.isArray(json.data?.blocks) ? json.data.blocks : [];
                const primaryBlock = getPrimaryPostListBlock(blocks);
                const categoryIds = Array.isArray(primaryBlock?.settings?.categoryIds)
                    ? primaryBlock.settings.categoryIds.filter(
                          (categoryId): categoryId is number =>
                              typeof categoryId === "number"
                      )
                    : [];
                const pageData = json.data?.page;

                let posts = Array.isArray(primaryBlock?.posts) ? primaryBlock.posts : [];
                const categoryLabelById = new Map<number, string>();

                if (pageSlug) {
                    const categoriesResponse = await fetch(
                        `/api/categories?pageSlug=${encodeURIComponent(pageSlug)}`,
                        {
                            cache: "no-store",
                        }
                    );

                    if (categoriesResponse.ok) {
                        const categoriesJson =
                            (await categoriesResponse.json()) as CategoriesResponse;
                        const categories = getCategoriesFromResponse(categoriesJson);

                        for (let index = 0; index < categories.length; index += 1) {
                            const category = categories[index];
                            const categoryId = category.id;
                            const categoryLabel = pickText(category.name, uiLang);

                            if (
                                typeof categoryId === "number" &&
                                categoryLabel
                            ) {
                                categoryLabelById.set(categoryId, categoryLabel);
                            }
                        }
                    }
                }

                if (categoryIds.length > 0) {
                    const categoryResponses = await Promise.all(
                        categoryIds.map((categoryId) =>
                            fetch(`/api/posts/category/${categoryId}`, {
                                cache: "no-store",
                            })
                        )
                    );

                    const mergedPosts: ApiPost[] = [];
                    const seenPostIds = new Set<number>();

                    for (let index = 0; index < categoryResponses.length; index += 1) {
                        const categoryResponse = categoryResponses[index];

                        if (!categoryResponse.ok) {
                            continue;
                        }

                        const categoryData =
                            (await categoryResponse.json()) as CategoryPostsResponse;
                        const categoryPosts = getPostsFromResponse(categoryData);

                        for (let postIndex = 0; postIndex < categoryPosts.length; postIndex += 1) {
                            const post = categoryPosts[postIndex];

                            if (seenPostIds.has(post.id)) {
                                continue;
                            }

                            seenPostIds.add(post.id);
                            mergedPosts.push(post);
                        }
                    }

                    posts = mergedPosts;
                }

                const nextTitle =
                    pickText((pageData as ApiPage | undefined)?.title, uiLang) ||
                    pickText(pageData, uiLang) ||
                    pickText(json.data?.title, uiLang) ||
                    pickText(primaryBlock?.title, uiLang) ||
                    formatSlugLabel(pageSlug);

                const nextDescription =
                    pickText((pageData as ApiPage | undefined)?.description, uiLang) ||
                    pickText(json.data?.description, uiLang) ||
                    pickText(primaryBlock?.description, uiLang) ||
                    "";

                const nextBadgeText =
                    categoryIds
                        .map((categoryId) => categoryLabelById.get(categoryId) || "")
                        .find((categoryLabel) => categoryLabel.length > 0) ||
                    pickText(primaryBlock?.title, uiLang) ||
                    nextTitle;

                const orderedPosts = sortPosts(
                    posts.filter((post) => isPublishedPost(post)),
                    primaryBlock?.settings?.sort
                );

                const orderedItems = orderedPosts.map((post) => ({
                    id: post.id,
                    badgeText:
                        pickText(post.category?.name, uiLang) ||
                        (typeof post.category?.id === "number"
                            ? categoryLabelById.get(post.category.id) || ""
                            : "") ||
                        nextBadgeText,
                    title: pickText(post.title, uiLang),
                    description: pickText(post.description, uiLang),
                    image: pickThumbnail(post, uiLang),
                    date: formatLocalizedDate(post.publishedAt || post.createdAt, uiLang),
                    languages: buildLanguages(post, uiLang),
                }));

                if (!active) {
                    return;
                }

                setTitle(nextTitle);
                setDescription(nextDescription);
                setBadgeText(nextBadgeText);
                setItems(orderedItems);
            } catch (loadError: any) {
                if (!active) {
                    return;
                }

                setError(loadError?.message || "Failed to load page.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            active = false;
        };
    }, [pageSlug, uiLang]);

    return (
        <PublicationDocumentsBrowser
            title={title || formatSlugLabel(pageSlug)}
            badgeText={badgeText || title || formatSlugLabel(pageSlug)}
            description={description}
            items={items}
            loading={loading}
            error={error}
        />
    );
}
