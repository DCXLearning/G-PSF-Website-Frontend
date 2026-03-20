"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
    en?: string | null;
    km?: string | null;
};

type SchedulePost = {
    id?: number;
    slug?: string | null;
    title?: I18nText;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: string | null;
    isPublished?: boolean | null;
};

type ScheduleBlock = {
    type?: string;
    enabled?: boolean;
    title?: I18nText;
    posts?: SchedulePost[];
};

type ScheduleResponse = {
    success?: boolean;
    data?: {
        blocks?: ScheduleBlock[];
    };
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
    href: string;
};

const daysOfWeekLabel: Record<Lang, string[]> = {
    en: ["S", "M", "T", "W", "T", "F", "S"],
    kh: ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"],
};

function cleanText(value?: string | null): string {
    return value?.trim() ?? "";
}

function getText(value: I18nText | undefined, lang: ApiLang): string {
    if (!value) return "";

    if (lang === "km") {
        return cleanText(value.km) || cleanText(value.en);
    }

    return cleanText(value.en) || cleanText(value.km);
}

function getPostDateValue(post: SchedulePost): string {
    // Use the best available date from the API.
    return (
        cleanText(post.publishedAt) ||
        cleanText(post.createdAt) ||
        cleanText(post.updatedAt)
    );
}

function getPostDate(post: SchedulePost): Date | null {
    const rawDate = getPostDateValue(post);

    if (!rawDate) {
        return null;
    }

    const date = new Date(rawDate);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatMonthLabel(month: CalendarMonth, lang: Lang): string {
    const locale = lang === "kh" ? "km-KH" : "en-US";
    const label = new Intl.DateTimeFormat(locale, {
        month: "long",
    }).format(new Date(month.year, month.month, 1));

    return lang === "kh" ? label : label.toUpperCase();
}

function createMonthKey(year: number, month: number): string {
    return `${year}-${month}`;
}

function buildCalendarMonths(posts: SchedulePost[]): CalendarMonth[] {
    const months: CalendarMonth[] = [];
    const seen = new Set<string>();

    const dates = posts
        .map((post) => getPostDate(post))
        .filter((date): date is Date => date !== null)
        .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

    const startDate = dates[0] ?? new Date();
    let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // Build 3 months for the calendar UI, starting from the first event month.
    while (months.length < 3) {
        const key = createMonthKey(cursor.getFullYear(), cursor.getMonth());

        if (!seen.has(key)) {
            seen.add(key);
            months.push({
                key,
                year: cursor.getFullYear(),
                month: cursor.getMonth(),
            });
        }

        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return months;
}

function buildHighlightedDates(
    posts: SchedulePost[],
    lang: ApiLang
): HighlightedDate[] {
    const groupedDates = new Map<string, HighlightedDate>();

    for (const post of posts) {
        const date = getPostDate(post);

        if (!date) {
            continue;
        }

        const monthKey = createMonthKey(date.getFullYear(), date.getMonth());
        const day = date.getDate();
        const mapKey = `${monthKey}-${day}`;
        const postTitle = getText(post.title, lang);

        // Save the post title and detail link on each date for hover + click.
        if (!groupedDates.has(mapKey)) {
            groupedDates.set(mapKey, {
                monthKey,
                day,
                title: postTitle,
                href: buildDetailHref(post),
            });
            continue;
        }

        const existing = groupedDates.get(mapKey);

        if (existing && postTitle) {
            existing.title = existing.title
                ? `${existing.title}\n${postTitle}`
                : postTitle;
        }
    }

    return Array.from(groupedDates.values());
}

function formatSectionTitle(title: string, lang: Lang): string {
    if (title) {
        return title;
    }

    return lang === "kh" ? "កាលវិភាគប្រជុំ" : "Meeting Schedule";
}

function buildDetailHref(post?: SchedulePost): string {
    if (!post?.id) {
        return "";
    }

    const slug = cleanText(post.slug);

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

function Calendar({
    month,
    lang,
    highlightedDates,
}: {
    month: CalendarMonth;
    lang: Lang;
    highlightedDates: HighlightedDate[];
}) {
    const daysOfWeek = daysOfWeekLabel[lang];
    const totalDays = new Date(month.year, month.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(month.year, month.month, 1).getDay();
    const leadingBlankDays = Array.from({ length: firstDayOfWeek }, (_, index) => index);
    const days = Array.from({ length: totalDays }, (_, index) => index + 1);

    return (
        <div className="bg-[#f4f6f7] rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="py-3 sm:py-4 text-center">
                <h3
                    className={`text-lg sm:text-xl font-medium tracking-widest text-gray-800 ${
                        lang === "kh" ? "khmer-font tracking-normal" : ""
                    }`}
                >
                    {formatMonthLabel(month, lang)}
                </h3>
            </div>

            <div className="bg-gray-200/50 grid grid-cols-7 py-2">
                {daysOfWeek.map((day, index) => (
                    <div
                        key={`${month.key}-${day}-${index}`}
                        className={`text-center text-[10px] sm:text-xs font-bold text-gray-400 ${
                            lang === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="p-3 sm:p-4 grid grid-cols-7 gap-y-2 text-center flex-grow auto-rows-[32px]">
                {leadingBlankDays.map((blankDay) => (
                    <div key={`${month.key}-blank-${blankDay}`} />
                ))}

                {days.map((day) => {
                    const highlightedDate = highlightedDates.find(
                        (item) => item.monthKey === month.key && item.day === day
                    );

                    // Make highlighted days clickable so they open the post detail page.
                    if (highlightedDate?.href) {
                        return (
                            <Link
                                key={`${month.key}-${day}`}
                                href={highlightedDate.href}
                                className="relative flex items-center justify-center cursor-pointer"
                                title={highlightedDate.title || undefined}
                            >
                                <div className="absolute w-7 h-7 sm:w-8 sm:h-8 bg-[#ffb347] rounded-full shadow-inner" />

                                <span className="relative z-10 text-xs sm:text-sm font-semibold text-black">
                                    {day}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={`${month.key}-${day}`}
                            className="relative flex items-center justify-center"
                        >
                            <span className="relative z-10 text-xs sm:text-sm font-semibold text-gray-700">
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function WorkingGroupsDate() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";

    const [isLoading, setIsLoading] = useState(true);
    const [calendarMonths, setCalendarMonths] = useState<CalendarMonth[]>(() =>
        buildCalendarMonths([])
    );
    const [highlightedDates, setHighlightedDates] = useState<HighlightedDate[]>([]);
    const [sectionTitle, setSectionTitle] = useState("");
    const [showMoreHref, setShowMoreHref] = useState("");

    const t = {
        en: {
            upNext: "Previous",
            btn: "Show More",
            loading: "Loading...",
        },
        kh: {
            upNext: "ខាងមុខនេះ",
            btn: "មើលបន្ថែម",
            loading: "កំពុងទាញយក...",
        },
    }[lang];

    useEffect(() => {
        let mounted = true;

        async function loadSchedule() {
            try {
                setIsLoading(true);

                const response = await fetch(
                    "/api/working-groups-page/section?slug=working-groups&types=post_list",
                    {
                        cache: "no-store",
                    }
                );

                const data = (await response.json()) as ScheduleResponse;

                if (!response.ok || !data.success) {
                    throw new Error("Failed to fetch working groups schedule.");
                }

                const blocks = data.data?.blocks ?? [];

                // Pick the Event & Meetings Schedule block from the page response.
                const scheduleBlock =
                    blocks.find(
                        (block) =>
                            block.enabled === true &&
                            block.type === "post_list" &&
                            getText(block.title, "en") === "Event & Meetings Schedule"
                    ) ?? blocks.find((block) => block.enabled === true && block.type === "post_list");

                const posts = (scheduleBlock?.posts ?? [])
                    .filter(
                        (post) => post.status === "published" && post.isPublished !== false
                    )
                    .sort((firstPost, secondPost) => {
                        const firstTime = getPostDate(firstPost)?.getTime() ?? 0;
                        const secondTime = getPostDate(secondPost)?.getTime() ?? 0;
                        return secondTime - firstTime;
                    });

                if (!mounted) {
                    return;
                }

                setSectionTitle(getText(scheduleBlock?.title, apiLang));
                setCalendarMonths(buildCalendarMonths(posts));
                setHighlightedDates(buildHighlightedDates(posts, apiLang));
                // Use the section id for the "Show More" page.
                setShowMoreHref(
                    scheduleBlock?.id ? `/sections/${scheduleBlock.id}/posts` : ""
                );
            } catch (error) {
                console.error("Failed to load working groups dates:", error);

                if (!mounted) {
                    return;
                }

                setSectionTitle("");
                setCalendarMonths(buildCalendarMonths([]));
                setHighlightedDates([]);
                setShowMoreHref("");
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        loadSchedule();

        return () => {
            mounted = false;
        };
    }, [apiLang]);

    const finalTitle = useMemo(
        () => formatSectionTitle(sectionTitle, lang),
        [sectionTitle, lang]
    );

    return (
        <section className="bg-white py-4 sm:py-4 lg:py-1 px-4">
            <div className="max-w-7xl px-4 mx-auto">
                <div className="mb-10 sm:mb-14">
                    <p
                        className={`text-base sm:text-xl font-bold text-gray-800 mb-1 ${
                            lang === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {t.upNext}
                    </p>

                    <h2
                        className={`text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2d3436] mb-4 ${
                            lang === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {finalTitle}
                    </h2>

                    <div className="w-40 sm:w-64 h-1.5 bg-[#f39c12] rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {calendarMonths.map((month) => (
                        <Calendar
                            key={month.key}
                            month={month}
                            lang={lang}
                            highlightedDates={highlightedDates}
                        />
                    ))}
                </div>

                <div className="flex justify-center mt-8 sm:mt-12">
                    {showMoreHref ? (
                        <Link
                            href={showMoreHref}
                            className={`bg-[#2c3e50] hover:bg-[#34495e] text-white px-8 sm:px-10 py-3 rounded-md font-bold uppercase tracking-wider text-xs sm:text-sm transition-colors shadow-lg ${
                                lang === "kh"
                                    ? "khmer-font normal-case tracking-normal"
                                    : ""
                            }`}
                        >
                            {t.btn}
                        </Link>
                    ) : (
                        <button
                            disabled
                            className={`bg-[#2c3e50] text-white/80 px-8 sm:px-10 py-3 rounded-md font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg cursor-not-allowed ${
                                lang === "kh"
                                    ? "khmer-font normal-case tracking-normal"
                                    : ""
                            }`}
                        >
                            {isLoading ? t.loading : t.btn}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
