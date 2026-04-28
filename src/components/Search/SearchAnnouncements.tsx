"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { getContentLanguageLabel } from "@/utils/languageLabels";

type Lang = "en" | "kh";

type AnnouncementItem = {
    id: number;
    category: "announcement" | "news";
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
    languages?: string[];
};

type SearchAnnouncementsProps = {
    query?: string;
};

const ANNOUNCEMENT_DATA: AnnouncementItem[] = [
    {
        id: 1,
        category: "announcement",
        title: {
            en: "Official Announcement on Government-Private Sector Forum Meeting",
            kh: "សេចក្តីជូនដំណឹងផ្លូវការអំពីកិច្ចប្រជុំវេទិការដ្ឋាភិបាល-វិស័យឯកជន",
        },
        description: {
            en: "An official announcement regarding the upcoming plenary meeting, agenda updates, and participant coordination.",
            kh: "សេចក្តីជូនដំណឹងផ្លូវការអំពីកិច្ចប្រជុំពេញអង្គនាពេលខាងមុខ ការកែសម្រួលរបៀបវារៈ និងការសម្របសម្រួលអ្នកចូលរួម។",
        },
        date: "December 2025",
        href: "/new-update/announcements/1",
        image: "https://placehold.co/400x530/ffffff/1d4ed8?text=Announcement",
        languages: ["Khmer", "English"],
    },
    {
        id: 2,
        category: "news",
        title: {
            en: "Government-Private sector forum marks 25 years of dialogue partnership and reform",
            kh: "វេទិការាជរដ្ឋាភិបាល-ឯកជន អបអរសាទរខួប ២៥ ឆ្នាំ នៃកិច្ចសន្ទនា ភាពជាដៃគូ និងកំណែទម្រង់",
        },
        description: {
            en: 'H.E. Sun Chanthol said, "As we celebrate 25 years of the G-PSF, this mechanism is more important than ever..."',
            kh: "ឯកឧត្តម ស៊ុន ចាន់ថុល បានមានប្រសាសន៍ថា ក្នុងឱកាសខួប ២៥ ឆ្នាំ នៃវេទិកា G-PSF យន្តការនេះកាន់តែមានសារៈសំខាន់...",
        },
        date: "November 2025",
        href: "/new-update/2",
        image: "https://placehold.co/400x530/ffffff/2563eb?text=News",
        languages: ["English"],
    },
    {
        id: 3,
        category: "announcement",
        title: {
            en: "Notice for Working Group Submissions",
            kh: "សេចក្តីជូនដំណឹងស្តីពីការដាក់ស្នើឯកសាររបស់ក្រុមការងារ",
        },
        description: {
            en: "Working groups are invited to submit progress reports, action points, and recommendations before the deadline.",
            kh: "ក្រុមការងារត្រូវបានអញ្ជើញឱ្យដាក់ស្នើរបាយការណ៍វឌ្ឍនភាព ចំណុចសកម្មភាព និងអនុសាសន៍មុនថ្ងៃកំណត់។",
        },
        date: "October 2025",
        href: "/new-update/announcements/3",
        image: "https://placehold.co/400x530/ffffff/0f172a?text=Notice",
        languages: ["Khmer"],
    },
];

function getText(
    value: { en: string; kh: string } | undefined,
    lang: Lang
): string {
    if (!value) return "";
    return lang === "kh" ? value.kh : value.en;
}

function getCategoryLabel(category: "announcement" | "news", lang: Lang) {
    const labels = {
        en: {
            announcement: "ANNOUNCEMENT",
            news: "NEWS",
        },
        kh: {
            announcement: "សេចក្តីជូនដំណឹង",
            news: "ព័ត៌មាន",
        },
    };

    return labels[lang][category];
}

function getCategoryBadgeClass(category: "announcement" | "news") {
    switch (category) {
        case "announcement":
            return "bg-[#ea580c]";
        case "news":
            return "bg-[#4a56c5]";
        default:
            return "bg-[#4a56c5]";
    }
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

function AnnouncementListItem({
    item,
    language,
}: {
    item: AnnouncementItem;
    language: Lang;
}) {
    return (
        <div className="flex flex-col md:flex-row items-start gap-5 md:gap-6 py-8 border-b border-gray-300 last:border-b-0">
            <div className="w-full md:w-[120px] lg:w-[130px] shrink-0">
                <div className="aspect-[3/4] bg-white border border-gray-200 shadow-sm overflow-hidden">
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

            <div className="flex-1 max-w-4xl">
                <span
                    className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wide text-white ${getCategoryBadgeClass(
                        item.category
                    )}`}
                >
                    {getCategoryLabel(item.category, language)}
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
                        <span className="font-bold text-[#94a3b8]">
                            {language === "kh" ? "ភាសា៖" : "Language:"}
                        </span>

                        {item.languages.map((lang) => (
                            <span
                                key={lang}
                                className="font-bold text-[#0f172a] mr-2"
                            >
                                {getContentLanguageLabel(lang, language)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchAnnouncements({
    query = "",
}: SearchAnnouncementsProps) {
    const { language } = useLanguage();
    const normalizedQuery = query.trim().toLowerCase();

    const content = {
        en: {
            title: "Search Announcements",
            subtitle: "Find content in announcements and news updates.",
            resultFor: "Showing results for",
            sectionTitle: "Announcements & News Updates",
        },
        kh: {
            title: "ស្វែងរកសេចក្តីជូនដំណឹង",
            subtitle: "ស្វែងរកមាតិកានៅក្នុងសេចក្តីជូនដំណឹង និងព័ត៌មានបច្ចុប្បន្នភាព។",
            resultFor: "បង្ហាញលទ្ធផលសម្រាប់",
            sectionTitle: "សេចក្តីជូនដំណឹង និងព័ត៌មានបច្ចុប្បន្នភាព",
        },
    };

    const filtered = useMemo(() => {
        if (!normalizedQuery) return ANNOUNCEMENT_DATA;

        return ANNOUNCEMENT_DATA.filter((item) => {
            const title = `${item.title.en} ${item.title.kh}`.toLowerCase();
            const desc = `${item.description.en} ${item.description.kh}`.toLowerCase();
            return title.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
    }, [normalizedQuery]);

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

                <section>
                    <h2
                        className={`text-[28px] font-bold text-[#0f172a] mb-4 ${
                            language === "kh" ? "khmer-font" : ""
                        }`}
                    >
                        {content[language].sectionTitle}
                    </h2>

                    {filtered.length > 0 ? (
                        <div className="space-y-0">
                            {filtered.map((item) => (
                                <AnnouncementListItem
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
    );
}
