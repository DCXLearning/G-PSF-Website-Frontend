"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";
type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    slug?: string | null;
    description?: I18n | null;
    publishedAt?: string | null;
    document?: string | null;
    documentThumbnail?: string | null;
    documents?: {
        en?: { url?: string; thumbnailUrl?: string };
        km?: { url?: string; thumbnailUrl?: string } | null;
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
    description?: I18n | null;
    settings?: {
        sort?: string;
        limit?: number;
        categoryIds?: number[];
    } | null;
    posts?: ApiPost[];
};

type ApiResponse = {
    success?: boolean;
    data?: {
        blocks?: ApiBlock[];
    };
};

const CACHE_KEY = "events-announcements-cache";

function pickText(i18n: I18n | null | undefined, lang: ApiLang) {
    if (!i18n) return "";
    return i18n[lang] || i18n.en || i18n.km || "";
}

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(d);
}

function readCache(): { sectionTitle: string; posts: ApiPost[] } | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            sectionTitle: parsed?.sectionTitle || "",
            posts: Array.isArray(parsed?.posts) ? parsed.posts : [],
        };
    } catch {
        return null;
    }
}

function writeCache(data: { sectionTitle: string; posts: ApiPost[] }) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore cache errors
    }
}

function AnnouncementSkeleton() {
    return (
        <div className="border border-gray-200 p-8 flex gap-6 items-start animate-pulse">
            <div className="flex-shrink-0 mt-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded bg-slate-200" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <div className="h-3 w-36 bg-slate-200 rounded mb-3" />
                <div className="h-8 w-3/4 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-slate-200 rounded mb-4" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

export default function EventsAndAnnouncements() {
    const { language } = useLanguage();
    const apiLang: ApiLang = language === "kh" ? "km" : "en";

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [sectionTitle, setSectionTitle] = useState("Announcements");
    const [posts, setPosts] = useState<ApiPost[]>([]);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    useEffect(() => {
        setMounted(true);

        const cached = readCache();
        if (cached) {
            setSectionTitle(cached.sectionTitle || "Announcements");
            setPosts(cached.posts || []);
            setLoading(false);
        }

        let alive = true;

        async function fetchAnnouncements() {
            try {
                setError("");

                const res = await fetch("/api/newupdate-page/section", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const json: ApiResponse = await res.json();
                const blocks = json?.data?.blocks || [];

                const announcementBlock =
                    blocks.find((block) => block.type === "announcement" && block.id === 32) ||
                    blocks.find((block) => block.type === "announcement");

                if (!alive) return;

                if (!announcementBlock) {
                    return;
                }

                const nextSectionTitle =
                    pickText(announcementBlock.title, apiLang) || "Announcements";

                const sortedPosts = [...(announcementBlock.posts || [])].sort((a, b) => {
                    const aTime = new Date(a.publishedAt || 0).getTime();
                    const bTime = new Date(b.publishedAt || 0).getTime();
                    return bTime - aTime;
                });

                const nextPosts = sortedPosts.slice(0, announcementBlock.settings?.limit || 2);

                setSectionTitle(nextSectionTitle);
                setPosts(nextPosts);
                writeCache({
                    sectionTitle: nextSectionTitle,
                    posts: nextPosts,
                });
            } catch (error) {
                if (!alive) return;
                console.error("Failed to fetch announcements:", error);
                setError("Failed to load");
                // keep cached posts, do not clear state
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        fetchAnnouncements();

        return () => {
            alive = false;
        };
    }, [apiLang]);

    const labels = useMemo(() => {
        return {
            eventsTitle:
                language === "kh"
                    ? "កាលវិភាគប្រជុំ និងព្រឹត្តិការណ៍"
                    : "Events & Meetings Schedule",
            announcementsTitle:
                sectionTitle || (language === "kh" ? "សេចក្តីជូនដំណឹង" : "Announcements"),
            download: language === "kh" ? "ទាញយក" : "Download",
            noData: language === "kh" ? "មិនមានទិន្នន័យ" : "No announcements available",
            untitled: language === "kh" ? "គ្មានចំណងជើង" : "Untitled",
        };
    }, [language, sectionTitle]);

    const showSkeleton = !mounted || (loading && posts.length === 0);
    const showErrorOnly = !showSkeleton && posts.length === 0 && !!error;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white font-sans text-[#1a2b4b]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column */}
                <div className="lg:col-span-6">
                    <h2 className="text-3xl font-bold mb-6">{labels.eventsTitle}</h2>

                    <div className="bg-[#e9ecef] p-6 rounded-sm">
                        <div className="flex items-center gap-1 bg-white/50 p-1 rounded-full mb-6 border border-gray-200">
                            <button className="flex-1 py-2 px-4 bg-white rounded-full shadow-sm font-bold text-gray-700">
                                May
                            </button>
                            <button className="flex-1 py-2 px-4 text-gray-400 font-bold">
                                June
                            </button>
                            <button className="flex-1 py-2 px-4 text-gray-400 font-bold">
                                July
                            </button>
                            <button className="px-3 text-gray-600 font-bold">›</button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="grid grid-cols-7 mb-4">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className="text-center text-gray-400 font-bold text-xl"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-4">
                                {days.map((day) => (
                                    <div
                                        key={day}
                                        className="relative flex justify-center items-center"
                                    >
                                        {day === 10 ? (
                                            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-inner">
                                                {day}
                                            </div>
                                        ) : (
                                            <span className="text-xl font-medium text-gray-800">
                                                {day}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-6">
                    <h2 className="text-3xl font-bold mb-6">{labels.announcementsTitle}</h2>

                    <div className="space-y-6">
                        {showSkeleton ? (
                            <>
                                <AnnouncementSkeleton />
                                <AnnouncementSkeleton />
                            </>
                        ) : posts.length === 0 ? (
                            <div className="border border-gray-200 p-8 text-sm text-gray-500">
                                {showErrorOnly ? error : labels.noData}
                            </div>
                        ) : (
                            posts.map((post) => {
                                const title = pickText(post.title, apiLang) || labels.untitled;
                                const description = pickText(post.description, apiLang);
                                const categoryName =
                                    pickText(post.category?.name, apiLang) || "Announcement";

                                const fileUrl =
                                    post.documents?.[apiLang]?.url ||
                                    post.documents?.en?.url ||
                                    post.document ||
                                    "#";

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
                                                {post.publishedAt ? ` • ${formatDate(post.publishedAt)}` : ""}
                                            </span>

                                            <h3 className="text-2xl font-bold mb-3 leading-tight text-[#1a2b4b]">
                                                {title}
                                            </h3>

                                            <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                                {description || "-"}
                                            </p>

                                            <Link
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold flex items-center mt-auto uppercase tracking-tighter hover:text-orange-500"
                                            >
                                                {labels.download}
                                                <span className="ml-1 text-lg">›</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}