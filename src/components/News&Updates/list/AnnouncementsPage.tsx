/* eslint-disable @next/next/no-img-element */
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
    const [view, setView] = useState<"list" | "grid">("list");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/newupdate-page/announcements?t=${Date.now()}`, {
                    signal: controller.signal,
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Failed to fetch");

                if (isMounted) {
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

            {/* Header + Toggle */}
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <p className="text-2xl font-bold text-gray-900 md:text-3xl">Latest</p>
                    <h1 className="mt-1 text-4xl font-extrabold text-[#0f2347] md:text-5xl">
                        Announcements
                    </h1>
                    <div className="mt-4 h-1.5 w-60 bg-orange-500" />
                </div>

                <div className="flex items-center gap-2 mt-4 bg-gray-100 rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setView("list")}
                        className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${view === "list"
                            ? "bg-[#2f3e55] text-white shadow"
                            : "text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        List
                    </button>

                    <button
                        onClick={() => setView("grid")}
                        className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${view === "grid"
                            ? "bg-[#2f3e55] text-white shadow"
                            : "text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                        </svg>
                        Grid
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Fetching latest data...</p>
                </div>
            )}

            {/* Error */}
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

            {/* Empty */}
            {!loading && announcements.length === 0 && !error && (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <p className="text-gray-400 text-lg">No announcements available right now.</p>
                </div>
            )}

            {/* List / Grid */}
            {!loading && !error && announcements.length > 0 && (
                <div
                    className={
                        view === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "flex flex-col gap-6"
                    }
                >
                    {announcements.map((item) => {
                        const thumb = item.documentThumbnails?.[language] || item.documentThumbnails?.en;
                        const docUrl = item.documents?.[language]?.url || item.documents?.en?.url;

                        return (
                            <div
                                key={item.id}
                                className={`group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition ${view === "list"
                                    ? "flex flex-col md:flex-row gap-6 p-5"
                                    : "p-4 flex flex-col"
                                    }`}
                            >
                                {/* Image */}
                                <div className={`${view === "list" ? "md:w-40" : "w-full"} flex-shrink-0`}>
                                    {thumb ? (
                                        <img
                                            src={thumb}
                                            alt="Thumbnail"
                                            className={`w-full ${view === "list"
                                                ? "h-48"
                                                : "aspect-[1/1.414]"
                                                } object-cover rounded-xl`}
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                                            No Preview
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-between flex-1 mt-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600">
                                            {item.title?.[language] || item.title?.en || "Untitled"}
                                        </h2>

                                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                                            {item.description?.[language] || item.description?.en}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                        {/* Date */}
                                        <span className="text-xs text-slate-400">
                                            {item.publishedAt
                                                ? new Date(item.publishedAt).toLocaleDateString()
                                                : "N/A"}
                                        </span>

                                        {/* Download Link */}
                                        {docUrl && (
                                            <Link
                                                href={docUrl}
                                                target="_blank"
                                                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                {downloadText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}