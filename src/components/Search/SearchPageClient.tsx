"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";
type SearchItemType = "news" | "resource" | "event";

type I18nText = {
    en?: string | null;
    km?: string | null;
};

type ApiFile = {
    url?: string | null;
    thumbnailUrl?: string | null;
} | null;

type ApiPost = {
    id: number;
    slug?: string | null;
    title?: I18nText | null;
    description?: I18nText | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: string | null;
    isPublished?: boolean | null;
    expiredAt?: string | null;
    coverImage?: string | null;
    documents?: {
        en?: ApiFile;
        km?: ApiFile;
    } | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    } | null;
    author?: {
        displayName?: string | null;
    } | null;
    category?: {
        id?: number | null;
        name?: I18nText | null;
    } | null;
    page?: {
        id?: number | null;
        slug?: string | null;
        title?: I18nText | null;
    } | null;
    section?: {
        pageId?: number | null;
        blockType?: string | null;
        title?: I18nText | null;
    } | null;
};

type PostsResponse = {
    success?: boolean;
    message?: string;
    data?: ApiPost[];
    items?: ApiPost[];
};

type SearchItem = {
    id: number;
    type: SearchItemType;
    title: {
        en: string;
        kh: string;
    };
    description: {
        en: string;
        kh: string;
    };
    date: string;
    href: string;
    image?: string;
    org?: {
        en: string;
        kh: string;
    };
    author?: {
        en: string;
        kh: string;
    };
    languages?: string[];
};

type SearchPageClientProps = {
    query?: string;
};

const ALLOWED_BLOCK_TYPES = new Set(["post_list", "announcement"]);

function cleanText(value?: string | null) {
    return value?.trim() ?? "";
}

function getDateValue(post: ApiPost) {
    return (
        cleanText(post.publishedAt) ||
        cleanText(post.createdAt) ||
        cleanText(post.updatedAt)
    );
}

function formatPostDate(post: ApiPost, lang: ApiLang) {
    const value = getDateValue(post);

    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function buildDetailHref(post: ApiPost) {
    const slug = cleanText(post.slug);

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function pickImage(post: ApiPost, lang: ApiLang) {
    return (
        cleanText(post.coverImage) ||
        cleanText(post.documentThumbnails?.[lang]) ||
        cleanText(post.documentThumbnails?.en) ||
        cleanText(post.documents?.[lang]?.thumbnailUrl) ||
        cleanText(post.documents?.en?.thumbnailUrl)
    );
}

function getLanguages(post: ApiPost) {
    const languages: string[] = [];

    // Show which language versions exist for the current post.
    if (
        cleanText(post.title?.en) ||
        cleanText(post.description?.en) ||
        cleanText(post.documents?.en?.url)
    ) {
        languages.push("English");
    }

    if (
        cleanText(post.title?.km) ||
        cleanText(post.description?.km) ||
        cleanText(post.documents?.km?.url)
    ) {
        languages.push("Khmer");
    }

    return languages;
}

function isPostVisible(post: ApiPost) {
    if (post.isPublished !== true && post.status !== "published") {
        return false;
    }

    if (post.expiredAt) {
        const expiredTime = new Date(post.expiredAt).getTime();

        if (!Number.isNaN(expiredTime) && expiredTime < Date.now()) {
            return false;
        }
    }

    return ALLOWED_BLOCK_TYPES.has(cleanText(post.section?.blockType));
}

function getItemType(post: ApiPost): SearchItemType {
    const pageSlug = cleanText(post.page?.slug);
    const pageId = post.page?.id ?? post.section?.pageId ?? 0;
    const sectionTitle = cleanText(post.section?.title?.en).toLowerCase();
    const categoryId = post.category?.id ?? 0;
    const blockType = cleanText(post.section?.blockType);

    if (pageSlug === "resources" || pageId === 12) {
        return "resource";
    }

    if (
        pageSlug === "working-groups" ||
        pageId === 29 ||
        categoryId === 8 ||
        sectionTitle === "event & meetings schedule"
    ) {
        return "event";
    }

    // Announcements and news-updates posts both stay in the news section UI.
    if (blockType === "announcement") {
        return "news";
    }

    return "news";
}

function mapPostToSearchItem(post: ApiPost): SearchItem {
    const languages = getLanguages(post);
    const orgEn =
        cleanText(post.page?.title?.en) || cleanText(post.category?.name?.en);
    const orgKh =
        cleanText(post.page?.title?.km) || cleanText(post.category?.name?.km);
    const authorName = cleanText(post.author?.displayName);

    return {
        id: post.id,
        type: getItemType(post),
        title: {
            en: cleanText(post.title?.en) || cleanText(post.title?.km) || "Untitled",
            kh: cleanText(post.title?.km) || cleanText(post.title?.en) || "គ្មានចំណងជើង",
        },
        description: {
            en: cleanText(post.description?.en) || cleanText(post.description?.km),
            kh: cleanText(post.description?.km) || cleanText(post.description?.en),
        },
        date: formatPostDate(post, "en"),
        href: buildDetailHref(post),
        image: pickImage(post, "en"),
        org:
            orgEn || orgKh
                ? {
                      en: orgEn || orgKh,
                      kh: orgKh || orgEn,
                  }
                : undefined,
        author: authorName
            ? {
                  en: authorName,
                  kh: authorName,
              }
            : undefined,
        languages: languages.length > 0 ? languages : undefined,
    };
}

function sortPosts(posts: ApiPost[]) {
    return [...posts].sort((firstPost, secondPost) => {
        const firstTime = new Date(getDateValue(firstPost) || 0).getTime();
        const secondTime = new Date(getDateValue(secondPost) || 0).getTime();
        return secondTime - firstTime;
    });
}

function getText(
    value: { en: string; kh: string } | undefined,
    lang: Lang
): string {
    if (!value) return "";
    return lang === "kh" ? value.kh : value.en;
}

function getTypeLabel(type: SearchItemType, lang: Lang) {
    const labels = {
        en: {
            news: "BLOG",
            resource: "PUBLICATION",
            event: "VIDEO",
        },
        kh: {
            news: "ប្លុក",
            resource: "ឯកសារ",
            event: "វីដេអូ",
        },
    };

    return labels[lang][type];
}

function getSectionLabel(type: SearchItemType, lang: Lang) {
    const labels = {
        en: {
            news: "New & Updates",
            resource: "Resources",
            event: "Events",
        },
        kh: {
            news: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
            resource: "ធនធាន",
            event: "ព្រឹត្តិការណ៍",
        },
    };

    return labels[lang][type];
}

function getBadgeClass(type: SearchItemType) {
    switch (type) {
        case "resource":
            return "bg-[#4a56c5]";
        case "event":
            return "bg-[#4a56c5]";
        case "news":
            return "bg-[#4a56c5]";
        default:
            return "bg-[#4a56c5]";
    }
}

function groupByType(items: SearchItem[]) {
    return {
        news: items.filter((item) => item.type === "news"),
        resource: items.filter((item) => item.type === "resource"),
        event: items.filter((item) => item.type === "event"),
    };
}

function EmptySectionMessage({ language }: { language: Lang }) {
    return (
        <div className="pt-1 pb-4">
            <p
                className={`text-[16px] leading-7 text-left text-[#64748b] ${
                    language === "kh" ? "khmer-font" : ""
                }`}
            >
                {language === "kh" ? "មិនមានមាតិកាទេ" : "No content found"}
            </p>
        </div>
    );
}

function ResourceListItem({
    item,
    language,
}: {
    item: SearchItem;
    language: Lang;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 py-8 border-b border-gray-300 last:border-b-0">
            <div className="w-full md:w-[238px] shrink-0">
                <div className="aspect-[3/4] bg-white border border-gray-200 shadow-md overflow-hidden">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={getText(item.title, language)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-3xl">
                <span
                    className={`inline-flex khmer-font px-2.5 py-1 rounded text-[10px] font-bold tracking-wide text-white ${getBadgeClass(
                        item.type
                    )}`}
                >
                    {getTypeLabel(item.type, language)}
                </span>

                <h2
                    className={`mt-3 text-2xl md:text-[22px] font-semibold text-[#0f172a] leading-snug ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {getText(item.title, language)}
                </h2>

                <p className="mt-1 text-[15px] font-bold text-[#0f172a]">
                    {item.date}
                </p>

                {(item.org || item.author) && (
                    <div
                        className={`mt-3 text-[15px] text-[#334155] leading-6 ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {item.org && <p>{getText(item.org, language)}</p>}
                        {item.author && <p>{getText(item.author, language)}</p>}
                    </div>
                )}

                <p
                    className={`mt-5 text-[17px] leading-8 text-[#64748b] ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {getText(item.description, language)}
                </p>

                <Link
                    href={item.href}
                    className={`inline-block mt-4 text-[15px] font-bold underline text-[#0f172a] hover:text-blue-700 ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {language === "kh" ? "អានបន្ថែម" : "More"}
                </Link>

                {item.languages && item.languages.length > 0 && (
                    <div className="mt-6 flex items-center flex-wrap gap-2 text-sm">
                        <span className="font-bold khmer-font text-[#343a42]">
                            {language === "kh" ? "ភាសា៖" : "Language:"}
                        </span>

                        {item.languages.map((lang) => (
                            <span
                                key={lang}
                                className="font-bold text-[#0f172a] mr-2"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPageClient({
    query = "",
}: SearchPageClientProps) {
    const { language } = useLanguage();
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const normalizedQuery = query.trim();

    const content = {
        en: {
            title: "Search Results",
            subtitle: "Find content across New & Updates, Resources, and Events.",
            resultFor: "Showing results for",
            loading: "Loading search results...",
            error: "Failed to load search results.",
        },
        kh: {
            title: "លទ្ធផលស្វែងរក",
            subtitle: "ស្វែងរកមាតិកាក្នុងព័ត៌មាន និងបច្ចុប្បន្នភាព ធនធាន និងព្រឹត្តិការណ៍។",
            resultFor: "បង្ហាញលទ្ធផលសម្រាប់",
            loading: "កំពុងទាញយកលទ្ធផលស្វែងរក...",
            error: "មិនអាចទាញយកលទ្ធផលស្វែងរកបានទេ។",
        },
    };

    useEffect(() => {
        let alive = true;

        async function loadSearchResults() {
            if (!normalizedQuery) {
                setItems([]);
                setError("");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Keep the UI the same, but replace the mock data with the real search endpoint.
                const response = await fetch(
                    `/api/posts?search=${encodeURIComponent(normalizedQuery)}&types=post_list,announcement`,
                    {
                        cache: "no-store",
                    }
                );

                const json = (await response.json()) as PostsResponse;

                if (!response.ok) {
                    throw new Error(json.message || "Failed to fetch search results");
                }

                const posts = Array.isArray(json.data)
                    ? json.data
                    : Array.isArray(json.items)
                      ? json.items
                      : [];

                const visiblePosts = sortPosts(posts).filter(isPostVisible);
                const mappedItems = visiblePosts.map(mapPostToSearchItem);

                if (!alive) {
                    return;
                }

                setItems(mappedItems);
            } catch (error) {
                if (!alive) {
                    return;
                }

                const message =
                    error instanceof Error ? error.message : "Failed to fetch search results";
                setItems([]);
                setError(message);
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        }

        loadSearchResults();

        return () => {
            alive = false;
        };
    }, [normalizedQuery]);

    const grouped = useMemo(() => groupByType(items), [items]);

    return (
        <div className="min-h-screen bg-[#eef1f5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                <div className="mb-10">
                    <h1
                        className={`text-3xl md:text-4xl font-bold text-[#0f172a] ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].title}
                    </h1>

                    <p
                        className={`mt-3 text-lg text-[#64748b] ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].subtitle}
                    </p>

                    {normalizedQuery ? (
                        <div
                            className={`mt-4 text-sm text-[#64748b] ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {content[language].resultFor}{" "}
                            <span className="font-semibold text-[#0f172a]">
                                “{query}”
                            </span>
                        </div>
                    ) : null}
                </div>

                {loading ? (
                    <div
                        className={`mb-8 text-[16px] text-[#64748b] ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].loading}
                    </div>
                ) : null}

                {error ? (
                    <div
                        className={`mb-8 text-[16px] text-red-600 ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].error}
                    </div>
                ) : null}

                <div className="bg-transparent">
                    <section className="mb-10">
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("resource", language)}
                        </h2>

                        {grouped.resource.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.resource.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>

                    <section className="mb-10">
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("event", language)}
                        </h2>

                        {grouped.event.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.event.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>

                    <section>
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("news", language)}
                        </h2>

                        {grouped.news.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.news.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
