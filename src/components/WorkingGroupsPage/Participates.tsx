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

function uiToApiLang(ui: UiLang): ApiLang {
    return ui === "kh" ? "km" : "en";
}

function isSvg(url?: string) {
    return !!url && url.toLowerCase().includes(".svg");
}

const Participates: React.FC = () => {
    const { language } = useLanguage();
    const uiLang = (language as UiLang) ?? "en";
    const apiLang = uiToApiLang(uiLang);
    const isKh = uiLang === "kh";

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [items, setItems] = useState<Stakeholder[]>([]);
    const [error, setError] = useState("");

    const fallback = useMemo(() => {
        return uiLang === "kh"
            ? { title: "អ្នកចូលរួម", subtitle: "អង្គប្រជុំក្រុមការងារ រួមបញ្ចូលភាគីពាក់ព័ន្ធជាច្រើនប្រភេទ។" }
            : { title: "Who Participates", subtitle: "Working Group meetings bring together a broad range of stakeholders." };
    }, [uiLang]);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/participates?lang=${apiLang}`, { cache: "no-store" });
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
        <section className="relative bg-white pt-16 pb-0 cursor-pointer">
            <div className="container mx-auto px-4 text-center mb-12">
                <h2 className={`text-5xl md:text-6xl font-bold text-[#1e234a] mb-4 ${isKh ? "khmer-font" : ""}`}>
                    {viewTitle}
                </h2>

                <p className={`text-xl text-gray-500 font-medium ${isKh ? "khmer-font" : ""}`}>
                    {viewSubtitle}
                </p>

                {error ? <p className={`mt-4 text-red-600 ${isKh ? "khmer-font" : ""}`}>{error}</p> : null}
            </div>

            <div className="relative">
                <div className="absolute bottom-0 w-full h-[150px] bg-[#1e234a]" />

                <div className="container mx-auto px-4 relative z-10">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 animate-pulse">
                                    <div className="w-full h-25 flex justify-center -mt-12 mb-10">
                                        <div className="bg-[#1e234a] p-8 rounded-b-[100px] rounded-t-sm w-[110px] h-[110px]" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded mb-4" />
                                    <div className="h-4 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl hover:translate-y-[-1.5%] transition-all overflow-hidden p-8 shadow-2xl flex flex-col items-start text-left h-full border border-gray-100"
                                >
                                    <div className="w-full h-25 flex justify-center -mt-12 mb-10">
                                        <div className="bg-[#1e234a] p-8 rounded-b-[100px] rounded-t-sm shadow-md">
                                            <img
                                                src={item.icon}
                                                alt="icon"
                                                className={`w-14 h-14 ${isSvg(item.icon) ? "brightness-0 invert" : ""}`}
                                            />
                                        </div>
                                    </div>

                                    <h3 className={`text-2xl font-bold text-[#3a475a] mb-4 leading-tight min-h-[4rem] ${isKh ? "khmer-font" : ""}`}>
                                        {item.title}
                                    </h3>

                                    <p className={`text-gray-600 text-lg leading-relaxed ${isKh ? "khmer-font" : ""}`}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[#1e234a] h-24 w-full" />
        </section>
    );
};

export default Participates;