// src/app/recent-issues/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type Status = "Resolved" | "In Progress" | "Pending";

const rows: Array<{
    theme_en: string;
    theme_kh: string;
    status: Status;
    year: number;
    quarter: "Q1" | "Q2" | "Q3" | "Q4";
    href: string;
}> = [
        {
            theme_en: "Tax administration clarity",
            theme_kh: "ភាពច្បាស់លាស់ក្នុងការគ្រប់គ្រងពន្ធ",
            status: "Resolved",
            year: 2024,
            quarter: "Q2",
            href: "/issues/tax-administration-clarity",
        },
        {
            theme_en: "Licensing & permits delays",
            theme_kh: "ការពន្យារពេលអាជ្ញាបណ្ណ និងការអនុញ្ញាត",
            status: "In Progress",
            year: 2024,
            quarter: "Q3",
            href: "/issues/licensing-permits-delays",
        },
        {
            theme_en: "Regulatory interpretation",
            theme_kh: "ការបកស្រាយបទប្បញ្ញត្តិ",
            status: "In Progress",
            year: 2024,
            quarter: "Q3",
            href: "/issues/regulatory-interpretation",
        },
        {
            theme_en: "Fees & compliance burden",
            theme_kh: "ថ្លៃសេវា និងបន្ទុកអនុលោមតាមច្បាប់",
            status: "Pending",
            year: 2024,
            quarter: "Q4",
            href: "/issues/fees-compliance-burden",
        },
    ];

function StatusPill({ status, lang }: { status: Status; lang: Lang }) {
    const label =
        lang === "kh"
            ? status === "Resolved"
                ? "ដោះស្រាយរួច"
                : status === "In Progress"
                    ? "កំពុងដំណើរការ"
                    : "កំពុងរង់ចាំ"
            : status;

    const styles: Record<Status, string> = {
        Resolved: "bg-emerald-100 text-slate-900",
        "In Progress": "bg-sky-100 text-slate-900",
        Pending: "bg-amber-100 text-slate-900",
    };

    return (
        <span
            className={[
                "inline-flex h-10 w-full md:w-auto md:min-w-[170px] items-center justify-center rounded-full px-6 text-sm font-semibold",
                styles[status],
            ].join(" ")}
        >
            {label}
        </span>
    );
}

export default function RecentIssuesPage() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t =
        lang === "kh"
            ? {
                title1: "បញ្ហាថ្មីៗ និង",
                title2: "ការឆ្លើយតប",
                issueTheme: "ប្រធានបទបញ្ហា",
                status: "ស្ថានភាព",
                lastUpdate: "បច្ចុប្បន្នភាពចុងក្រោយ",
                link: "តំណភ្ជាប់",
                lastUpdateMobile: "បច្ចុប្បន្នភាពចុងក្រោយ៖",
                view: "មើល",
            }
            : {
                title1: "Recent Issues &",
                title2: "Responses",
                issueTheme: "Issue theme",
                status: "Status",
                lastUpdate: "Last update",
                link: "Link",
                lastUpdateMobile: "Last update:",
                view: "View",
            };

    return (
        <main className="min-h-screen bg-white px-4 py-10 sm:px-6 md:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-7xl px-4">
                {/* Title */}
                <header className="mb-8 md:mb-10">
                    <h1
                        className={`text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {t.title1}{" "}
                        <span className="relative inline-block">
                            {t.title2}
                            <span className="absolute -bottom-2 left-0 h-[5px] w-2/3 rounded-full bg-orange-400 md:w-full" />
                        </span>
                    </h1>
                </header>

                {/* Card */}
                <section className="rounded-[22px] sm:rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Header row (hide on mobile, show on md+) */}
                    <div className="hidden md:block bg-slate-50 px-6 py-6 md:px-10">
                        <div
                            className={`grid grid-cols-12 items-center text-sm font-bold text-slate-900 ${isKh ? "khmer-font" : ""
                                }`}
                        >
                            <div className="col-span-6">{t.issueTheme}</div>
                            <div className="col-span-3 text-center">{t.status}</div>
                            <div className="col-span-2 text-center">{t.lastUpdate}</div>
                            <div className="col-span-1 text-right">{t.link}</div>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="px-4 py-4 sm:px-6 md:px-10 md:py-6">
                        <div className="divide-y divide-slate-200">
                            {rows.map((r) => (
                                <div
                                    key={r.href}
                                    className="py-5 md:py-6 grid gap-4 grid-cols-1 md:grid-cols-12 md:items-center"
                                >
                                    {/* Theme */}
                                    <div className="md:col-span-6">
                                        <div className={`text-base font-semibold text-slate-800 ${isKh ? "khmer-font" : ""}`}>
                                            {isKh ? r.theme_kh : r.theme_en}
                                        </div>

                                        {/* Mobile meta labels */}
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 md:hidden">
                                            <span className={`rounded-full bg-slate-100 px-3 py-1 ${isKh ? "khmer-font" : ""}`}>
                                                {t.lastUpdateMobile}{" "}
                                                <span className="font-semibold text-slate-700">
                                                    {r.year} {r.quarter}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-3 md:text-center">
                                        <div className={`mb-2 text-xs font-semibold text-slate-500 md:hidden ${isKh ? "khmer-font" : ""}`}>
                                            {t.status}
                                        </div>
                                        <StatusPill status={r.status} lang={lang} />
                                    </div>

                                    {/* Last update (md+) */}
                                    <div className="hidden md:block md:col-span-2 md:text-center">
                                        <span className="text-sm font-semibold text-slate-700">{r.year}</span>
                                        <span className="ml-4 text-sm font-semibold text-slate-700">{r.quarter}</span>
                                    </div>

                                    {/* Link */}
                                    <div className="md:col-span-1 md:text-right">
                                        <Link
                                            href="#"
                                            className={[
                                                "inline-flex h-10 w-full md:w-auto items-center justify-center rounded-full bg-[#0F3D5E] px-8 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]",
                                                isKh ? "khmer-font" : "",
                                            ].join(" ")}
                                        >
                                            {t.view}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-6 md:h-8" />
                </section>
            </div>
        </main>
    );
}
