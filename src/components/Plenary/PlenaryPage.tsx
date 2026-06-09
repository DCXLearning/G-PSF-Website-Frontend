"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type I18n = {
    en?: string;
    km?: string;
};

type ApiBlock = {
    id?: number;
    type?: string;
    enabled?: boolean;
    title?: I18n;
    description?: I18n;
    posts?: Array<{
        content?: {
            en?: {
                items?: Array<{
                    title?: I18n;
                    description?: I18n;
                }>;
            };
            km?: {
                items?: Array<{
                    title?: I18n;
                    description?: I18n;
                }>;
            };
        };
    }>;
};

type ApiResponse = {
    data?: {
        blocks?: ApiBlock[];
    };
};

type Objective = {
    id: number;
    title: string;
    description: string;
};

const HexNode = () => (
    <div className="relative flex h-12 w-12 items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>

        <span className="absolute h-3.5 w-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

function PlenaryPageSkeleton() {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl animate-pulse px-4">
                <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="lg:sticky lg:top-40">
                        <div className="h-12 w-56 rounded bg-slate-200 md:h-14" />
                        <div className="mt-4 h-12 w-44 rounded bg-slate-200 md:h-14" />
                        <div className="mt-5 h-1.5 w-56 bg-orange-300 sm:w-72 md:w-96 lg:w-[360px]" />
                        <div className="mt-8 h-5 w-full max-w-md rounded bg-slate-200" />
                        <div className="mt-3 h-5 w-5/6 max-w-sm rounded bg-slate-200" />
                        <div className="mt-3 h-5 w-2/3 max-w-xs rounded bg-slate-200" />
                    </div>

                    <div className="lg:pt-24 xl:pt-80">
                        <div className="mb-10 h-12 w-64 rounded bg-slate-200" />

                        <div className="relative">
                            <div className="absolute bottom-0 left-[23px] top-0 w-[4px] bg-orange-200" />

                            <div className="space-y-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="w-full pt-1">
                                            <div className="h-6 w-full max-w-md rounded bg-slate-200" />
                                            <div className="mt-2 h-4 w-5/6 max-w-sm rounded bg-slate-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const FALLBACK_COPY: Record<Lang, { title: string; desc: string }> = {
    en: {
        title: "G-PSF\nPlenary",
        desc: "Roles and responsibilities of the plenary Allowing private sector to raise concerns and challenges seeking resolution and intervention from the Royal Government",
    },
    kh: {
        title: "កិច្ចប្រជុំពេញអង្គ\nG-PSF",
        desc: "អនុញ្ញាតឱ្យផ្នែកឯកជនលើកឡើងនូវសំណូមពរ និងបញ្ហាប្រឈម ដើម្បីស្នើសុំដំណោះស្រាយ និងអន្តរាគមន៍ពីផ្នែករាជរដ្ឋាភិបាល។",
    },
};

const FALLBACK_OBJECTIVES_TITLE: Record<Lang, string> = {
    en: "The plenary is:",
    kh: "កិច្ចប្រជុំពេញអង្គគឺ៖",
};

const FALLBACK_OBJECTIVES: Record<Lang, Objective[]> = {
    en: [
        {
            id: 1,
            title: "Adjusting the business and investment climate",
            description: "",
        },
        {
            id: 2,
            title: "Easing the compliance burden",
            description: "",
        },
        {
            id: 3,
            title: "Facilitating businesses under tax authorities",
            description: "",
        },
        {
            id: 4,
            title: "Trade facilitation under customs authority jurisdiction",
            description: "",
        },
        {
            id: 5,
            title: "Improving transportation and infrastructure",
            description: "",
        },
        {
            id: 6,
            title: "Rehabilitation and development of tourism",
            description: "",
        },
        {
            id: 7,
            title: "Developing agriculture and agro-industry",
            description: "",
        },
        {
            id: 8,
            title: "Banking and the finance sector",
            description: "",
        },
        {
            id: 9,
            title: "Mining and the energy sector",
            description: "",
        },
        {
            id: 10,
            title: "Construction and the real estate sector",
            description: "",
        },
        {
            id: 11,
            title: "Other issues",
            description: "",
        },
    ],
    kh: [
        {
            id: 1,
            title: "ការកែសម្រួលបរិយាកាសធុរកិច្ច និងការវិនិយោគ",
            description: "",
        },
        {
            id: 2,
            title: "ការសម្រាលបន្ទុកលើអនុលោមភាព",
            description: "",
        },
        {
            id: 3,
            title: "ការសម្រួលដល់ធុរកិច្ចក្រោមដែនសមត្ថកិច្ចពន្ធដារ",
            description: "",
        },
        {
            id: 4,
            title: "កិច្ចសម្រួលពាណិជ្ជកម្មក្រោមដែនសមត្ថកិច្ចគយ",
            description: "",
        },
        {
            id: 5,
            title: "ការលើកកម្ពស់ការដឹកជញ្ជូន និងហេដ្ឋារចនាសម្ព័ន្ធ",
            description: "",
        },
        {
            id: 6,
            title: "ការស្តារ និងការលើកស្ទួយការអភិវឌ្ឍវិស័យទេសចរណ៍",
            description: "",
        },
        {
            id: 7,
            title: "ការអភិវឌ្ឍវិស័យកសិកម្ម និងកសិឧស្សាហកម្ម",
            description: "",
        },
        {
            id: 8,
            title: "វិស័យធនាគារ និងហិរញ្ញវត្ថុ",
            description: "",
        },
        {
            id: 9,
            title: "វិស័យរ៉ែ និងថាមពល",
            description: "",
        },
        {
            id: 10,
            title: "វិស័យសំណង់ និងអចលនទ្រព្យ",
            description: "",
        },
        {
            id: 11,
            title: "បញ្ហាផ្សេងៗ",
            description: "",
        },
    ],
};

function pickText(value: I18n | undefined, lang: Lang, fallback: string) {
    return (lang === "kh" ? value?.km : value?.en) || value?.en || value?.km || fallback;
}

function formatPlenaryTitle(title: string, lang: Lang) {
    const normalizedTitle = title.trim().replace(/\s+/g, " ");

    if (lang === "kh" && normalizedTitle.includes("G-PSF")) {
        return normalizedTitle.replace(/\s*G-PSF\s*/i, "\nG-PSF");
    }

    if (lang === "en" && normalizedTitle.toLowerCase().includes("plenary")) {
        return normalizedTitle.replace(/g-psf\s*plenary/i, "G-PSF\nPlenary");
    }

    return title;
}

const PlenaryPage: React.FC = () => {
    const { language } = useLanguage();
    const lang = (language === "kh" ? "kh" : "en") as Lang;
    const isKh = lang === "kh";

    const titleFontClass = isKh ? "title-km" : "title-en";
    const bodyFontClass = isKh ? "body-km" : "body-en";

    const itemTitleFontClass = isKh ? "body-km" : "body-en";

    const [copy, setCopy] = useState(FALLBACK_COPY);
    const [objectivesTitle, setObjectivesTitle] = useState(FALLBACK_OBJECTIVES_TITLE);
    const [objectives, setObjectives] = useState(FALLBACK_OBJECTIVES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function loadPlenaryTextBlocks() {
            try {
                const response = await fetch("/api/plenary/section?types=text_block", {
                    cache: "no-store",
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) return;

                const result = (await response.json()) as ApiResponse;
                const blocks = result?.data?.blocks ?? [];

                const introBlock =
                    blocks.find((block) => block.enabled !== false && block.id === 51) ||
                    blocks.find((block) => block.enabled !== false && block.type === "text_block");

                const objectivesBlock =
                    blocks.find((block) => block.enabled !== false && block.id === 52) || null;

                if (!alive) return;

                if (introBlock) {
                    setCopy({
                        en: {
                            title: pickText(introBlock.title, "en", FALLBACK_COPY.en.title),
                            desc: pickText(introBlock.description, "en", FALLBACK_COPY.en.desc),
                        },
                        kh: {
                            title: pickText(introBlock.title, "kh", FALLBACK_COPY.kh.title),
                            desc: pickText(introBlock.description, "kh", FALLBACK_COPY.kh.desc),
                        },
                    });
                }

                if (objectivesBlock) {
                    const items =
                        objectivesBlock.posts?.[0]?.content?.en?.items ||
                        objectivesBlock.posts?.[0]?.content?.km?.items ||
                        [];

                    setObjectivesTitle({
                        en: pickText(objectivesBlock.title, "en", FALLBACK_OBJECTIVES_TITLE.en),
                        kh: pickText(objectivesBlock.title, "kh", FALLBACK_OBJECTIVES_TITLE.kh),
                    });

                    if (items.length > 0) {
                        setObjectives({
                            en: items.map((item, index) => ({
                                id: index + 1,
                                title: pickText(
                                    item.title,
                                    "en",
                                    FALLBACK_OBJECTIVES.en[index]?.title || ""
                                ),
                                description: pickText(item.description, "en", ""),
                            })),
                            kh: items.map((item, index) => ({
                                id: index + 1,
                                title: pickText(
                                    item.title,
                                    "kh",
                                    FALLBACK_OBJECTIVES.kh[index]?.title || ""
                                ),
                                description: pickText(item.description, "kh", ""),
                            })),
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load plenary text blocks:", error);
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        }

        void loadPlenaryTextBlocks();

        return () => {
            alive = false;
        };
    }, []);

    const t = {
        en: {
            title: formatPlenaryTitle(copy.en.title, "en"),
            desc: copy.en.desc,
            objectives: objectivesTitle.en,
        },
        kh: {
            title: formatPlenaryTitle(copy.kh.title, "kh"),
            desc: copy.kh.desc,
            objectives: objectivesTitle.kh,
        },
    }[lang];

    const data = objectives[lang];

    if (loading) {
        return <PlenaryPageSkeleton />;
    }

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="lg:sticky lg:top-40">
                        <h1
                            className={`
                                whitespace-pre-line text-gray-900
                                ${titleFontClass}
                            `}
                        >
                            {t.title}
                        </h1>

                        <div className="mt-5 h-1.5 w-56 translate-x-0 bg-orange-500 sm:w-72 sm:translate-x-8 md:w-96 md:translate-x-32 lg:w-[360px]" />

                        <p
                            className={`
                                mt-8 max-w-md translate-x-0 whitespace-pre-line text-[#1e3a8a]
                                sm:translate-x-8 md:translate-x-32
                                ${bodyFontClass}
                            `}
                        >
                            {t.desc}
                        </p>
                    </div>

                    <div className="lg:pt-24 xl:pt-80">
                        <h2
                            className={`
                                mb-10 text-gray-900
                                ${titleFontClass}
                            `}
                        >
                            {t.objectives}
                        </h2>

                        <div className="relative">
                            <div className="absolute bottom-0 left-[23px] top-0 w-[4px] bg-orange-500" />

                            <div className="space-y-6">
                                {data.map((obj) => (
                                    <div key={obj.id} className="relative flex items-start gap-6">
                                        <div className="relative z-10">
                                            <HexNode />
                                        </div>

                                        <div className="pt-1">
                                            <h3
                                                className={`
                                                    text-gray-900
                                                    !whitespace-normal !overflow-visible !text-clip
                                                    ${itemTitleFontClass}
                                                `}
                                            >
                                                {obj.title}
                                            </h3>

                                            {obj.description ? (
                                                <p
                                                    className={`
                                                        mt-2 max-w-sm text-gray-600
                                                        ${bodyFontClass}
                                                    `}
                                                >
                                                    {obj.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlenaryPage;
