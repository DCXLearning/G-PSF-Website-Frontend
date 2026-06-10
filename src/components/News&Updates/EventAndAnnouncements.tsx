"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    formatLocalizedDate,
    formatLocalizedMonthName,
} from "@/utils/localizedDate";

type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };
type DocFile = { url?: string; thumbnailUrl?: string } | null;

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    publishedAt?: string | null;
    status?: string;
    isPublished?: boolean;
    document?: string | null;
    documents?: { en?: DocFile; km?: DocFile } | null;
    category?: { id: number; name?: I18n } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    settings?: { limit?: number; categoryIds?: number[] } | null;
    posts?: ApiPost[];
};

type AnnouncementResponse = {
    success?: boolean;
    message?: string;
    data?: { blocks?: ApiBlock[] };
};

type EventResponse = {
    success?: boolean;
    message?: string;
    sectionTitle?: I18n | null;
    limit?: number | null;
    data?: ApiPost[];
};

type CalendarMonth = {
    key: string;
    year: number;
    month: number;
};

type VisibleCalendarMonth = CalendarMonth & {
    realIndex: number;
};

type HighlightedDate = {
    monthKey: string;
    day: number;
    title: string;
    description: string;
    href: string;
};

type CalendarCell = {
    key: string;
    day: number | null;
};

const DAYS_OF_WEEK: Record<ApiLang, string[]> = {
    en: ["S", "M", "T", "W", "T", "F", "S"],
    km: ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"],
};

const TOTAL_CALENDAR_CELLS = 42;
const SAME_CONTENT_HEIGHT = "min-h-[528px]";

function containsKhmer(value?: string | null) {
    return /[\u1780-\u17FF]/.test(value ?? "");
}

function pickText(i18n: I18n | null | undefined, lang: ApiLang) {
    if (!i18n) return "";
    return i18n[lang] || i18n.en || i18n.km || "";
}

function isPublishedPost(post: ApiPost) {
    return post.isPublished === true || post.status === "published";
}

function sortPostsByDate(posts: ApiPost[]) {
    return [...posts].sort((a, b) => {
        const aTime = new Date(a.publishedAt || 0).getTime();
        const bTime = new Date(b.publishedAt || 0).getTime();
        return bTime - aTime;
    });
}

function pickDocumentUrl(post: ApiPost, lang: ApiLang) {
    return post.documents?.[lang]?.url || post.documents?.en?.url || post.document || "";
}

function getPostDate(post: ApiPost) {
    if (!post.publishedAt) return null;
    const date = new Date(post.publishedAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

function buildDetailHref(post: ApiPost) {
    const slug = post.slug?.trim() || "";

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function createMonthKey(year: number, month: number) {
    return `${year}-${month}`;
}

function toLocalizedNumber(value: number, lang: ApiLang) {
    if (lang !== "km") return String(value);
    return String(value).replace(/\d/g, (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)]);
}

function buildCalendarMonths(posts: ApiPost[]): CalendarMonth[] {
    const eventDates = posts
        .map((post) => getPostDate(post))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    if (eventDates.length === 0) {
        const now = new Date();

        return [
            {
                key: createMonthKey(now.getFullYear(), now.getMonth()),
                year: now.getFullYear(),
                month: now.getMonth(),
            },
        ];
    }

    const firstDate = eventDates[0];
    const lastDate = eventDates[eventDates.length - 1];

    const months: CalendarMonth[] = [];
    const current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const end = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

    while (current <= end) {
        months.push({
            key: createMonthKey(current.getFullYear(), current.getMonth()),
            year: current.getFullYear(),
            month: current.getMonth(),
        });

        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

function formatMonthLabel(month: CalendarMonth, lang: ApiLang) {
    return formatLocalizedMonthName(month.year, month.month, lang);
}

function buildCalendarCells(month: CalendarMonth): CalendarCell[] {
    const firstDayIndex = new Date(month.year, month.month, 1).getDay();
    const totalDays = new Date(month.year, month.month + 1, 0).getDate();

    return Array.from({ length: TOTAL_CALENDAR_CELLS }, (_, index) => {
        const dayNumber = index - firstDayIndex + 1;

        return {
            key: `${month.key}-cell-${index}`,
            day: dayNumber >= 1 && dayNumber <= totalDays ? dayNumber : null,
        };
    });
}

function buildHighlightedDates(posts: ApiPost[], lang: ApiLang): HighlightedDate[] {
    const groupedDates = new Map<string, HighlightedDate>();

    for (const post of posts) {
        const date = getPostDate(post);
        if (!date) continue;

        const monthKey = createMonthKey(date.getFullYear(), date.getMonth());
        const day = date.getDate();
        const mapKey = `${monthKey}-${day}`;
        const title = pickText(post.title, lang);
        const description = pickText(post.description, lang);

        if (!groupedDates.has(mapKey)) {
            groupedDates.set(mapKey, {
                monthKey,
                day,
                title,
                description,
                href: buildDetailHref(post),
            });
            continue;
        }

        const existing = groupedDates.get(mapKey);

        if (existing) {
            if (title) existing.title = existing.title ? `${existing.title}\n${title}` : title;
            if (description) {
                existing.description = existing.description
                    ? `${existing.description}\n\n${description}`
                    : description;
            }
        }
    }

    return Array.from(groupedDates.values());
}

function PostCardSkeleton() {
    return (
        <div className="min-h-[252px] animate-pulse border border-gray-200 p-6">
            <div className="mb-3 h-3 w-36 rounded bg-slate-200" />
            <div className="mb-3 h-8 w-3/4 rounded bg-slate-200" />
            <div className="mb-2 h-4 w-full rounded bg-slate-200" />
            <div className="mb-4 h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
    );
}

export default function EventsAndAnnouncements() {
    const { language } = useLanguage();
    const apiLang: ApiLang = language === "kh" ? "km" : "en";

    const isKh = apiLang === "km";
    const titleClass = isKh ? "title-km" : "title-en";
    const mainTitleClass = isKh ? "main-title-km" : "main-title-en";
    const bodyClass = isKh ? "body-km" : "body-en";
    const smallFontClass = isKh ? "khmer-font" : "airbnb-font";

    const [eventLoading, setEventLoading] = useState(true);
    const [eventError, setEventError] = useState("");
    const [eventPosts, setEventPosts] = useState<ApiPost[]>([]);

    const [announcementLoading, setAnnouncementLoading] = useState(true);
    const [announcementError, setAnnouncementError] = useState("");
    const [announcementPosts, setAnnouncementPosts] = useState<ApiPost[]>([]);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

    useEffect(() => {
        let alive = true;

        async function fetchEvents() {
            try {
                setEventError("");
                setEventLoading(true);

                const res = await fetch("/api/newupdate-page/events", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: EventResponse = await res.json();

                if (!res.ok) throw new Error(json.message || "Failed to load events");
                if (!alive) return;

                const publishedPosts = (json.data || []).filter(isPublishedPost);
                setEventPosts(sortPostsByDate(publishedPosts));
            } catch (error) {
                if (!alive) return;
                setEventError(error instanceof Error ? error.message : "Failed to load events");
            } finally {
                if (alive) setEventLoading(false);
            }
        }

        fetchEvents();

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;

        async function fetchAnnouncements() {
            try {
                setAnnouncementError("");
                setAnnouncementLoading(true);

                const res = await fetch("/api/newupdate-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: AnnouncementResponse = await res.json();

                if (!res.ok) throw new Error(json.message || "Failed to load announcements");
                if (!alive) return;

                const blocks = json.data?.blocks || [];
                const announcementBlock =
                    blocks.find((block) => block.type === "announcement" && block.id === 32) ||
                    blocks.find((block) => block.type === "announcement");

                if (!announcementBlock) {
                    setAnnouncementPosts([]);
                    return;
                }

                const publishedPosts = (announcementBlock.posts || []).filter(isPublishedPost);

                setAnnouncementPosts(
                    sortPostsByDate(publishedPosts).slice(
                        0,
                        announcementBlock.settings?.limit || 2
                    )
                );
            } catch (error) {
                if (!alive) return;
                setAnnouncementError(
                    error instanceof Error ? error.message : "Failed to load announcements"
                );
            } finally {
                if (alive) setAnnouncementLoading(false);
            }
        }

        fetchAnnouncements();

        return () => {
            alive = false;
        };
    }, []);

    const labels = useMemo(
        () => ({
            eventsTitle:
                language === "kh"
                    ? "កាលវិភាគប្រជុំ និងព្រឹត្តិការណ៍"
                    : "Events & Meetings Schedule",
            announcementsTitle: language === "kh" ? "សេចក្តីជូនដំណឹង" : "Announcement",
            download: language === "kh" ? "ទាញយក" : "Download",
            noEvents: language === "kh" ? "មិនមានព្រឹត្តិការណ៍" : "No events available",
            noAnnouncements:
                language === "kh"
                    ? "មិនមានសេចក្តីជូនដំណឹង"
                    : "No announcements available",
            untitled: language === "kh" ? "គ្មានចំណងជើង" : "Untitled",
            seeMore: language === "kh" ? "មើលបន្ថែម" : "See More",
        }),
        [language]
    );

    const calendarMonths = useMemo(() => buildCalendarMonths(eventPosts), [eventPosts]);

    useEffect(() => {
        setSelectedMonthIndex(Math.max(0, calendarMonths.length - 1));
    }, [calendarMonths.length]);

    const visibleCalendarMonths = useMemo<VisibleCalendarMonth[]>(() => {
        const endIndex = selectedMonthIndex;
        const startIndex = Math.max(0, endIndex - 2);

        return calendarMonths.slice(startIndex, endIndex + 1).map((month, index) => ({
            ...month,
            realIndex: startIndex + index,
        }));
    }, [calendarMonths, selectedMonthIndex]);

    const highlightedDates = useMemo(
        () => buildHighlightedDates(eventPosts, apiLang),
        [eventPosts, apiLang]
    );

    const selectedMonth =
        calendarMonths[selectedMonthIndex] || calendarMonths[calendarMonths.length - 1];

    const calendarCells = useMemo(() => {
        if (!selectedMonth) return [];
        return buildCalendarCells(selectedMonth);
    }, [selectedMonth]);

    const showEventSkeleton = eventLoading && eventPosts.length === 0;
    const showAnnouncementSkeleton = announcementLoading && announcementPosts.length === 0;

    function goToPreviousMonth() {
        setSelectedMonthIndex((currentIndex) => Math.max(0, currentIndex - 1));
    }

    function goToNextMonth() {
        setSelectedMonthIndex((currentIndex) =>
            Math.min(calendarMonths.length - 1, currentIndex + 1)
        );
    }

    return (
        <div className="mx-auto max-w-7xl bg-white px-4 py-8 text-[#1a2b4b]">
            <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2">
                <div className="flex h-full flex-col">
                    <h2 className={`mb-6 min-h-[48px] text-[#1a2b4b] ${titleClass}`}>
                        {labels.eventsTitle}
                    </h2>

                    <div className={`rounded-sm bg-[#e9ecef] p-6 ${SAME_CONTENT_HEIGHT}`}>
                        {showEventSkeleton ? (
                            <>
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </>
                        ) : eventPosts.length === 0 ? (
                            <div
                                className={`rounded-2xl border border-gray-200 bg-white p-8 text-gray-500 ${bodyClass}`}
                            >
                                {eventError || labels.noEvents}
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex items-center gap-1 rounded-full border border-gray-200 bg-white/50 p-1">
                                    <button
                                        type="button"
                                        onClick={goToPreviousMonth}
                                        disabled={selectedMonthIndex === 0}
                                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center font-bold text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Previous month"
                                    >
                                        ‹
                                    </button>

                                    {visibleCalendarMonths.map((month) => {
                                        const isActive = month.realIndex === selectedMonthIndex;

                                        return (
                                            <button
                                                key={month.key}
                                                type="button"
                                                onClick={() => setSelectedMonthIndex(month.realIndex)}
                                                className={`h-10 flex-1 cursor-pointer whitespace-nowrap rounded-full px-2 text-center text-sm font-bold transition ${
                                                    isActive
                                                        ? "bg-white text-gray-700 shadow-sm"
                                                        : "text-gray-400"
                                                } ${smallFontClass}`}
                                            >
                                                {formatMonthLabel(month, apiLang)}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={goToNextMonth}
                                        disabled={selectedMonthIndex === calendarMonths.length - 1}
                                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center font-bold text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Next month"
                                    >
                                        ›
                                    </button>
                                </div>

                                <div className="min-h-[408px] rounded-2xl bg-white p-6 shadow-sm">
                                    <div className="mb-4 grid grid-cols-7">
                                        {DAYS_OF_WEEK[apiLang].map((day, index) => (
                                            <div
                                                key={`${selectedMonth?.key || "month"}-${day}-${index}`}
                                                className={`flex h-8 items-center justify-center font-bold text-gray-400 ${smallFontClass}`}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid min-h-[300px] grid-cols-7 grid-rows-6 gap-y-2">
                                        {calendarCells.map((cell) => {
                                            if (!cell.day || !selectedMonth) {
                                                return <div key={cell.key} className="h-10" />;
                                            }

                                            const highlightedDate = highlightedDates.find(
                                                (item) =>
                                                    item.monthKey === selectedMonth.key &&
                                                    item.day === cell.day
                                            );

                                            if (highlightedDate?.href) {
                                                return (
                                                    <Link
                                                        key={cell.key}
                                                        href={highlightedDate.href}
                                                        className="group relative flex h-10 items-center justify-center"
                                                    >
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-400 font-bold text-gray-800 shadow-inner ${smallFontClass}`}
                                                        >
                                                            {toLocalizedNumber(cell.day, apiLang)}
                                                        </div>
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={cell.key}
                                                    className="flex h-10 items-center justify-center"
                                                >
                                                    <span
                                                        className={`flex h-10 w-10 items-center justify-center font-medium text-gray-800 ${smallFontClass}`}
                                                    >
                                                        {toLocalizedNumber(cell.day, apiLang)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/events-meetings"
                            className={`rounded-lg bg-blue-950 px-5 py-2 font-semibold text-white hover:bg-blue-900 ${smallFontClass}`}
                        >
                            {labels.seeMore}
                        </Link>
                    </div>
                </div>

                <div className="flex h-full flex-col">
                    <h2 className={`mb-6 min-h-[48px] text-[#1a2b4b] ${titleClass}`}>
                        {labels.announcementsTitle}
                    </h2>

                    <div className={`space-y-6 ${SAME_CONTENT_HEIGHT}`}>
                        {showAnnouncementSkeleton ? (
                            <>
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </>
                        ) : announcementPosts.length === 0 ? (
                            <div
                                className={`min-h-[252px] border border-gray-200 p-6 text-gray-500 ${bodyClass}`}
                            >
                                {announcementError || labels.noAnnouncements}
                            </div>
                        ) : (
                            announcementPosts.map((post) => {
                                const title = pickText(post.title, apiLang) || labels.untitled;
                                const description = pickText(post.description, apiLang);
                                const categoryName =
                                    pickText(post.category?.name, apiLang) ||
                                    labels.announcementsTitle;
                                const documentUrl = pickDocumentUrl(post, apiLang);
                                const useKhmerFont =
                                    apiLang === "km" ||
                                    containsKhmer(categoryName) ||
                                    containsKhmer(title) ||
                                    containsKhmer(description);

                                return (
                                    <div
                                        key={post.id}
                                        className="flex min-h-[252px] items-start gap-6 border border-gray-200 p-6 transition-shadow hover:shadow-md"
                                    >
                                        <div className="mt-2 flex-shrink-0">
                                            <img
                                                src="/icon_NewUpdate_page/icon1.svg"
                                                alt="icon"
                                                className="h-10 w-10 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
                                            />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <span
                                                className={`mb-1 text-[13px] font-bold text-[#1a2b4b] ${
                                                    useKhmerFont
                                                        ? "khmer-font normal-case"
                                                        : "airbnb-font uppercase tracking-wider"
                                                }`}
                                            >
                                                {categoryName}
                                                {post.publishedAt
                                                    ? ` • ${formatLocalizedDate(
                                                          post.publishedAt,
                                                          apiLang
                                                      )}`
                                                    : ""}
                                            </span>

                                            <h3
                                                className={`
                                                    mb-3 text-[#1a2b4b]
                                                    !whitespace-normal !leading-tight line-clamp-2
                                                    ${mainTitleClass}
                                                `}
                                            >
                                                {title}
                                            </h3>

                                            <p className={`mb-4 line-clamp-3 text-gray-600 ${bodyClass}`}>
                                                {description || "-"}
                                            </p>

                                            {documentUrl && (
                                                <Link
                                                    href={documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`
                                                        mt-auto inline-flex w-fit items-center justify-center gap-2
                                                        rounded-md bg-[#f5a20a] px-5 py-2.5
                                                        text-[13px] font-bold !text-white no-underline
                                                        transition hover:bg-[#ea9805]
                                                        hover:!text-white hover:no-underline
                                                        ${
                                                            useKhmerFont
                                                                ? "khmer-font normal-case"
                                                                : "airbnb-font uppercase tracking-tighter"
                                                        }
                                                    `}
                                                >
                                                    <span>{labels.download}</span>
                                                    <span className="mb-[2px] text-lg leading-none">
                                                        ›
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/announcement"
                            className={`rounded-lg bg-blue-950 px-5 py-2 font-semibold text-white hover:bg-blue-900 ${smallFontClass}`}
                        >
                            {labels.seeMore}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}