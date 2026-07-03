/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Grid3X3, List } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";

type I18n = { en?: string; km?: string; kh?: string };

type Announcement = {
    id: number;
    title?: I18n;
    description?: I18n;
    publishedAt?: string;
    createdAt?: string;
    status?: string;
    isPublished?: boolean;
    coverImage?: string | null;
    documentThumbnails?: {
        en?: string | null;
        km?: string | null;
        kh?: string | null;
    } | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string } | null;
        km?: { url?: string; thumbnailUrl?: string } | null;
        kh?: { url?: string; thumbnailUrl?: string } | null;
    } | null;
};

type ApiResponse = {
    success?: boolean;
    message?: string;
    data?: Announcement[];
};

export default function AnnouncementsPage() {
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

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState<"list" | "grid">("list");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchData() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(
                    `/api/newupdate-page/announcements?t=${Date.now()}`,
                    {
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                const result: ApiResponse | Announcement[] = await res.json();

                if (!res.ok) {
                    throw new Error(
                        (result as ApiResponse)?.message ||
                        "Failed to fetch announcements"
                    );
                }

                const rawData = Array.isArray((result as ApiResponse)?.data)
                    ? (result as ApiResponse).data || []
                    : Array.isArray(result)
                        ? result
                        : [];

                const publishedOnly = rawData.filter(
                    (item) =>
                        item.isPublished === true ||
                        item.status === "published" ||
                        (!item.status && item.id)
                );

                if (isMounted) setAnnouncements(publishedOnly);
            } catch (err: any) {
                if (err.name !== "AbortError" && isMounted) {
                    setError(err.message || "Failed to load announcements");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const labels = {
        headerMain: isKh ? "សេចក្តីជូនដំណឹង" : "Latest",
        headerSub: isKh ? "សេចក្តីប្រកាស" : "Announcements",
        language: isKh ? "ភាសា:" : "Language:",
        khmer: isKh ? "ខ្មែរ" : "Khmer",
        english: isKh ? "អង់គ្លេស" : "English",
        noFile: isKh ? "គ្មានឯកសារ" : "No file",
        empty: isKh
            ? "មិនមានសេចក្តីជូនដំណឹងទេ។"
            : "No announcements available right now.",
        loading: isKh
            ? "កំពុងទាញយកទិន្នន័យ..."
            : "Loading announcements...",
        error: isKh
            ? "មិនអាចទាញយកទិន្នន័យបានទេ។"
            : "Failed to load announcements.",
        noDate: isKh ? "មិនមានកាលបរិច្ឆេទ" : "No date",
        noDescription: isKh
            ? "មិនមានការពិពណ៌នា។"
            : "No description available.",
        list: isKh ? "បញ្ជី" : "List",
        grid: isKh ? "ក្រឡា" : "Grid",
        announcement: isKh ? "សេចក្តីប្រកាស" : "ANNOUNCEMENT",
    };

    const content = useMemo(() => {
        return announcements.map((item) => {
            const title = isKh
                ? item.title?.km || item.title?.kh || item.title?.en || "Untitled"
                : item.title?.en || item.title?.km || item.title?.kh || "Untitled";

            const desc = isKh
                ? item.description?.km ||
                item.description?.kh ||
                item.description?.en ||
                ""
                : item.description?.en ||
                item.description?.km ||
                item.description?.kh ||
                "";

            const documents = [
                item.documents?.km?.url || item.documents?.kh?.url
                    ? {
                        label: labels.khmer,
                        href:
                            item.documents?.km?.url ||
                            item.documents?.kh?.url ||
                            "",
                    }
                    : null,
                item.documents?.en?.url
                    ? {
                        label: labels.english,
                        href: item.documents.en.url,
                    }
                    : null,
            ].filter(Boolean) as { label: string; href: string }[];

            const imageUrl =
                item.coverImage ||
                (isKh
                    ? item.documentThumbnails?.km ||
                    item.documentThumbnails?.kh ||
                    item.documentThumbnails?.en ||
                    item.documents?.km?.thumbnailUrl ||
                    item.documents?.kh?.thumbnailUrl ||
                    item.documents?.en?.thumbnailUrl
                    : item.documentThumbnails?.en ||
                    item.documentThumbnails?.km ||
                    item.documentThumbnails?.kh ||
                    item.documents?.en?.thumbnailUrl ||
                    item.documents?.km?.thumbnailUrl ||
                    item.documents?.kh?.thumbnailUrl) ||
                "/image/no-image.png";

            const dateValue = item.publishedAt || item.createdAt || "";
            const date = dateValue ? formatLocalizedDate(dateValue, apiLang) : "";

            return { ...item, title, desc, documents, imageUrl, date };
        });
    }, [announcements, isKh, apiLang, labels.khmer, labels.english]);

    const renderLanguageLinks = (
    documents: { label: string; href: string }[],
    compact = false
) => (
    <div
        className={`${bodyClass} flex flex-wrap items-center ${
            compact ? "mt-3 gap-1 text-[9px]" : "mt-6 gap-1 text-[10px]"
        }`}
    >
        <span className="!text-slate-400 !text-[15px]" style={{ fontWeight: 600 }}>
            {labels.language}
        </span>

        {documents.length > 0 ? (
            documents.map((doc) => (
                <Link
                    key={doc.label}
                    href={doc.href}
                    target="_blank"
                    download
                    className={`${bodyClass} inline-flex h-[24px] min-w-[38px] items-center justify-center rounded border border-slate-200 bg-white px-2 !text-[10px] leading-none !text-[#64748B] shadow-sm transition hover:border-[#23395D] hover:!bg-[#23395D] hover:!text-white`}
                    style={{ fontWeight: 600 }}
                >
                    {doc.label}
                </Link>
            ))
        ) : (
            <span
                className={`${bodyClass} inline-flex h-[16px] min-w-[38px] items-center justify-center rounded border border-slate-200 bg-white px-1.5 !text-[5px] leading-none text-slate-400 shadow-sm`}
                style={{ fontWeight: 600 }}
            >
                {labels.noFile}
            </span>
        )}
    </div>
);

    return (
        <main className={`${bodyClass} bg-[#f5f7fb]`}>
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className={`${mainTitleFontClass} text-[#0B2C5F]`}>
                            {labels.headerMain}
                        </p>

                        <h1 className={`${titleFontClass} mt-1 text-[#0B2C5F]`}>
                            {labels.headerSub}
                        </h1>
                    </div>

                    <div className="flex w-full max-w-sm gap-1 rounded-sm border border-gray-300 bg-white p-1 shadow-sm sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-xs transition sm:flex-none ${view === "list"
                                    ? "bg-[#23395D] text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <List size={15} />
                            {labels.list}
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-xs transition sm:flex-none ${view === "grid"
                                    ? "bg-[#23395D] text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Grid3X3 size={15} />
                            {labels.grid}
                        </button>
                    </div>
                </div>

                {loading && (
                    <p className={`${bodyClass} py-10 text-center`}>
                        {labels.loading}
                    </p>
                )}

                {error && !loading && (
                    <p className={`${bodyClass} py-10 text-center text-red-500`}>
                        {error || labels.error}
                    </p>
                )}

                {!loading && !error && content.length === 0 && (
                    <p className={`${bodyClass} py-10 text-center text-slate-500`}>
                        {labels.empty}
                    </p>
                )}

                {!loading && !error && content.length > 0 && view === "list" && (
                    <div className="divide-y divide-gray-300">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="flex flex-col gap-8 py-6 md:flex-row md:items-center"
                            >
                                <div className="w-full flex-shrink-0 md:w-44">
                                    <div className="overflow-hidden border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
                                        <div className="relative aspect-[210/297] w-full overflow-hidden bg-white">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.src = "/image/no-image.png";
                                                    target.className =
                                                        "h-full w-full object-contain p-6 opacity-30";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <span className="inline-block rounded bg-[#3f51b5] px-2 py-[1px] text-[12px] font-semibold uppercase text-white">
                                        {labels.announcement}
                                    </span>

                                    <h2
                                        className={`${mainTitleFontClass} mt-2 text-slate-900`}
                                    >
                                        {item.title}
                                    </h2>

                                    <p
                                        className={`${bodyClass} mt-1 !text-[14px] font-semibold text-slate-800`} style={{ fontWeight: 600 }}
                                    >
                                        {item.date || labels.noDate}
                                    </p>

                                    <p
                                        className={`${bodyClass} mt-4 line-clamp-2 text-slate-600`}
                                    >
                                        {item.desc || labels.noDescription}
                                    </p>

                                    {renderLanguageLinks(item.documents)}
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
                                                const target =
                                                    e.target as HTMLImageElement;
                                                target.src = "/image/no-image.png";
                                                target.className =
                                                    "h-full w-full object-contain p-6 opacity-30";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col justify-between px-3 py-4">
                                    <div className="min-w-0">
                                        <span className="inline-block rounded bg-[#3f51b5] px-2 py-[1px] text-[12px] font-semibold uppercase text-white">
                                            {labels.announcement}
                                        </span>

                                        <div
                                            className={`${bodyClass} mt-2 flex items-center gap-1.5 text-[10px] text-[#1a2b4b]`}
                                        >
                                            <CalendarDays size={13} />
                                            {item.date || labels.noDate}
                                        </div>

                                        <h2
                                            className={`${mainTitleFontClass} mt-1 line-clamp-2 text-[#1a2b4b]`}
                                        >
                                            {item.title}
                                        </h2>

                                        <p
                                            className={`${bodyClass} mt-2 line-clamp-3 text-slate-700`}
                                        >
                                            {item.desc || labels.noDescription}
                                        </p>
                                    </div>

                                    {renderLanguageLinks(item.documents, true)}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}