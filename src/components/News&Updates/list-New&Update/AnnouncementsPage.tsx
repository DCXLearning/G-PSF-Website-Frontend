/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Grid3X3, List, CalendarDays, Download } from "lucide-react";

type I18n = { en?: string; km?: string };

type Announcement = {
    id: number;
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
    publishedAt?: string;
    status?: string;
    isPublished?: boolean;
    coverImage?: string | null;
    documentThumbnails?: { en?: string | null; km?: string | null } | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string } | null;
        km?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
};

type ApiResponse = {
    success?: boolean;
    message?: string;
    data?: Announcement[];
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [language] = useState<"en" | "km">("en");
    const [view, setView] = useState<"list" | "grid">("list");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/newupdate-page/announcements?t=${Date.now()}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });

                const result: ApiResponse | Announcement[] = await res.json();

                if (!res.ok) {
                    const msg =
                        (result as ApiResponse)?.message || "Failed to fetch announcements";
                    throw new Error(msg);
                }

                if (isMounted) {
                    const rawData = Array.isArray((result as ApiResponse)?.data)
                        ? (result as ApiResponse).data || []
                        : Array.isArray(result)
                            ? result
                            : [];

                    const publishedOnly = rawData.filter(
                        (item) => item.isPublished === true || item.status === "published" || (!item.status && item.id)
                    );

                    setAnnouncements(publishedOnly);
                }
            } catch (err: any) {
                if (err.name !== "AbortError" && isMounted) {
                    setError(err.message || "Failed to load announcements");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const labels = {
        headerMain: language === "km" ? "សេចក្តីជូនដំណឹង" : "Latest",
        headerSub: language === "km" ? "សេចក្តីប្រកាស" : "Announcements",
        download: language === "km" ? "ទាញយកឯកសារ" : "Download",
        empty:
            language === "km"
                ? "មិនមានសេចក្តីជូនដំណឹងទេ។"
                : "No announcements available right now.",
        loading:
            language === "km" ? "កំពុងទាញយកទិន្នន័យ..." : "Loading announcements...",
        error:
            language === "km"
                ? "មិនអាចទាញយកទិន្នន័យបានទេ។"
                : "Failed to load announcements.",
        noDate: language === "km" ? "មិនមានកាលបរិច្ឆេទ" : "No date",
        noDescription:
            language === "km" ? "មិនមានការពិពណ៌នា។" : "No description available.",
    };

    const content = useMemo(() => {
        return announcements.map((item) => {
            const title = item.title?.[language] || item.title?.en || "Untitled";
            const desc = item.description?.[language] || item.description?.en || "";

            const docUrl = item.documents?.[language]?.url || item.documents?.en?.url || "";

            const imageUrl =
                item.coverImage ||
                item.documentThumbnails?.[language] ||
                item.documentThumbnails?.en ||
                item.documents?.[language]?.thumbnailUrl ||
                item.documents?.en?.thumbnailUrl ||
                "/image/no-image.png";

            const dateValue = item.publishedAt || "";
            const parsedDate = new Date(dateValue);
            const isValidDate = dateValue && !Number.isNaN(parsedDate.getTime());

            const date = isValidDate
                ? new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }).format(parsedDate)
                : "";

            return {
                ...item,
                title,
                desc,
                docUrl,
                imageUrl,
                date,
            };
        });
    }, [announcements, language]);

    return (
        <section className="min-h-screen bg-[#eef0f3] py-10 md:py-14">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 md:text-3xl khmer-font">
                            {labels.headerMain}
                        </p>
                        <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl khmer-font">
                            {labels.headerSub}
                        </h1>
                        <div className="mt-4 h-1.5 w-60 bg-orange-500" />
                    </div>

                    <div className="mt-12 flex items-center gap-2 self-start rounded-lg bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${view === "list"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <List size={18} />
                            List
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${view === "grid"
                                    ? "bg-[#273650] text-white"
                                    : "text-[#273650] hover:bg-gray-100"
                                }`}
                        >
                            <Grid3X3 size={18} />
                            Grid
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="rounded bg-white px-6 py-10 text-center shadow-sm">
                        {labels.loading}
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="rounded bg-white px-6 py-10 text-center text-red-600 shadow-sm">
                        {error || labels.error}
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && content.length === 0 && (
                    <div className="rounded bg-white px-6 py-10 text-center shadow-sm">
                        {labels.empty}
                    </div>
                )}

                {/* List View */}
                {!loading && !error && view === "list" && (
                    <div>
                        {content.map((item, index) => (
                            <article
                                key={item.id}
                                className={`grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 ${index !== content.length - 1 ? "mb-10 border-b border-gray-300" : ""
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
                                                target.className = "h-full w-full object-contain opacity-30 p-6";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col justify-between pt-1">
                                    <div>
                                        <span className="inline-block rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                            ANNOUNCEMENT
                                        </span>

                                        <h2 className="mt-3 text-xl khmer-font font-bold leading-tight text-[#0f2347] md:text-xl lg:text-[25px]">
                                            {item.title}
                                        </h2>

                                        <p className="mt-4 max-w-4xl text-sm leading-7 khmer-font text-[#4f6482] md:text-base md:leading-8 lg:text-[19px]">
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 pt-4">
                                        {item.docUrl && (
                                            <Link
                                                href={item.docUrl}
                                                target="_blank"
                                                className="inline-flex cursor-pointer items-center gap-2 khmer-font text-base font-bold text-[#0f2347] underline transition hover:text-blue-700 md:text-lg lg:text-[18px]"
                                            >
                                                <Download size={18} />
                                                {labels.download}
                                            </Link>
                                        )}

                                        <div className="flex items-center gap-2 text-sm font-medium text-[#6a7b96] md:text-base">
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            <span className="khmer-font">{item.date || labels.noDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Grid View */}
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
                                                target.className = "h-full w-full object-contain opacity-30 p-6";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex h-full grow flex-col justify-between p-5">
                                    <div>
                                        <span className="inline-block w-fit rounded bg-[#4b5dbb] px-3 py-1 text-[10px] font-bold uppercase text-white">
                                            ANNOUNCEMENT
                                        </span>

                                        <h2 className="mt-3 line-clamp-2 text-xl khmer-font font-bold leading-tight text-[#0f2347]">
                                            {item.title}
                                        </h2>

                                        <p className="mt-4 line-clamp-4 khmer-font text-sm leading-7 text-[#4f6482]">
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 pt-5">
                                        {item.docUrl && (
                                            <Link
                                                href={item.docUrl}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 khmer-font text-base font-bold text-[#0f2347] underline transition hover:text-blue-700"
                                            >
                                                <Download size={16} />
                                                {labels.download}
                                            </Link>
                                        )}

                                        <div className="flex items-center gap-2 text-sm font-medium text-[#6a7b96]">
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            <span className="khmer-font">{item.date || labels.noDate}</span>
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