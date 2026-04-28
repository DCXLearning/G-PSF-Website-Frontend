import SearchNewsUpdates, {
    type SearchNewsItem,
} from "@/components/Search/SearchNewsUpdates";
import { API_URL } from "@/config/api";
import { formatLocalizedDate } from "@/utils/localizedDate";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

type I18nText = {
    en?: string;
    km?: string;
};

type CmsPost = {
    id?: number;
    slug?: string | null;
    title?: I18nText;
    description?: I18nText | null;
    status?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    coverImage?: string | null;
    images?: Array<{
        url?: string;
    }>;
};

type CmsTreeResponse = {
    data?: unknown;
};

type CollectedPost = {
    post: CmsPost;
    blockType: string;
};

const NEWS_PAGE_SLUG = "news-and-updates";
const ALLOWED_BLOCK_TYPES = new Set(["announcement", "post_list"]);

function cleanText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function buildI18nValue(value?: I18nText | null): { en: string; kh: string } {
    const en = cleanText(value?.en);
    const km = cleanText(value?.km);

    return {
        en: en || km,
        kh: km || en,
    };
}

function buildDetailHref(post: CmsPost): string {
    const slug = cleanText(post.slug);

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function pickImage(post: CmsPost): string {
    return cleanText(post.coverImage) || cleanText(post.images?.[0]?.url);
}

function buildLanguages(post: CmsPost): string[] {
    const languages: string[] = [];
    const titleEn = cleanText(post.title?.en);
    const titleKm = cleanText(post.title?.km);
    const descriptionEn = cleanText(post.description?.en);
    const descriptionKm = cleanText(post.description?.km);

    if (titleKm || descriptionKm) {
        languages.push("Khmer");
    }

    if (titleEn || descriptionEn) {
        languages.push("English");
    }

    if (languages.length === 0) {
        languages.push("English");
    }

    return languages;
}

function parseDateValue(post: CmsPost): number {
    const raw =
        cleanText(post.publishedAt) ||
        cleanText(post.createdAt) ||
        cleanText(post.updatedAt);

    if (!raw) {
        return 0;
    }

    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getStringValue(value: unknown): string {
    return typeof value === "string" ? cleanText(value) : "";
}

function getBlockType(node: Record<string, unknown>, fallbackType = ""): string {
    const section = isRecord(node.section) ? node.section : null;
    const sectionBlockType = section ? getStringValue(section.blockType) : "";
    const blockType = getStringValue(node.blockType);
    const type = getStringValue(node.type);

    return sectionBlockType || blockType || type || fallbackType;
}

function looksLikePost(node: Record<string, unknown>): boolean {
    return (
        "title" in node &&
        !Array.isArray(node.posts) &&
        !Array.isArray(node.blocks) &&
        !Array.isArray(node.children)
    );
}

function collectAllowedPosts(
    node: unknown,
    bucket: CollectedPost[],
    fallbackType = ""
) {
    if (Array.isArray(node)) {
        for (let index = 0; index < node.length; index += 1) {
            collectAllowedPosts(node[index], bucket, fallbackType);
        }

        return;
    }

    if (!isRecord(node)) {
        return;
    }

    const nodeType = getBlockType(node, fallbackType);

    // When a block is allowed, collect each post under that block.
    if (Array.isArray(node.posts)) {
        collectAllowedPosts(node.posts, bucket, nodeType);
    }

    // Some tree responses can already contain post objects directly.
    if (looksLikePost(node) && ALLOWED_BLOCK_TYPES.has(nodeType)) {
        bucket.push({
            post: node as CmsPost,
            blockType: nodeType,
        });
    }

    const childKeys = ["blocks", "children", "items", "sections"];

    for (let index = 0; index < childKeys.length; index += 1) {
        const key = childKeys[index];
        const value = node[key];

        if (Array.isArray(value)) {
            collectAllowedPosts(value, bucket, nodeType);
        }
    }
}

function mapSearchItems(response: CmsTreeResponse): SearchNewsItem[] {
    const collectedPosts: CollectedPost[] = [];
    collectAllowedPosts(response.data, collectedPosts);
    collectedPosts.sort((a, b) => parseDateValue(b.post) - parseDateValue(a.post));

    const items: SearchNewsItem[] = [];
    const seenKeys = new Set<string>();

    for (let index = 0; index < collectedPosts.length; index += 1) {
        const { post, blockType } = collectedPosts[index];

        if (cleanText(post.status) && cleanText(post.status) !== "published") {
            continue;
        }

        const title = buildI18nValue(post.title);

        if (!title.en && !title.kh) {
            continue;
        }

        const uniqueKey = `${post.id ?? 0}:${cleanText(post.slug)}`;

        if (seenKeys.has(uniqueKey)) {
            continue;
        }

        seenKeys.add(uniqueKey);

        items.push({
            id: post.id ?? index + 1,
            category: blockType === "announcement" ? "announcement" : "news",
            title,
            description: buildI18nValue(post.description),
            date:
                formatLocalizedDate(post.publishedAt) ||
                formatLocalizedDate(post.createdAt) ||
                formatLocalizedDate(post.updatedAt),
            href: buildDetailHref(post),
            image: pickImage(post),
            languages: buildLanguages(post),
        });
    }

    // The posts were already sorted before mapping.
    return items;
}

async function getSearchItems(): Promise<SearchNewsItem[]> {
    if (!API_URL) {
        return [];
    }

    const response = await fetch(`${API_URL}/pages/${NEWS_PAGE_SLUG}/tree`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return [];
    }

    const json = (await response.json()) as CmsTreeResponse;
    return mapSearchItems(json);
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.q ?? "";
    const items = await getSearchItems();

    return <SearchNewsUpdates query={query} items={items} />;
}
