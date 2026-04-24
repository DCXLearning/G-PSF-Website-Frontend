import type { DetailPageData, TiptapNode } from "@/components/News&Updates/list-New&Update/Detail_top";
import { API_URL } from "@/config/api";
import { buildAbsoluteUrl, buildPathWithQuery } from "@/utils/socialShare";
import { buildNewsDetailPath } from "@/utils/newsDetail";
import { formatLocalizedDate } from "@/utils/localizedDate";

export type CmsPost = {
    id?: number;
    slug?: string;
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
    content?: { en?: unknown; km?: unknown };
    coverImage?: string | null;
    images?: Array<{ url?: string }>;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    category?: { name?: { en?: string; km?: string } };
};

type CmsResponse = {
    success?: boolean;
    message?: string;
    data?:
        | {
            blocks?: Array<{
                type?: string;
                enabled?: boolean;
                posts?: CmsPost[];
            }>;
        }
        | CmsPost;
};

export const NEWS_SITE_NAME = "G-PSF Cambodia";

export function cleanText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function normalizeSlug(value?: string): string {
    return cleanText(value).toLowerCase();
}

function pickI18nText(text?: { en?: string; km?: string }): string {
    return cleanText(text?.en) || cleanText(text?.km);
}

function isTiptapDoc(value: unknown): value is TiptapNode {
    if (!value || typeof value !== "object") {
        return false;
    }

    const doc = value as TiptapNode;
    return doc.type === "doc" || Array.isArray(doc.content);
}

function pickContentDoc(content?: { en?: unknown; km?: unknown }): TiptapNode | null {
    if (isTiptapDoc(content?.en)) {
        return content.en;
    }

    if (isTiptapDoc(content?.km)) {
        return content.km;
    }

    return null;
}

export function pickPrimaryImage(post: CmsPost): string {
    return cleanText(post.coverImage) || cleanText(post.images?.[0]?.url);
}

function mergePostWithFallback(primaryPost: CmsPost, fallbackPost?: CmsPost): CmsPost {
    if (!fallbackPost) {
        return primaryPost;
    }

    return {
        ...fallbackPost,
        ...primaryPost,
        coverImage: cleanText(primaryPost.coverImage) || cleanText(fallbackPost.coverImage),
        images: primaryPost.images?.length ? primaryPost.images : fallbackPost.images,
        description: primaryPost.description ?? fallbackPost.description,
        category: primaryPost.category ?? fallbackPost.category,
        title: primaryPost.title ?? fallbackPost.title,
    };
}

export function mapPostToDetail(post: CmsPost): DetailPageData {
    const detailPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug,
    });
    const dateValue = cleanText(post.publishedAt) || cleanText(post.createdAt) || cleanText(post.updatedAt);

    return {
        category: pickI18nText(post.category?.name) || "News & Updates",
        date: formatLocalizedDate(dateValue),
        dateValue,
        title: pickI18nText(post.title) || "Untitled",
        heroImage: pickPrimaryImage(post),
        tagLabel: pickI18nText(post.category?.name) || "News & Updates",
        tagHref: "/new-update",
        summary: pickI18nText(post.description),
        contentDoc: pickContentDoc(post.content),
        shareUrl: buildAbsoluteUrl(detailPath),
    };
}

function isSinglePostData(data: CmsResponse["data"]): data is CmsPost {
    if (!data || typeof data !== "object") {
        return false;
    }

    return "slug" in data || "title" in data || "id" in data;
}

function findPostBySlugOrId(response: CmsResponse, slug?: string, id?: string) {
    const data = response.data;
    const targetSlug = normalizeSlug(slug);

    if (isSinglePostData(data)) {
        if (id) {
            return String(data.id ?? "") === id ? data : undefined;
        }

        if (targetSlug) {
            return normalizeSlug(data.slug) === targetSlug ? data : undefined;
        }

        return data;
    }

    const blocks = data?.blocks ?? [];
    const postListBlock = blocks.find(
        (block) => block.enabled === true && block.type === "post_list"
    );
    const posts = postListBlock?.posts ?? [];

    if (id) {
        return posts.find((post) => String(post.id) === id);
    }

    if (targetSlug) {
        return posts.find((post) => normalizeSlug(post.slug) === targetSlug);
    }

    return undefined;
}

async function fetchCmsResponse(url: string): Promise<CmsResponse | null> {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as CmsResponse;
}

async function getSectionPost(slug?: string, id?: string): Promise<CmsPost | null> {
    if (!API_URL) {
        return null;
    }

    const cleanSlug = cleanText(slug);
    const cleanId = cleanText(id);
    const sectionQueries: Array<{ key: "id" | "slug"; value: string }> = [];

    if (cleanId) {
        sectionQueries.push({ key: "id", value: cleanId });
    }

    if (cleanSlug) {
        sectionQueries.push({ key: "slug", value: cleanSlug });
    }

    for (let index = 0; index < sectionQueries.length; index += 1) {
        const query = sectionQueries[index];
        const sectionUrl = new URL(`${API_URL}/pages/news-and-updates/section`);
        sectionUrl.searchParams.set(query.key, query.value);

        const sectionResponse = await fetchCmsResponse(sectionUrl.toString());
        if (!sectionResponse) {
            continue;
        }

        const sectionPost =
            query.key === "id"
                ? findPostBySlugOrId(sectionResponse, undefined, query.value)
                : findPostBySlugOrId(sectionResponse, query.value, undefined);

        if (sectionPost) {
            return sectionPost;
        }
    }

    return null;
}

export async function getNewsCmsPost(slug?: string, id?: string): Promise<CmsPost | null> {
    if (!API_URL) {
        return null;
    }

    const cleanSlug = cleanText(slug);
    const cleanId = cleanText(id);

    if (!cleanSlug && !cleanId) {
        return null;
    }

    const sectionPost = await getSectionPost(cleanSlug, cleanId);

    if (cleanId) {
        const byIdResponse = await fetchCmsResponse(
            `${API_URL}/posts/${encodeURIComponent(cleanId)}`
        );

        if (byIdResponse) {
            const byIdPost = findPostBySlugOrId(byIdResponse, undefined, cleanId);
            if (byIdPost) {
                return mergePostWithFallback(byIdPost, sectionPost ?? undefined);
            }
        }
    }

    if (cleanSlug) {
        const bySlugResponse = await fetchCmsResponse(
            `${API_URL}/posts/${encodeURIComponent(cleanSlug)}`
        );

        if (bySlugResponse) {
            const bySlugPost = findPostBySlugOrId(bySlugResponse, cleanSlug, undefined);
            if (bySlugPost) {
                return mergePostWithFallback(bySlugPost, sectionPost ?? undefined);
            }
        }
    }

    if (sectionPost) {
        const sectionPostId = sectionPost.id ? String(sectionPost.id) : "";

        if (sectionPostId) {
            const fullResponse = await fetchCmsResponse(
                `${API_URL}/posts/${encodeURIComponent(sectionPostId)}`
            );

            if (fullResponse) {
                const fullPost = findPostBySlugOrId(fullResponse, undefined, sectionPostId);
                if (fullPost) {
                    return mergePostWithFallback(fullPost, sectionPost);
                }
            }
        }

        return sectionPost;
    }

    return null;
}

export async function getNewsDetailData(slug?: string, id?: string): Promise<DetailPageData | null> {
    const post = await getNewsCmsPost(slug, id);
    return post ? mapPostToDetail(post) : null;
}

export function buildMetadataDescription(detailData: DetailPageData): string {
    return cleanText(detailData.summary) || `${detailData.category} - ${detailData.title}`;
}

export function buildShareImageUrl(heroImage: string): string {
    const rawImageUrl = cleanText(heroImage);

    if (!rawImageUrl) {
        return buildAbsoluteUrl("/image/gpsf_logo.png");
    }

    return buildAbsoluteUrl(
        buildPathWithQuery("/api/share-image", {
            url: buildAbsoluteUrl(rawImageUrl),
        })
    );
}
