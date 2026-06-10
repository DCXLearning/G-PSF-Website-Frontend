/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Grid3X3, List, CalendarDays, Download } from "lucide-react";
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

    const isKh =
        currentLang === "kh" ||
        currentLang === "km" ||
        currentLang === "khmer";

    const apiLang: "en" | "km" = isKh ? "km" : "en";

    const mainTitleFontClass = isKh ? "main-title-km" : "main-title-en";
    const titleFontClass = isKh ? "title-km" : "title-en";
    const bodyClass = isKh ? "body-km" : "body-en";

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
        download: isKh ? "ទាញយកឯកសារ" : "Download PDF",
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
                ? item.documents?.km?.url ||
                item.documents?.kh?.url ||
                item.documents?.en?.url ||
                ""
                : item.documents?.en?.url ||
                item.documents?.km?.url ||
                item.documents?.kh?.url ||
                "";

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
        <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className={`${titleFontClass} !text-[30px] !leading-[38px] text-[#0f2347]`}>
                            {labels.headerMain}
                        </p>

                        <h1 className={`${mainTitleFontClass} mt-1 !text-[20px] !leading-[28px] text-[#0f2347]`}>
                            {labels.headerSub}
                        </h1>

                        <div className="mt-4 h-1.5 w-60 bg-orange-500" />
                    </div>

                    <div className="mt-12 flex items-center gap-1 self-start rounded-lg bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "list"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <List size={15} />
                            {labels.list}
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "grid"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <Grid3X3 size={15} />
                            {labels.grid}
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className={`${bodyClass} rounded bg-white px-6 py-10 text-center shadow-sm`}>
                        {labels.loading}
                    </div>
                )}

                {error && !loading && (
                    <div className={`${bodyClass} rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm`}>
                        {error || labels.error}
                    </div>
                )}

                {!loading && !error && content.length === 0 && (
                    <div className={`${bodyClass} rounded bg-white px-6 py-10 text-center shadow-sm`}>
                        {labels.empty}
                    </div>
                )}

                {!loading && !error && view === "list" && (
                    <div>
                        {content.map((item, index) => (
                            <article
                                key={item.id}
                                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 ${index !== content.length - 1
                                        ? "mb-10 border-b border-gray-300"
                                        : ""
                                    }`}
                            >
                                <div className="group block">
                                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-md md:h-[260px] md:aspect-auto">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/image/no-image.png";
                                                target.className =
                                                    "h-full w-full object-contain opacity-30 p-6";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col justify-between pt-1">
                                    <div>
                                        <span className="inline-block rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                            {labels.event}
                                        </span>

                                        <h2 className={`${mainTitleFontClass} mt-3 line-clamp-1 text-[#0f2347]`}>
                                            {item.title}
                                        </h2>

                                        <p className={`${bodyClass} mt-4 max-w-4xl line-clamp-2 text-[#4f6482]`}>
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 pt-4">
                                        {item.docUrl && (
                                            <Link
                                                href={item.docUrl}
                                                target="_blank"
                                                className={`${bodyClass} inline-flex items-center gap-2 font-bold text-[#0f2347] underline transition hover:text-blue-700`}
                                            >
                                                <Download size={18} />
                                                {labels.download}
                                            </Link>
                                        )}

                                        <div className={`${bodyClass} flex items-center gap-2 text-[#6a7b96]`}>
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            <span>{item.date || labels.noDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!loading && !error && view === "grid" && (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="group flex h-full flex-col overflow-hidden bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="block">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/image/no-image.png";
                                                target.className =
                                                    "h-full w-full object-contain opacity-30 p-6";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex h-full grow flex-col justify-between p-5">
                                    <div>
                                        <span className="inline-block w-fit rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                            {labels.event}
                                        </span>

                                        <h2 className={`${mainTitleFontClass} mt-3 line-clamp-2 text-[#0f2347]`}>
                                            {item.title}
                                        </h2>

                                        <p className={`${bodyClass} mt-4 line-clamp-4 text-[#4f6482]`}>
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 pt-5">
                                        {item.docUrl && (
                                            <Link
                                                href={item.docUrl}
                                                target="_blank"
                                                className={`${bodyClass} inline-flex items-center gap-2 font-bold text-[#0f2347] underline transition hover:text-blue-700`}
                                            >
                                                <Download size={16} />
                                                {labels.download}
                                            </Link>
                                        )}

                                        <div className={`${bodyClass} flex items-center gap-2 text-[#6a7b96]`}>
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            <span>{item.date || labels.noDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}