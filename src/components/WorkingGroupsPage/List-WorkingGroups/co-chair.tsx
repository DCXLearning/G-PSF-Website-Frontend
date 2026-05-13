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

const DEFAULT_PAGE_SLUG = "agriculture-and-agro-industry";

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

export default function TeamSection({
    pageSlug = DEFAULT_PAGE_SLUG,
}: TeamSectionProps) {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const apiLang: ApiLang = lang === "kh" ? "km" : "en";
    const isKh = lang === "kh";
    const [data, setData] = useState<CoChairData | null>(null);

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
            title: "សហប្រធាននៃ ក្រុមការងារ",
            governmentLabel: "សហប្រធានផ្នែករាជរដ្ឋាភិបាល",
            sectorLabel: "សហប្រធានផ្នែកឯកជន",
            imageAlt: "រូបភាពសហប្រធានក្រុមការងារ",
            noImage: "មិនមានរូបភាព",
            noName: "មិនទាន់មានឈ្មោះ",
        }
        : {
            title: "Working Group Co-Chairs",
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

    return (
        <section className="bg-[#f5f6fa] py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-8 md:mb-10">
                    <h2
                        className={`max-w-4xl text-4xl font-black leading-tight text-[#101a3f] md:text-6xl ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
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
                    <div className={`flex h-full items-center justify-center px-6 text-center text-slate-400 ${isKh ? "khmer-font" : ""}`}>
                        {noImageText}
                    </div>
                )}
            </div>

            <div className="flex min-h-[135px] flex-col items-center justify-center px-6 py-8 text-center">
                <span className={`mb-3 text-sm font-extrabold text-orange-500 ${isKh ? "khmer-font" : ""}`}>
                    {representative.label}
                </span>

                <h3 className={`text-3xl font-black leading-tight text-[#101a3f] md:text-4xl ${isKh ? "khmer-font" : ""}`}>
                    {representative.name || noNameText}
                </h3>

                {representative.description ? (
                    <p className={`mt-3 text-sm font-semibold text-slate-500 ${isKh ? "khmer-font" : ""}`}>
                        {representative.description}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
