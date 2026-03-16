"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type SearchItemType = "news" | "resource" | "event";

type SearchItem = {
    id: number;
    type: SearchItemType;
    title: {
        en: string;
        kh: string;
    };
    description: {
        en: string;
        kh: string;
    };
    date: string;
    href: string;
    image?: string;
    org?: {
        en: string;
        kh: string;
    };
    author?: {
        en: string;
        kh: string;
    };
    languages?: string[];
};

type SearchPageClientProps = {
    query?: string;
};

const SEARCH_DATA: SearchItem[] = [
    {
        id: 1,
        type: "resource",
        title: {
            en: "Title of Publication",
            kh: "ចំណងជើងនៃការបោះពុម្ពផ្សាយ",
        },
        description: {
            en: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
            kh: "ខ្លឹមសារពិពណ៌នាឧទាហរណ៍ សម្រាប់ការបោះពុម្ពផ្សាយនេះ។",
        },
        date: "December 2025",
        href: "/resources",
        image: "https://placehold.co/400x530/ffffff/111827?text=G-PSF+Cover",
        org: {
            en: "Organisation or Agency Name",
            kh: "ឈ្មោះអង្គការ ឬស្ថាប័ន",
        },
        author: {
            en: "Author Name",
            kh: "ឈ្មោះអ្នកនិពន្ធ",
        },
        languages: ["Khmer"],
    },
    {
        id: 2,
        type: "event",
        title: {
            en: "Title of Video",
            kh: "ចំណងជើងវីដេអូ",
        },
        description: {
            en: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
            kh: "ខ្លឹមសារពិពណ៌នាឧទាហរណ៍ សម្រាប់វីដេអូនេះ។",
        },
        date: "January 2024",
        href: "/event",
        image: "https://placehold.co/400x530/f8fafc/ef4444?text=Play+Icon",
        org: {
            en: "Organisation or Agency Name",
            kh: "ឈ្មោះអង្គការ ឬស្ថាប័ន",
        },
        author: {
            en: "Author Name",
            kh: "ឈ្មោះអ្នកនិពន្ធ",
        },
        languages: ["English"],
    },
    {
        id: 3,
        type: "news",
        title: {
            en: "Government-Private sector forum marks 25 years of dialogue partnership and reform",
            kh: "វេទិការាជរដ្ឋាភិបាល-ឯកជន អបអរសាទរខួប ២៥ ឆ្នាំ នៃកិច្ចសន្ទនា ភាពជាដៃគូ និងកំណែទម្រង់",
        },
        description: {
            en: 'H.E. Sun Chanthol said, "As we celebrate 25 years of the G-PSF, this mechanism is more important than ever. In the face of new regional challenges..."',
            kh: "ឯកឧត្តម ស៊ុន ចាន់ថុល បានមានប្រសាសន៍ថា ក្នុងឱកាសខួប ២៥ ឆ្នាំ នៃវេទិកា G-PSF យន្តការនេះកាន់តែមានសារៈសំខាន់...",
        },
        date: "December 2025",
        href: "/new-update",
        image: "https://placehold.co/400x530/ffffff/1d4ed8?text=CAPRED",
        languages: ["English"],
    },
];

function getText(
    value: { en: string; kh: string } | undefined,
    lang: Lang
): string {
    if (!value) return "";
    return lang === "kh" ? value.kh : value.en;
}

function getTypeLabel(type: SearchItemType, lang: Lang) {
    const labels = {
        en: {
            news: "BLOG",
            resource: "PUBLICATION",
            event: "VIDEO",
        },
        kh: {
            news: "ប្លុក",
            resource: "ឯកសារ",
            event: "វីដេអូ",
        },
    };

    return labels[lang][type];
}

function getSectionLabel(type: SearchItemType, lang: Lang) {
    const labels = {
        en: {
            news: "New & Updates",
            resource: "Resources",
            event: "Events",
        },
        kh: {
            news: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
            resource: "ធនធាន",
            event: "ព្រឹត្តិការណ៍",
        },
    };

    return labels[lang][type];
}

function getBadgeClass(type: SearchItemType) {
    switch (type) {
        case "resource":
            return "bg-[#4a56c5]";
        case "event":
            return "bg-[#4a56c5]";
        case "news":
            return "bg-[#4a56c5]";
        default:
            return "bg-[#4a56c5]";
    }
}

function groupByType(items: SearchItem[]) {
    return {
        news: items.filter((item) => item.type === "news"),
        resource: items.filter((item) => item.type === "resource"),
        event: items.filter((item) => item.type === "event"),
    };
}

function EmptySectionMessage({ language }: { language: Lang }) {
    return (
        <div className="pt-1 pb-4">
            <p
                className={`text-[16px] leading-7 text-left text-[#64748b] ${
                    language === "kh" ? "khmer-font" : ""
                }`}
            >
                {language === "kh" ? "មិនមានមាតិកាទេ" : "No content found"}
            </p>
        </div>
    );
}

function ResourceListItem({
    item,
    language,
}: {
    item: SearchItem;
    language: Lang;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 py-8 border-b border-gray-300 last:border-b-0">
            <div className="w-full md:w-[238px] shrink-0">
                <div className="aspect-[3/4] bg-white border border-gray-200 shadow-md overflow-hidden">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={getText(item.title, language)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-3xl">
                <span
                    className={`inline-flex khmer-font px-2.5 py-1 rounded text-[10px] font-bold tracking-wide text-white ${getBadgeClass(
                        item.type
                    )}`}
                >
                    {getTypeLabel(item.type, language)}
                </span>

                <h2
                    className={`mt-3 text-2xl md:text-[22px] font-semibold text-[#0f172a] leading-snug ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {getText(item.title, language)}
                </h2>

                <p className="mt-1 text-[15px] font-bold text-[#0f172a]">
                    {item.date}
                </p>

                {(item.org || item.author) && (
                    <div
                        className={`mt-3 text-[15px] text-[#334155] leading-6 ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {item.org && <p>{getText(item.org, language)}</p>}
                        {item.author && <p>{getText(item.author, language)}</p>}
                    </div>
                )}

                <p
                    className={`mt-5 text-[17px] leading-8 text-[#64748b] ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {getText(item.description, language)}
                </p>

                <Link
                    href={item.href}
                    className={`inline-block mt-4 text-[15px] font-bold underline text-[#0f172a] hover:text-blue-700 ${
                        language === "kh" ? "khmer-font" : ""
                    }`}
                >
                    {language === "kh" ? "អានបន្ថែម" : "More"}
                </Link>

                {item.languages && item.languages.length > 0 && (
                    <div className="mt-6 flex items-center flex-wrap gap-2 text-sm">
                        <span className="font-bold khmer-font text-[#343a42]">
                            {language === "kh" ? "ភាសា៖" : "Language:"}
                        </span>

                        {item.languages.map((lang) => (
                            <span
                                key={lang}
                                className="font-bold text-[#0f172a] mr-2"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPageClient({
    query = "",
}: SearchPageClientProps) {
    const { language } = useLanguage();
    const normalizedQuery = query.trim().toLowerCase();

    const content = {
        en: {
            title: "Search Results",
            subtitle: "Find content across New & Updates, Resources, and Events.",
            resultFor: "Showing results for",
        },
        kh: {
            title: "លទ្ធផលស្វែងរក",
            subtitle: "ស្វែងរកមាតិកាក្នុងព័ត៌មាន និងបច្ចុប្បន្នភាព ធនធាន និងព្រឹត្តិការណ៍។",
            resultFor: "បង្ហាញលទ្ធផលសម្រាប់",
        },
    };

    const filtered = useMemo(() => {
        if (!normalizedQuery) return SEARCH_DATA;

        return SEARCH_DATA.filter((item) => {
            const title = `${item.title.en} ${item.title.kh}`.toLowerCase();
            const desc = `${item.description.en} ${item.description.kh}`.toLowerCase();
            const org = `${item.org?.en ?? ""} ${item.org?.kh ?? ""}`.toLowerCase();
            const author = `${item.author?.en ?? ""} ${item.author?.kh ?? ""}`.toLowerCase();

            return (
                title.includes(normalizedQuery) ||
                desc.includes(normalizedQuery) ||
                org.includes(normalizedQuery) ||
                author.includes(normalizedQuery)
            );
        });
    }, [normalizedQuery]);

    const grouped = useMemo(() => groupByType(filtered), [filtered]);

    return (
        <div className="min-h-screen bg-[#eef1f5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                <div className="mb-10">
                    <h1
                        className={`text-3xl md:text-4xl font-bold text-[#0f172a] ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].title}
                    </h1>

                    <p
                        className={`mt-3 text-lg text-[#64748b] ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].subtitle}
                    </p>

                    {normalizedQuery ? (
                        <div
                            className={`mt-4 text-sm text-[#64748b] ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {content[language].resultFor}{" "}
                            <span className="font-semibold text-[#0f172a]">
                                “{query}”
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="bg-transparent">
                    <section className="mb-10">
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("resource", language)}
                        </h2>

                        {grouped.resource.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.resource.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>

                    <section className="mb-10">
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("event", language)}
                        </h2>

                        {grouped.event.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.event.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>

                    <section>
                        <h2
                            className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                                language === "kh" ? "khmer-font" : ""
                            }`}
                        >
                            {getSectionLabel("news", language)}
                        </h2>

                        {grouped.news.length > 0 ? (
                            <div className="space-y-0">
                                {grouped.news.map((item) => (
                                    <ResourceListItem
                                        key={item.id}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptySectionMessage language={language} />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}