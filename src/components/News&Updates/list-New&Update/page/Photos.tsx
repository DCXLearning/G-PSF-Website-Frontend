"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";
import { FaArrowRight } from "react-icons/fa";

type UiLang = "en" | "kh";
type ViewMode = "list" | "grid";

type I18n = {
    en?: string;
    km?: string;
    kh?: string;
};

type ContentBlock = {
    type?: string;
    attrs?: {
        src?: string;
    };
};

type MediaPost = {
    id: number;
    slug?: string | null;
    title?: I18n | string | null;
    description?: I18n | string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: string | null;
    isPublished?: boolean;
    coverImage?: string | null;
    images?: Array<{ url?: string | null }> | null;
    content?: {
        en?: {
            content?: ContentBlock[];
        } | null;
        km?: {
            content?: ContentBlock[];
        } | null;
        kh?: {
            content?: ContentBlock[];
        } | null;
    } | null;
};

type ApiBlock = {
    type?: string;
    orderIndex?: number;
    enabled?: boolean;
    title?: I18n | string | null;
    description?: I18n | string | null;
    settings?: {
        categoryIds?: number[];
    } | null;
    posts?: MediaPost[];
};

type PageSectionResponse = {
    data?: {
        page?: {
            title?: I18n | string | null;
            description?: I18n | string | null;
        } | I18n | null;
        title?: I18n | string | null;
        description?: I18n | string | null;
        blocks?: ApiBlock[];
    };
};

type CategoryPostsResponse = {
    data?: MediaPost[];
    items?: MediaPost[];
};

type PhotoItem = {
    id: number;
    title: string;
    description: string;
    date: string;
    image: string;
    extraImageCount: number;
    href: string;
};

const PAGE_SLUG = "photos";

function getText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickText(value: I18n | string | null | undefined, language: UiLang): string {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return getText(value);
    }

    if (language === "kh") {
        return getText(value.km) || getText(value.kh) || getText(value.en);
    }

    return getText(value.en) || getText(value.km) || getText(value.kh);
}

function normalizeImageUrl(value?: string | null): string {
    const url = getText(value);

    if (url.startsWith("/https://") || url.startsWith("/http://")) {
        return url.slice(1);
    }

    return url;
}

function getLocalizedBlocks(post: MediaPost, language: UiLang): ContentBlock[] {
    if (language === "kh") {
        return (
            post.content?.km?.content ||
            post.content?.kh?.content ||
            post.content?.en?.content ||
            []
        );
    }

    return (
        post.content?.en?.content ||
        post.content?.km?.content ||
        post.content?.kh?.content ||
        []
    );
}

function getPhotoSources(post: MediaPost, language: UiLang): string[] {
    const urls: string[] = [];

    const coverImage = normalizeImageUrl(post.coverImage);
    if (coverImage) {
        urls.push(coverImage);
    }

    const fallbackImage = normalizeImageUrl(post.images?.[0]?.url);
    if (fallbackImage) {
        urls.push(fallbackImage);
    }

    const blocks = getLocalizedBlocks(post, language);
    for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];
        const imageUrl =
            block.type === "image" ? normalizeImageUrl(block.attrs?.src) : "";

        if (imageUrl) {
            urls.push(imageUrl);
        }
    }

    return [...new Set(urls)];
}

function isPublishedPost(post: MediaPost): boolean {
    if (post.isPublished === false) {
        return false;
    }

    if (typeof post.status === "string") {
        return post.status.toLowerCase() === "published";
    }

    return true;
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
        null
    );
}

function getPostsFromResponse(response: CategoryPostsResponse): MediaPost[] {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    return [];
}

function buildDetailHref(post: MediaPost): string {
    if (post.slug?.trim()) {
        return `/new-update/view-detail?slug=${encodeURIComponent(post.slug.trim())}&id=${encodeURIComponent(String(post.id))}`;
    }

    return `/new-update/view-detail?id=${encodeURIComponent(String(post.id))}`;
}

function mapPhotoItems(posts: MediaPost[], language: UiLang): PhotoItem[] {
    return [...posts]
        .sort((leftPost, rightPost) => {
            const leftDate = new Date(
                leftPost.publishedAt || leftPost.createdAt || leftPost.updatedAt || ""
            ).getTime();
            const rightDate = new Date(
                rightPost.publishedAt || rightPost.createdAt || rightPost.updatedAt || ""
            ).getTime();

            return rightDate - leftDate;
        })
        .filter((post) => isPublishedPost(post))
        .map((post) => {
            const photoSources = getPhotoSources(post, language);

            return {
                id: post.id,
                title:
                    pickText(post.title, language) ||
                    (language === "kh" ? "គ្មានចំណងជើង" : "Untitled"),
                description: pickText(post.description, language),
                date: formatLocalizedDate(
                    post.publishedAt || post.createdAt || post.updatedAt,
                    language
                ),
                image: photoSources[0] || "",
                extraImageCount: Math.max(photoSources.length - 1, 0),
                href: buildDetailHref(post),
            };
        })
        .filter((post) => post.image);
}

function NewsImage({
    src,
    alt,
    language,
    extraImageCount = 0,
    className = "",
}: {
    src?: string;
    alt: string;
    language: UiLang;
    extraImageCount?: number;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const imageSrc = failed ? "" : src || "";

    return (
        <div className={`relative overflow-hidden bg-[#ECECEC] ${className}`}>
            {imageSrc ? (
                <Image
                    src={imageSrc}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ECECEC]">
                    <div className="flex h-[218px] w-[156px] flex-col items-center justify-center bg-[#F6F6F6]">
                        <div className="flex h-[70px] w-[70px] items-center justify-center bg-[#D9D9D9]">
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-sm bg-[#BBBBBB]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.7"
                                    className="h-7 w-7"
                                >
                                    <circle cx="8.5" cy="8.5" r="1.8" fill="white" stroke="none" />
                                    <path d="M4 17l4.5-4.5a1 1 0 011.5.08L13 16l2.2-2.8a1 1 0 011.62.04L20 17" />
                                    <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-[12px] leading-[18px] text-[#777777]">
                            {language === "kh" ? (
                                <>
                                    រូបភាពឯកសារ
                                    <br />
                                    ឬ
                                    <br />
                                    ស្លាកសញ្ញាព័ត៌មាន
                                </>
                            ) : (
                                <>
                                    document image
                                    <br />
                                    or
                                    <br />
                                    news logo
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {imageSrc && extraImageCount > 0 ? (
                <div className="absolute right-3 top-3 rounded-md  px-2.5 py-1 text-[13px] font-bold">
                    +{extraImageCount}
                </div>
            ) : null}
        </div>
    );
}

function Header({
    language,
    title,
    view,
    setView,
}: {
    language: UiLang;
    title: string;
    view: ViewMode;
    setView: (value: ViewMode) => void;
}) {
    return (
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="mt-1 text-[44px] font-extrabold leading-none text-[#0B2C5F]">
                    {title}
                </h1>
                <div className="mt-4 h-[4px] w-[150px] bg-orange-500" />
            </div>

            <div className="flex w-full max-w-sm items-center gap-1 self-start rounded-md border border-[#D1D5DB] bg-white p-1 shadow-sm sm:w-auto sm:max-w-none">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-semibold transition sm:flex-none sm:px-3 ${view === "list"
                        ? "bg-[#23395D] text-white"
                        : "text-[#475569] hover:bg-slate-100"
                        }`}
                >
                    <List className="h-3.5 w-3.5" />
                    <span className={language === "kh" ? "khmer-font" : ""}>
                        {language === "kh" ? "បញ្ជី" : "List"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-semibold transition sm:flex-none sm:px-3 ${view === "grid"
                        ? "bg-[#23395D] text-white"
                        : "text-[#475569] hover:bg-slate-100"
                        }`}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className={language === "kh" ? "khmer-font" : ""}>
                        {language === "kh" ? "ក្រឡា" : "Grid"}
                    </span>
                </button>
            </div>
        </div>
    );
}

function ListCard({
    item,
    language,
}: {
    item: PhotoItem;
    language: UiLang;
}) {
    return (
        <article className="grid grid-cols-1 gap-6 border-b border-[#D9DEE7] py-7 md:grid-cols-[136px_minmax(0,1fr)]">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    language={language}
                    extraImageCount={item.extraImageCount}
                    className="h-[164px] w-full md:w-[136px]"
                />
            </Link>

            <div className="min-w-0">
                <h2 className="mt-3 text-[18px] font-extrabold leading-[1.5] text-[#0B2C5F] md:text-[20px]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-[#64748B]">
                    {item.description ||
                        (language === "kh"
                            ? "មិនមានការពិពណ៌នា។"
                            : "No description available.")}
                </p>

                <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-orange-600 underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {language === "kh" ? "អានបន្ថែម" : "View details"}
                    <FaArrowRight className="text-[13px]" />
                </Link>

                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date || (language === "kh" ? "មិនមានកាលបរិច្ឆេទ" : "No date")}</span>
                </div>
            </div>
        </article>
    );
}

function GridCard({
    item,
    language,
}: {
    item: PhotoItem;
    language: UiLang;
}) {
    return (
        <article className="overflow-hidden rounded-md border border-[#D9DEE7] bg-white transition hover:shadow-md">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    language={language}
                    extraImageCount={item.extraImageCount}
                    className="h-[240px] w-full"
                />
            </Link>

            <div className="p-5">
                <h2 className="mt-3 line-clamp-2 text-[20px] font-extrabold leading-snug text-[#0B2C5F]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#64748B]">
                    {item.description ||
                        (language === "kh"
                            ? "មិនមានការពិពណ៌នា។"
                            : "No description available.")}
                </p>

                <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-orange-600 underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {language === "kh" ? "អានបន្ថែម" : "View details"}
                    <FaArrowRight className="text-[13px]" />
                </Link>

                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date || (language === "kh" ? "មិនមានកាលបរិច្ឆេទ" : "No date")}</span>
                </div>
            </div>
        </article>
    );
}

export default function PhotosPage() {
    const { language } = useLanguage();
    const uiLanguage = language as UiLang;
    const [view, setView] = useState<ViewMode>("list");
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<PhotoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadPhotosPage() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/pages/section?slug=${encodeURIComponent(PAGE_SLUG)}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(`API error ${response.status}`);
                }

                const json = (await response.json()) as PageSectionResponse;
                const blocks = Array.isArray(json.data?.blocks) ? json.data.blocks : [];
                const primaryBlock = getPrimaryPostListBlock(blocks);
                const pageData = json.data?.page;
                const categoryIds = Array.isArray(primaryBlock?.settings?.categoryIds)
                    ? primaryBlock.settings.categoryIds.filter(
                        (categoryId): categoryId is number => typeof categoryId === "number"
                    )
                    : [];

                let posts = Array.isArray(primaryBlock?.posts) ? primaryBlock.posts : [];

                if (categoryIds.length > 0) {
                    const categoryResponses = await Promise.all(
                        categoryIds.map((categoryId) =>
                            fetch(`/api/posts/category/${categoryId}`, {
                                cache: "no-store",
                            })
                        )
                    );

                    const mergedPosts: MediaPost[] = [];
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
                    pickText(
                        (pageData as { title?: I18n | string | null } | undefined)?.title,
                        uiLanguage
                    ) ||
                    pickText(pageData as I18n | string | null | undefined, uiLanguage) ||
                    pickText(json.data?.title, uiLanguage) ||
                    pickText(primaryBlock?.title, uiLanguage) ||
                    (uiLanguage === "kh" ? "រូបថត" : "Photos");

                const photoItems = mapPhotoItems(posts, uiLanguage);

                if (!active) {
                    return;
                }

                setTitle(nextTitle);
                setItems(photoItems);
            } catch (loadError) {
                console.error(loadError);

                if (!active) {
                    return;
                }

                setError(
                    uiLanguage === "kh"
                        ? "មិនអាចទាញយកទំព័ររូបថតបានទេ។"
                        : "Failed to load the photos page."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPhotosPage();

        return () => {
            active = false;
        };
    }, [uiLanguage]);

    return (
        <main className="min-h-screen">
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-4 lg:px-4">
                <Header
                    language={uiLanguage}
                    title={title || (uiLanguage === "kh" ? "រូបថត" : "Photos")}
                    view={view}
                    setView={setView}
                />

                {loading ? (
                    <div className="rounded-md border border-[#D9DEE7] bg-white px-6 py-10 text-center text-[#64748B]">
                        {uiLanguage === "kh" ? "កំពុងផ្ទុក..." : "Loading..."}
                    </div>
                ) : null}

                {!loading && error ? (
                    <div className="rounded-md border border-[#D9DEE7] bg-white px-6 py-10 text-center text-red-600">
                        {error}
                    </div>
                ) : null}

                {!loading && !error && items.length === 0 ? (
                    <div className="rounded-md border border-[#D9DEE7] bg-white px-6 py-10 text-center text-[#64748B]">
                        {uiLanguage === "kh"
                            ? "មិនមានអាល់ប៊ុមរូបថតទេ។"
                            : "No photo albums found."}
                    </div>
                ) : null}

                {!loading && !error && items.length > 0 ? (
                    view === "list" ? (
                        <div>
                            {items.map((item) => (
                                <ListCard key={item.id} item={item} language={uiLanguage} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {items.map((item) => (
                                <GridCard key={item.id} item={item} language={uiLanguage} />
                            ))}
                        </div>
                    )
                ) : null}
            </section>
        </main>
    );
}
