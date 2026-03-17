"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, List } from "lucide-react";

type LangText = string | { en?: string; km?: string };

type ContentBlock = {
    type?: string;
    attrs?: {
        src?: string;
    };
};

type PostItem = {
    id: number;
    slug: string | null;
    title: LangText;
    description: LangText;
    createdAt: string;
    publishedAt: string | null;
    coverImage: string | null;
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
    };
    category?: {
        id: number;
        name?: {
            en?: string;
            km?: string;
        };
    };
};

type ApiResponse = {
    success: boolean;
    message: string;
    data: PostItem[];
};

type ViewMode = "list" | "grid";

const API_URL = "https://api-gpsf.datacolabx.com/api/v1/posts/category/4";

function getText(value: LangText | undefined, lang: "en" | "km" = "en") {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || value.km || "";
}

function formatDate(dateValue?: string | null): string {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
    }).format(date);
}

function getPostType(post: PostItem) {
    const contentEn = post.content?.en?.content || [];
    const hasYoutube = contentEn.some((block) => block.type === "youtube");

    if (hasYoutube) return "VIDEO";
    return "PUBLICATION";
}

function getThumbnail(post: PostItem) {
    if (post.coverImage) return post.coverImage;

    const contentEn = post.content?.en?.content || [];
    const firstImage = contentEn.find(
        (block) => block.type === "image" && block.attrs?.src
    );

    return firstImage?.attrs?.src || "";
}

export default function NewsUpdateListPage() {
    const [items, setItems] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(API_URL, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const json: ApiResponse = await res.json();

                const publishedOnly = (json.data || []).filter(
                    (item) => item.isPublished === true || item.status === "published"
                );

                if (mounted) {
                    setItems(publishedOnly);
                }
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setError("Failed to load news and updates.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    const content = useMemo(() => {
        return items.map((item) => {
            const title = getText(item.title, "en");
            const excerpt = getText(item.description, "en");
            const imageUrl = getThumbnail(item);
            const type = getPostType(item);
            const date = formatDate(item.publishedAt || item.createdAt);

            const detailHref = item.slug
                ? {
                    pathname: "/new-update/view-detail",
                    query: { slug: item.slug, id: String(item.id) },
                }
                : {
                    pathname: "/new-update/view-detail",
                    query: { id: String(item.id) },
                };

            return {
                ...item,
                title,
                excerpt,
                imageUrl,
                type,
                date,
                detailHref,
            };
        });
    }, [items]);

    return (
        <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 center flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 md:text-3xl">Latest</p>
                        <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl">
                            News & Updates
                        </h1>
                        <div className="mt-4 h-1.5 w-60 bg-orange-500" />
                    </div>

                    <div className="mt-12 flex items-center gap-2 self-start rounded-lg bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex items-center cursor-pointer gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${viewMode === "list"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <List size={18} />
                            List
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ${viewMode === "grid"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <Grid3X3 size={18} />
                            Grid
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="py-2 text-center">
                        Loading...
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && content.length === 0 && (
                    <div className="rounded bg-white px-6 py-10 text-center shadow-sm">
                        No published news yet.
                    </div>
                )}

                {!loading && !error && viewMode === "list" && (
                    <div>
                        {content.map((item, index) => (
                            <article
                                key={item.id}
                                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 ${index !== content.length - 1 ? "mb-10 border-b border-gray-300" : ""
                                    }`}
                            >
                                <Link href={item.detailHref} className="group block">
                                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-md md:h-[260px] md:aspect-auto">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-white px-4 text-center text-xl font-semibold text-[#0f2347] md:text-2xl">
                                                G-PSF Cover
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="min-w-0 pt-1">
                                    <span className="inline-block rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                        {item.type}
                                    </span>

                                    <Link href={item.detailHref} className="block">
                                        <h2 className="mt-3 text-xl khmer-font font-bold leading-tight text-[#0f2347] hover:underline md:text-xl lg:text-[25px]">
                                            {item.title}
                                        </h2>
                                    </Link>

                                    <p className="mt-2 text-lg font-bold khmer-font text-[#0f2347] md:text-2xl lg:text-[28px]">
                                        {item.date}
                                    </p>

                                    <p className="mt-4 max-w-4xl text-sm leading-7 khmer-font text-[#4f6482] md:text-base md:leading-8 lg:text-[19px]">
                                        {item.excerpt || "No description available."}
                                    </p>

                                    <Link
                                        href={item.detailHref}
                                        className="mt-4 inline-block text-base font-bold text-[#0f2347] underline md:text-lg lg:text-[18px]"
                                    >
                                        View details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!loading && !error && viewMode === "grid" && (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="group flex h-full flex-col overflow-hidden bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <Link href={item.detailHref} className="block">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xl font-semibold text-[#0f2347]">
                                                G-PSF Cover
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex grow flex-col p-5">
                                    <span className="inline-block w-fit rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                        {item.type}
                                    </span>

                                    <Link href={item.detailHref} className="block">
                                        <h2 className="mt-3 line-clamp-2 text-xl khmer-font font-bold leading-tight text-[#0f2347] hover:underline">
                                            {item.title}
                                        </h2>
                                    </Link>

                                    <p className="mt-2 text-lg khmer-font font-bold text-[#0f2347]">
                                        {item.date}
                                    </p>

                                    <p className="mt-4 line-clamp-4 khmer-font text-sm leading-7 text-[#4f6482]">
                                        {item.excerpt || "No description available."}
                                    </p>

                                    <Link
                                        href={item.detailHref}
                                        className="mt-auto pt-5 text-base font-bold text-[#0f2347] underline"
                                    >
                                        View details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}