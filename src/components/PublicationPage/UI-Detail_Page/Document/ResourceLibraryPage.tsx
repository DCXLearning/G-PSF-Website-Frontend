"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import Pagination from "@/components/Pagination";
import { formatLocalizedDate } from "@/utils/localizedDate";

type ApiLang = "en" | "km";
type DateRangeId =
    | "2021-2026"
    | "2015-2020"
    | "2009-2014"
    | "2003-2008"
    | "before-2003";

interface Resource {
    id: number;
    categoryId?: number;
    type: string;
    title: string;
    date: string;
    publishedDate: string;
    org?: string;
    author?: string;
    description: string;
    languages: ResourceLanguage[];
    image: string;
    href: string;
}

type ResourceLanguage = {
    label: string;
    href: string;
};

type I18nText = {
    en?: string;
    km?: string;
};

type CategoryItem = {
    id?: number;
    name?: I18nText;
};

type CategoryOption = {
    id: number;
    label: string;
};

type DateRangeOption = {
    id: DateRangeId;
    label: string;
};

type CategoryResponse = {
    data?: CategoryItem[];
    items?: CategoryItem[];
};

type ResourceLibraryPageProps = {
    query?: string;
};

type ResourceSectionResponse = {
    data?: {
        page?: {
            id?: number;
        } | null;
        blocks?: Array<{
            pageId?: number;
            posts?: Array<{
                page?: {
                    id?: number;
                } | null;
                section?: {
                    pageId?: number;
                } | null;
            }>;
        }>;
    };
};

const RESOURCE_LIBRARY_SECTION_TYPES = "post_list,announcement";
const RESOURCE_PLACEHOLDER_IMAGE = "https://placehold.co/400x530/white/black?text=G-PSF+Cover";
const RESOURCE_ITEMS_PER_PAGE = 6;
const DATE_FILTER_OPTIONS: DateRangeOption[] = [
    { id: "2021-2026", label: "2021-2026" },
    { id: "2015-2020", label: "2015-2020" },
    { id: "2009-2014", label: "2009-2014" },
    { id: "2003-2008", label: "2003-2008" },
    { id: "before-2003", label: "before 2003" },
];

type ApiDocumentFile = {
    url?: string;
    thumbnailUrl?: string;
} | null;

type ApiResourcePost = {
    id?: number;
    title?: I18nText;
    slug?: string | null;
    description?: I18nText | null;
    status?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    author?: {
        displayName?: string;
    } | null;
    category?: {
        id?: number;
        name?: I18nText;
    } | null;
    coverImage?: string | null;
    documentThumbnail?: string | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    } | null;
    documents?: {
        en?: ApiDocumentFile;
        km?: ApiDocumentFile;
    } | null;
};

type ResourcePostResponse = {
    data?: ApiResourcePost[];
    items?: ApiResourcePost[];
};

function getText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickText(value: I18nText | undefined, apiLang: ApiLang): string {
    if (!value) return "";

    if (apiLang === "km") {
        return getText(value.km) || getText(value.en);
    }

    return getText(value.en) || getText(value.km);
}

function mapCategoryItems(response: CategoryResponse, apiLang: ApiLang): CategoryOption[] {
    const categoryList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.items)
          ? response.items
          : [];

    const items: CategoryOption[] = [];

    for (const category of categoryList) {
        const id = category.id;
        const label = pickText(category.name, apiLang);

        if (typeof id !== "number") {
            continue;
        }

        if (!label || items.some((item) => item.id === id)) {
            continue;
        }

        items.push({ id, label });
    }

    return items;
}

function getDateYear(value?: string | null): number | null {
    const raw = getText(value);

    if (!raw) {
        return null;
    }

    const yearText = raw.match(/^(\d{4})/)?.[1];

    if (yearText) {
        return Number(yearText);
    }

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.getFullYear();
}

function pickPublishedDate(post: ApiResourcePost): string {
    // Prefer the published date, but keep created date as a fallback
    // so older items without publishedAt can still be shown and filtered.
    return getText(post.publishedAt) || getText(post.createdAt);
}

function matchesDateRange(year: number, rangeId: DateRangeId): boolean {
    switch (rangeId) {
        case "2021-2026":
            return year >= 2021 && year <= 2026;
        case "2015-2020":
            return year >= 2015 && year <= 2020;
        case "2009-2014":
            return year >= 2009 && year <= 2014;
        case "2003-2008":
            return year >= 2003 && year <= 2008;
        case "before-2003":
            return year < 2003;
        default:
            return false;
    }
}

function matchesSelectedDateRanges(
    publishedDate: string,
    selectedDateRangeIds: DateRangeId[]
): boolean {
    if (selectedDateRangeIds.length === 0) {
        return true;
    }

    const year = getDateYear(publishedDate);

    if (year === null) {
        return false;
    }

    return selectedDateRangeIds.some((rangeId) => matchesDateRange(year, rangeId));
}

function pickImage(post: ApiResourcePost, apiLang: ApiLang): string {
    if (apiLang === "km") {
        return (
            getText(post.documentThumbnails?.km) ||
            getText(post.documentThumbnails?.en) ||
            getText(post.documents?.km?.thumbnailUrl) ||
            getText(post.documents?.en?.thumbnailUrl) ||
            getText(post.documentThumbnail) ||
            getText(post.coverImage) ||
            RESOURCE_PLACEHOLDER_IMAGE
        );
    }

    return (
        getText(post.documentThumbnails?.en) ||
        getText(post.documentThumbnails?.km) ||
        getText(post.documents?.en?.thumbnailUrl) ||
        getText(post.documents?.km?.thumbnailUrl) ||
        getText(post.documentThumbnail) ||
        getText(post.coverImage) ||
        RESOURCE_PLACEHOLDER_IMAGE
    );
}

function normalizeFileUrl(value?: string | null): string {
    const url = getText(value);

    if (url.startsWith("/https://") || url.startsWith("/http://")) {
        return url.slice(1);
    }

    return url;
}

function getFileExtension(fileUrl: string): string {
    try {
        const url = new URL(fileUrl);
        const fileName = url.pathname.split("/").pop() ?? "";
        const extension = fileName.split(".").pop() ?? "";

        if (!extension || extension === fileName) {
            return "";
        }

        return `.${extension}`;
    } catch {
        return "";
    }
}

function buildFileName(title: string, languageLabel: string, fileUrl: string): string {
    const extension = getFileExtension(fileUrl);
    const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const safeLanguageLabel = languageLabel.toLowerCase();
    const baseName = [safeTitle, safeLanguageLabel].filter(Boolean).join("-");

    return `${baseName || "document"}${extension}`;
}

function buildDownloadHref(fileUrl: string, fileName: string): string {
    return `/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileName)}`;
}

function buildLanguages(post: ApiResourcePost, title: string): ResourceLanguage[] {
    const languages: ResourceLanguage[] = [];
    const englishUrl = normalizeFileUrl(post.documents?.en?.url);
    const khmerUrl = normalizeFileUrl(post.documents?.km?.url);

    if (englishUrl) {
        languages.push({
            label: "English",
            href: buildDownloadHref(englishUrl, buildFileName(title, "english", englishUrl)),
        });
    }

    if (khmerUrl) {
        languages.push({
            label: "Khmer",
            href: buildDownloadHref(khmerUrl, buildFileName(title, "khmer", khmerUrl)),
        });
    }

    return languages;
}

function buildPostHref(post: ApiResourcePost): string {
    const slug = getText(post.slug);

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function mapResourcePosts(response: ResourcePostResponse, apiLang: ApiLang): Resource[] {
    const posts = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.items)
          ? response.items
          : [];

    const resources: Resource[] = [];

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index];

        if (post.status && post.status !== "published") {
            continue;
        }

        const title = pickText(post.title, apiLang);

        if (!title) {
            continue;
        }

        const publishedDate = pickPublishedDate(post);

        resources.push({
            id: post.id ?? index + 1,
            categoryId: post.category?.id,
            type: pickText(post.category?.name, apiLang) || "Document",
            title,
            date: formatLocalizedDate(publishedDate, apiLang),
            publishedDate,
            org: pickText(post.category?.name, apiLang),
            author: getText(post.author?.displayName),
            description: pickText(post.description ?? undefined, apiLang),
            languages: buildLanguages(post, title),
            image: pickImage(post, apiLang),
            href: buildPostHref(post),
        });
    }

    return resources;
}

function getPageIdFromSection(response: ResourceSectionResponse): number | null {
    // Try the main page object first.
    const pageId = response.data?.page?.id;

    if (typeof pageId === "number") {
        return pageId;
    }

    const blocks = response.data?.blocks ?? [];

    for (const block of blocks) {
        // Some responses may keep the page id directly on the block.
        if (typeof block.pageId === "number") {
            return block.pageId;
        }

        const posts = block.posts ?? [];

        for (const post of posts) {
            // Some responses keep the page id inside the post page object.
            if (typeof post.page?.id === "number") {
                return post.page.id;
            }

            // Some responses keep the page id inside the section object.
            if (typeof post.section?.pageId === "number") {
                return post.section.pageId;
            }
        }
    }

    return null;
}

const FilterSection = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-500 w-fit pb-1 text-slate-800 tracking-tight">
            {title}
        </h3>
        <div className="space-y-3">
            {items.map((item) => (
                <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 border-gray-300 rounded text-blue-800 focus:ring-blue-500"
                    />
                    <span className="text-[15px] text-slate-700 leading-snug group-hover:text-blue-700 transition-colors">
                        {item}
                    </span>
                </label>
            ))}
        </div>
    </div>
);

function DateFilterSection({
    title,
    items,
    selectedDateRangeIds,
    onToggle,
}: {
    title: string;
    items: DateRangeOption[];
    selectedDateRangeIds: DateRangeId[];
    onToggle: (dateRangeId: DateRangeId) => void;
}) {
    return (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-500 w-fit pb-1 text-slate-800 tracking-tight">
                {title}
            </h3>

            <div className="space-y-3">
                {items.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={selectedDateRangeIds.includes(item.id)}
                            onChange={() => onToggle(item.id)}
                            className="mt-1 w-5 h-5 border-gray-300 rounded text-blue-800 focus:ring-blue-500"
                        />
                        <span className="text-[15px] text-slate-700 leading-snug group-hover:text-blue-700 transition-colors">
                            {item.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function CategoryFilterSection({
    title,
    items,
    selectedCategoryIds,
    onToggle,
}: {
    title: string;
    items: CategoryOption[];
    selectedCategoryIds: number[];
    onToggle: (categoryId: number) => void;
}) {
    return (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-500 w-fit pb-1 text-slate-800 tracking-tight">
                {title}
            </h3>

            <div className="space-y-3">
                {items.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(item.id)}
                            onChange={() => onToggle(item.id)}
                            className="mt-1 w-5 h-5 border-gray-300 rounded text-blue-800 focus:ring-blue-500"
                        />
                        <span className="text-[15px] text-slate-700 leading-snug group-hover:text-blue-700 transition-colors">
                            {item.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

const ResourceItem = ({ item }: { item: Resource }) => {
    const badgeStyles: Record<string, string> = {
        Publication: "bg-[#3f51b5]",
        Report: "bg-[#3949ab]",
        Video: "bg-[#5c6bc0]",
        Press: "bg-[#1e88e5]",
        Blog: "bg-[#3f51b5]",
        Social: "bg-[#283593]",
        Template: "bg-[#303f9f]",
        Online: "bg-[#1a237e]",
    };
    const badgeClass = badgeStyles[item.type] || "bg-[#1a237e]";

    return (
        <div className="flex flex-col md:flex-row gap-8 py-10 border-b border-gray-200 last:border-0">
            <div className="w-full md:w-44 flex-shrink-0">
                <div className="aspect-[3/4] bg-white shadow-xl overflow-hidden border border-gray-100 ring-1 ring-black/5">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex-1">
                <span
                    className={`inline-block px-3 py-0.5 text-[10px] font-bold text-white uppercase rounded ${badgeClass}`}
                >
                    {item.type}
                </span>

                <h2 className="text-2xl font-semibold text-slate-900 mt-2 leading-tight tracking-tight">
                    {item.title}
                </h2>

                <p className="text-sm font-bold text-slate-800 mt-1">{item.date}</p>


                <p className="mt-4 text-slate-600 khmer-font text-[15px] leading-relaxed line-clamp-3">
                    {item.description}
                </p>

                {/*<a href={item.href} className="mt-2 inline-block text-sm font-bold underline text-slate-900 hover:text-blue-800">*/}
                {/*    More*/}
                {/*</a>*/}

                <div className="mt-6 flex gap-4 text-xs font-bold items-baseline flex-wrap">
                    <span className="text-slate-400">Language:</span>
                    {item.languages.length > 0 ? (
                        item.languages.map((languageItem) => (
                            <a
                                key={languageItem.label}
                                href={languageItem.href}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-900 underline hover:text-blue-800"
                            >
                                {languageItem.label}
                            </a>
                        ))
                    ) : (
                        <span className="text-slate-400">No file</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ResourceLibraryPage({
    query = "",
}: ResourceLibraryPageProps) {
    const { language } = useLanguage();
    const apiLang: ApiLang = language === "kh" ? "km" : "en";
    const [pageId, setPageId] = useState<number | null>(null);
    const [isLoadingPageId, setIsLoadingPageId] = useState(true);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedDateRangeIds, setSelectedDateRangeIds] = useState<DateRangeId[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);

    const normalizedQuery = query.trim().toLowerCase();
    const isSearching = normalizedQuery.length > 0;
    const visibleResources = useMemo(() => {
        return resources.filter((resource) =>
            matchesSelectedDateRanges(resource.publishedDate, selectedDateRangeIds)
        );
    }, [resources, selectedDateRangeIds]);
    const totalPages = Math.ceil(visibleResources.length / RESOURCE_ITEMS_PER_PAGE);
    const paginatedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * RESOURCE_ITEMS_PER_PAGE;
        const endIndex = startIndex + RESOURCE_ITEMS_PER_PAGE;

        return visibleResources.slice(startIndex, endIndex);
    }, [currentPage, visibleResources]);

    useEffect(() => {
        setCurrentPage(1);
    }, [normalizedQuery, resources, selectedCategoryIds, selectedDateRangeIds]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPageId() {
            try {
                setIsLoadingPageId(true);

                // First get the real page id from the page slug response.
                const response = await fetch("/api/resources-page/section", {
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setPageId(null);
                    return;
                }

                const data = (await response.json()) as ResourceSectionResponse;
                setPageId(getPageIdFromSection(data));
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setPageId(null);
                }
            } finally {
                setIsLoadingPageId(false);
            }
        }

        loadPageId();

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCategories() {
            if (pageId === null) {
                if (!isLoadingPageId) {
                    setCategories([]);
                    setHasLoadedCategories(false);
                    setIsLoadingCategories(false);
                }

                return;
            }

            try {
                setIsLoadingCategories(true);
                setHasLoadedCategories(false);

                // Load only categories that belong to the real page id.
                const response = await fetch(`/api/categories?pageId=${pageId}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setCategories([]);
                    return;
                }

                const data = (await response.json()) as CategoryResponse;
                const categoryItems = mapCategoryItems(data, apiLang);

                // Save the categories only for the latest finished request.
                setCategories(categoryItems);
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setCategories([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingCategories(false);
                    setHasLoadedCategories(true);
                }
            }
        }

        loadCategories();

        return () => {
            controller.abort();
        };
    }, [apiLang, isLoadingPageId, pageId]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadResources() {
            if (pageId === null) {
                if (!isLoadingPageId) {
                    setResources([]);
                    setIsLoadingResources(false);
                }

                return;
            }

            if (normalizedQuery && !hasLoadedCategories) {
                // Wait until page categories finish loading before filtering search results.
                setIsLoadingResources(true);
                return;
            }

            try {
                setIsLoadingResources(true);
                if (normalizedQuery) {
                    // Search all posts, then keep only results that belong to this page's categories.
                    const response = await fetch(
                        `/api/posts?types=${encodeURIComponent(RESOURCE_LIBRARY_SECTION_TYPES)}&search=${encodeURIComponent(normalizedQuery)}`,
                        {
                            cache: "no-store",
                            signal: controller.signal,
                        }
                    );

                    if (!response.ok) {
                        setResources([]);
                        return;
                    }

                    const data = (await response.json()) as ResourcePostResponse;
                    const mappedResources = mapResourcePosts(data, apiLang);
                    const pageCategoryIds = categories.map((item) => item.id);
                    const pageResources = mappedResources.filter((item) => {
                        if (typeof item.categoryId !== "number") {
                            return false;
                        }

                        return pageCategoryIds.includes(item.categoryId);
                    });
                    const nextResources =
                        selectedCategoryIds.length === 0
                            ? pageResources
                            : pageResources.filter((item) => {
                                  if (typeof item.categoryId !== "number") {
                                      return false;
                                  }

                                  return selectedCategoryIds.includes(item.categoryId);
                              });

                    setResources(nextResources);
                    return;
                }

                if (selectedCategoryIds.length === 0) {
                    // When no category is selected, load all posts that belong to this page.
                    const response = await fetch(
                        `/api/posts?pageId=${pageId}&types=${encodeURIComponent(RESOURCE_LIBRARY_SECTION_TYPES)}`,
                        {
                            cache: "no-store",
                            signal: controller.signal,
                        }
                    );

                    if (!response.ok) {
                        setResources([]);
                        return;
                    }

                    const data = (await response.json()) as ResourcePostResponse;
                    setResources(mapResourcePosts(data, apiLang));
                    return;
                }

                const responses = await Promise.all(
                    selectedCategoryIds.map((categoryId) =>
                        fetch(
                            `/api/posts/category/${categoryId}?types=${encodeURIComponent(RESOURCE_LIBRARY_SECTION_TYPES)}`,
                            {
                                cache: "no-store",
                                signal: controller.signal,
                            }
                        )
                    )
                );

                const mergedResources: Resource[] = [];
                const seenIds = new Set<number>();

                for (let index = 0; index < responses.length; index += 1) {
                    const response = responses[index];

                    if (!response.ok) {
                        continue;
                    }

                    const data = (await response.json()) as ResourcePostResponse;
                    const categoryResources = mapResourcePosts(data, apiLang);

                    for (let itemIndex = 0; itemIndex < categoryResources.length; itemIndex += 1) {
                        const resource = categoryResources[itemIndex];

                        if (seenIds.has(resource.id)) {
                            continue;
                        }

                        seenIds.add(resource.id);
                        mergedResources.push(resource);
                    }
                }

                setResources(mergedResources);
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setResources([]);
                }
            } finally {
                setIsLoadingResources(false);
            }
        }

        loadResources();

        return () => {
            controller.abort();
        };
    }, [
        apiLang,
        categories,
        hasLoadedCategories,
        isLoadingPageId,
        normalizedQuery,
        pageId,
        selectedCategoryIds,
    ]);

    function toggleCategory(categoryId: number) {
        setSelectedCategoryIds((currentIds) => {
            if (currentIds.includes(categoryId)) {
                return currentIds.filter((id) => id !== categoryId);
            }

            return [...currentIds, categoryId];
        });
    }

    function toggleDateRange(dateRangeId: DateRangeId) {
        setSelectedDateRangeIds((currentIds) => {
            if (currentIds.includes(dateRangeId)) {
                return currentIds.filter((id) => id !== dateRangeId);
            }

            return [...currentIds, dateRangeId];
        });
    }

    function changePage(page: number) {
        if (page < 1 || page > totalPages) {
            return;
        }

        setCurrentPage(page);
    }

    return (
        <div className="bg-[#f2f4f7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className={`flex flex-col ${isSearching ? "" : "lg:flex-row"} gap-12 lg:gap-20`}>
                    <main className="flex-1">
                        <div className="divide-gray-200">
                            {isLoadingPageId || isLoadingResources ? (
                                <div className="py-10 text-slate-500 text-lg">
                                    Loading documents...
                                </div>
                            ) : visibleResources.length > 0 ? (
                                <>
                                    {paginatedResources.map((resource) => (
                                        <ResourceItem key={resource.id} item={resource} />
                                    ))}

                                    {totalPages > 1 ? (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={visibleResources.length}
                                            itemsPerPage={RESOURCE_ITEMS_PER_PAGE}
                                            onPageChange={changePage}
                                        />
                                    ) : null}
                                </>
                            ) : (
                                <div className="py-10 text-slate-500 text-lg">
                                    No documents found
                                </div>
                            )}
                        </div>
                    </main>

                    {!isSearching ? (
                        <aside className="w-full lg:w-72">
                            <div className="bg-white px-4 pt-4 pb-20">
                                <h2 className="text-2xl font-bold text-slate-800 mb-10 tracking-wide uppercase">
                                    Search Filters
                                </h2>

                                {isLoadingPageId || isLoadingCategories ? (
                                    <p className="mb-6 text-sm text-slate-500">
                                        Loading categories...
                                    </p>
                                ) : null}

                                <CategoryFilterSection
                                    title="Category"
                                    items={categories}
                                    selectedCategoryIds={selectedCategoryIds}
                                    onToggle={toggleCategory}
                                />

                                <DateFilterSection
                                    title="Dates"
                                    items={DATE_FILTER_OPTIONS}
                                    selectedDateRangeIds={selectedDateRangeIds}
                                    onToggle={toggleDateRange}
                                />

                                <FilterSection
                                    title="Working Groups"
                                    items={[
                                        "Agriculture & Agro-Industry",
                                        "Tourism",
                                        "Manufacturing & SMEs",
                                        "Law, Tax & Governance",
                                        "Banking & Financial Services",
                                        "Transportation & Infrastructure",
                                        "Export Processing & Trade Facilitation",
                                        "Industrial Relations",
                                        "Paddy-Rice",
                                        "Energy & Mineral Resources",
                                        "Education",
                                        "Health",
                                        "Construction & Real Estate",
                                        "Non-Banking Financial Services",
                                        "Digital Economy, Society & Telecommunications",
                                        "Land Administration, Security & Public Order",
                                    ]}
                                />
                            </div>
                        </aside>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
