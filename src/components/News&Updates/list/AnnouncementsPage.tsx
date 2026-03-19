/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Announcement = {
    id: number;
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
    publishedAt?: string;
    documentThumbnails?: { en?: string; km?: string };
    documents?: { en?: { url?: string }; km?: { url?: string } };
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [language] = useState<"en" | "km">("en");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                // Added a cache-busting timestamp to ensure fresh data on reload
                const res = await fetch(`/api/newupdate-page/announcements?t=${Date.now()}`, {
                    signal: controller.signal,
                });

                const result = await res.json();

                if (!res.ok) throw new Error(result.message || "Failed to fetch");

                if (isMounted) {
                    // DEFENSIVE CHECK: Handle cases where data might be result.data or just result
                    const finalData = Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result) ? result : [];

                    setAnnouncements(finalData);
                }
            } catch (err: any) {
                if (err.name !== "AbortError" && isMounted) {
                    setError(err.message);
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

    const downloadText = language === "km" ? "ទាញយកឯកសារ" : "Download";

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 max-w-5xl min-h-[60vh]">
            <div className="mb-10">
                <p className="text-2xl font-bold text-gray-900 md:text-3xl">Latest</p>
                <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl">
                    Announcements
                </h1>
                <div className="mt-4 h-1.5 w-60 bg-orange-500" />
            </div>

            {/* 1. LOADING STATE */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Fetching latest data...</p>
                </div>
            )}

            {/* 2. ERROR STATE */}
            {error && !loading && (
                <div className="text-center py-10 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-medium">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-sm underline text-red-700"
                    >
                        Try reloading the page
                    </button>
                </div>
            )}

            {/* 3. EMPTY STATE */}
            {!loading && announcements.length === 0 && !error && (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <p className="text-gray-400 text-lg">No announcements available right now.</p>
                </div>
            )}

            {/* 4. DATA LIST */}
            <div className="grid gap-8">
                {announcements.map((item) => {
                    const thumb = item.documentThumbnails?.[language] || item.documentThumbnails?.en;
                    const docUrl = item.documents?.[language]?.url || item.documents?.en?.url;

                    return (
                        <div
                            key={item.id}
                            className="group bg-white flex flex-col md:flex-row gap-6 p-5 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                        >
                            {/* Image Left */}
                            <div className="md:w-40 w-full flex-shrink-0">
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt="Thumbnail"
                                        className="w-full h-52 md:h-48 object-cover rounded-xl border border-slate-100"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                                        No Preview
                                    </div>
                                )}
                            </div>

                            {/* Content Right */}
                            <div className="flex flex-col justify-between flex-1">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {item.title?.[language] || item.title?.en || "Untitled"}
                                    </h2>
                                    <p className="text-slate-600 line-clamp-2 text-sm mb-4">
                                        {item.description?.[language] || item.description?.en}
                                    </p>
                                </div>

                                <div className="flex-wrap items-center gap-4 mt-auto">
                                    <span className="text-xs text-slate-400 font-medium uppercase">
                                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "N/A"}
                                    </span>
                                    {docUrl && (
                                        <Link
                                            href={docUrl}
                                            target="_blank"
                                            className="text-sm font-semibold text-blue-600 hover:underline flex items-center"
                                        >
                                            <span className="mr-1">⬇</span> {downloadText}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}