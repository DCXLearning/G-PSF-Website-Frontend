"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";

import "swiper/css";
import "swiper/css/pagination";

type UiLang = "en" | "kh";

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

type WorkingGroupItem = {
    id?: number;
    slug?: string;
    orderIndex?: number;
    title?: LangText;
};

type WorkingGroupsResponse = {
    items?: WorkingGroupItem[];
};

type RelatedNewsItem = {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    href: string;
};

type RelateNewsWorkingGroupProps = {
    pageSlug?: string;
};

const DEFAULT_PAGE_SLUG = "agriculture-and-agro-industry";
// We build the /api/posts URL after resolving the WG id from the slug
// (see the effect below). The old `pageId=6` hardcoded News & Updates page
// returned the same posts on every WG page — that's gone.
const RELATED_NEWS_LIMIT = 9;

function normalizeLanguage(value: unknown): UiLang {
    return value === "kh" || value === "km" ? "kh" : "en";
}

function getText(value: LangText | undefined, language: UiLang): string {
    if (!value) return "";

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
    if (post.coverImage) return post.coverImage;
    if (post.images?.[0]?.url) return post.images[0].url;

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

function mapRelatedNews(posts: PostItem[], language: UiLang): RelatedNewsItem[] {
    return posts
        .filter((post) => post.isPublished === true || post.status === "published")
        .sort((a, b) => {
            const dateA = new Date(
                a.publishedAt || a.createdAt || a.updatedAt || "",
            ).getTime();

            const dateB = new Date(
                b.publishedAt || b.createdAt || b.updatedAt || "",
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 9)
        .map((post) => ({
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
    bodyFontClass,
}: {
    src?: string | null;
    alt: string;
    language: UiLang;
    bodyFontClass: string;
}) {
    const [error, setError] = useState(false);
    const isValid = Boolean(src) && !error;

    return (
        <div className="relative h-[230px] w-full overflow-hidden bg-slate-200">
            {isValid ? (
                <Image
                    src={src ?? ""}
                    alt={alt}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <p className={`text-center text-slate-500 ${bodyFontClass}`}>
                        {language === "kh" ? "មិនមានរូបភាព" : "No image"}
                    </p>
                </div>
            )}
        </div>
    );
}

function FeatureDate({
    date,
    fontClass,
}: {
    date: string;
    fontClass: string;
}) {
    return (
        <div
            className={`mb-3 flex items-center gap-2 text-[13px] font-bold text-[#1a2b4b] ${fontClass}`}
        >
            <CalendarDays size={16} className="shrink-0 text-[#3f51b5]" />
            <span className="leading-none">{date}</span>
        </div>
    );
}

export default function RelateNewsWorkingGroup({
    pageSlug = DEFAULT_PAGE_SLUG,
}: RelateNewsWorkingGroupProps) {
    const { language } = useLanguage();

    const lang = normalizeLanguage(language);
    const isKhmer = lang === "kh";

    const fontClass = isKhmer ? "khmer-font" : "airbnb-font";
    const titleFontClass = isKhmer ? "title-km" : "title-en";
    const mainTitleFontClass = isKhmer ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKhmer ? "body-km" : "body-en";

    const [posts, setPosts] = useState<PostItem[]>([]);
    const [workingGroupId, setWorkingGroupId] = useState<number | null>(null);
    const [workingGroupTitle, setWorkingGroupTitle] = useState("");
    const [workingGroupNumber, setWorkingGroupNumber] = useState<number | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    // Resolve the WG (id + label + number) from the pageSlug. We need the id
    // before we can fetch its posts, so the post fetch waits on this.
    useEffect(() => {
        const controller = new AbortController();

        async function loadWorkingGroup() {
            try {
                const response = await fetch("/api/working-groups", {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    setWorkingGroupId(null);
                    setWorkingGroupTitle("");
                    setWorkingGroupNumber(null);
                    return;
                }

                const json = (await response.json()) as WorkingGroupsResponse;
                const groups = Array.isArray(json.items) ? json.items : [];

                const currentIndex = groups.findIndex(
                    (group) => getText(group.slug, lang) === pageSlug,
                );

                if (currentIndex < 0) {
                    setWorkingGroupId(null);
                    setWorkingGroupTitle("");
                    setWorkingGroupNumber(null);
                    return;
                }

                const currentGroup = groups[currentIndex];
                const groupNumber =
                    typeof currentGroup.orderIndex === "number"
                        ? currentGroup.orderIndex
                        : currentIndex;

                setWorkingGroupId(
                    typeof currentGroup.id === "number" && currentGroup.id > 0
                        ? currentGroup.id
                        : null,
                );
                setWorkingGroupTitle(getText(currentGroup.title, lang));
                setWorkingGroupNumber(groupNumber);
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setWorkingGroupId(null);
                    setWorkingGroupTitle("");
                    setWorkingGroupNumber(null);
                }
            }
        }

        void loadWorkingGroup();

        return () => controller.abort();
    }, [lang, pageSlug]);

    // Fetch posts tagged with this WG (workingGroupId on Post, set in the admin
    // form's WG dropdown). Skips while WG id is still resolving.
    useEffect(() => {
        if (workingGroupId === null) {
            // Don't clear posts to null while WG id is still resolving on initial mount,
            // but if we tried to resolve and got back nothing valid, return empty.
            return;
        }

        const controller = new AbortController();

        async function loadRelatedNews() {
            try {
                setLoading(true);

                // hasDocument=false keeps the strip news-only: posts with a PDF
                // attached are documents and belong on the Publication page, not
                // the WG "Related Content" carousel.
                const url = `/api/posts?workingGroupIds=${workingGroupId}&hasDocument=false&pageSize=${RELATED_NEWS_LIMIT}`;
                const response = await fetch(url, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    setPosts([]);
                    return;
                }

                const json = (await response.json()) as ApiResponse;
                const items = Array.isArray(json.data)
                    ? json.data
                    : Array.isArray(json.items)
                      ? json.items
                      : [];
                setPosts(items);
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setPosts([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadRelatedNews();

        return () => controller.abort();
    }, [workingGroupId]);

    const relatedNews = useMemo(
        () => mapRelatedNews(posts, lang),
        [posts, lang],
    );

    const subHeading = isKhmer
        ? "ព័ត៌មានក្រុមការងារបន្ថែម"
        : "More Working Group Updates";

    const englishWorkingGroupLabel =
        workingGroupNumber !== null
            ? `WG: ${workingGroupNumber} ${workingGroupTitle}`
            : `WG: ${workingGroupTitle}`;

    const mainHeading = workingGroupTitle
        ? isKhmer
            ? `ព័ត៌មានពាក់ព័ន្ធ ${workingGroupTitle}`
            : `Related Content ${englishWorkingGroupLabel}`
        : isKhmer
          ? "ព័ត៌មានពាក់ព័ន្ធតាម"
          : "Related Content";

    return (
        <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 text-center">
                    <p
                        className={`mb-2 tracking-[0.025em] text-[#3f3cff] ${bodyFontClass} !font-semibold`}
                    >
                        {subHeading}
                    </p>

                    <h2 className={`text-[#312b85] ${titleFontClass}`}>
                        {mainHeading}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-3xl bg-white shadow-md"
                            >
                                <div className="h-[230px] animate-pulse bg-slate-200" />

                                <div className="space-y-4 p-6">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                    <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : relatedNews.length > 0 ? (
                    <Swiper
                        modules={[Pagination]}
                        slidesPerView={1}
                        spaceBetween={24}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="related-working-group-news-swiper !pb-12"
                    >
                        {relatedNews.map((item) => (
                            <SwiperSlide key={item.id} className="!flex h-auto">
                                <article className="group flex h-full min-h-[500px] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                                    <Link href={item.href} aria-label={item.title}>
                                        <NewsImage
                                            src={item.image}
                                            alt={item.title}
                                            language={lang}
                                            bodyFontClass={bodyFontClass}
                                        />
                                    </Link>

                                    <div className="flex flex-1 flex-col p-6">
                                        <FeatureDate
                                            date={item.date}
                                            fontClass={fontClass}
                                        />

                                        <Link href={item.href} className="mb-2 block">
                                            <h3
                                                className={`line-clamp-2 min-h-[64px] text-[#0B2C5F] transition group-hover:text-[#3f51b5] ${mainTitleFontClass} related-news-card-title`}
                                            >
                                                {item.title}
                                            </h3>
                                        </Link>

                                        <p
                                            className={`mb-2 line-clamp-2 min-h-[60px] text-slate-600 ${bodyFontClass} related-news-card-body`}
                                        >
                                            {item.description ||
                                                (isKhmer
                                                    ? "មិនមានការពិពណ៌នា"
                                                    : "No description")}
                                        </p>

                                        <Link
                                            href={item.href}
                                            className={`
                                                mt-auto inline-flex w-fit items-center gap-2
                                                rounded-full border border-orange-500
                                                px-3 py-1
                                                text-[12px] font-bold text-orange-600
                                                no-underline transition
                                                hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]
                                                ${fontClass}
                                            `}
                                        >
                                            {isKhmer ? "អានបន្ថែម" : "View details"}
                                            <FaArrowRight className="text-[12px]" />
                                        </Link>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p className={`text-center text-slate-500 ${bodyFontClass}`}>
                        {isKhmer
                            ? "មិនមានព័ត៌មានដែលពាក់ព័ន្ធ"
                            : "No related working group news"}
                    </p>
                )}
            </div>
        </section>
    );
}