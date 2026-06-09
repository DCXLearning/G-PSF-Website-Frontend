"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedMonthName } from "@/utils/localizedDate";

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
    description?: I18nText;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: string | null;
    isPublished?: boolean | null;
};

type ScheduleBlock = {
    id?: number;
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
    description: string;
    href: string;
};

const daysOfWeekLabel: Record<Lang, string[]> = {
    en: ["S", "M", "T", "W", "T", "F", "S"],
    kh: ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"],
};

function normalizeLang(language: unknown): Lang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

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
    return (
        cleanText(post.publishedAt) ||
        cleanText(post.createdAt) ||
        cleanText(post.updatedAt)
    );
}

function getPostDate(post: SchedulePost): Date | null {
    const rawDate = getPostDateValue(post);

    if (!rawDate) return null;

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime()) ? null : date;
}

function createMonthKey(year: number, month: number): string {
    return `${year}-${month}`;
}

function toKhmerNumber(value: number, lang: Lang): string {
    if (lang !== "kh") return String(value);

    return String(value).replace(
        /\d/g,
        (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)]
    );
}

function formatMonthLabel(month: CalendarMonth, lang: Lang): string {
    return formatLocalizedMonthName(month.year, month.month, lang, true);
}

function buildCalendarMonths(posts: SchedulePost[]): CalendarMonth[] {
    const dates = posts
        .map((post) => getPostDate(post))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    const lastDate = dates[dates.length - 1] ?? new Date();
    const months: CalendarMonth[] = [];

    for (let i = 2; i >= 0; i--) {
        const date = new Date(
            lastDate.getFullYear(),
            lastDate.getMonth() - i,
            1
        );

        months.push({
            key: createMonthKey(date.getFullYear(), date.getMonth()),
            year: date.getFullYear(),
            month: date.getMonth(),
        });
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

        if (!date) continue;

        const monthKey = createMonthKey(date.getFullYear(), date.getMonth());
        const day = date.getDate();
        const mapKey = `${monthKey}-${day}`;

        const postTitle = getText(post.title, lang);
        const postDescription = getText(post.description, lang);

        if (!groupedDates.has(mapKey)) {
            groupedDates.set(mapKey, {
                monthKey,
                day,
                title: postTitle,
                description: postDescription,
                href: buildDetailHref(post),
            });

            continue;
        }

        const existing = groupedDates.get(mapKey);

        if (existing) {
            if (postTitle) {
                existing.title = existing.title
                    ? `${existing.title}\n${postTitle}`
                    : postTitle;
            }

            if (postDescription) {
                existing.description = existing.description
                    ? `${existing.description}\n\n${postDescription}`
                    : postDescription;
            }
        }
    }

    return Array.from(groupedDates.values());
}

function formatSectionTitle(title: string, lang: Lang): string {
    if (title) return title;

    return lang === "kh" ? "កាលវិភាគប្រជុំ" : "Meeting Schedule";
}

function buildDetailHref(post?: SchedulePost): string {
    if (!post?.id) return "";

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
    const isKh = lang === "kh";

    const daysOfWeek = daysOfWeekLabel[lang];
    const totalDays = new Date(month.year, month.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(month.year, month.month, 1).getDay();

    const leadingBlankDays = Array.from(
        { length: firstDayOfWeek },
        (_, index) => index
    );

    const days = Array.from({ length: totalDays }, (_, index) => index + 1);

    const calendarTitleFontClass = isKh
        ? "khmer-font text-[17px] sm:text-[18px] md:text-[20px] leading-[30px] font-medium tracking-normal"
        : "airbnb-font text-[16px] sm:text-[18px] md:text-[20px] leading-[30px] font-medium tracking-[0.7px]";

    const smallFontClass = isKh ? "khmer-font" : "airbnb-font";

    return (
        <div className="flex h-full flex-col overflow-visible rounded-xl border border-gray-100 bg-[#f4f6f7] shadow-sm">
            <div className="py-3 text-center sm:py-4">
                <h3 className={`text-gray-800 ${calendarTitleFontClass}`}>
                    {formatMonthLabel(month, lang)}
                </h3>
            </div>

            <div className="grid grid-cols-7 bg-gray-200/50 py-2">
                {daysOfWeek.map((day, index) => (
                    <div
                        key={`${month.key}-${day}-${index}`}
                        className={`
                            text-center text-[10px] font-bold text-gray-400 sm:text-xs
                            ${smallFontClass}
                        `}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid flex-grow grid-cols-7 gap-y-2 p-3 text-center auto-rows-[32px] sm:p-4">
                {leadingBlankDays.map((blankDay) => (
                    <div key={`${month.key}-blank-${blankDay}`} />
                ))}

                {days.map((day) => {
                    const highlightedDate = highlightedDates.find(
                        (item) => item.monthKey === month.key && item.day === day
                    );

                    if (highlightedDate?.href) {
                        return (
                            <Link
                                key={`${month.key}-${day}`}
                                href={highlightedDate.href}
                                className="group relative flex cursor-pointer items-center justify-center"
                            >
                                <div className="absolute h-7 w-7 rounded-full bg-[#ffb347] shadow-inner sm:h-8 sm:w-8" />

                                <span
                                    className={`
                                        relative z-10 text-xs font-semibold text-black sm:text-sm
                                        ${smallFontClass}
                                    `}
                                >
                                    {toKhmerNumber(day, lang)}
                                </span>

                                <div
                                    className={`
                                        pointer-events-none absolute left-1/2 top-full z-20 hidden w-60
                                        -translate-x-1/2 rounded-xl bg-[#1f2937] px-3 py-2
                                        text-left text-white shadow-xl group-hover:block
                                        ${smallFontClass}
                                    `}
                                >
                                    {highlightedDate.title ? (
                                        <p className="whitespace-pre-line text-xs font-semibold leading-5 sm:text-sm">
                                            {highlightedDate.title}
                                        </p>
                                    ) : null}

                                    {highlightedDate.description ? (
                                        <p className="mt-2 whitespace-pre-line text-[11px] leading-5 text-white/85 sm:text-xs">
                                            {highlightedDate.description}
                                        </p>
                                    ) : null}
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={`${month.key}-${day}`}
                            className="relative flex items-center justify-center"
                        >
                            <span
                                className={`
                                    relative z-10 text-xs font-semibold text-gray-700 sm:text-sm
                                    ${smallFontClass}
                                `}
                            >
                                {toKhmerNumber(day, lang)}
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

    const lang = normalizeLang(language);
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    const isKh = lang === "kh";

    const [isLoading, setIsLoading] = useState(true);
    const [calendarMonths, setCalendarMonths] = useState<CalendarMonth[]>([]);
    const [highlightedDates, setHighlightedDates] = useState<HighlightedDate[]>([]);
    const [sectionTitle, setSectionTitle] = useState("");
    const [showMoreHref, setShowMoreHref] = useState("");

    const titleFontClass = isKh
        ? "title-km khmer-font font-bold"
        : "title-en airbnb-font font-extrabold";

    const bodyFontClass = isKh
        ? "body-km khmer-font"
        : "body-en airbnb-font";

    const labelFontClass = isKh
        ? "body-km khmer-font !font-bold"
        : "body-en airbnb-font !font-bold";

    const buttonFontClass = isKh
        ? "body-km khmer-font font-bold normal-case tracking-normal"
        : "body-en airbnb-font font-bold uppercase tracking-[0.7px]";

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
                    { cache: "no-store" }
                );

                const data = (await response.json()) as ScheduleResponse;

                if (!response.ok || !data.success) {
                    throw new Error("Failed to fetch working groups schedule.");
                }

                const blocks = data.data?.blocks ?? [];

                const scheduleBlock =
                    blocks.find(
                        (block) =>
                            block.enabled === true &&
                            block.type === "post_list" &&
                            getText(block.title, "en") === "Event & Meetings Schedule"
                    ) ??
                    blocks.find(
                        (block) =>
                            block.enabled === true && block.type === "post_list"
                    );

                const posts = (scheduleBlock?.posts ?? [])
                    .filter(
                        (post) =>
                            post.status === "published" &&
                            post.isPublished !== false
                    )
                    .sort((firstPost, secondPost) => {
                        const firstTime = getPostDate(firstPost)?.getTime() ?? 0;
                        const secondTime = getPostDate(secondPost)?.getTime() ?? 0;

                        return secondTime - firstTime;
                    });

                if (!mounted) return;

                setSectionTitle(getText(scheduleBlock?.title, apiLang));
                setCalendarMonths(buildCalendarMonths(posts));
                setHighlightedDates(buildHighlightedDates(posts, apiLang));
                setShowMoreHref("/events-meetings");
            } catch (error) {
                console.error("Failed to load working groups dates:", error);

                if (!mounted) return;

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
        <section className="bg-white px-4 py-4 sm:py-4 lg:py-1">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 sm:mb-14">
                    <p
                        className={`mb-1 text-gray-900 ${labelFontClass}`}
                        style={{ fontWeight: 700 }}
                    >
                        {t.upNext}
                    </p>

                    <h2 className={`mb-4 text-[#2d3436] ${titleFontClass}`}>
                        {finalTitle}
                    </h2>

                    <div className="mt-5 mb-12 h-1.5 w-3/4 max-w-[300px] bg-orange-500 sm:w-full" />
                </div>

                <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                    {calendarMonths.length > 0
                        ? calendarMonths.map((month) => (
                            <Calendar
                                key={month.key}
                                month={month}
                                lang={lang}
                                highlightedDates={highlightedDates}
                            />
                        ))
                        : Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`calendar-placeholder-${index}`}
                                className="flex h-full flex-col overflow-visible rounded-xl border border-gray-100 bg-[#f4f6f7] shadow-sm"
                            >
                                <div className="py-3 text-center sm:py-4">
                                    <div className="mx-auto h-7 w-24 rounded bg-gray-200/80" />
                                </div>

                                <div className="grid grid-cols-7 bg-gray-200/50 py-2">
                                    {Array.from({ length: 7 }).map((__, dayIndex) => (
                                        <div
                                            key={`placeholder-day-label-${index}-${dayIndex}`}
                                            className="h-4"
                                        />
                                    ))}
                                </div>

                                <div className="grid flex-grow grid-cols-7 gap-y-2 p-3 auto-rows-[32px] sm:p-4">
                                    {Array.from({ length: 35 }).map(
                                        (__, dayIndex) => (
                                            <div
                                                key={`placeholder-day-cell-${index}-${dayIndex}`}
                                                className="mx-auto h-6 w-6 rounded-full bg-gray-200/70"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                </div>

                <div className="mt-8 flex justify-center sm:mt-12">
                    {showMoreHref ? (
                        <Link
                            href={showMoreHref}
                            className={`
                                rounded-md bg-[#2c3e50] px-8 py-3 !text-white shadow-lg
                                transition-colors hover:bg-[#34495e] sm:px-10
                                ${buttonFontClass}
                            `}
                        >
                            {t.btn}
                        </Link>
                    ) : (
                        <button
                            disabled
                            className={`
                                cursor-not-allowed rounded-md bg-[#2c3e50] px-8 py-3
                                text-white/80 shadow-lg sm:px-10
                                ${buttonFontClass}
                            `}
                        >
                            {isLoading ? t.loading : t.btn}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}