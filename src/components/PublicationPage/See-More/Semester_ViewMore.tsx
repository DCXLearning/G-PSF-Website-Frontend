/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type ViewMode = "list" | "grid";
type UiLang = "en" | "kh";

type FeaturedItem = {
    id: number;
    title: string;
    description: string;
    image?: string | null;
    date: string;
    href: string;
    languages: ResourceLanguage[];
};

type ResourceLanguage = {
    label: string;
    href: string;
};

type HeaderProps = {
    view: ViewMode;
    setView: (view: ViewMode) => void;
    lang: UiLang;
};

type CardProps = {
    item: FeaturedItem;
    lang: UiLang;
};

type DocumentPreviewProps = {
    src?: string | null;
    alt: string;
    className?: string;
};

function pickText(value: any, lang: UiLang): string {
    if (typeof value === "string") return value;
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || "";
}

function normalizeFileUrl(value?: string | null): string {
    const url = typeof value === "string" ? value.trim() : "";

    if (url.startsWith("/https://") || url.startsWith("/http://")) {
        return url.slice(1);
    }

    return url;
}

function buildDownloadHref(value?: string | null): string {
    const fileUrl = normalizeFileUrl(value);

    if (!fileUrl) {
        return "";
    }

    return `/api/download?url=${encodeURIComponent(fileUrl)}`;
}

function formatDate(value?: string | null, lang: UiLang = "en"): string {
    const raw = typeof value === "string" ? value.trim() : "";

    if (!raw) {
        return "";
    }

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return raw;
    }

    return new Intl.DateTimeFormat(lang === "kh" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function DocumentPreview({ src, alt, className = "" }: DocumentPreviewProps) {
    const [error, setError] = useState(false);
    const isValid = !!src && !error;

    return (
        <div className={`w-full ${className}`}>
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-white">
                {isValid ? (
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover"
                        onError={() => setError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center">
                        <p className="text-xs leading-snug text-slate-500">
                            Document cover is not available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TypeBadge({ lang }: { lang: UiLang }) {
    return (
        <span className="inline-block rounded bg-[#3f51b5] px-3 py-0.5 text-[10px] font-bold uppercase text-white">
            {lang === "kh" ? "របាយការណ៍ឆមាស" : "Semester Report"}
        </span>
    );
}

function LanguageLinks({
    languages,
    lang,
}: {
    languages: ResourceLanguage[];
    lang: UiLang;
}) {
    return (
        <div className="mt-6 flex flex-wrap items-baseline gap-4 text-xs font-bold">
            <span className="text-slate-400">{lang === "kh" ? "ភាសា:" : "Language:"}</span>
            {languages.length > 0 ? (
                languages.map((languageItem) => (
                    <a
                        key={languageItem.label}
                        href={languageItem.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 underline hover:text-blue-800"
                    >
                        {languageItem.label}
                    </a>
                ))
            ) : (
                <span className="text-slate-400">{lang === "kh" ? "គ្មានឯកសារ" : "No file"}</span>
            )}
        </div>
    );
}

function Header({ view, setView, lang }: HeaderProps) {
    return (
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-[#0B2C5F] md:text-4xl">
                    {lang === "kh" ? "របាយការណ៍ឆមាស" : "Semester Reports"}
                </h1>
            </div>

            <div className="flex gap-2 rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
                <button
                    onClick={() => setView("list")}
                    className={`rounded-lg px-3 py-2 ${
                        view === "list" ? "bg-[#23395D] text-white" : "text-gray-600"
                    }`}
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => setView("grid")}
                    className={`rounded-lg px-3 py-2 ${
                        view === "grid" ? "bg-[#23395D] text-white" : "text-gray-600"
                    }`}
                >
                    <LayoutGrid size={18} />
                </button>
            </div>
        </div>
    );
}

function ListCard({ item, lang }: CardProps) {
    return (
        <article className="flex flex-col gap-8 py-10 md:flex-row">
            <div className="w-full flex-shrink-0 md:w-44">
                <DocumentPreview
                    src={item.image}
                    alt={item.title}
                    className="overflow-hidden border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
                />
            </div>

            <div className="flex-1">
                <TypeBadge lang={lang} />

                <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-slate-900">
                    {item.title}
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-800">
                    {item.date || (lang === "kh" ? "គ្មានកាលបរិច្ឆេទ" : "No date")}
                </p>

                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 line-clamp-3">
                    {item.description || (lang === "kh" ? "គ្មានការពិពណ៌នា" : "No description")}
                </p>

                <LanguageLinks languages={item.languages} lang={lang} />
            </div>
        </article>
    );
}

function GridCard({ item, lang }: CardProps) {
    return (
        <article className="group flex h-full flex-col overflow-hidden bg-[#e9ecef]">
            <div className="border-b border-slate-200 bg-white">
                <DocumentPreview src={item.image} alt={item.title} />
            </div>

            <div className="flex flex-1 flex-col px-5 py-5">
                <TypeBadge lang={lang} />

                <div className="mt-3 text-[11px] font-semibold text-[#1a2b4b]">
                    {item.date || (lang === "kh" ? "គ្មានកាលបរិច្ឆេទ" : "No date")}
                </div>

                <h2 className="mt-1 text-base font-extrabold leading-snug text-[#1a2b4b] transition  line-clamp-2">
                    {item.title}
                </h2>

                <p className="mt-2 flex-1 text-[11px] leading-relaxed text-slate-700 line-clamp-3">
                    {item.description || (lang === "kh" ? "គ្មានការពិពណ៌នា" : "No description")}
                </p>

                <LanguageLinks languages={item.languages} lang={lang} />
            </div>
        </article>
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
                        title: pickText(post.title, uiLang),
                        description: pickText(post.description, uiLang),
                        image:
                            post.documentThumbnails?.[uiLang === "kh" ? "km" : "en"] ||
                            post.documentThumbnails?.en ||
                            null,
                        date: formatDate(post.publishedAt, uiLang),
                        href:
                            buildDownloadHref(post.documents?.[uiLang === "kh" ? "km" : "en"]?.url) ||
                            buildDownloadHref(post.documents?.en?.url) ||
                            buildDownloadHref(post.documents?.km?.url) ||
                            "#",
                        languages: [
                            buildDownloadHref(post.documents?.en?.url)
                                ? {
                                      label: "English",
                                      href: buildDownloadHref(post.documents?.en?.url),
                                  }
                                : null,
                            buildDownloadHref(post.documents?.km?.url)
                                ? {
                                      label: "Khmer",
                                      href: buildDownloadHref(post.documents?.km?.url),
                                  }
                                : null,
                        ].filter(Boolean),
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
        <main className="bg-[#f5f7fb]">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <Header view={view} setView={setView} lang={uiLang} />

                {loading && <p className="py-10 text-center">Loading...</p>}

                {error && (
                    <p className="py-10 text-center text-red-500">{error}</p>
                )}

                {!loading && !error && (
                    <>
                        {view === "list" ? (
                            <div>
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={item.id !== items[items.length - 1]?.id ? "mb-10 border-b border-gray-300" : ""}
                                    >
                                        <ListCard item={item} lang={uiLang} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {items.map((item) => (
                                    <GridCard key={item.id} item={item} lang={uiLang} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
