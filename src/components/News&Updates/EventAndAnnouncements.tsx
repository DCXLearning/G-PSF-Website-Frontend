"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type DocFile = {
    url?: string;
    thumbnailUrl?: string;
} | null;

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    publishedAt?: string | null;
    status?: string;
    isPublished?: boolean;
    document?: string | null;
    documents?: {
        en?: DocFile;
        km?: DocFile;
    } | null;
    category?: {
        id: number;
        name?: I18n;
    } | null;
};

type ApiBlock = {
    id: number;
    type: string;
    title?: I18n;
    settings?: {
        limit?: number;
        categoryIds?: number[];
    } | null;
    posts?: ApiPost[];
};

type AnnouncementResponse = {
    success?: boolean;
    message?: string;
    data?: {
        blocks?: ApiBlock[];
    };
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

type HighlightedDate = {
    monthKey: string;
    day: number;
    title: string;
    description: string;
    href: string;
};

const DAYS_OF_WEEK: Record<ApiLang, string[]> = {
    en: ["S", "M", "T", "W", "T", "F", "S"],
    km: ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"],
};

function pickText(i18n: I18n | null | undefined, lang: ApiLang) {
    if (!i18n) return "";
    return i18n[lang] || i18n.en || i18n.km || "";
}

function formatDate(dateStr?: string | null, lang: ApiLang = "en") {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function isPublishedPost(post: ApiPost) {
    return post.isPublished === true || post.status === "published";
}

function sortPostsByDate(posts: ApiPost[]) {
    // Keep the newest posts first so the homepage always shows recent content.
    return [...posts].sort((a, b) => {
        const aTime = new Date(a.publishedAt || 0).getTime();
        const bTime = new Date(b.publishedAt || 0).getTime();
        return bTime - aTime;
    });
}

function pickDocumentUrl(post: ApiPost, lang: ApiLang) {
    return post.documents?.[lang]?.url || post.documents?.en?.url || post.document || "";
}

function getPostDateValue(post: ApiPost) {
    return post.publishedAt || "";
}

function getPostDate(post: ApiPost) {
    const dateValue = getPostDateValue(post);

    if (!dateValue) {
        return null;
    }

    const date = new Date(dateValue);
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

function buildCalendarMonths(posts: ApiPost[]): CalendarMonth[] {
    const eventDates = posts
        .map((post) => getPostDate(post))
        .filter((date): date is Date => date !== null)
        .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

    const startDate = eventDates[0] ?? new Date();
    const months: CalendarMonth[] = [];

    // Build 3 tabs for the old calendar UI.
    for (let index = 0; index < 3; index += 1) {
        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);

        months.push({
            key: createMonthKey(monthDate.getFullYear(), monthDate.getMonth()),
            year: monthDate.getFullYear(),
            month: monthDate.getMonth(),
        });
    }

    return months;
}

function formatMonthLabel(month: CalendarMonth, lang: ApiLang) {
    return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
        month: "long",
    }).format(new Date(month.year, month.month, 1));
}

function buildHighlightedDates(posts: ApiPost[], lang: ApiLang): HighlightedDate[] {
    const groupedDates = new Map<string, HighlightedDate>();

    for (const post of posts) {
        const date = getPostDate(post);

        if (!date) {
            continue;
        }

        const monthKey = createMonthKey(date.getFullYear(), date.getMonth());
        const day = date.getDate();
        const mapKey = `${monthKey}-${day}`;
        const title = pickText(post.title, lang);
        const description = pickText(post.description, lang);

        // Group events by day so one date can represent multiple posts.
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
            if (title) {
                existing.title = existing.title ? `${existing.title}\n${title}` : title;
            }

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
        <div className="border border-gray-200 p-8 animate-pulse">
            <div className="h-3 w-36 bg-slate-200 rounded mb-3" />
            <div className="h-8 w-3/4 bg-slate-200 rounded mb-3" />
            <div className="h-4 w-full bg-slate-200 rounded mb-2" />
            <div className="h-4 w-5/6 bg-slate-200 rounded mb-4" />
            <div className="flex gap-6">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

export default function EventsAndAnnouncements() {
    const { language } = useLanguage();
    const apiLang: ApiLang = language === "kh" ? "km" : "en";

    // Left side: event calendar data.
    const [eventLoading, setEventLoading] = useState(true);
    const [eventError, setEventError] = useState("");
    const [eventPosts, setEventPosts] = useState<ApiPost[]>([]);

    // Right side: announcement card data.
    const [announcementLoading, setAnnouncementLoading] = useState(true);
    const [announcementError, setAnnouncementError] = useState("");
    const [announcementPosts, setAnnouncementPosts] = useState<ApiPost[]>([]);
    // This controls which month tab is active in the old calendar UI.
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

    useEffect(() => {
        let alive = true;

        async function fetchEvents() {
            try {
                setEventError("");
                setEventLoading(true);

                // Load only the News & Updates event section from the dedicated API route.
                const res = await fetch("/api/newupdate-page/events", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: EventResponse = await res.json();

                if (!res.ok) {
                    throw new Error(json.message || "Failed to load events");
                }

                if (!alive) return;

                // Keep only published items, sort newest first, then respect the CMS limit.
                const publishedPosts = (json.data || []).filter(isPublishedPost);
                const sortedPosts = sortPostsByDate(publishedPosts);
                const limitedPosts = sortedPosts.slice(0, json.limit || 2);

                setEventPosts(limitedPosts);
            } catch (error) {
                if (!alive) return;
                const message =
                    error instanceof Error ? error.message : "Failed to load events";
                setEventError(message);
            } finally {
                if (!alive) return;
                setEventLoading(false);
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

                // Load the full page section response, then pick only the announcement block.
                const res = await fetch("/api/newupdate-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: AnnouncementResponse = await res.json();

                if (!res.ok) {
                    throw new Error(json.message || "Failed to load announcements");
                }

                if (!alive) return;

                // The page section response contains many blocks.
                // We only want the announcement block for the right side.
                const blocks = json.data?.blocks || [];
                const announcementBlock =
                    blocks.find((block) => block.type === "announcement" && block.id === 32) ||
                    blocks.find((block) => block.type === "announcement");

                if (!announcementBlock) {
                    setAnnouncementPosts([]);
                    return;
                }

                const publishedPosts = (announcementBlock.posts || []).filter(isPublishedPost);
                const sortedPosts = sortPostsByDate(publishedPosts);
                const limitedPosts = sortedPosts.slice(0, announcementBlock.settings?.limit || 2);

                setAnnouncementPosts(limitedPosts);
            } catch (error) {
                if (!alive) return;
                const message =
                    error instanceof Error ? error.message : "Failed to load announcements";
                setAnnouncementError(message);
            } finally {
                if (!alive) return;
                setAnnouncementLoading(false);
            }
        }

        fetchAnnouncements();

        return () => {
            alive = false;
        };
    }, []);

    const labels = useMemo(() => {
        return {
            // Keep the original UI heading text stable.
            // Only the event dates are dynamic, not this label.
            eventsTitle:
                language === "kh"
                    ? "កាលវិភាគប្រជុំ និងព្រឹត្តិការណ៍"
                    : "Events & Meetings Schedule",
            // Keep the original right-side heading text too.
            announcementsTitle:
                language === "kh" ? "សេចក្តីជូនដំណឹង" : "Announcement",
            eventLabel: language === "kh" ? "ព្រឹត្តិការណ៍" : "Event",
            download: language === "kh" ? "ទាញយក" : "Download",
            viewDetail: language === "kh" ? "មើលលម្អិត" : "View Detail",
            noEvents: language === "kh" ? "មិនមានព្រឹត្តិការណ៍" : "No events available",
            noAnnouncements:
                language === "kh" ? "មិនមានសេចក្តីជូនដំណឹង" : "No announcements available",
            untitled: language === "kh" ? "គ្មានចំណងជើង" : "Untitled",
            seeMore: language === "kh" ? "មើលបន្ថែម" : "See More",
        };
    }, [language]);

    // Keep the original UI labels instead of replacing them with CMS block titles.
    const eventsTitle = labels.eventsTitle;
    const announcementsTitle = labels.announcementsTitle;
    // These values are used only to paint the old calendar UI with real event data.
    const calendarMonths = useMemo(() => buildCalendarMonths(eventPosts), [eventPosts]);
    const highlightedDates = useMemo(
        () => buildHighlightedDates(eventPosts, apiLang),
        [eventPosts, apiLang]
    );
    const selectedMonth = calendarMonths[selectedMonthIndex] || calendarMonths[0];

    const showEventSkeleton = eventLoading && eventPosts.length === 0;
    const showAnnouncementSkeleton =
        announcementLoading && announcementPosts.length === 0;

    useEffect(() => {
        // Reset the tab when the event data changes.
        setSelectedMonthIndex(0);
    }, [eventPosts]);

    function goToNextMonth() {
        if (calendarMonths.length === 0) {
            return;
        }

        // Move to the next month tab and loop back to the first one at the end.
        setSelectedMonthIndex((currentIndex) => (currentIndex + 1) % calendarMonths.length);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white font-sans text-[#1a2b4b]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-6">
                    <h2 className="text-3xl khmer-font font-bold mb-6">{eventsTitle}</h2>

                    <div className="bg-[#e9ecef] p-6 rounded-sm">
                        {showEventSkeleton ? (
                            <>
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </>
                        ) : eventPosts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
                                {eventError || labels.noEvents}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-1 bg-white/50 p-1 rounded-full mb-6 border border-gray-200">
                                    {calendarMonths.map((month, index) => {
                                        const isActive = index === selectedMonthIndex;

                                        return (
                                            <button
                                                key={month.key}
                                                type="button"
                                                onClick={() => setSelectedMonthIndex(index)}
                                                className={`flex-1 py-2 px-4 rounded-full font-bold transition ${
                                                    isActive
                                                        ? "bg-white shadow-sm text-gray-700"
                                                        : "text-gray-400"
                                                } ${apiLang === "km" ? "khmer-font" : ""}`}
                                            >
                                                {formatMonthLabel(month, apiLang)}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={goToNextMonth}
                                        className="px-3 text-gray-600 font-bold"
                                        aria-label="Next month"
                                    >
                                        ›
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="grid grid-cols-7 mb-4">
                                        {DAYS_OF_WEEK[apiLang].map((day, index) => (
                                            <div
                                                key={`${selectedMonth?.key || "month"}-${day}-${index}`}
                                                className={`text-center text-gray-400 font-bold text-xl ${
                                                    apiLang === "km" ? "khmer-font text-sm" : ""
                                                }`}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-y-4">
                                        {selectedMonth ? (
                                            <>
                                                {Array.from(
                                                    {
                                                        length: new Date(
                                                            selectedMonth.year,
                                                            selectedMonth.month,
                                                            1
                                                        ).getDay(),
                                                    },
                                                    (_, index) => (
                                                        <div key={`${selectedMonth.key}-blank-${index}`} />
                                                    )
                                                )}

                                                {Array.from(
                                                    {
                                                        length: new Date(
                                                            selectedMonth.year,
                                                            selectedMonth.month + 1,
                                                            0
                                                        ).getDate(),
                                                    },
                                                    (_, index) => index + 1
                                                ).map((day) => {
                                                    const highlightedDate = highlightedDates.find(
                                                        (item) =>
                                                            item.monthKey === selectedMonth.key &&
                                                            item.day === day
                                                    );

                                                    if (highlightedDate?.href) {
                                                        return (
                                                            <Link
                                                                key={`${selectedMonth.key}-${day}`}
                                                                href={highlightedDate.href}
                                                                className="group relative flex justify-center items-center"
                                                            >
                                                                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-inner">
                                                                    {day}
                                                                </div>

                                                                {(highlightedDate.title ||
                                                                    highlightedDate.description) ? (
                                                                    <div
                                                                        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[#1f2937] px-3 py-2 text-left text-white shadow-xl group-hover:block ${
                                                                            apiLang === "km"
                                                                                ? "khmer-font"
                                                                                : ""
                                                                        }`}
                                                                    >
                                                                        {highlightedDate.title ? (
                                                                            <p className="text-xs sm:text-sm font-semibold whitespace-pre-line">
                                                                                {highlightedDate.title}
                                                                            </p>
                                                                        ) : null}

                                                                        {highlightedDate.description ? (
                                                                            <p className="mt-2 text-[11px] sm:text-xs leading-5 text-white/85 whitespace-pre-line">
                                                                                {highlightedDate.description}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                ) : null}
                                                            </Link>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={`${selectedMonth.key}-${day}`}
                                                            className="relative flex justify-center items-center"
                                                        >
                                                            <span className="text-xl font-medium text-gray-800">
                                                                {day}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/events-meetings"
                            className="text-white khmer-font bg-blue-950 hover:bg-blue-900 py-2 px-4 rounded-lg font-semibold"
                        >
                            {labels.seeMore}
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <h2 className="text-3xl font-bold mb-6">{announcementsTitle}</h2>

                    <div className="space-y-6">
                        {showAnnouncementSkeleton ? (
                            <>
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </>
                        ) : announcementPosts.length === 0 ? (
                            <div className="border border-gray-200 p-8 text-sm text-gray-500">
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

                                return (
                                    <div
                                        key={post.id}
                                        className="border border-gray-200 p-8 flex gap-6 hover:shadow-md transition-shadow items-start"
                                    >
                                        <div className="flex-shrink-0 mt-2">
                                            <img
                                                src="/icon_NewUpdate_page/icon1.svg"
                                                alt="icon"
                                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                            />
                                        </div>

                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[#1a2b4b]">
                                                {categoryName}
                                                {post.publishedAt
                                                    ? ` • ${formatDate(post.publishedAt, apiLang)}`
                                                    : ""}
                                            </span>

                                            <h3 className="text-2xl font-bold mb-3 leading-tight text-[#1a2b4b]">
                                                {title}
                                            </h3>

                                            <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                                {description || "-"}
                                            </p>

                                            {documentUrl ? (
                                                <Link
                                                    href={documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] khmer-font font-bold flex items-center mt-auto uppercase tracking-tighter hover:text-orange-500"
                                                >
                                                    {labels.download}
                                                    <span className="ml-1 text-lg">›</span>
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/announcement"
                            className="text-white khmer-font bg-blue-950 hover:bg-blue-900 py-2 px-4 rounded-lg font-semibold"
                        >
                            {labels.seeMore}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
