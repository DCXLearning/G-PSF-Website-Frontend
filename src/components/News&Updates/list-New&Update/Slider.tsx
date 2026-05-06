"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";
import { FaArrowRight } from "react-icons/fa";

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

type RelatedNewsItem = {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    href: string;
};

type SliderProps = {
    currentId?: number | string;
    currentSlug?: string;
};

const RELATED_NEWS_ENDPOINT = "/api/posts?pageId=6";

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
        (block) => block.type === "image" && block.attrs?.src
    );

    return firstImage?.attrs?.src || "";
}

function buildDetailHref(post: PostItem) {
    if (post.slug?.trim()) {
        return `/new-update/view-detail?slug=${encodeURIComponent(
            post.slug.trim()
        )}&id=${encodeURIComponent(String(post.id))}`;
    }

    return `/new-update/view-detail?id=${encodeURIComponent(String(post.id))}`;
}

function mapRelatedNews(
    posts: PostItem[],
    language: UiLang,
    currentId?: number | string,
    currentSlug?: string
): RelatedNewsItem[] {
    return posts
        .filter((post) => {
            const published = post.isPublished === true || post.status === "published";
            const notCurrentId = currentId ? String(post.id) !== String(currentId) : true;
            const notCurrentSlug = currentSlug
                ? post.slug?.trim() !== currentSlug.trim()
                : true;

            return published && notCurrentId && notCurrentSlug;
        })
        .sort((a, b) => {
            const dateA = new Date(
                a.publishedAt || a.createdAt || a.updatedAt || ""
            ).getTime();

            const dateB = new Date(
                b.publishedAt || b.createdAt || b.updatedAt || ""
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
                language
            ),
            href: buildDetailHref(post),
        }));
}

function NewsImage({
    src,
    alt,
    language,
}: {
    src?: string | null;
    alt: string;
    language: UiLang;
}) {
    const [error, setError] = useState(false);
    const isValid = !!src && !error;

    return (
        <div className="relative h-[230px] w-full overflow-hidden bg-slate-200">
            {isValid ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <p className="text-center text-sm text-slate-500">
                        {language === "kh" ? "មិនមានរូបភាព" : "No image"}
                    </p>
                </div>
            )}
        </div>
    );
}

function FeatureDate({ date }: { date: string }) {
    return (
        <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#1a2b4b]">
            <CalendarDays size={16} className="shrink-0 text-[#3f51b5]" />
            <span className="leading-none">{date}</span>
        </div>
    );
}

export default function Slider({ currentId, currentSlug }: SliderProps) {
    const { language } = useLanguage();
    const lang: UiLang = language === "kh" ? "kh" : "en";
    const isKhmer = lang === "kh";

    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadRelatedNews() {
            try {
                setLoading(true);

                const response = await fetch(RELATED_NEWS_ENDPOINT, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
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
                setLoading(false);
            }
        }

        void loadRelatedNews();

        return () => {
            controller.abort();
        };
    }, []);

    const relatedNews = useMemo(
        () => mapRelatedNews(posts, lang, currentId, currentSlug),
        [posts, lang, currentId, currentSlug]
    );

    const subHeading = isKhmer ? "ព័ត៌មាន G-PSF បន្ថែម" : "More G-PSF News";
    const mainHeading = isKhmer ? "ព័ត៌មានដែលពាក់ព័ន្ធ" : "Related Content";

    return (
        <section className="py-4 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="mb-14 text-center">
                    <p
                        className={`mb-2 text-lg font-semibold tracking-[0.025em] text-[#3f3cff] ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {subHeading}
                    </p>

                    <h2
                        className={`text-4xl font-extrabold leading-tight text-[#312b85] md:text-5xl ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
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
                        className="related-news-swiper !pb-12"
                    >
                        {relatedNews.map((item) => (
                            <SwiperSlide key={item.id} className="!flex h-auto">
                                <article className="group flex h-full min-h-[500px] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                                    <Link href={item.href} aria-label={item.title}>
                                        <NewsImage src={item.image} alt={item.title} language={lang} />
                                    </Link>

                                    <div className="flex flex-1 flex-col p-6">
                                        <FeatureDate date={item.date} />

                                        <Link href={item.href} className="mb-2 block">
                                            <h3
                                                className={`line-clamp-2 min-h-[56px] text-xl font-bold leading-7 text-[#0B2C5F] transition group-hover:text-[#3f51b5] ${isKhmer ? "khmer-font" : ""
                                                    }`}
                                            >
                                                {item.title}
                                            </h3>
                                        </Link>

                                        <p
                                            className={`mb-2 line-clamp-2 min-h-[56px] text-sm leading-7 text-slate-600 ${isKhmer ? "khmer-font" : ""
                                                }`}
                                        >
                                            {item.description ||
                                                (isKhmer ? "មិនមានការពិពណ៌នា" : "No description")}
                                        </p>

                                        <Link
                                            href={item.href}
                                            className={`mt-auto inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-[#1D4ED8] ${isKhmer ? "khmer-font" : ""
                                                }`}
                                        >
                                            {isKhmer ? "អានបន្ថែម" : "Read more"}
                                            <FaArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p
                        className={`text-center text-sm text-slate-500 ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {isKhmer ? "មិនមានព័ត៌មានដែលពាក់ព័ន្ធ" : "No related news"}
                    </p>
                )}
            </div>
        </section>
    );
}