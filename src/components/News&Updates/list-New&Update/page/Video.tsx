"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

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
        poster?: string;
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
    posts?: MediaPost[];
    settings?: {
        categoryIds?: number[];
    } | null;
};

type PageSectionResponse = {
    data?: {
        page?: {
            title?: I18n | string | null;
        } | I18n | null;
        title?: I18n | string | null;
        blocks?: ApiBlock[];
    };
};

type CategoryPostsResponse = {
    data?: MediaPost[];
    items?: MediaPost[];
};

type VideoItem = {
    id: number;
    title: string;
    description: string;
    date: string;
    image: string;
    href: string;
};

const PAGE_SLUGS = ["video", "videos"];

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

function formatDate(value?: string | null, language: UiLang = "en"): string {
    const raw = getText(value);

    if (!raw) {
        return "";
    }

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return raw;
    }

    return new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function normalizeUrl(value?: string | null): string {
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

function isPublishedPost(post: MediaPost): boolean {
    if (post.isPublished === false) {
        return false;
    }

    if (typeof post.status === "string") {
        return post.status.toLowerCase() === "published";
    }

    return true;
}

function hasVideoBlock(post: MediaPost, language: UiLang): boolean {
    const blocks = getLocalizedBlocks(post, language);

    return blocks.some(
        (block) => block.type === "youtube" || block.type === "video"
    );
}

function getYoutubeThumbnail(url?: string): string {
    const value = getText(url);

    if (!value) {
        return "";
    }

    let videoId = "";

    if (value.includes("youtube.com/watch")) {
        try {
            const parsed = new URL(value);
            videoId = parsed.searchParams.get("v") || "";
        } catch {
            videoId = "";
        }
    } else if (value.includes("youtube.com/embed/")) {
        videoId = value.split("youtube.com/embed/")[1]?.split(/[?&]/)[0] || "";
    } else if (value.includes("youtu.be/")) {
        videoId = value.split("youtu.be/")[1]?.split(/[?&]/)[0] || "";
    }

    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
}

function getVideoThumbnail(post: MediaPost, language: UiLang): string {
    const coverImage = normalizeUrl(post.coverImage);
    if (coverImage) {
        return coverImage;
    }

    const fallbackImage = normalizeUrl(post.images?.[0]?.url);
    if (fallbackImage) {
        return fallbackImage;
    }

    const blocks = getLocalizedBlocks(post, language);

    for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];

        if (block.type === "video") {
            const poster = normalizeUrl(block.attrs?.poster);
            if (poster) {
                return poster;
            }
        }

        if (block.type === "youtube") {
            const youtubeThumbnail = getYoutubeThumbnail(block.attrs?.src);
            if (youtubeThumbnail) {
                return youtubeThumbnail;
            }
        }

        if (block.type === "image") {
            const imageUrl = normalizeUrl(block.attrs?.src);
            if (imageUrl) {
                return imageUrl;
            }
        }
    }

    return "";
}

function getPrimaryPostListBlock(blocks: ApiBlock[]): ApiBlock | null {
    const sortedBlocks = [...blocks].sort(
        (leftBlock, rightBlock) =>
            (leftBlock.orderIndex ?? 0) - (rightBlock.orderIndex ?? 0)
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

function mapVideoItems(posts: MediaPost[], language: UiLang): VideoItem[] {
    return [...posts]
        .filter((post) => isPublishedPost(post) && hasVideoBlock(post, language))
        .sort((leftPost, rightPost) => {
            const leftDate = new Date(
                leftPost.publishedAt || leftPost.createdAt || leftPost.updatedAt || ""
            ).getTime();
            const rightDate = new Date(
                rightPost.publishedAt || rightPost.createdAt || rightPost.updatedAt || ""
            ).getTime();

            return rightDate - leftDate;
        })
        .map((post) => ({
            id: post.id,
            title:
                pickText(post.title, language) ||
                (language === "kh" ? "គ្មានចំណងជើង" : "Untitled"),
            description: pickText(post.description, language),
            date: formatDate(
                post.publishedAt || post.createdAt || post.updatedAt,
                language
            ),
            image: getVideoThumbnail(post, language),
            href: buildDetailHref(post),
        }));
}

async function fetchPageSection(slug: string): Promise<PageSectionResponse | null> {
    const response = await fetch(`/api/pages/section?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as PageSectionResponse;
}

function VideoBadge({ language }: { language: UiLang }) {
    return (
        <span className="inline-flex rounded-[3px] bg-[#3F51D7] px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white">
            {language === "kh" ? "វីដេអូ" : "VIDEO"}
        </span>
    );
}

function NewsImage({
    src,
    alt,
    language,
    className = "",
}: {
    src?: string;
    alt: string;
    language: UiLang;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const imageSrc = failed ? "" : src || "";

    return (
        <div className={`relative overflow-hidden bg-[#ECECEC] ${className}`}>
            {imageSrc ? (
                <>
                    <Image
                        src={imageSrc}
                        alt={alt}
                        fill
                        className="object-cover"
                        onError={() => setFailed(true)}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#0B2C5F] shadow-md">
                            <Play className="ml-1 h-6 w-6 fill-current" />
                        </div>
                    </div>
                </>
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
                                    រូបភាពវីដេអូ
                                    <br />
                                    ឬ
                                    <br />
                                    ស្លាកសញ្ញាព័ត៌មាន
                                </>
                            ) : (
                                <>
                                    video image
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
                <div className="mt-4 h-[4px] w-[150px] bg-[#F59E0B]" />
            </div>

            <div className="flex items-center gap-2 self-start rounded-md border border-[#D1D5DB] bg-white p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${
                        view === "list"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                    }`}
                >
                    <List className="h-4 w-4" />
                    {language === "kh" ? "បញ្ជី" : "List"}
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${
                        view === "grid"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                    }`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    {language === "kh" ? "ក្រឡា" : "Grid"}
                </button>
            </div>
        </div>
    );
}

function ListCard({
    item,
    language,
}: {
    item: VideoItem;
    language: UiLang;
}) {
    return (
        <article className="grid grid-cols-1 gap-6 border-b border-[#D9DEE7] py-7 md:grid-cols-[136px_minmax(0,1fr)]">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    language={language}
                    className="h-[164px] w-full md:w-[136px]"
                />
            </Link>

            <div className="min-w-0">
                {/*<VideoBadge language={language} />*/}

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
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {language === "kh" ? "មើលលម្អិត" : "View details"}
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
    item: VideoItem;
    language: UiLang;
}) {
    return (
        <article className="overflow-hidden rounded-md border border-[#D9DEE7] bg-white transition hover:shadow-md">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    language={language}
                    className="h-[240px] w-full"
                />
            </Link>

            <div className="p-5">
                {/*<VideoBadge language={language} />*/}

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
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {language === "kh" ? "មើលលម្អិត" : "View details"}
                </Link>

                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date || (language === "kh" ? "មិនមានកាលបរិច្ឆេទ" : "No date")}</span>
                </div>
            </div>
        </article>
    );
}

export default function VideoPage() {
    const { language } = useLanguage();
    const uiLanguage = language as UiLang;
    const [view, setView] = useState<ViewMode>("list");
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadVideoPage() {
            try {
                setLoading(true);
                setError("");

                let pageJson: PageSectionResponse | null = null;

                for (let index = 0; index < PAGE_SLUGS.length; index += 1) {
                    pageJson = await fetchPageSection(PAGE_SLUGS[index]);

                    if (pageJson?.data) {
                        break;
                    }
                }

                if (!pageJson?.data) {
                    throw new Error("Video page not found");
                }

                const blocks = Array.isArray(pageJson.data.blocks)
                    ? pageJson.data.blocks
                    : [];
                const primaryBlock = getPrimaryPostListBlock(blocks);
                const pageData = pageJson.data.page;
                const categoryIds = Array.isArray(primaryBlock?.settings?.categoryIds)
                    ? primaryBlock.settings.categoryIds.filter(
                          (categoryId): categoryId is number =>
                              typeof categoryId === "number"
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
                    pickText(pageJson.data.title, uiLanguage) ||
                    pickText(primaryBlock?.title, uiLanguage) ||
                    (uiLanguage === "kh" ? "វីដេអូ" : "Video");

                const videoItems = mapVideoItems(posts, uiLanguage);

                if (!active) {
                    return;
                }

                setTitle(nextTitle);
                setItems(videoItems);
            } catch (loadError) {
                console.error(loadError);

                if (!active) {
                    return;
                }

                setError(
                    uiLanguage === "kh"
                        ? "មិនអាចទាញយកទំព័រវីដេអូបានទេ។"
                        : "Failed to load the videos page."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadVideoPage();

        return () => {
            active = false;
        };
    }, [uiLanguage]);

    return (
        <main className="min-h-screen">
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-4 lg:px-4">
                <Header
                    language={uiLanguage}
                    title={title || (uiLanguage === "kh" ? "វីដេអូ" : "Video")}
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
                            ? "មិនមានវីដេអូទេ។"
                            : "No videos found."}
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
