const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

export type BackendPageResult = {
    found: boolean;
    slug: string;
    endpoint?: string;
    data?: any;
};

type MenuItem = {
    id?: number;
    label?: {
        en?: string;
        km?: string;
    };
    url?: string;
    children?: MenuItem[];
};

const SLUG_ALIASES: Record<string, string[]> = {
    "": ["home"],
    home: ["home"],

    test: ["test"],

    "new-update": ["new-update", "news-and-updates"],
    "new-update/featured": ["new-update/featured", "featured"],
    "new-update/photos": ["new-update/photos", "photos", "new-update/media/photos"],
    "new-update/video": ["new-update/video", "video", "videos", "new-update/media/video"],

    "publication/laws-and-regulations": [
        "publication/laws-and-regulations",
        "publication/laws-regulations",
        "laws-and-regulations",
        "laws-regulations",
    ],
    "publication/decisions": ["publication/decisions", "decisions"],
    "publication/reports": ["publication/reports", "reports"],
    "publication/reform-tracker": ["publication/reform-tracker", "reform-tracker"],
    "reform-tracker": ["reform-tracker", "publication/reform-tracker"],
};

function getApiBase() {
    return (
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        FALLBACK_API_BASE
    ).replace(/\/$/, "");
}

function cleanPath(value?: string) {
    if (!value) return "";

    return value
        .replace(/^https?:\/\/[^/]+/i, "")
        .split("?")[0]
        .split("#")[0]
        .replace(/^\/|\/$/g, "");
}

function encodeSlug(slug: string) {
    return slug
        .split("/")
        .filter(Boolean)
        .map(encodeURIComponent)
        .join("/");
}

function unique(values: string[]) {
    return Array.from(new Set(values.filter(Boolean)));
}

function getSlugVariants(slug: string) {
    const cleanSlug = cleanPath(slug);
    const alias = SLUG_ALIASES[cleanSlug] ?? [];

    const variants = [cleanSlug, ...alias];

    if (cleanSlug.includes("/")) {
        const lastPart = cleanSlug.split("/").pop();
        if (lastPart) variants.push(lastPart);
    }

    return unique(variants);
}

function hasUsefulData(result: any) {
    const data = result?.data ?? result;

    return Boolean(
        data &&
            (data.page ||
                data.title ||
                data.name ||
                data.content ||
                data.blocks ||
                data.sections ||
                data.items ||
                data.posts)
    );
}

async function tryFetchJson(url: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) return null;

        const result = await response.json();

        if (!hasUsefulData(result)) return null;

        return result;
    } catch {
        return null;
    }
}

function flattenMenuItems(items: MenuItem[] = []): MenuItem[] {
    return items.flatMap((item) => [
        item,
        ...flattenMenuItems(item.children ?? []),
    ]);
}

async function findMenuItemBySlug(slug: string) {
    const apiBase = getApiBase();
    const cleanSlug = cleanPath(slug);

    try {
        const response = await fetch(`${apiBase}/menus/slug/main-nav/tree`, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) return null;

        const result = await response.json();
        const items = flattenMenuItems(result?.data?.items ?? []);

        return (
            items.find((item) => cleanPath(item.url) === cleanSlug) ??
            null
        );
    } catch {
        return null;
    }
}

function createMenuFallbackPage(item: MenuItem, slug: string) {
    const title = {
        en: item.label?.en || item.label?.km || slug,
        km: item.label?.km || item.label?.en || slug,
    };

    return {
        page: {
            title,
            description: {
                en: "This page was created from the backend menu. Please add page content in the backend.",
                km: "ទំព័រនេះត្រូវបានបង្កើតពី Backend Menu។ សូមបន្ថែម content នៅ Backend។",
            },
            blocks: [],
        },
    };
}

export async function fetchBackendPage(slug: string): Promise<BackendPageResult> {
    const cleanSlug = cleanPath(slug);
    const apiBase = getApiBase();
    const slugVariants = getSlugVariants(cleanSlug);

    for (const slugVariant of slugVariants) {
        const encodedSlug = encodeSlug(slugVariant);

        const endpoints = [
            `${apiBase}/pages/${encodedSlug}/section`,
            `${apiBase}/pages/${encodedSlug}`,
            `${apiBase}/pages/slug/${encodedSlug}`,
            `${apiBase}/sections/page/${encodedSlug}`,
        ];

        for (const endpoint of endpoints) {
            const result = await tryFetchJson(endpoint);

            if (result) {
                return {
                    found: true,
                    slug: cleanSlug,
                    endpoint,
                    data: result?.data ?? result,
                };
            }
        }
    }

    const menuItem = await findMenuItemBySlug(cleanSlug);

    if (menuItem) {
        return {
            found: true,
            slug: cleanSlug,
            endpoint: "main-nav-menu-fallback",
            data: createMenuFallbackPage(menuItem, cleanSlug),
        };
    }

    return {
        found: false,
        slug: cleanSlug,
    };
}