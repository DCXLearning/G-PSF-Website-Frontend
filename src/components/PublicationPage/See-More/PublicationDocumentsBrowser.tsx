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
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-white">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={alt}
                        fill
                        className="object-cover"
                        onError={() => setFailedSrc(src || "")}
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

function TypeBadge({ text }: { text: string }) {
    return (
        <span className="inline-block rounded bg-[#3f51b5] px-3 py-0.5 text-[10px] font-bold uppercase text-white">
            {text}
        </span>
    );
}

function LanguageLinks({
    languages,
    lang,
}: {
    languages: PublicationDocumentLanguage[];
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
                        download
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

function Header({ view, setView, title, description }: HeaderProps) {
    return (
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-[#0B2C5F] md:text-4xl">{title}</h1>

                {description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="flex gap-2 rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`rounded-lg px-3 py-2 ${
                        view === "list" ? "bg-[#23395D] text-white" : "text-gray-600"
                    }`}
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
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

function ListCard({ item, lang, badgeText }: CardProps) {
    const resolvedBadgeText = item.badgeText || badgeText;

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
                <TypeBadge text={resolvedBadgeText} />

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

function GridCard({ item, lang, badgeText }: CardProps) {
    const resolvedBadgeText = item.badgeText || badgeText;

    return (
        <article className="group flex h-full flex-col overflow-hidden bg-[#e9ecef]">
            <div className="border-b border-slate-200 bg-white">
                <DocumentPreview src={item.image} alt={item.title} />
            </div>

            <div className="flex flex-1 flex-col px-5 py-5">
                <TypeBadge text={resolvedBadgeText} />

                <div className="mt-3 text-[11px] font-semibold text-[#1a2b4b]">
                    {item.date || (lang === "kh" ? "គ្មានកាលបរិច្ឆេទ" : "No date")}
                </div>

                <h2 className="mt-1 text-base font-extrabold leading-snug text-[#1a2b4b] line-clamp-2">
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

                {loading ? <p className="py-10 text-center">Loading...</p> : null}

                {error ? <p className="py-10 text-center text-red-500">{error}</p> : null}

                {!loading && !error && items.length === 0 ? (
                    <p className="py-10 text-center text-slate-500">
                        {uiLang === "kh" ? "មិនមានឯកសារ" : "No documents found."}
                    </p>
                ) : null}

                {!loading && !error && items.length > 0 ? (
                    <>
                        {view === "list" ? (
                            <div>
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={
                                            item.id !== items[items.length - 1]?.id
                                                ? "mb-10 border-b border-gray-300"
                                                : ""
                                        }
                                    >
                                        <ListCard item={item} lang={uiLang} badgeText={badgeText} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
