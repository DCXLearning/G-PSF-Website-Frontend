export type Lang = "en" | "kh";
export type ApiLang = "en" | "km";
export type JsonObject = Record<string, unknown>;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

export function isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function uiToApiLang(lang: Lang): ApiLang {
    return lang === "kh" ? "km" : "en";
}

export function getText(value: unknown, lang: Lang): string {
    const apiLang = uiToApiLang(lang);

    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);

    if (!isObject(value)) return "";

    const candidates = [
        value[apiLang],
        value[lang],
        value.km,
        value.en,
        value.title,
        value.name,
    ];

    for (const candidate of candidates) {
        const text = getText(candidate, lang);

        if (text) {
            return text;
        }
    }

    return "";
}

export function getContent(item: unknown, lang: Lang): JsonObject {
    if (!isObject(item) || !isObject(item.content)) return {};

    const apiLang = uiToApiLang(lang);
    const content =
        item.content[apiLang] ??
        item.content.en ??
        item.content.km ??
        item.content;

    return isObject(content) ? content : {};
}

export function getPageInfo(data: unknown): JsonObject {
    if (!isObject(data)) return {};

    if (isObject(data.data) && isObject(data.data.page)) {
        return data.data.page;
    }

    if (isObject(data.page)) {
        return data.page;
    }

    return data;
}

function getContentRoot(data: unknown): JsonObject {
    if (!isObject(data)) return {};

    if (isObject(data.data)) {
        return data.data;
    }

    return data;
}

export function getPageTitle(data: unknown, lang: Lang, slug: string) {
    const pageInfo = getPageInfo(data);

    return (
        getText(pageInfo.title, lang) ||
        getText(pageInfo.name, lang) ||
        getText(pageInfo.pageTitle, lang) ||
        slug
            .split("/")
            .filter(Boolean)
            .map((item) => item.replace(/-/g, " "))
            .join(" / ")
    );
}

export function getPageDescription(data: unknown, lang: Lang) {
    const pageInfo = getPageInfo(data);

    return (
        getText(pageInfo.description, lang) ||
        getText(pageInfo.subtitle, lang) ||
        getText(pageInfo.shortDescription, lang)
    );
}

export function getBlocks(data: unknown): JsonObject[] {
    const root = getContentRoot(data);

    if (Array.isArray(root.blocks)) return root.blocks.filter(isObject);
    if (Array.isArray(root.sections)) return root.sections.filter(isObject);

    if (Array.isArray(root.items)) {
        return [
            {
                type: "items",
                title: getPageInfo(data).title,
                posts: root.items,
            },
        ];
    }

    if (Array.isArray(root.posts)) {
        return [
            {
                type: "posts",
                title: getPageInfo(data).title,
                posts: root.posts,
            },
        ];
    }

    return [];
}

export function getBlockType(block: JsonObject) {
    const section = isObject(block.section) ? block.section : {};
    return getText(block.type, "en") || getText(block.blockType, "en") || getText(section.blockType, "en");
}

export function isBlockEnabled(block: JsonObject) {
    return block.enabled !== false;
}

export function getPosts(block: JsonObject): JsonObject[] {
    if (Array.isArray(block.posts)) return block.posts.filter(isObject);
    if (Array.isArray(block.items)) return block.items.filter(isObject);

    if (isObject(block.data)) {
        if (Array.isArray(block.data.posts)) return block.data.posts.filter(isObject);
        if (Array.isArray(block.data.items)) return block.data.items.filter(isObject);
    }

    return [];
}

export function getImageUrl(value: unknown) {
    if (typeof value !== "string" || !value.trim()) return "";

    const imageUrl = value.trim();

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }

    const apiOrigin = (
        process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE
    ).replace(/\/api\/v1\/?$/, "");

    return `${apiOrigin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export function findImage(item: JsonObject, lang: Lang) {
    const content = getContent(item, lang);
    const backgroundImages = Array.isArray(content.backgroundImages)
        ? content.backgroundImages
        : [];
    const itemBackgroundImages = Array.isArray(item.backgroundImages)
        ? item.backgroundImages
        : [];

    const image =
        item.image ||
        item.thumbnail ||
        item.cover ||
        item.coverImage ||
        item.icon ||
        item.featuredImage ||
        content.image ||
        content.thumbnail ||
        content.cover ||
        content.coverImage ||
        content.featuredImage ||
        content.backgroundImage ||
        backgroundImages[0] ||
        itemBackgroundImages[0];

    return getImageUrl(image);
}

export function getItemTitle(item: JsonObject, lang: Lang) {
    const content = getContent(item, lang);

    return (
        getText(content.title, lang) ||
        getText(item.title, lang) ||
        getText(item.name, lang) ||
        "Untitled"
    );
}

export function getItemDescription(item: JsonObject, lang: Lang) {
    const content = getContent(item, lang);

    return (
        getText(content.description, lang) ||
        getText(item.description, lang) ||
        getText(content.subtitle, lang) ||
        getText(item.subtitle, lang) ||
        getText(item.excerpt, lang)
    );
}

export function getItemHref(item: JsonObject) {
    const url = item.url || item.href || item.link;

    if (typeof url !== "string" || !url.trim()) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    return url.startsWith("/") ? url : `/${url}`;
}
