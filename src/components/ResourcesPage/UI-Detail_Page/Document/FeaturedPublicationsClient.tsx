"use client";

import React, { useMemo } from "react";
import Image from "next/image";

export type Publication = {
    id: number;
    coverUrl: string;
    dateText: string;
    title: string;
    excerpt: string;
    kmUrl: string;
    enUrl: string;
};

type FeaturedPublicationsClientProps = {
    items: Publication[];
    query?: string;
};

export default function FeaturedPublicationsClient({
    items,
    query = "",
}: FeaturedPublicationsClientProps) {
    const normalizedQuery = query.trim().toLowerCase();

    const filteredItems = useMemo(() => {
        if (!normalizedQuery) return items;

        return items.filter((item) => {
            const text = [
                item.title,
                item.excerpt,
                item.dateText,
            ]
                .join(" ")
                .toLowerCase();

            return text.includes(normalizedQuery);
        });
    }, [items, normalizedQuery]);

    const hasItems = filteredItems.length > 0;

    return (
        <main className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="mb-10">
                    <h2 className="text-[#1a2b4b] text-3xl md:text-4xl font-bold">
                        Featured Publications
                    </h2>
                    <div className="mt-2 h-[4px] w-52 bg-[#fb923c]" />
                </div>


                {hasItems ? (
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredItems.map((item) => (
                            <PublicationCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-left text-slate-500 font-semibold">
                        No featured publications found.
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
                    <Image
                        src={item.coverUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
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

                <h3 className="mt-1 text-[#1a2b4b] khmer-font font-extrabold text-base leading-snug line-clamp-2">
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
                        <span className="text-[10px] font-bold text-slate-400">
                            No file
                        </span>
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