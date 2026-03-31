/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
// Import your language context
import { useLanguage } from "@/app/context/LanguageContext";

type ViewMode = "list" | "grid";
type UiLang = "en" | "kh";

type FeaturedItem = {
    id: number;
    type: "PUBLICATION";
    title: string;
    description: string;
    image?: string | null;
    date: string;
    href: string;
};

// Simple utility to handle I18n objects if the API returns them
function pickText(value: any, lang: UiLang): string {
    if (typeof value === 'string') return value;
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || "";
}

function NewsImage({
    src,
    alt,
    className = "",
}: {
    src?: string | null;
    alt: string;
    className?: string;
}) {
    const [error, setError] = useState(false);
    const isValid = !!src && !error;

    return (
        <div className={`relative overflow-hidden bg-[#ECECEC] ${className}`}>
            {isValid ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ECECEC]">
                    <div className="flex h-[218px] w-[156px] flex-col items-center justify-center bg-[#F6F6F6]">
                        <div className="flex h-[70px] w-[70px] items-center justify-center bg-[#D9D9D9]">
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-sm bg-[#BBBBBB]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.7"
                                    className="h-7 w-7"
                                >
                                    <circle cx="8.5" cy="8.5" r="1.8" fill="white" stroke="none" />
                                    <path d="M4 17l4.5-4.5a1 1 0 011.5.08L13 16l2.2-2.8a1 1 0 011.62.04L20 17" />
                                    <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-[12px] leading-[18px] text-[#777777]">
                            document image
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ type, lang }: { type: FeaturedItem["type"]; lang: UiLang }) {
    const label = lang === "kh" ? "ការបោះពុម្ពផ្សាយ" : type;
    return (
        <span className="inline-flex rounded-[3px] bg-[#3F51D7] px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white">
            {label}
        </span>
    );
}

function Header({ view, setView, lang }: { view: ViewMode; setView: (v: ViewMode) => void; lang: UiLang }) {
    return (
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="mt-1 text-[32px] md:text-[44px] font-extrabold leading-none text-[#0B2C5F]">
                    {lang === "kh" ? "របាយការណ៍ឆមាស" : "Semester Reports"}
                </h1>
                <div className="mt-4 h-[4px] w-[150px] bg-[#F59E0B]" />
            </div>

            <div className="flex items-center gap-2 self-start rounded-md border border-[#D1D5DB] bg-white p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${view === "list" ? "bg-[#23395D] text-white" : "text-[#475569] hover:bg-slate-100"}`}
                >
                    <List className="h-4 w-4" />
                    {lang === "kh" ? "បញ្ជី" : "List"}
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${view === "grid" ? "bg-[#23395D] text-white" : "text-[#475569] hover:bg-slate-100"}`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    {lang === "kh" ? "Grid" : "Grid"}
                </button>
            </div>
        </div>
    );
}

function ListCard({ item, lang }: { item: FeaturedItem; lang: UiLang }) {
    return (
        <article className="grid grid-cols-1 gap-6 border-b border-[#D9DEE7] py-7 md:grid-cols-[136px_minmax(0,1fr)]">
            <Link href={item.href} className="block">
                <NewsImage src={item.image} alt={item.title} className="h-[164px] w-full md:w-[136px]" />
            </Link>

            <div className="min-w-0">
                <Badge type={item.type} lang={lang} />
                <h2 className="mt-3 text-lg md:text-2xl font-bold leading-[1.5] text-[#0B2C5F]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>
                <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-[#64748B]">
                    {item.description}
                </p>
                <Link
                    href={item.href}
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {lang === "kh" ? "ទាញយក" : "Download"}
                </Link>
                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date}</span>
                </div>
            </div>
        </article>
    );
}

function GridCard({ item, lang }: { item: FeaturedItem; lang: UiLang }) {
    return (
        <article className="overflow-hidden rounded-md border border-[#D9DEE7] bg-white transition hover:shadow-md">
            <Link href={item.href} className="block">
                <NewsImage src={item.image} alt={item.title} className="h-[240px] w-full" />
            </Link>
            <div className="p-5">
                <Badge type={item.type} lang={lang} />
                <h2 className="mt-3 line-clamp-2 text-2xl font-bold leading-snug text-[#0B2C5F]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>
                <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#64748B]">
                    {item.description}
                </p>
                <Link
                    href={item.href}
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    {lang === "kh" ? "ទាញយក" : "Download"}
                </Link>
                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date}</span>
                </div>
            </div>
        </article>
    );
}

export default function SemesterViewMorePage() {
    const { language, fontClass } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";

    const [view, setView] = useState<ViewMode>("list");
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("https://api-gpsf.datacolabx.com/api/v1/posts/category/17");
                if (!res.ok) throw new Error("Failed to fetch");

                const json = await res.json();

                const mapped = (json.data || [])
                    .filter((post: any) => post.isPublished)
                    .map((post: any) => ({
                        id: post.id,
                        type: "PUBLICATION",
                        title: pickText(post.title, uiLang),
                        description: pickText(post.description, uiLang),
                        image: post.documentThumbnails?.[uiLang === "kh" ? "km" : "en"] || post.documentThumbnails?.en || post.documentThumbnails?.km || null,
                        date: post.publishedAt
                            ? new Intl.DateTimeFormat(uiLang === "kh" ? "km-KH" : "en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            }).format(new Date(post.publishedAt))
                            : "",
                        href: post.documents?.[uiLang === "kh" ? "km" : "en"]?.url || post.documents?.en?.url || "#",
                    }));

                setItems(mapped);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [uiLang]); // Refetch or remap when language changes

    return (
        <main className={`min-h-screen ${fontClass || ""}`}>
            <section className="mx-auto max-w-7xl px-4 py-10">
                <Header view={view} setView={setView} lang={uiLang} />

                {loading && (
                    <p className="text-center py-10">
                        {uiLang === "kh" ? "កំពុងផ្ទុក..." : "Loading..."}
                    </p>
                )}
                
                {error && (
                    <p className="text-red-500 text-center py-10">{error}</p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-center py-10 text-slate-500">
                        {uiLang === "kh" ? "មិនមានទិន្នន័យ" : "No reports found."}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        {view === "list" ? (
                            <div className="flex flex-col">
                                {items.map((item) => (
                                    <ListCard key={item.id} item={item} lang={uiLang} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {items.map((item) => (
                                    <GridCard key={item.id} item={item} lang={uiLang} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}