/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
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

function pickText(value: any, lang: UiLang): string {
    if (typeof value === "string") return value;
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || "";
}

function NewsImage({ src, alt, className = "" }: any) {
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
                    <p className="text-xs text-gray-500">No Image</p>
                </div>
            )}
        </div>
    );
}

function Badge({ lang }: { lang: UiLang }) {
    return (
        <span className="inline-flex rounded bg-[#3F51D7] px-2 py-1 text-xs font-bold text-white">
            {lang === "kh" ? "ការបោះពុម្ពផ្សាយ" : "Publication"}
        </span>
    );
}

function Header({ view, setView, lang }: any) {
    return (
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B2C5F]">
                {lang === "kh" ? "របាយការណ៍ឆមាស" : "Semester Reports"}
            </h1>

            <div className="flex gap-2 border border-gray-300 p-1 rounded-md bg-white shadow-sm">
                <button
                    onClick={() => setView("list")}
                    className={`px-3 py-1 rounded ${
                        view === "list" ? "bg-[#23395D] text-white" : "text-gray-600"
                    }`}
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => setView("grid")}
                    className={`px-3 py-1 rounded ${
                        view === "grid" ? "bg-[#23395D] text-white" : "text-gray-600"
                    }`}
                >
                    <LayoutGrid size={18} />
                </button>
            </div>
        </div>
    );
}

function ListCard({ item, lang }: any) {
    return (
        <div className="group border-b border-gray-200 py-6 transition hover:bg-gray-50">
            <div className="grid md:grid-cols-[140px_1fr] gap-4">
                <NewsImage src={item.image} alt={item.title} className="h-36 rounded-md" />

                <div>
                    <Badge lang={lang} />

                    <h2 className="font-bold text-xl mt-2 text-[#0B2C5F] group-hover:text-blue-600 transition">
                        {item.title}
                    </h2>

                    <p className="text-gray-500 mt-2 line-clamp-2">
                        {item.description}
                    </p>

                    <Link href={item.href} className="underline mt-3 inline-block font-medium">
                        {lang === "kh" ? "ទាញយក" : "Download"}
                    </Link>

                    <div className="text-sm mt-3 flex gap-2 items-center text-gray-500">
                        <CalendarDays size={14} />
                        {item.date}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GridCard({ item, lang }: any) {
    return (
        <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:shadow-lg hover:-translate-y-1">
            <NewsImage src={item.image} alt={item.title} className="h-48 w-full" />

            <div className="p-5">
                <Badge lang={lang} />

                <h2 className="font-bold mt-3 text-lg text-[#0B2C5F] group-hover:text-blue-600 transition line-clamp-2">
                    {item.title}
                </h2>

                <p className="text-gray-500 mt-2 line-clamp-3">
                    {item.description}
                </p>

                <Link href={item.href} className="underline mt-3 inline-block font-medium">
                    {lang === "kh" ? "ទាញយក" : "Download"}
                </Link>

                <div className="text-sm mt-3 flex gap-2 items-center text-gray-500">
                    <CalendarDays size={14} />
                    {item.date}
                </div>
            </div>
        </div>
    );
}

export default function SemesterPage() {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";

    const [view, setView] = useState<ViewMode>("list");
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const res = await fetch("/api/resources-page/semester");

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }

                const json = await res.json();

                const mapped = (json.data || [])
                    .filter((post: any) => post.isPublished)
                    .map((post: any) => ({
                        id: post.id,
                        type: "PUBLICATION",
                        title: pickText(post.title, uiLang),
                        description: pickText(post.description, uiLang),
                        image:
                            post.documentThumbnails?.[uiLang === "kh" ? "km" : "en"] ||
                            post.documentThumbnails?.en ||
                            null,
                        date: post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : "",
                        href:
                            post.documents?.[uiLang === "kh" ? "km" : "en"]?.url ||
                            "#",
                    }));

                setItems(mapped);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [uiLang]);

    return (
        <main className="max-w-7xl mx-auto px-4 py-12">
            <Header view={view} setView={setView} lang={uiLang} />

            {loading && <p className="text-center py-10">Loading...</p>}

            {error && (
                <p className="text-center text-red-500 py-10">{error}</p>
            )}

            {!loading && !error && (
                <>
                    {view === "list" ? (
                        <div className="border-t border-gray-200">
                            {items.map((item) => (
                                <ListCard key={item.id} item={item} lang={uiLang} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <GridCard key={item.id} item={item} lang={uiLang} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}