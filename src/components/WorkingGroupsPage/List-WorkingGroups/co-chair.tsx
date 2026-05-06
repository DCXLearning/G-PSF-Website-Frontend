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
    sectorRepresentative?: I18nText;
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
    governmentName: string;
    photos: string[];
    sectorName: string;
};

type TeamSectionProps = {
    pageSlug?: string;
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
        governmentName: pickText(representative.governmentRepresentative, apiLang),
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

    return (
        <section className="bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-8">
                    {/*<p className={`text-xl font-bold text-slate-700 ${isKh ? "khmer-font" : ""}`}>*/}
                    {/*    {isKh ? "សូមជួបជាមួយ" : "Meet the"}*/}
                    {/*</p>*/}
                    <h2
                        className={`text-3xl font-extrabold text-[#101a3f] md:text-5xl ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {isKh ? "សហប្រធាននៃ ក្រុមការងារតាមវិស័យ" : "Working Group Co-Chairs"}
                    </h2>
                    <div className="mt-4 h-1.5 w-64 bg-orange-500" />
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2">
                    <RepresentativeName
                        label={isKh ? "តំណាងរាជរដ្ឋាភិបាល" : "Government Representative"}
                        name={data.governmentName}
                        isKh={isKh}
                    />
                    <RepresentativeName
                        label={isKh ? "តំណាងវិស័យឯកជន" : "Private Sector Representative"}
                        name={data.sectorName}
                        isKh={isKh}
                    />
                </div>

                {data.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {data.photos.map((photo, index) => (
                            <div
                                key={`${photo}-${index}`}
                                className="aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                            >
                                <img
                                    src={photo}
                                    alt={
                                        isKh
                                            ? "រូបភាពសហអធិបតីក្រុមការងារ"
                                            : "Working group co-chair"
                                    }
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : null}
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
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className={`text-sm font-bold text-orange-600 ${isKh ? "khmer-font" : ""}`}>
                {label}
            </p>
            <h3 className={`mt-2 text-2xl font-extrabold text-[#101a3f] ${isKh ? "khmer-font" : ""}`}>
                {name}
            </h3>
        </article>
    );
}
