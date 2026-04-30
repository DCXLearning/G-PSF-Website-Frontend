"use client";

import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ViewMode = "list" | "grid";

export type PublicationDocumentLanguage = {
    label: string;
    href: string;
};

export type PublicationDocumentItem = {
    id: number;
    badgeText?: string;
    title: string;
    description: string;
    image?: string | null;
    date: string;
    languages: PublicationDocumentLanguage[];
};

type PublicationDocumentsBrowserProps = {
    title: string;
    badgeText: string;
    items: PublicationDocumentItem[];
    loading: boolean;
    error: string | null;
    description?: string;
};

type HeaderProps = {
    view: ViewMode;
    setView: (view: ViewMode) => void;
    title: string;
    description?: string;
};

type CardProps = {
    item: PublicationDocumentItem;
    lang: UiLang;
    badgeText: string;
};

type DocumentPreviewProps = {
    src?: string | null;
    alt: string;
    className?: string;
};

function DocumentPreview({ src, alt, className = "" }: DocumentPreviewProps) {
    const [failedSrc, setFailedSrc] = useState("");
    const imageSrc = failedSrc === src ? "" : src;

    return (
        <div className={`w-full ${className}`}>
            {/* A4 ratio = 210 / 297 */}
            <div className="relative w-full aspect-[210/297] overflow-hidden bg-white">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={alt}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 220px"
                        onError={() => setFailedSrc(src || "")}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center">
                        <p className="text-[10px] leading-snug text-slate-500">
                            Document cover is not available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TypeBadge({ text }: { text: string }) {
    return (
        <span className="inline-block rounded bg-[#3f51b5] px-2.5 py-0.5 text-[9px] font-bold uppercase text-white">
            {text}
        </span>
    );
}

function LanguageLinks({
    languages,
    lang,
    compact = false,
    fontSizeClass,
}: {
    languages: PublicationDocumentLanguage[];
    lang: UiLang;
    compact?: boolean;
    fontSizeClass?: string;
}) {
    const sizeClass = fontSizeClass || (compact ? "text-[13px]" : "text-lg");

    return (
        <div
            className={`flex flex-wrap items-baseline font-bold ${compact ? "mt-3 gap-2" : "mt-6 gap-4"
                } ${sizeClass}`}
        >
            <span className="text-slate-400">
                {lang === "kh" ? "ភាសា:" : "Language:"}
            </span>

            {languages.length > 0 ? (
                languages.map((languageItem) => (
                    <a
                        key={languageItem.label}
                        href={languageItem.href}
                        download
                        className="text-slate-900 underline hover:text-blue-800"
                    >
                        {languageItem.label}
                    </a>
                ))
            ) : (
                <span className="text-slate-400">
                    {lang === "kh" ? "គ្មានឯកសារ" : "No file"}
                </span>
            )}
        </div>
    );
}

function Header({ view, setView, title, description }: HeaderProps) {
    const { language } = useLanguage();

    const lang = language === "kh" ? "kh" : "en";
    const isKhmer = lang === "kh";

    const labels = {
        en: {
            list: "List",
            grid: "Grid",
        },
        kh: {
            list: "បញ្ជី",
            grid: "ក្រឡា",
        },
    };

    return (
        <div className="mb-10 -mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1
                    className={`text-3xl font-bold text-[#0B2C5F] md:text-[44px] ${isKhmer ? "khmer-font" : ""
                        }`}
                >
                    {title}
                </h1>

                {description ? (
                    <p
                        className={`mt-3 max-w-3xl text-sm leading-7 text-slate-600 ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="flex w-full max-w-sm gap-1 rounded-sm border border-gray-300 bg-white p-1 shadow-sm sm:w-auto">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold transition sm:flex-none sm:px-3 ${view === "list"
                        ? "bg-[#23395D] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <List size={15} />
                    <span className={isKhmer ? "khmer-font" : ""}>
                        {labels[lang].list}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold transition sm:flex-none sm:px-3 ${view === "grid"
                        ? "bg-[#23395D] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <LayoutGrid size={15} />
                    <span className={isKhmer ? "khmer-font" : ""}>
                        {labels[lang].grid}
                    </span>
                </button>
            </div>
        </div>
    );
}

function ListCard({ item, lang, badgeText }: CardProps) {
    const resolvedBadgeText = item.badgeText || badgeText;

    return (
        <article className="flex flex-col gap-8 py-10 md:flex-row md:items-center">
            <div className="w-full flex-shrink-0 md:w-44">
                <DocumentPreview
                    src={item.image}
                    alt={item.title}
                    className="overflow-hidden border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
                />
            </div>

            <div className="flex-1">
                <TypeBadge text={resolvedBadgeText} />

                <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-slate-900">
                    {item.title}
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-800">
                    {item.date || (lang === "kh" ? "គ្មានកាលបរិច្ឆេទ" : "No date")}
                </p>

                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 line-clamp-3">
                    {item.description ||
                        (lang === "kh" ? "គ្មានការពិពណ៌នា" : "No description")}
                </p>

                <LanguageLinks languages={item.languages} lang={lang} />
            </div>
        </article>
    );
}

function GridCard({ item, lang, badgeText }: CardProps) {
    const resolvedBadgeText = item.badgeText || badgeText;

    return (
        <article className="group flex h-full flex-col overflow-hidden bg-[#e9ecef]">
            <div className="border-b border-slate-200 bg-white">
                <DocumentPreview src={item.image} alt={item.title} />
            </div>

            <div className="flex flex-1 flex-col justify-between px-3 py-4">
                <div>
                    <TypeBadge text={resolvedBadgeText} />

                    <div className="mt-2 text-[10px] font-semibold text-[#1a2b4b]">
                        {item.date ||
                            (lang === "kh" ? "គ្មានកាលបរិច្ឆេទ" : "No date")}
                    </div>

                    <h2 className="mt-1 text-[16px] font-extrabold leading-snug text-[#1a2b4b] line-clamp-2">
                        {item.title}
                    </h2>

                    <p className="mt-2 text-[10px] leading-relaxed text-slate-700 line-clamp-3">
                        {item.description ||
                            (lang === "kh"
                                ? "គ្មានការពិពណ៌នា"
                                : "No description")}
                    </p>
                </div>

                <LanguageLinks languages={item.languages} lang={lang} compact />
            </div>
        </article>
    );
}

export default function PublicationDocumentsBrowser({
    title,
    badgeText,
    items,
    loading,
    error,
    description,
}: PublicationDocumentsBrowserProps) {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const [view, setView] = useState<ViewMode>("list");

    return (
        <main className="bg-[#f5f7fb]">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <Header
                    view={view}
                    setView={setView}
                    title={title}
                    description={description}
                />

                {loading ? (
                    <p className={`py-10 text-center ${uiLang === "kh" ? "khmer-font" : ""}`}>
                        {uiLang === "kh" ? "កំពុងទាញទិន្នន័យ..." : "Loading..."}
                    </p>
                ) : null}

                {error ? (
                    <p className="py-10 text-center text-red-500">{error}</p>
                ) : null}

                {!loading && !error && items.length === 0 ? (
                    <p className="py-10 text-center text-slate-500">
                        {uiLang === "kh" ? "មិនមានឯកសារ" : "No documents found."}
                    </p>
                ) : null}

                {!loading && !error && items.length > 0 ? (
                    <>
                        {view === "list" ? (
                            <div className="divide-y divide-gray-300">
                                {items.map((item) => (
                                    <ListCard
                                        key={item.id}
                                        item={item}
                                        lang={uiLang}
                                        badgeText={badgeText}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                {items.map((item) => (
                                    <GridCard
                                        key={item.id}
                                        item={item}
                                        lang={uiLang}
                                        badgeText={badgeText}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </main>
    );
}