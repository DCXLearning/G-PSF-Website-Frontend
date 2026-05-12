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

type Representative = {
    photos?: string[];
    governmentRepresentative?: I18nText;
    governmentRepresentativeDescription?: I18nText;
    sectorRepresentative?: I18nText;
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
    photos: string[];
    sectorDescription: string;
    sectorName: string;
};

type TeamSectionProps = {
    pageSlug?: string;
};

type FeaturedRepresentative = {
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
    return {
        governmentDescription: pickText(
            representative.governmentRepresentativeDescription,
            apiLang
        ),
        governmentName: pickText(representative.governmentRepresentative, apiLang),
        sectorDescription: pickText(
            representative.sectorRepresentativeDescription,
            apiLang
        ),
        sectorName: pickText(representative.sectorRepresentative, apiLang),
        photos: (representative.photos ?? []).filter(Boolean),
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

    if (!data || (data.photos.length === 0 && !data.governmentName && !data.sectorName)) {
        return null;
    }

    const text = isKh
        ? {
            title: "សហប្រធាននៃ ក្រុមការងារតាមវិស័យ",
            governmentLabel: "តំណាងរាជរដ្ឋាភិបាល",
            sectorLabel: "តំណាងវិស័យឯកជន",
            badge: "សហប្រធាន",
            imageAlt: "រូបភាពសហប្រធានក្រុមការងារ",
        }
        : {
            title: "Working Group Co-Chairs",
            governmentLabel: "Government Co-Chair",
            sectorLabel: "Private Sector Co-Chair",
            badge: "Co-Chair",
            imageAlt: "Working group co-chair",
        };

    const featuredRepresentative: FeaturedRepresentative =
        data.governmentName || data.governmentDescription
            ? {
                description: data.governmentDescription,
                imageUrl: data.photos[0] ?? "",
                label: text.governmentLabel,
                name: data.governmentName,
            }
            : {
                description: data.sectorDescription,
                imageUrl: data.photos[0] ?? "",
                label: text.sectorLabel,
                name: data.sectorName,
            };

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

                <div className="mb-9 grid gap-5 md:grid-cols-2">
                    <RepresentativeName
                        label={text.governmentLabel}
                        name={data.governmentName}
                        isKh={isKh}
                    />
                    <RepresentativeName
                        label={text.sectorLabel}
                        name={data.sectorName}
                        isKh={isKh}
                    />
                </div>

                <FeaturedProfileCard
                    badge={text.badge}
                    imageAlt={text.imageAlt}
                    isKh={isKh}
                    representative={featuredRepresentative}
                />
            </div>
        </section>
    );
}

function RepresentativeName({
    isKh,
    label,
    name,
}: {
    isKh: boolean;
    label: string;
    name: string;
}) {
    if (!name) {
        return null;
    }

    return (
        <article className="rounded-[1.6rem] bg-white px-7 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
            <p className={`text-sm font-extrabold text-orange-500 ${isKh ? "khmer-font" : ""}`}>
                {label}
            </p>
            {name ? (
                <h3 className={`mt-4 text-3xl font-black leading-tight text-[#101a3f] ${isKh ? "khmer-font" : ""}`}>
                    {name}
                </h3>
            ) : null}
        </article>
    );
}

function FeaturedProfileCard({
    badge,
    imageAlt,
    isKh,
    representative,
}: {
    badge: string;
    imageAlt: string;
    isKh: boolean;
    representative: FeaturedRepresentative;
}) {
    return (
        <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.09)] ring-1 ring-slate-100 md:grid md:grid-cols-[0.78fr_1.42fr]">
            <div className="min-h-[360px] bg-slate-100 md:min-h-[560px]">
                {representative.imageUrl ? (
                    <img
                        src={representative.imageUrl}
                        alt={imageAlt}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className={`flex h-full min-h-[360px] items-center justify-center px-6 text-center text-slate-400 ${isKh ? "khmer-font" : ""}`}>
                        {isKh ? "មិនមានរូបភាព" : "No image available"}
                    </div>
                )}
            </div>

            <div className="flex min-h-[360px] flex-col justify-center px-7 py-10 md:px-14 lg:px-16">
                <span className={`mb-8 w-fit rounded-full bg-orange-50 px-5 py-2 text-sm font-extrabold text-orange-500 ${isKh ? "khmer-font" : ""}`}>
                    {badge}
                </span>

                {representative.name ? (
                    <h3 className={`text-4xl font-black leading-tight text-[#101a3f] md:text-6xl ${isKh ? "khmer-font" : ""}`}>
                        {representative.name}
                    </h3>
                ) : null}

                {/*<p className={`mt-6 text-base font-extrabold text-orange-500 ${isKh ? "khmer-font" : ""}`}>*/}
                {/*    {representative.label}*/}
                {/*</p>*/}

                {representative.description ? (
                    <p className={`mt-5 max-w-2xl text-base leading-8 text-slate-500 md:text-lg ${isKh ? "khmer-font" : ""}`}>
                        {representative.description}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
