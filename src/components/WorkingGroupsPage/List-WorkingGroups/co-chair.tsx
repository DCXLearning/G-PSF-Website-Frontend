/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
    en?: string;
    km?: string;
};

type RepresentativePerson = {
    name?: I18nText;
    description?: I18nText;
    photo?: string;
};

type RepresentativeValue = I18nText | RepresentativePerson;

type Representative = {
    photos?: string[];
    governmentRepresentative?: RepresentativeValue;
    governmentRepresentativeDescription?: I18nText;
    sectorRepresentative?: RepresentativeValue;
    sectorRepresentativeDescription?: I18nText;
};

type CmsContent = {
    representative?: Representative;
};

type CmsPost = {
    status?: string;
    isPublished?: boolean;
    content?: {
        en?: CmsContent;
        km?: CmsContent;
    };
};

type CmsBlock = {
    enabled?: boolean;
    posts?: CmsPost[];
};

type CmsResponse = {
    success?: boolean;
    data?: {
        blocks?: CmsBlock[];
    };
};

type WorkingGroupItem = {
    slug?: string;
    orderIndex?: number;
    title?: I18nText;
};

type WorkingGroupsResponse = {
    items?: WorkingGroupItem[];
};

type CoChairData = {
    governmentDescription: string;
    governmentName: string;
    governmentPhoto: string;
    sectorDescription: string;
    sectorName: string;
    sectorPhoto: string;
};

type TeamSectionProps = {
    pageSlug?: string;
};

type CoChairCardData = {
    description: string;
    imageUrl: string;
    label: string;
    name: string;
};

type WorkingGroupTitleData = {
    groupLetterEn: string;
    groupLetterKh: string;
    title: string;
};

const DEFAULT_PAGE_SLUG = "agriculture-and-agro-industry";
const KHMER_GROUP_LETTERS = [
    "ក",
    "ខ",
    "គ",
    "ឃ",
    "ង",
    "ច",
    "ឆ",
    "ជ",
    "ឈ",
    "ញ",
    "ដ",
    "ឋ",
    "ឌ",
    "ឍ",
    "ណ",
    "ត",
    "ថ",
    "ទ",
    "ធ",
    "ន",
];

function cleanText(value?: string) {
    return (value ?? "").trim();
}

function pickText(value: I18nText | undefined, apiLang: ApiLang) {
    if (!value) return "";

    const primary = apiLang === "km" ? cleanText(value.km) : cleanText(value.en);

    return primary || cleanText(value.en) || cleanText(value.km);
}

function isRepresentativePerson(
    value: RepresentativeValue | undefined
): value is RepresentativePerson {
    return Boolean(
        value &&
        typeof value === "object" &&
        ("name" in value || "description" in value || "photo" in value)
    );
}

function pickRepresentativeName(
    value: RepresentativeValue | undefined,
    apiLang: ApiLang
) {
    return isRepresentativePerson(value)
        ? pickText(value.name, apiLang)
        : pickText(value, apiLang);
}

function pickRepresentativeDescription(
    value: RepresentativeValue | undefined,
    legacyDescription: I18nText | undefined,
    apiLang: ApiLang
) {
    return isRepresentativePerson(value)
        ? pickText(value.description, apiLang)
        : pickText(legacyDescription, apiLang);
}

function pickRepresentativePhoto(
    value: RepresentativeValue | undefined,
    fallbackPhoto: string
) {
    return isRepresentativePerson(value)
        ? cleanText(value.photo) || fallbackPhoto
        : fallbackPhoto;
}

function findRepresentative(response: CmsResponse, apiLang: ApiLang) {
    const blocks = response.data?.blocks ?? [];

    for (const block of blocks) {
        if (block.enabled === false) continue;

        const posts = block.posts ?? [];
        const post =
            posts.find((item) => item.status === "published" || item.isPublished) ??
            posts[0];

        const content =
            post?.content?.[apiLang] ?? post?.content?.en ?? post?.content?.km;

        if (content?.representative) {
            return content.representative;
        }
    }

    return null;
}

function mapRepresentative(
    representative: Representative,
    apiLang: ApiLang
): CoChairData {
    const legacyPhotos = (representative.photos ?? []).filter(Boolean);

    return {
        governmentDescription: pickRepresentativeDescription(
            representative.governmentRepresentative,
            representative.governmentRepresentativeDescription,
            apiLang
        ),
        governmentName: pickRepresentativeName(
            representative.governmentRepresentative,
            apiLang
        ),
        governmentPhoto: pickRepresentativePhoto(
            representative.governmentRepresentative,
            legacyPhotos[0] ?? ""
        ),
        sectorDescription: pickRepresentativeDescription(
            representative.sectorRepresentative,
            representative.sectorRepresentativeDescription,
            apiLang
        ),
        sectorName: pickRepresentativeName(representative.sectorRepresentative, apiLang),
        sectorPhoto: pickRepresentativePhoto(
            representative.sectorRepresentative,
            legacyPhotos[1] ?? legacyPhotos[0] ?? ""
        ),
    };
}

function getGroupArrayIndex(orderIndex: number | null) {
    if (orderIndex === null || Number.isNaN(orderIndex)) {
        return null;
    }

    return orderIndex > 0 ? orderIndex - 1 : orderIndex;
}

function getEnglishGroupLetter(orderIndex: number | null) {
    const groupIndex = getGroupArrayIndex(orderIndex);

    if (groupIndex === null || groupIndex < 0) {
        return "";
    }

    return String.fromCharCode(65 + groupIndex);
}

function getKhmerGroupLetter(orderIndex: number | null) {
    const groupIndex = getGroupArrayIndex(orderIndex);

    if (groupIndex === null || groupIndex < 0) {
        return "";
    }

    return KHMER_GROUP_LETTERS[groupIndex] ?? "";
}

function removeKhmerGroupPrefix(title: string, groupLetter: string) {
    const spacing = "[\\s\\u00A0\\u200B]*";
    let cleanTitle = title.trim();

    if (groupLetter) {
        const exactGroupPrefix = new RegExp(
            `^ក្រុមការងារ${spacing}${groupLetter}${spacing}[៖:]${spacing}`
        );
        cleanTitle = cleanTitle.replace(exactGroupPrefix, "").trim();
    }

    return cleanTitle
        .replace(new RegExp(`^ក្រុមការងារ${spacing}[៖:]?${spacing}`), "")
        .trim();
}

function removeEnglishGroupPrefix(title: string, groupLetter: string) {
    const spacing = "[\\s\\u00A0\\u200B]*";
    let cleanTitle = title.trim();

    if (groupLetter) {
        const exactGroupPrefix = new RegExp(
            `^Working${spacing}Group${spacing}${groupLetter}${spacing}:${spacing}`,
            "i"
        );
        cleanTitle = cleanTitle.replace(exactGroupPrefix, "").trim();
    }

    return cleanTitle
        .replace(new RegExp(`^Working${spacing}Group${spacing}:?${spacing}`, "i"), "")
        .trim();
}

function buildSectionTitle(
    isKh: boolean,
    titleData: WorkingGroupTitleData | null
) {
    if (!titleData?.title) {
        return isKh ? "សហប្រធាននៃក្រុមការងារ" : "Working Group Co-Chairs";
    }

    if (isKh) {
        const titleWithoutGroup = removeKhmerGroupPrefix(
            titleData.title,
            titleData.groupLetterKh
        );

        return titleData.groupLetterKh
            ? `សហប្រធាននៃ ក្រុមការងារ ${titleData.groupLetterKh}៖\n${titleWithoutGroup}`
        : `សហប្រធាននៃ ${titleWithoutGroup}`;
    }

    const titleWithoutGroup = removeEnglishGroupPrefix(
        titleData.title,
        titleData.groupLetterEn
    );

    return titleData.groupLetterEn
        ? `Co-chairs of Working Group ${titleData.groupLetterEn}:\n${titleWithoutGroup}`
        : `Co-chairs of Working Group:\n${titleWithoutGroup}`;
}

export default function TeamSection({
    pageSlug = DEFAULT_PAGE_SLUG,
}: TeamSectionProps) {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    const isKh = lang === "kh";
    const [data, setData] = useState<CoChairData | null>(null);
    const [workingGroupTitleData, setWorkingGroupTitleData] =
        useState<WorkingGroupTitleData | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadRepresentative() {
            try {
                const response = await fetch(
                    `/api/working-groups-page/section?slug=${encodeURIComponent(pageSlug)}`,
                    {
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    setData(null);
                    return;
                }

                const json = (await response.json()) as CmsResponse;
                const representative = findRepresentative(json, apiLang);

                setData(
                    representative ? mapRepresentative(representative, apiLang) : null
                );
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setData(null);
                }
            }
        }

        loadRepresentative();

        return () => {
            controller.abort();
        };
    }, [apiLang, pageSlug]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadWorkingGroupTitle() {
            try {
                const response = await fetch("/api/working-groups", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setWorkingGroupTitleData(null);
                    return;
                }

                const json = (await response.json()) as WorkingGroupsResponse;
                const groups = Array.isArray(json.items) ? json.items : [];
                const cleanSlug = cleanText(pageSlug);
                const group = groups.find((item) => cleanText(item.slug) === cleanSlug);

                if (!group) {
                    setWorkingGroupTitleData(null);
                    return;
                }

                const title = pickText(group.title, apiLang);
                const fallbackOrderIndex = groups.findIndex(
                    (item) => cleanText(item.slug) === cleanSlug
                );
                const rawOrderIndex =
                    typeof group.orderIndex === "number"
                        ? group.orderIndex
                        : fallbackOrderIndex;
                const orderIndex = rawOrderIndex >= 0 ? rawOrderIndex : null;

                setWorkingGroupTitleData({
                    groupLetterEn: getEnglishGroupLetter(orderIndex),
                    groupLetterKh: getKhmerGroupLetter(orderIndex),
                    title,
                });
            } catch (error) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setWorkingGroupTitleData(null);
                }
            }
        }

        loadWorkingGroupTitle();

        return () => {
            controller.abort();
        };
    }, [apiLang, pageSlug]);

    if (
        !data ||
        (!data.governmentPhoto &&
            !data.sectorPhoto &&
            !data.governmentName &&
            !data.sectorName &&
            !data.governmentDescription &&
            !data.sectorDescription)
    ) {
        return null;
    }

    const text = isKh
        ? {
              title: buildSectionTitle(isKh, workingGroupTitleData),
              governmentLabel: "សហប្រធានផ្នែករាជរដ្ឋាភិបាល",
              sectorLabel: "សហប្រធានផ្នែកឯកជន",
              imageAlt: "រូបភាពសហប្រធានក្រុមការងារ",
              noImage: "មិនមានរូបភាព",
              noName: "មិនទាន់មានឈ្មោះ",
          }
        : {
              title: buildSectionTitle(isKh, workingGroupTitleData),
              governmentLabel: "Government Co-Chair",
              sectorLabel: "Private Sector Co-Chair",
              imageAlt: "Working group co-chair",
              noImage: "No image available",
              noName: "Name unavailable",
          };

    const coChairCards: CoChairCardData[] = [
        {
            description: data.governmentDescription,
            imageUrl: data.governmentPhoto,
            label: text.governmentLabel,
            name: data.governmentName,
        },
        {
            description: data.sectorDescription,
            imageUrl: data.sectorPhoto,
            label: text.sectorLabel,
            name: data.sectorName,
        },
    ].filter(
        (representative) =>
            representative.name || representative.description || representative.imageUrl
    );

    const titleFontClass = isKh ? "title-km" : "title-en";

    return (
        <section className="bg-[#f5f6fa] py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-8 md:mb-10">
                    <h2 className={`max-w-4xl whitespace-pre-line text-[#101a3f] ${titleFontClass}`}>
                        {text.title}
                    </h2>
                    <div className="mt-4 h-1.5 w-56 rounded-full bg-orange-500" />
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {coChairCards.map((representative) => (
                        <CoChairCard
                            key={representative.label}
                            imageAlt={text.imageAlt}
                            isKh={isKh}
                            noImageText={text.noImage}
                            noNameText={text.noName}
                            representative={representative}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CoChairCard({
    imageAlt,
    isKh,
    noImageText,
    noNameText,
    representative,
}: {
    imageAlt: string;
    isKh: boolean;
    noImageText: string;
    noNameText: string;
    representative: CoChairCardData;
}) {
    const mainTitleFontClass = isKh ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKh ? "body-km" : "body-en";

    return (
        <article className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
            <div className="h-[320px] bg-slate-200 sm:h-[400px] lg:h-[430px]">
                {representative.imageUrl ? (
                    <img
                        src={representative.imageUrl}
                        alt={imageAlt}
                        className="h-full w-full object-cover object-top"
                    />
                ) : (
                    <div
                        className={`flex h-full items-center justify-center px-6 text-center text-slate-400 ${bodyFontClass}`}
                    >
                        {noImageText}
                    </div>
                )}
            </div>

            <div className="flex min-h-[135px] flex-col items-center justify-center px-6 py-8 text-center">
                <span
                    className={`mb-3 block text-orange-500 ${bodyFontClass} !font-extrabold`}
                >
                    {representative.label}
                </span>

                <h3
                    className={`${mainTitleFontClass} main-title-2line text-[#101a3f]`}
                >
                    {representative.name || noNameText}
                </h3>

                {representative.description ? (
                    <p
                        className={`mt-3 text-slate-500 ${bodyFontClass} body-2line !font-semibold`}
                    >
                        {representative.description}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
