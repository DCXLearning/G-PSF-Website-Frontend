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

type PageSectionResponse = {
    data?: {
        blocks?: ApiBlock[];
    };
};

type SectionPostsResponse = {
    data?: ApiPost[];
    items?: ApiPost[];
};

const CASE_STUDIES_BLOCK_ID = 24;

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

function pickCaseStudiesBlock(response: PageSectionResponse): ApiBlock | null {
    const blocks = Array.isArray(response.data?.blocks) ? response.data.blocks : [];

    return (
        blocks.find((block) => block.id === CASE_STUDIES_BLOCK_ID) ||
        blocks.find(
            (block) =>
                block.enabled !== false &&
                block.type === "post_list" &&
                pickText(block.title, "en") === "Case Studies"
        ) ||
        null
    );
}

function getPosts(response: SectionPostsResponse | null): ApiPost[] {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    return [];
}

function isPublishedPost(post: ApiPost): boolean {
    if (post.isPublished === false) {
        return false;
    }

    if (typeof post.status === "string") {
        return post.status.toLowerCase() === "published";
    }

    return true;
}

function buildLanguages(
    post: ApiPost,
    lang: UiLang
): PublicationDocumentLanguage[] {
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

function pickThumbnail(post: ApiPost, lang: UiLang): string | null {
    const currentLanguage = lang === "kh" ? "km" : "en";

    return (
        normalizeFileUrl(post.documents?.[currentLanguage]?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.en?.thumbnailUrl) ||
        normalizeFileUrl(post.documents?.km?.thumbnailUrl) ||
        normalizeFileUrl(post.documentThumbnail) ||
        normalizeFileUrl(post.coverImage) ||
        null
    );
}

function getPostTimestamp(post: ApiPost): number {
    const timestamp = new Date(post.publishedAt || post.createdAt || "").getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function CaseStudiesViewMore() {
    const { language } = useLanguage();
    const uiLang: UiLang = language === "kh" ? "kh" : "en";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [items, setItems] = useState<PublicationDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadCaseStudies() {
            try {
                setLoading(true);
                setError(null);

                const [pageResponse, postsResponse] = await Promise.all([
                    fetch("/api/newupdate-page/section", {
                        cache: "no-store",
                    }),
                    fetch(`/api/sections/${CASE_STUDIES_BLOCK_ID}/posts`, {
                        cache: "no-store",
                    }),
                ]);

                if (!pageResponse.ok && !postsResponse.ok) {
                    throw new Error("Failed to load Case Studies.");
                }

                const pageData = pageResponse.ok
                    ? ((await pageResponse.json()) as PageSectionResponse)
                    : {};
                const postsData = postsResponse.ok
                    ? ((await postsResponse.json()) as SectionPostsResponse)
                    : null;
                const block = pickCaseStudiesBlock(pageData);
                const sectionPosts = getPosts(postsData);
                const posts =
                    sectionPosts.length > 0
                        ? sectionPosts
                        : Array.isArray(block?.posts)
                          ? block.posts
                          : [];

                const nextItems = posts
                    .filter(isPublishedPost)
                    .sort(
                        (leftPost, rightPost) =>
                            getPostTimestamp(rightPost) - getPostTimestamp(leftPost)
                    )
                    .map((post) => ({
                        id: post.id,
                        badgeText: pickText(post.category?.name, uiLang),
                        title:
                            pickText(post.title, uiLang) ||
                            (uiLang === "kh" ? "គ្មានចំណងជើង" : "Untitled"),
                        description: pickText(post.description, uiLang),
                        image: pickThumbnail(post, uiLang),
                        date: formatLocalizedDate(
                            post.publishedAt || post.createdAt,
                            uiLang
                        ),
                        languages: buildLanguages(post, uiLang),
                    }));

                if (!active) {
                    return;
                }

                setTitle(
                    pickText(block?.title, uiLang) ||
                        (uiLang === "kh" ? "ករណីសិក្សា" : "Case Studies")
                );
                setDescription(pickText(block?.description, uiLang));
                setItems(nextItems);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Failed to load Case Studies."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCaseStudies();

        return () => {
            active = false;
        };
    }, [uiLang]);

    return (
        <PublicationDocumentsBrowser
            title={title || (uiLang === "kh" ? "ករណីសិក្សា" : "Case Studies")}
            badgeText={uiLang === "kh" ? "ករណីសិក្សា" : "Case Studies"}
            description={description}
            items={items}
            loading={loading}
            error={error}
        />
    );
}
