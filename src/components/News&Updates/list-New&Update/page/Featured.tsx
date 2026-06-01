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

type LangText = string | { en?: string; km?: string; kh?: string };

type ContentBlock = {
    type?: string;
    attrs?: {
        src?: string;
    };
};

type PostItem = {
    id: number;
    slug?: string | null;
    title?: LangText;
    description?: LangText;
    createdAt?: string;
    publishedAt?: string | null;
    updatedAt?: string;
    coverImage?: string | null;
    images?: Array<{ url?: string }>;
    status?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    content?: {
        en?: {
            type?: string;
            content?: ContentBlock[];
        };
        km?: {
            type?: string;
            content?: ContentBlock[];
        };
        kh?: {
            type?: string;
            content?: ContentBlock[];
        };
    };
};

type ApiResponse = {
    success?: boolean;
    message?: string;
    data?: PostItem[];
    items?: PostItem[];
};

type FeaturedItem = {
    id: number;
    title: string;
    description: string;
    image?: string | null;
    date: string;
    href: string;
};

const FEATURED_POSTS_ENDPOINT = "/api/posts?pageId=6&isFeatured=true";

function normalizeLang(language: unknown): UiLang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

function getFontClass(language: UiLang) {
    return language === "kh" ? "khmer-font" : "airbnb-font";
}

function getTitleFontClass(language: UiLang) {
    return language === "kh"
        ? "title-km khmer-font"
        : "title-en airbnb-font";
}

function getMainTitleClass(language: UiLang) {
    return language === "kh"
        ? "main-title-km khmer-font"
        : "main-title-en airbnb-font";
}

function getBodyClass(language: UiLang) {
    return language === "kh"
        ? "body-km khmer-font"
        : "body-en airbnb-font";
}

function getText(value: LangText | undefined, language: UiLang): string {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (language === "kh") {
        return value.km?.trim() || value.kh?.trim() || value.en?.trim() || "";
    }

    return value.en?.trim() || value.km?.trim() || value.kh?.trim() || "";
}

function getContentBlocks(post: PostItem, language: UiLang): ContentBlock[] {
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

function getThumbnail(post: PostItem, language: UiLang): string {
    if (post.coverImage) {
        return post.coverImage;
    }

    if (post.images?.[0]?.url) {
        return post.images[0].url;
    }

    const blocks = getContentBlocks(post, language);
    const firstImage = blocks.find(
        (block) => block.type === "image" && block.attrs?.src,
    );

    return firstImage?.attrs?.src || "";
}

function buildDetailHref(post: PostItem) {
    if (post.slug?.trim()) {
        return `/new-update/view-detail?slug=${encodeURIComponent(
            post.slug.trim(),
        )}&id=${encodeURIComponent(String(post.id))}`;
    }

    return `/new-update/view-detail?id=${encodeURIComponent(String(post.id))}`;
}

function mapFeaturedPosts(posts: PostItem[], language: UiLang): FeaturedItem[] {
    const featuredPosts = posts
        .filter(
            (post) =>
                post.isFeatured === true &&
                (post.isPublished === true || post.status === "published"),
        )
        .sort((leftPost, rightPost) => {
            const leftDate = new Date(
                leftPost.publishedAt || leftPost.createdAt || leftPost.updatedAt || "",
            ).getTime();

            const rightDate = new Date(
                rightPost.publishedAt ||
                rightPost.createdAt ||
                rightPost.updatedAt ||
                "",
            ).getTime();

            return rightDate - leftDate;
        });

    return featuredPosts.map((post) => ({
        id: post.id,
        title:
            getText(post.title, language) ||
            (language === "kh" ? "គ្មានចំណងជើង" : "Untitled"),
        description: getText(post.description, language),
        image: getThumbnail(post, language),
        date: formatLocalizedDate(
            post.publishedAt || post.createdAt || post.updatedAt,
            language,
        ),
        href: buildDetailHref(post),
    }));
}

function NewsImage({
    src,
    alt,
    language,
    className = "",
}: {
    src?: string | null;
    alt: string;
    language: UiLang;
    className?: string;
}) {
    const [error, setError] = useState(false);
    const isValid = !!src && !error;
    const bodyClass = getBodyClass(language);

    return (
        <div className={`relative overflow-hidden bg-[#ECECEC] ${className}`}>
            {isValid ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={() => setError(true)}
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
                                    <circle
                                        cx="8.5"
                                        cy="8.5"
                                        r="1.8"
                                        fill="white"
                                        stroke="none"
                                    />
                                    <path d="M4 17l4.5-4.5a1 1 0 011.5.08L13 16l2.2-2.8a1 1 0 011.62.04L20 17" />
                                    <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
                                </svg>
                            </div>
                        </div>

                        <p
                            className={`mt-6 text-center text-[#777777] ${bodyClass}`}
                            style={{ fontWeight: 400 }}
                        >
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
        </div>
    );
}

function Header({
    language,
    view,
    setView,
}: {
    language: UiLang;
    view: ViewMode;
    setView: (value: ViewMode) => void;
}) {
    const fontClass = getFontClass(language);
    const titleFontClass = getTitleFontClass(language);

    return (
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className={`mt-1 text-[#0B2C5F] ${titleFontClass}`}>
                    {language === "kh" ? "ព័ត៌មានលេចធ្លោ" : "Featured News"}
                </h1>

                <div className="mt-4 h-[4px] w-[150px] bg-orange-500" />
            </div>

            <div className="flex w-full max-w-sm items-center gap-1 self-start rounded-md border border-[#D1D5DB] bg-white p-1 shadow-sm sm:w-auto sm:max-w-none">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition sm:flex-none sm:px-3 ${fontClass} ${view === "list"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                        }`}
                    style={{ fontWeight: 600 }}
                >
                    <List className="h-3.5 w-3.5" />
                    <span>{language === "kh" ? "បញ្ជី" : "List"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition sm:flex-none sm:px-3 ${fontClass} ${view === "grid"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                        }`}
                    style={{ fontWeight: 600 }}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>{language === "kh" ? "ក្រឡា" : "Grid"}</span>
                </button>
            </div>
        </div>
    );
}

function DateRow({ date, language }: { date: string; language: UiLang }) {
    const fontClass = getFontClass(language);

    return (
        <div
            className={`mt-2 flex items-center gap-2 text-[14px] text-slate-800 ${fontClass}`}
            style={{ fontWeight: 600 }}
        >
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
        </div>
    );
}

function ViewDetailButton({
    href,
    language,
}: {
    href: string;
    language: UiLang;
}) {
    const fontClass = getFontClass(language);

    return (
        <Link
            href={href}
            className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-orange-500 px-3 py-[4px] text-[12px] leading-[18px] text-orange-600 transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] ${fontClass}`}
            style={{ fontWeight: 600 }}
        >
            {language === "kh" ? "អានបន្ថែម" : "View details"}
            <FaArrowRight className="text-[12px]" />
        </Link>
    );
}

function ListCard({
    item,
    language,
}: {
    item: FeaturedItem;
    language: UiLang;
}) {
    const mainTitleClass = getMainTitleClass(language);
    const bodyClass = getBodyClass(language);

    return (
        <article className="grid grid-cols-1 gap-6 border-b border-[#D9DEE7] py-7 md:grid-cols-[136px_minmax(0,1fr)] md:items-center">
            <Link href={item.href} className="block md:self-center">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    language={language}
                    className="h-[164px] w-full md:w-[136px]"
                />
            </Link>

            <div className="flex min-w-0 flex-col justify-center">
                <h2 className={`mt-0 text-[#0B2C5F] ${mainTitleClass}`}>
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <DateRow date={item.date} language={language} />

                <p className={`mt-3 line-clamp-2 text-[#64748B] ${bodyClass}`}>
                    {item.description ||
                        (language === "kh"
                            ? "មិនមានការពិពណ៌នា។"
                            : "No description available.")}
                </p>

                <ViewDetailButton href={item.href} language={language} />
            </div>
        </article>
    );
}

function GridCard({
    item,
    language,
}: {
    item: FeaturedItem;
    language: UiLang;
}) {
    const mainTitleClass = getMainTitleClass(language);
    const bodyClass = getBodyClass(language);

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
                <h2 className={`mt-3 text-[#0B2C5F] ${mainTitleClass}`}>
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <DateRow date={item.date} language={language} />

                <p className={`mt-3 line-clamp-3 text-[#64748B] ${bodyClass}`}>
                    {item.description ||
                        (language === "kh"
                            ? "មិនមានការពិពណ៌នា។"
                            : "No description available.")}
                </p>

                <ViewDetailButton href={item.href} language={language} />
            </div>
        </article>
    );
}

export default function FeaturedPage() {
    const { language } = useLanguage();
    const uiLanguage = normalizeLang(language);
    const bodyClass = getBodyClass(uiLanguage);

    const [view, setView] = useState<ViewMode>("list");
    const [items, setItems] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const htmlLang = uiLanguage === "kh" ? "km" : "en";

        document.documentElement.lang = htmlLang;
        document.body.dataset.language = htmlLang;
    }, [uiLanguage]);

    useEffect(() => {
        let mounted = true;

        async function loadFeaturedPosts() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(FEATURED_POSTS_ENDPOINT, {
                    cache: "no-store",
                });

                const json = (await response.json()) as ApiResponse;

                if (!response.ok) {
                    throw new Error(json.message || "Failed to fetch featured posts");
                }

                const posts = Array.isArray(json.data)
                    ? json.data
                    : Array.isArray(json.items)
                        ? json.items
                        : [];

                if (mounted) {
                    setItems(posts);
                }
            } catch (fetchError) {
                console.error(fetchError);

                if (mounted) {
                    setError(
                        uiLanguage === "kh"
                            ? "មិនអាចទាញយកព័ត៌មានលេចធ្លោបានទេ។"
                            : "Failed to load featured posts.",
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadFeaturedPosts();

        return () => {
            mounted = false;
        };
    }, [uiLanguage]);

    const featuredItems = mapFeaturedPosts(items, uiLanguage);

    return (
        <main className={`min-h-screen ${bodyClass}`}>
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-4 lg:px-4">
                <Header language={uiLanguage} view={view} setView={setView} />

                {loading ? (
                    <div className={`py-8 text-center text-[#64748B] ${bodyClass}`}>
                        {uiLanguage === "kh" ? "កំពុងផ្ទុក..." : "Loading..."}
                    </div>
                ) : null}

                {!loading && error ? (
                    <div
                        className={`rounded-md border border-[#D9DEE7] bg-white px-6 py-10 text-center text-red-600 ${bodyClass}`}
                    >
                        {error}
                    </div>
                ) : null}

                {!loading && !error && featuredItems.length === 0 ? (
                    <div
                        className={`rounded-md border border-[#D9DEE7] bg-white px-6 py-10 text-center text-[#64748B] ${bodyClass}`}
                    >
                        {uiLanguage === "kh"
                            ? "មិនមានព័ត៌មានលេចធ្លោទេ។"
                            : "No featured posts found."}
                    </div>
                ) : null}

                {!loading && !error && featuredItems.length > 0 ? (
                    view === "list" ? (
                        <div>
                            {featuredItems.map((item) => (
                                <ListCard
                                    key={item.id}
                                    item={item}
                                    language={uiLanguage}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {featuredItems.map((item) => (
                                <GridCard
                                    key={item.id}
                                    item={item}
                                    language={uiLanguage}
                                />
                            ))}
                        </div>
                    )
                ) : null}
            </section>
        </main>
    );
}