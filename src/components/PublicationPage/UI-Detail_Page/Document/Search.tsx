"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type SearchProps = {
    value: string;
    onSearch: (value: string) => void;
};

const searchText = {
    en: {
        title: "Search the documents",
        placeholder: "Search related public documents …",
        button: "Search",
    },
    kh: {
        title: "ស្វែងរកឯកសារ",
        placeholder: "ស្វែងរកឯកសារសាធារណៈដែលពាក់ព័ន្ធ …",
        button: "ស្វែងរក",
    },
};

export default function Search({ value, onSearch }: SearchProps) {
    const { language } = useLanguage();
    const isKhmer = language === "kh";
    const labels = isKhmer ? searchText.kh : searchText.en;
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSearch(inputValue.trim());
    }

    return (
        <main className="bg-[#d9d9d9] py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <h1 className={`text-[#1a2b4b] text-3xl md:text-4xl font-bold ${isKhmer ? "khmer-font" : ""}`}>
                    {labels.title}
                </h1>

                <form onSubmit={onSubmit} className="mt-5">
                    <div className="flex w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-sm">
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={labels.placeholder}
                            className={`h-11 flex-1 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        />

                        <button
                            type="submit"
                            className={`h-11 shrink-0 cursor-pointer bg-[#2f3b86] px-8 text-sm font-bold uppercase tracking-wide text-white hover:opacity-90 ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        >
                            {labels.button}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
