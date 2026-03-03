import React from "react";
import Image from "next/image";
import { API_URL } from "@/config/api";

type I18nText = {
    en?: string;
    km?: string;
};

type ApiDocumentFile = {
    url?: string;
    thumbnailUrl?: string;
} | null;

type ApiPost = {
    id?: number;
    title?: I18nText;
    description?: I18nText;
    status?: string;
    isFeatured?: boolean;
    documents?: {
        en?: ApiDocumentFile;
        km?: ApiDocumentFile;
    };
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
    };
    publishedAt?: string | null;
    createdAt?: string;
};

type FeaturedPostsResponse = {
    success?: boolean;
    message?: string;
    data?: ApiPost[];
};

type Publication = {
    id: number;
    coverUrl: string;
    dateText: string;
    title: string;
    excerpt: string;
    kmUrl: string;
    enUrl: string;
};

function getText(value?: string | null): string {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
}

function pickI18nText(value?: I18nText): string {
    return getText(value?.en) || getText(value?.km);
}

function formatDate(dateValue?: string | null): string {
    const raw = getText(dateValue);
    if (!raw) return "";

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        return raw;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function mapFeaturedPosts(response: FeaturedPostsResponse): Publication[] {
    const posts = response.data ?? [];
    const items: Publication[] = [];

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index];

        if (post.status !== "published") {
            continue;
        }

        if (post.isFeatured !== true) {
            continue;
        }

        const title = pickI18nText(post.title);
        if (!title) {
            continue;
        }

        const enUrl = getText(post.documents?.en?.url);
        const kmUrl = getText(post.documents?.km?.url);
        const coverUrl =
            getText(post.documentThumbnails?.en) ||
            getText(post.documentThumbnails?.km) ||
            getText(post.documents?.en?.thumbnailUrl) ||
            getText(post.documents?.km?.thumbnailUrl);

        items.push({
            id: post.id ?? index + 1,
            coverUrl,
            dateText: formatDate(post.publishedAt) || formatDate(post.createdAt),
            title,
            excerpt: pickI18nText(post.description),
            enUrl,
            kmUrl,
        });
    }

    return items;
}

async function getFeaturedPublications(): Promise<Publication[]> {
    if (!API_URL) {
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/posts?isFeatured=true`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const json = (await response.json()) as FeaturedPostsResponse;
        return mapFeaturedPosts(json);
    } catch {
        return [];
    }
}

export default async function FeaturedPublications() {
    const items = await getFeaturedPublications();
    const hasItems = items.length > 0;

    return (
        <main className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="mb-10">
                    <h2 className="text-[#1a2b4b] text-3xl md:text-4xl font-extrabold">
                        Featured Publications
                    </h2>
                    <div className="mt-2 h-[4px] w-52 bg-[#fb923c]" />
                </div>

                {hasItems ? (
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item) => (
                            <PublicationCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#e9ecef] px-6 py-10 text-center text-slate-700 font-semibold">
                        No featured publications yet.
                    </div>
                )}
            </div>
        </main>
    );
}

function PublicationCard({ item }: { item: Publication }) {
    const hasCover = Boolean(item.coverUrl);
    const defaultDownloadUrl = item.enUrl || item.kmUrl;

    return (
        <article className="bg-[#e9ecef] shadow-sm overflow-hidden">
            <div className="relative w-full aspect-[3/4] bg-white border-b border-slate-200">
                {hasCover ? (
                    <Image src={item.coverUrl} alt={item.title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-center px-6">
                        <p className="text-xs leading-snug text-slate-500">
                            Document cover is not available
                        </p>
                    </div>
                )}
            </div>

            <div className="px-5 py-5">
                <div className="text-[11px] font-semibold text-[#1a2b4b]">
                    {item.dateText || "No date"}
                </div>

                <h3 className="mt-1 text-[#1a2b4b] font-extrabold text-base leading-snug line-clamp-2">
                    {item.title}
                </h3>

                {item.excerpt ? (
                    <p className="mt-2 text-[11px] text-slate-700 leading-relaxed line-clamp-3">
                        {item.excerpt}
                    </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3">
                    {defaultDownloadUrl ? (
                        <a
                            href={defaultDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#1a2b4b] hover:underline"
                        >
                            Download
                        </a>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-400">No file</span>
                    )}

                    <div className="flex items-center gap-2">
                        {item.kmUrl ? <LangButton href={item.kmUrl} label="Khmer" /> : null}
                        {item.enUrl ? <LangButton href={item.enUrl} label="English" /> : null}
                    </div>
                </div>
            </div>
        </article>
    );
}

function LangButton({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-6 items-center justify-center rounded bg-[#1a2b4b] px-3 text-[10px] font-bold text-white hover:opacity-90"
        >
            {label}
        </a>
    );
}
