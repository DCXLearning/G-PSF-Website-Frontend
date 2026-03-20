/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type EventPost = {
    id: number;
    title?: I18n;
    description?: I18n;
    publishedAt?: string;
    coverImage?: string;
    documentThumbnails?: { en?: string; km?: string } | null;
    documents?: { en?: { url?: string }; km?: { url?: string } } | null;
};

export default function EventsListPage() {
    const { language } = useLanguage();
    const apiLang: "en" | "km" = language === "kh" ? "km" : "en";

    const [events, setEvents] = useState<EventPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState<"list" | "grid">("list");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/newupdate-page/events", { cache: "no-store" });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                setEvents(result.data || []);
            } catch (err: any) {
                setError(err.message || "Error fetching events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const labels = {
        headerMain: language === "kh" ? "ព្រឹត្តិការណ៍" : "Latest",
        headerSub: language === "kh" ? "កាលវិភាគប្រជុំ" : "Events & Meetings",
        download: language === "kh" ? "ទាញយក" : "Download PDF",
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#eef0f3]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 mt-12 max-w-7xl mx-auto px-6">
            {/* Header + View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <p className="text-2xl md:text-3xl khmer-font font-bold text-[#1a2b4b] opacity-80">{labels.headerMain}</p>
                    <h1 className="text-4xl md:text-5xl khmer-font font-extrabold text-[#1a2b4b] mt-1">{labels.headerSub}</h1>
                    <div className="h-1.5 w-24 bg-orange-500 mt-4 rounded-full"></div>
                </div>

                {/* List/Grid Toggle */}
                <div className="flex items-center bg-white gap-2 rounded-xl p-1 shadow-md border border-gray-100 mt-4 md:mt-0">
                    {["list", "grid"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setView(type as "list" | "grid")}
                            className={`flex items-center cursor-pointer gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === type ? "bg-[#1a2b4b] text-white shadow scale-105" : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            {type === "list" ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                                </svg>
                            )}
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List/Grid */}
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                {events.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 col-span-full">
                        <p className="text-gray-400 text-lg">No events found at the moment.</p>
                    </div>
                )}

                {events.map((item) => {
                    const title = item.title?.[apiLang] || item.title?.en || "Untitled";
                    const desc = item.description?.[apiLang] || item.description?.en || "";
                    const docUrl = item.documents?.[apiLang]?.url || item.documents?.en?.url;
                    const hasImage = !!(item.coverImage || item.documentThumbnails?.[apiLang] || item.documentThumbnails?.en);
                    const imageSrc = hasImage ? item.coverImage || item.documentThumbnails?.[apiLang] || item.documentThumbnails?.en : "/image/no-image.png";
                    const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-GB") : "";

                    return (
                        <div
                            key={item.id}
                            className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${view === "list" ? "flex flex-col md:flex-row gap-4" : "flex flex-col"
                                }`}
                        >
                            {/* Image */}
                            <div
                                className={`flex-shrink-0 relative bg-gray-50 rounded-t-2xl overflow-hidden ${view === "list" ? "md:w-48 lg:w-56 h-48" : "w-full aspect-[4/3]"
                                    }`}
                            >
                                <img
                                    src={imageSrc as string}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/image/no-image.png";
                                        target.className = "h-full w-full object-contain opacity-20";
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1a2b4b] mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">{title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6">{desc}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase">{dateStr}</span>
                                    {docUrl && (
                                        <Link
                                            href={docUrl}
                                            target="_blank"
                                            className="inline-flex khmer-font items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>{labels.download}</span>
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