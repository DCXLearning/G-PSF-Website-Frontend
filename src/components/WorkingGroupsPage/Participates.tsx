/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";
type ApiLang = "en" | "km";

type Stakeholder = {
    id: number;
    title: string;
    description: string;
    icon: string;
    slug?: string;
};

type ParticipatesResponse = {
    success: boolean;
    data?: {
        title: string;
        subtitle: string;
        items: Stakeholder[];
    };
    message?: string;
};

function normalizeLang(language: unknown): UiLang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

function uiToApiLang(ui: UiLang): ApiLang {
    return ui === "kh" ? "km" : "en";
}

function isSvg(url?: string) {
    return !!url && url.toLowerCase().includes(".svg");
}

const Participates: React.FC = () => {
    const { language } = useLanguage();

    const uiLang = normalizeLang(language);
    const apiLang = uiToApiLang(uiLang);
    const isKh = uiLang === "kh";

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [items, setItems] = useState<Stakeholder[]>([]);
    const [error, setError] = useState("");

    const titleFontClass = isKh ? "title-km" : "title-en";
    const mainTitleFontClass = isKh ? "main-title-km" : "main-title-en";
    const bodyFontClass = isKh ? "body-km" : "body-en";

    const fallback = useMemo(() => {
        return uiLang === "kh"
            ? {
                title: "អ្នកចូលរួម",
                subtitle:
                    "អង្គប្រជុំក្រុមការងារ រួមបញ្ចូលភាគីពាក់ព័ន្ធជាច្រើនប្រភេទ។",
            }
            : {
                title: "Who Participates",
                subtitle:
                    "Working Group meetings bring together a broad range of stakeholders.",
            };
    }, [uiLang]);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/participates?lang=${apiLang}`, {
                    cache: "no-store",
                });

                const json = (await res.json()) as ParticipatesResponse;

                if (!alive) return;

                if (!res.ok || !json.success) {
                    setError(json.message || "Failed to load data");
                    setTitle("");
                    setSubtitle("");
                    setItems([]);
                    return;
                }

                setTitle(json.data?.title || "");
                setSubtitle(json.data?.subtitle || "");
                setItems(json.data?.items || []);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Network error");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, [apiLang]);

    const viewTitle = title || fallback.title;
    const viewSubtitle = subtitle || fallback.subtitle;

    return (
        <section className="relative cursor-pointer bg-white pt-16 pb-0">
            <div className="mx-auto mb-12 w-full max-w-7xl px-4 text-left sm:px-6 lg:px-8">
                <h2 className={`mb-4 text-gray-900 ${titleFontClass}`}>
                    {viewTitle}
                </h2>

                <p className={`text-gray-500 ${bodyFontClass}`}>
                    {viewSubtitle}
                </p>

                {error ? (
                    <p className={`mt-4 text-red-600 ${bodyFontClass}`}>
                        {error}
                    </p>
                ) : null}
            </div>

            <div className="relative">
                <div className="absolute bottom-0 h-[150px] w-full bg-[#1e234a]" />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-4 lg:px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl"
                                >
                                    <div className="-mt-12 mb-10 flex h-25 w-full justify-center">
                                        <div className="h-[110px] w-[110px] rounded-t-sm rounded-b-[100px] bg-[#1e234a] p-8" />
                                    </div>

                                    <div className="mb-4 h-6 rounded bg-gray-200" />
                                    <div className="mb-2 h-4 rounded bg-gray-200" />
                                    <div className="h-4 w-4/5 rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex h-full flex-col items-start overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-2xl transition-all hover:-translate-y-1"
                                >
                                    <div className="-mt-12 mb-10 flex h-25 w-full justify-center">
                                        <div className="rounded-t-sm rounded-b-[100px] bg-[#1e234a] p-8 shadow-md">
                                            <img
                                                src={item.icon}
                                                alt={item.title}
                                                className={`h-14 w-14 ${isSvg(item.icon)
                                                        ? "brightness-0 invert"
                                                        : ""
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    <h3
                                        className={`
                                            mb-4 min-h-[4rem] text-[#01265a]
                                            !whitespace-normal !overflow-visible !text-clip
                                            ${mainTitleFontClass}
                                        `}
                                    >
                                        {item.title}
                                    </h3>

                                    <p className={`text-gray-600 ${bodyFontClass}`}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-24 w-full bg-[#1e234a]" />
        </section>
    );
};

export default Participates;