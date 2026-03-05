"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type StatApiItem = {
    label?: I18n;
    value?: I18n;
};

type StatsApiResponse = {
    success: boolean;
    data?: {
        description?: I18n | null;
        items?: StatApiItem[];
    };
    message?: string;
};

function pickText(obj: I18n | undefined, lang: "en" | "km") {
    if (!obj) return "";
    return (lang === "km" ? obj.km : obj.en) || obj.en || obj.km || "";
}

interface StatItemProps {
    value: string;
    label: string;
    isKhmer: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, isKhmer }) => (
    <div className="flex flex-col items-center justify-center p-3 border-5 border-dashed border-indigo-900 m-0">
        <div className="text-5xl lg:text-4xl font-extrabold text-indigo-900">
            {value}
        </div>
        <div
            className={`text-base lg:text-lg text-indigo-900 font-medium tracking-wider mt-2 opacity-90 text-center ${isKhmer ? "khmer-font" : ""
                }`}
        >
            {label}
        </div>
    </div>
);

const StatsBar: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";
    const langKey: "en" | "km" = isKhmer ? "km" : "en";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [items, setItems] = useState<StatApiItem[]>([]);
    const [desc, setDesc] = useState<I18n | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch("/api/home-page/stats", { cache: "no-store" });
                const json = (await res.json()) as StatsApiResponse;

                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || `Request failed: ${res.status}`);
                }

                if (!alive) return;
                setItems(json?.data?.items ?? []);
                setDesc((json?.data?.description as any) ?? null);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Failed to load stats");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, []);

    const descriptionText = useMemo(() => {
        // If you store description in statsBlock.description (top level) instead, just return that from route
        const txt = pickText(desc ?? undefined, langKey);
        return txt || (isKhmer ? "" : "");
    }, [desc, langKey, isKhmer]);

    const uiItems = useMemo(() => {
        return (items || []).map((it) => ({
            label: pickText(it.label, langKey),
            value: pickText(it.value, langKey),
        }));
    }, [items, langKey]);

    if (loading) {
        return (
            <section className="w-full bg-white py-16">
                <div className="container mx-auto px-4 max-w-7xl text-center text-gray-600">
                    {isKhmer ? "កំពុងទាញទិន្នន័យ..." : "Loading..."}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full bg-white py-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-white py-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {descriptionText ? (
                    <p
                        className={`text-center text-gray-600 mb-12 text-lg ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {descriptionText}
                    </p>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {uiItems.map((stat, index) => (
                        <StatItem
                            key={index}
                            value={stat.value}
                            label={stat.label}
                            isKhmer={isKhmer}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;