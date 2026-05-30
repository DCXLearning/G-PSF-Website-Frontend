import type {
    DetailPageData,
    TiptapNode,
} from "@/components/News&Updates/list-New&Update/Detail_top";
import { API_URL } from "@/config/api";
import { buildAbsoluteUrl, buildPathWithQuery } from "@/utils/socialShare";
import { buildNewsDetailPath } from "@/utils/newsDetail";
import { formatLocalizedDate } from "@/utils/localizedDate";

type Locale = "en" | "km";

export type CmsPost = {
    id?: number | string;
    slug?: string | null;
    title?: { en?: string | null; km?: string | null; kh?: string | null } | string | null;
    description?: { en?: string | null; km?: string | null; kh?: string | null } | string | null;
    content?: { en?: unknown; km?: unknown; kh?: unknown } | TiptapNode | null;
    coverImage?: string | null;
    images?: Array<{ url?: string | null }>;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    category?: {
        id?: number;
        name?: {
            en?: string | null;
            km?: string | null;
            kh?: string | null;
        } | null;
    } | null;
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

type LocalizedText = {
    en?: string | null;
    km?: string | null;
    kh?: string | null;
};

export const NEWS_SITE_NAME = "G-PSF Cambodia";

export function cleanText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function normalizeSlug(value?: string | null): string {
    return cleanText(value).toLowerCase();
}

function normalizeLocale(locale?: string | null): Locale {
    const value = String(locale || "km").toLowerCase();
    return value === "en" ? "en" : "km";
}

function isLocalizedText(value: unknown): value is LocalizedText {
    return typeof value === "object" && value !== null;
}

function plainText(
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

function pickI18nText(
    text?: LocalizedText | string | null,
    locale: Locale = "km",
    fallback = ""
): string {
    return plainText(text, locale, fallback);
}

function isTiptapDoc(value: unknown): value is TiptapNode {
    if (!value || typeof value !== "object") {
        return false;
    }

    const doc = value as TiptapNode;

    return doc.type === "doc" || Array.isArray(doc.content);
}

function pickContentDoc(
    content?: CmsPost["content"],
    locale: Locale = "km"
): TiptapNode | null {
    if (!content) {
        return null;
    }

    if (isTiptapDoc(content)) {
        return content;
    }

    if (typeof content !== "object") {
        return null;
    }

    const localizedContent = content as {
        en?: unknown;
        km?: unknown;
        kh?: unknown;
    };

    if (locale === "km") {
        if (isTiptapDoc(localizedContent.km)) {
            return localizedContent.km;
        }

        if (isTiptapDoc(localizedContent.kh)) {
            return localizedContent.kh;
        }

        if (isTiptapDoc(localizedContent.en)) {
            return localizedContent.en;
        }

        return null;
    }

    if (isTiptapDoc(localizedContent.en)) {
        return localizedContent.en;
    }

    if (isTiptapDoc(localizedContent.km)) {
        return localizedContent.km;
    }

    if (isTiptapDoc(localizedContent.kh)) {
        return localizedContent.kh;
    }

    return null;
}

export function pickPrimaryImage(post: CmsPost): string {
    return cleanText(post.coverImage) || cleanText(post.images?.[0]?.url);
}

function mergePostWithFallback(
    primaryPost: CmsPost,
    fallbackPost?: CmsPost
): CmsPost {
    if (!fallbackPost) {
        return primaryPost;
    }

    return {
        ...fallbackPost,
        ...primaryPost,
        coverImage:
            cleanText(primaryPost.coverImage) ||
            cleanText(fallbackPost.coverImage),
        images: primaryPost.images?.length
            ? primaryPost.images
            : fallbackPost.images,
        description: primaryPost.description ?? fallbackPost.description,
        category: primaryPost.category ?? fallbackPost.category,
        title: primaryPost.title ?? fallbackPost.title,
        content: primaryPost.content ?? fallbackPost.content,
    };
}

export function mapPostToDetail(
    post: CmsPost,
    localeValue: string | null = "km"
): DetailPageData {
    const locale = normalizeLocale(localeValue);

    const detailPath = buildNewsDetailPath({
        id: post.id,
        slug: post.slug || undefined,
    });

    const dateValue =
        cleanText(post.publishedAt) ||
        cleanText(post.createdAt) ||
        cleanText(post.updatedAt);

    const category =
        pickI18nText(
            post.category?.name,
            locale,
            locale === "km" ? "សារព័ត៌មាន" : "Press"
        ) || (locale === "km" ? "សារព័ត៌មាន" : "Press");

    const title =
        pickI18nText(
            post.title,
            locale,
            locale === "km" ? "គ្មានចំណងជើង" : "Untitled"
        ) || (locale === "km" ? "គ្មានចំណងជើង" : "Untitled");

    const summary = pickI18nText(post.description, locale, "");

    return {
        category,
        date: formatLocalizedDate(dateValue, locale),
        dateValue,
        title,
        heroImage: pickPrimaryImage(post),
        tagLabel: category,
        tagHref: "/new-update",
        summary,
        contentDoc: pickContentDoc(post.content, locale),
        shareUrl: buildAbsoluteUrl(detailPath),
    };
}

function isSinglePostData(data: CmsResponse["data"]): data is CmsPost {
    if (!data || typeof data !== "object") {
        return false;
    }

    return "slug" in data || "title" in data || "id" in data;
}

function findPostBySlugOrId(
    response: CmsResponse,
    slug?: string,
    id?: string
): CmsPost | undefined {
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
    try {
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as CmsResponse;
    } catch {
        return null;
    }
}

async function getSectionPost(
    slug?: string,
    id?: string
): Promise<CmsPost | null> {
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

export async function getNewsCmsPost(
    slug?: string,
    id?: string
): Promise<CmsPost | null> {
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
            const byIdPost = findPostBySlugOrId(
                byIdResponse,
                undefined,
                cleanId
            );

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
            const bySlugPost = findPostBySlugOrId(
                bySlugResponse,
                cleanSlug,
                undefined
            );

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
                const fullPost = findPostBySlugOrId(
                    fullResponse,
                    undefined,
                    sectionPostId
                );

                if (fullPost) {
                    return mergePostWithFallback(fullPost, sectionPost);
                }
            }
        }

        return sectionPost;
    }

    return null;
}

export async function getNewsDetailData(
    slug?: string,
    id?: string,
    locale: string = "km"
): Promise<DetailPageData | null> {
    const post = await getNewsCmsPost(slug, id);
    return post ? mapPostToDetail(post, locale) : null;
}

export function buildMetadataDescription(detailData: DetailPageData): string {
    const summary = plainText(detailData.summary);
    const category = plainText(detailData.category);
    const title = plainText(detailData.title);

    return summary || `${category} - ${title}`;
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