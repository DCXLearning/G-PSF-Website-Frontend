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
    document?: string | null;
    coverImage?: string | null;
    documentThumbnail?: string | null;
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
    enabled?: boolean;
    posts?: ApiPost[];
};

type ApiResponse = {
    data?: {
        blocks?: ApiBlock[];
    };
};

type SectionPostsResponse = {
    data?: ApiPost[];
    items?: ApiPost[];
};

const WG_BLOCK_ID = 28;

function pickText(value: I18n | string | null | undefined, lang: UiLang): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (!value) {
        return "";
    }

    if (lang === "kh") {
        return value.km?.trim() || value.en?.trim() || "";
    }

    return value.en?.trim() || value.km?.trim() || "";
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

function pickWGBlock(json: ApiResponse): ApiBlock | null {
    const blocks = Array.isArray(json.data?.blocks) ? json.data.blocks : [];

    return (
        blocks.find((block) => block.id === WG_BLOCK_ID) ||
        blocks.find((block) => block.enabled !== false && block.type === "post_list") ||
        null
    );
}

function getPostsFromResponse(response: SectionPostsResponse): ApiPost[] {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    return [];
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

function buildLanguages(post: ApiPost, lang: UiLang): PublicationDocumentLanguage[] {
    const englishFile = buildDownloadHref(post.documents?.en?.url);
    const khmerFile = buildDownloadHref(post.documents?.km?.url);
    const genericFile = buildDownloadHref(post.document);

    if (englishFile || khmerFile) {
        return [
            khmerFile
                ? {
                      label: getContentLanguageLabel("km", lang),
                      href: khmerFile,
                  }
                : null,
            englishFile
                ? {
                      label: getContentLanguageLabel("en", lang),
                      href: englishFile,
                  }
                : null,
        ].filter(Boolean) as PublicationDocumentLanguage[];
    }

    if (genericFile) {
        return [
            {
                label: lang === "kh" ? "ឯកសារ" : "Document",
                href: genericFile,
            },
        ];
    }

    return [];
}

function pickThumbnail(post: ApiPost, lang: UiLang) {
    return (
        normalizeFileUrl(post.documents?.[lang === "kh" ? "km" : "en"]?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.en?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.km?.thumbnailUrl) ||
        normalizeFileUrl(post.documentThumbnail) ||
        normalizeFileUrl(post.coverImage) ||
        null
    );
}

export default function WGOutputsViewMore() {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [items, setItems] = useState<PublicationDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const [resourceResponse, sectionPostsResponse] = await Promise.all([
                    fetch("/api/resources-page/section", {
                        cache: "no-store",
                    }),
                    fetch(`/api/sections/${WG_BLOCK_ID}/posts`, {
                        cache: "no-store",
                    }),
                ]);

                if (!resourceResponse.ok) {
                    throw new Error(`API error ${resourceResponse.status}`);
                }

                const json = (await resourceResponse.json()) as ApiResponse;
                const block = pickWGBlock(json);
                const sectionPostsJson = sectionPostsResponse.ok
                    ? ((await sectionPostsResponse.json()) as SectionPostsResponse)
                    : null;
                const sectionPosts = sectionPostsJson
                    ? getPostsFromResponse(sectionPostsJson)
                    : [];
                const posts =
                    sectionPosts.length > 0
                        ? sectionPosts
                        : Array.isArray(block?.posts)
                          ? block.posts
                          : [];

                const mappedItems = posts
                    .filter((post) => isPublishedPost(post))
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
                        badgeText: pickText(post.category?.name, uiLang),
                        title:
                            pickText(post.title, uiLang) ||
                            (uiLang === "kh" ? "គ្មានចំណងជើង" : "Untitled"),
                        description: pickText(post.description, uiLang),
                        image: pickThumbnail(post, uiLang),
                        date: formatLocalizedDate(post.publishedAt || post.createdAt, uiLang),
                        languages: buildLanguages(post, uiLang),
                    }));

                if (!active) {
                    return;
                }

                setTitle(
                    pickText(block?.title, uiLang) ||
                        (uiLang === "kh" ? "លទ្ធផលក្រុមការងារ" : "WG Outputs")
                );
                setDescription(pickText(block?.description, uiLang));
                setItems(mappedItems);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                const message =
                    loadError instanceof Error
                        ? loadError.message
                        : "Failed to load WG Outputs.";

                setError(message);
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
    }, [uiLang]);

    return (
        <PublicationDocumentsBrowser
            title={title || (uiLang === "kh" ? "លទ្ធផលក្រុមការងារ" : "WG Outputs")}
            badgeText={uiLang === "kh" ? "លទ្ធផលក្រុមការងារ" : "WG Outputs"}
            description={description}
            items={items}
            loading={loading}
            error={error}
        />
    );
}
