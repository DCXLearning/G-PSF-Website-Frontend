/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { LayoutGrid, List, CalendarDays, Download } from "lucide-react";
import { formatLocalizedDate } from "@/utils/localizedDate";

type I18n = { en?: string; km?: string; kh?: string };

type DocFile = {
    url?: string;
    thumbnailUrl?: string;
} | null;

type EventPost = {
    id: number;
    slug?: string | null;
    title?: I18n;
    description?: I18n;
    publishedAt?: string | null;
    createdAt?: string;
    coverImage?: string | null;
    status?: string;
    isPublished?: boolean;
    documents?: {
        en?: DocFile;
        km?: DocFile;
        kh?: DocFile;
    } | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
        kh?: string | null;
    } | null;
};

type ApiResponse = {
    success: boolean;
    message: string;
    data: EventPost[];
};

export default function EventsListPage() {
    const { language } = useLanguage();

    const currentLang = String(language || "en").toLowerCase();
    const isKh = currentLang === "kh" || currentLang === "km" || currentLang === "khmer";
    const apiLang: "en" | "km" = isKh ? "km" : "en";

    const fontClass = isKh ? "khmer-font" : "airbnb-font";
    const mainTitleFontClass = isKh ? "main-title-km khmer-font" : "main-title-en airbnb-font";
    const titleFontClass = isKh ? "title-km khmer-font" : "title-en airbnb-font";
    const bodyClass = isKh ? "body-km khmer-font" : "body-en airbnb-font";

    const [events, setEvents] = useState<EventPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState<"list" | "grid">("list");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch("/api/newupdate-page/events", {
                    cache: "no-store",
                });

                const result: ApiResponse = await res.json();

                if (!res.ok) {
                    throw new Error(result.message || "Failed to fetch events");
                }

                const publishedOnly = (result.data || []).filter(
                    (item) => item.isPublished === true || item.status === "published"
                );

                setEvents(publishedOnly);
            } catch (err: any) {
                setError(err.message || "Error fetching events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const labels = {
        headerMain: isKh ? "ព្រឹត្តិការណ៍" : "Latest",
        headerSub: isKh ? "កាលវិភាគប្រជុំ" : "Events & Meetings",
        download: isKh ? "ទាញយកឯកសារ" : "Download",
        empty: isKh ? "មិនមានព្រឹត្តិការណ៍ទេ។" : "No events found at the moment.",
        loading: isKh ? "កំពុងទាញយកទិន្នន័យ..." : "Loading events...",
        error: isKh ? "មិនអាចទាញយកទិន្នន័យបានទេ។" : "Failed to load events.",
        noDate: isKh ? "មិនមានកាលបរិច្ឆេទ" : "No date",
        noDescription: isKh ? "មិនមានការពិពណ៌នា។" : "No description available.",
        list: isKh ? "បញ្ជី" : "List",
        grid: isKh ? "ក្រឡា" : "Grid",
        event: isKh ? "ព្រឹត្តិការណ៍" : "EVENT",
    };

    const content = useMemo(() => {
        return events.map((item) => {
            const title = isKh
                ? item.title?.km || item.title?.kh || item.title?.en || "Untitled"
                : item.title?.en || item.title?.km || item.title?.kh || "Untitled";

            const desc = isKh
                ? item.description?.km || item.description?.kh || item.description?.en || ""
                : item.description?.en || item.description?.km || item.description?.kh || "";

            const docUrl = isKh
                ? item.documents?.km?.url || item.documents?.kh?.url || item.documents?.en?.url || ""
                : item.documents?.en?.url || item.documents?.km?.url || item.documents?.kh?.url || "";

            const imageUrl = isKh
                ? item.coverImage ||
                item.documentThumbnails?.km ||
                item.documentThumbnails?.kh ||
                item.documentThumbnails?.en ||
                item.documents?.km?.thumbnailUrl ||
                item.documents?.kh?.thumbnailUrl ||
                item.documents?.en?.thumbnailUrl ||
                "/image/no-image.png"
                : item.coverImage ||
                item.documentThumbnails?.en ||
                item.documentThumbnails?.km ||
                item.documentThumbnails?.kh ||
                item.documents?.en?.thumbnailUrl ||
                item.documents?.km?.thumbnailUrl ||
                item.documents?.kh?.thumbnailUrl ||
                "/image/no-image.png";

            const dateValue = item.publishedAt || item.createdAt || "";
            const date = dateValue ? formatLocalizedDate(dateValue, apiLang) : "";

            return {
                ...item,
                title,
                desc,
                docUrl,
                imageUrl,
                date,
            };
        });
    }, [events, isKh, apiLang]);

    return (
        <main className={`bg-[#f5f7fb] ${bodyClass}`}>
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10 -mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className={`text-[#0B2C5F] ${mainTitleFontClass}`}>
                            {labels.headerMain}
                        </p>

                        <h1 className={`mt-1 text-[#0B2C5F] ${titleFontClass}`}>
                            {labels.headerSub}
                        </h1>
                    </div>

                    <div className="flex w-full max-w-sm gap-1 rounded-sm border border-gray-300 bg-white p-1 shadow-sm sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs transition sm:flex-none sm:px-3 ${fontClass} ${view === "list"
                                    ? "bg-[#23395D] text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                            style={{ fontWeight: 600 }}
                        >
                            <List size={15} />
                            <span>{labels.list}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs transition sm:flex-none sm:px-3 ${fontClass} ${view === "grid"
                                    ? "bg-[#23395D] text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                            style={{ fontWeight: 600 }}
                        >
                            <LayoutGrid size={15} />
                            <span>{labels.grid}</span>
                        </button>
                    </div>
                </div>

                {loading && (
                    <p className={`py-10 text-center ${bodyClass}`}>
                        {labels.loading}
                    </p>
                )}

                {error && !loading && (
                    <p className={`py-10 text-center text-red-500 ${bodyClass}`}>
                        {error || labels.error}
                    </p>
                )}

                {!loading && !error && content.length === 0 && (
                    <p className={`py-10 text-center text-slate-500 ${bodyClass}`}>
                        {labels.empty}
                    </p>
                )}

                {!loading && !error && content.length > 0 && view === "list" && (
                    <div className="divide-y divide-gray-300">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="flex flex-col gap-8 py-10 md:flex-row md:items-center"
                            >
                                <div className="w-full flex-shrink-0 md:w-44">
                                    <div className="overflow-hidden border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
                                        <div className="relative aspect-[210/297] w-full overflow-hidden bg-white">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "/image/no-image.png";
                                                    target.className =
                                                        "h-full w-full object-contain p-6 opacity-30";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <span
                                        className={`inline-block rounded bg-[#3f51b5] px-2 py-[1px] font-semibold text-[12px] uppercase text-white ${fontClass}`}
                                        style={{ fontWeight: 700 }}
                                    >
                                        {labels.event}
                                    </span>

                                    <h2 className={`mt-2 text-slate-900 ${mainTitleFontClass}`}>
                                        {item.title}
                                    </h2>

                                    <p
                                        className={`mt-1 text-sm text-slate-800 ${fontClass}`}
                                        style={{ fontWeight: 600 }}
                                    >
                                        {item.date || labels.noDate}
                                    </p>

                                    <p className={`mt-4 line-clamp-2 text-slate-600 ${bodyClass}`}>
                                        {item.desc || labels.noDescription}
                                    </p>

                                    {item.docUrl && (
                                        <Link
                                            href={item.docUrl}
                                            target="_blank"
                                            className={`${bodyClass} mt-3 inline-flex min-h-[24px] items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] text-slate-500 shadow-sm transition hover:border-[#23395D] hover:bg-white hover:text-slate-500`}
                                        >
                                            <Download size={16} />
                                            {labels.download}
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!loading && !error && content.length > 0 && view === "grid" && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-9">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="group flex h-full flex-col overflow-hidden bg-[#e9ecef]"
                            >
                                <div className="border-b border-slate-200 bg-white">
                                    <div className="relative aspect-[210/297] w-full overflow-hidden bg-white">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/image/no-image.png";
                                                target.className =
                                                    "h-full w-full object-contain p-6 opacity-30";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col justify-between px-3 py-4">
                                    <div className="min-w-0">
                                        <span
                                            className={`inline-block rounded bg-[#3f51b5] font-semibold px-2.5 py-0.5 text-[12px] uppercase text-white ${fontClass}`}
                                            style={{ fontWeight: 700 }}
                                        >
                                            {labels.event}
                                        </span>

                                        <div
                                            className={`mt-2 flex items-center gap-1.5 text-[10px] text-[#1a2b4b] ${fontClass}`}
                                            style={{ fontWeight: 600 }}
                                        >
                                            <CalendarDays size={13} />
                                            {item.date || labels.noDate}
                                        </div>

                                        <h2 className={`mt-1 text-[#1a2b4b] ${mainTitleFontClass}`}>
                                            {item.title}
                                        </h2>

                                        <p className={`mt-2 line-clamp-3 text-slate-700 ${bodyClass}`}>
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    {item.docUrl && (
                                        <Link
                                            href={item.docUrl}
                                            target="_blank"
                                            className={`mt-3 inline-flex min-h-[24px] items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] text-slate-500 shadow-sm transition hover:border-[#23395D] hover:bg-[#23395D] hover:text-white ${fontClass}`}
                                            style={{ fontWeight: 600 }}
                                        >
                                            <Download size={13} />
                                            {labels.download}
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}