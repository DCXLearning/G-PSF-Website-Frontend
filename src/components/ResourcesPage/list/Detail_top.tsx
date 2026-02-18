"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";

type DetailPageData = {
    category: string;
    date: string;
    title: string;
    heroImage: string;
    tagLabel: string;
    tagHref: string;

    // Bottom title + content
    bottomTitle: string; // "FOR IMMEDIATE RELEASE"
    paragraphs: string[];
    quote?: string;
    mediaContactTitle: string;
    mediaContactLines: string[];
};

export default function ResourceDetailPage() {
    const data: DetailPageData = useMemo(
        () => ({
            category: "News & Updates",
            date: "2 January 2026",
            title:
                "Cambodia’s Government–Private Sector Forum (G-PSF) Demonstrates Proven Success in Building Trust and Cooperation",
            heroImage:
                "/image/detail.jpg",
            tagLabel: "News & Updates",
            tagHref: "/news",

            bottomTitle: "FOR IMMEDIATE RELEASE",
            paragraphs: [
                "The Government–Private Sector Forum (G-PSF) continues to stand as one of Cambodia’s most effective and durable mechanisms for cooperation between the private sector and the Royal Government of Cambodia (RGC), according to a newly released policy brief outlining its evolution, achievements, and future direction.",
                "Established in 1999 and chaired at the highest level by the Prime Minister, the G-PSF provides a structured platform for dialogue, problem-solving, and reform. Through its national plenary and technical working groups co-chaired by government and industry leaders, the forum enables open engagement on regulatory, policy, and operational issues critical to economic growth.",
                "For more than 25 years, the G-PSF has played a pivotal role in transforming the relationship between government and business in Cambodia. In a post-conflict and emerging market context, it has successfully built trust where formal interaction scarcely existed previously, creating a culture of cooperation and shared responsibility for development.",
                "International assessments have recognised the G-PSF as one of the most successful public–private dialogue mechanisms of its kind, citing its durability, political backing, and ability to deliver practical outcomes. World Bank evaluations have ranked Cambodia’s G-PSF among the top-performing dialogue platforms globally, highlighting its contribution to private sector development.",
                "The forum’s recent resurgence, marked by the 19th G-PSF Plenary in November 2023, underscores its continued relevance. More than 1,200 representatives from government, the private sector, and development partners participated, with the Plenary announcing an ambitious reform agenda and strengthened accountability mechanisms to ensure implementation of agreed measures.",
                "The G-PSF remains a cornerstone institution for inclusive, results-oriented engagement. Its proven record of building trust, fostering cooperation, and delivering reforms positions it as a model for effective public–private collaboration among other regional and emerging economies.",
            ],
            quote:
                "“In a 2009 World Bank assessment, the Cambodia G-PSF outperformed 24 other countries to be recognised as the best performing PPD (Public-Private Dialogue).”",

            mediaContactTitle: "Media contact:",
            mediaContactLines: [
                "Council for the Development of Cambodia",
                "[name of CDC contact person]",
                "[title of CDC contact person]",
                "[phone number]",
                "[email address]",
            ],
        }),
        []
    );

    return (
        <section className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 pt-8">
                {/* Category + underline */}
                <div className="inline-flex flex-col">
                    <span className="text-lg font-semibold text-slate-700">{data.category}</span>
                    <span className="mt-1 h-[3px] w-20 rounded-full bg-amber-500" />
                </div>

                {/* Title */}
                <h1 className="mt-4 max-w-5xl text-3xl font-semibold leading-tight tracking-tight text-[#0f1637] md:text-4xl">
                    {data.title}
                </h1>

                {/* Date + tag */}
                <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        <span>{data.date}</span>
                    </div>

                    <Link
                        href={data.tagHref}
                        className="inline-flex items-center gap-3 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-50 text-amber-600">
                            <FileText className="h-4 w-4" />
                        </span>
                        {data.tagLabel}
                    </Link>
                </div>

                {/* Hero */}
                <HeroImage src={data.heroImage} alt={data.title} />

                {/* Bottom title */}
                <h2 className="mt-8 text-sm font-extrabold tracking-wide text-slate-900">
                    {data.bottomTitle}
                </h2>

                {/* Body (like screenshot) */}
                <article className="mt-4 max-w-7xl">
                    {data.paragraphs.map((p, i) => (
                        <p key={i} className="mt-4 text-[18px] leading-7 text-slate-700">
                            {p}
                        </p>
                    ))}

                    {data.quote ? (
                        <blockquote className="mt-6 text-[15px] italic leading-7 text-slate-700">
                            {data.quote}
                        </blockquote>
                    ) : null}

                    {/* ### */}
                    <div className="mt-10 text-center text-slate-700">###</div>

                    {/* Media contact */}
                    <div className="mt-8">
                        <h3 className="text-sm font-extrabold text-[#1e2a7b]">{data.mediaContactTitle}</h3>
                        <div className="mt-2 text-sm leading-6 text-[#1e2a7b]">
                            {data.mediaContactLines.map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
            <div className="relative aspect-[16/9] w-full">
                {!failed ? (
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        priority
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        className="object-cover"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                        Image not available
                    </div>
                )}
            </div>
        </div>
    );
}