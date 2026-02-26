// app/publications/page.tsx  ✅ one file (Next.js + TypeScript + Tailwind)
"use client";

import React from "react";
import Image from "next/image";

type Publication = {
    id: string | number;
    coverUrl?: string; // thumbnail/cover image
    dateText: string; // e.g. "October 2025"
    title: string;
    excerpt?: string;
    kmUrl?: string; // Khmer PDF
    enUrl?: string; // English PDF
};

export default function FeaturedPublications() {
    const items: Publication[] = [
        {
            id: 1,
            dateText: "October 2025",
            title: "Policy Headline",
            excerpt:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy.",
            // coverUrl: "/images/sample-cover.jpg",
            kmUrl: "/docs/sample-km.pdf",
            enUrl: "/docs/sample-en.pdf",
        },
        {
            id: 2,
            dateText: "October 2025",
            title: "Policy Headline",
            excerpt:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy.",
            kmUrl: "/docs/sample-km.pdf",
            enUrl: "/docs/sample-en.pdf",
        },
        {
            id: 3,
            dateText: "October 2025",
            title: "Policy Headline",
            excerpt:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy.",
            kmUrl: "/docs/sample-km.pdf",
            enUrl: "/docs/sample-en.pdf",
        },
        {
            id: 4,
            dateText: "October 2025",
            title: "Policy Headline",
            excerpt:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy.",
            enUrl: "/docs/sample-en.pdf",
        },
    ];

    return (
        <main className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                {/* Title */}
                <div className="mb-10">
                    <h2 className="text-[#1a2b4b] text-3xl md:text-4xl font-extrabold">
                        Featured Publications
                    </h2>
                    <div className="mt-2 h-[4px] w-52 bg-[#fb923c]" />
                </div>

                {/* Grid */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((p) => (
                        <PublicationCard key={p.id} p={p} />
                    ))}
                </div>
            </div>
        </main>
    );
}

function PublicationCard({ p }: { p: Publication }) {
    const hasCover = Boolean(p.coverUrl);

    return (
        <article className="bg-[#e9ecef] shadow-sm">
            {/* Cover */}
            <div className="p-5">
                <div className="relative aspect-[4/3] w-full bg-white border border-slate-200 overflow-hidden">
                    {hasCover ? (
                        <Image src={p.coverUrl!} alt={p.title} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-center px-6">
                            <div className="text-slate-500">
                                <div className="mx-auto mb-3 h-12 w-12 rounded bg-slate-200 flex items-center justify-center">
                                    <span className="text-slate-600 text-xl">🖼️</span>
                                </div>
                                <p className="text-xs leading-snug">
                                    Screenshot
                                    <br />
                                    of document
                                    <br />
                                    cover page
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
                <div className="text-[11px] font-semibold text-[#1a2b4b]">
                    {p.dateText}
                </div>

                <h3 className="mt-1 text-[#1a2b4b] font-extrabold text-base leading-snug line-clamp-2">
                    {p.title}
                </h3>

                {p.excerpt ? (
                    <p className="mt-2 text-[11px] text-slate-700 leading-relaxed line-clamp-3">
                        {p.excerpt}
                    </p>
                ) : null}

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between gap-3">
                    <a
                        href={p.enUrl || p.kmUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#1a2b4b] hover:underline"
                    >
                        Download ›
                    </a>

                    <div className="flex items-center gap-2">
                        {p.kmUrl ? <LangButton href={p.kmUrl} label="Khmer" /> : null}
                        {p.enUrl ? <LangButton href={p.enUrl} label="English" /> : null}
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