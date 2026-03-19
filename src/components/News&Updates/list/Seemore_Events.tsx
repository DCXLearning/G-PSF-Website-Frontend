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
    documentThumbnails?: { en?: string; km?: string } | null;
    documents?: { en?: { url?: string }; km?: { url?: string } } | null;
    category?: { name?: I18n };
};

export default function EventsListPage() {
    const { language } = useLanguage();
    const apiLang: "en" | "km" = language === "kh" ? "km" : "en";

    const [events, setEvents] = useState<EventPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/newupdate-page/events", {
                    cache: "no-store",
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Failed to load data");
                setEvents(result.data || []);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const labels = {
        headerMain: language === "kh" ? "ព្រឹត្តិការណ៍ចុងក្រោយ" : "Latest",
        headerSub: language === "kh" ? "កាលវិភាគប្រជុំ" : "and Meetings Schedule",
        download: language === "kh" ? "ទាញយក" : "Download",
        noData: language === "kh" ? "មិនមានទិន្នន័យ" : "No Meetings Schedule.",
        error: language === "kh" ? "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ" : "Failed to load events.",
    };

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="container mx-auto px-6 max-w-7xl pt-12">
                {/* Section Title */}
                <div className="mb-12">
                    <p className="text-3xl khmer-font font-bold text-[#1a2b4b] mb-1">{labels.headerMain}</p>
                    <h1 className="text-4xl khmer-font md:text-5xl font-bold text-[#1a2b4b] tracking-tight">
                        {labels.headerSub}
                    </h1>
                    <div className="h-1.5 w-32 bg-orange-500 mt-4"></div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col gap-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-100"
                                />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="text-center py-20">
                            <p className="text-red-500 text-lg">{labels.error}</p>
                        </div>
                    )}

                    {/* Events List */}
                    {!loading && !error && events.length > 0 && events.map((item) => {
                        const title = item.title?.[apiLang] || item.title?.en || "Untitled";
                        const desc = item.description?.[apiLang] || item.description?.en || "";
                        const docUrl = item.documents?.[apiLang]?.url || item.documents?.en?.url;
                        const thumb = item.documentThumbnails?.[apiLang] || item.documentThumbnails?.en;
                        const dateStr = item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString('en-GB')
                            : "";

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                {/* Thumbnail / PDF Preview */}
                                <div className="w-full md:w-52 bg-gray-50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-100">
                                    {thumb ? (
                                        <img
                                            src={thumb}
                                            alt={title}
                                            className="h-40 w-auto object-contain shadow-md rounded-sm"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement?.classList.add('no-img');
                                            }}
                                        />
                                    ) : (
                                        <div className="h-40 w-28 bg-white border flex items-center justify-center">
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">G-PSF Doc</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Details */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col">
                                    <h3 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-3 leading-tight group-hover:text-blue-700 transition-colors">
                                        {title}
                                    </h3>
                                    <p className="text-gray-500 text-sm md:text-base mb-6 flex-1 line-clamp-3 leading-relaxed">
                                        {desc}
                                    </p>

                                    <div className="mt-auto flex flex-col gap-3">
                                        <span className="text-gray-400 text-xs font-medium">{dateStr}</span>
                                        {docUrl && (
                                            <Link
                                                href={docUrl}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                                            >
                                                <img
                                                    src="/icon_NewUpdate_page/icon1.svg"
                                                    className="w-4 h-4"
                                                    alt="download"
                                                />
                                                {labels.download}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {!loading && !error && events.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">{labels.noData}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}