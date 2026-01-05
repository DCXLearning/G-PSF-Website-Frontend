// src/app/mandate-scope/page.tsx
"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

function Donut({
    value = 90,
    size = 120,
    stroke = 14,
}: {
    value?: number;
    size?: number;
    stroke?: number;
}) {
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference * (1 - clamped / 100);

    return (
        <div className="relative inline-flex items-center justify-center shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E7EDF3" strokeWidth={stroke} />
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="#0F3D5E"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                />
            </svg>

            <div className="absolute text-center">
                <div className="text-base font-extrabold text-slate-900">{clamped}%</div>
            </div>
        </div>
    );
}

function MiniBarChart({ lang }: { lang: Lang }) {
    const labels =
        lang === "kh"
            ? { resolved: "ដោះស្រាយរួច", inProgress: "កំពុងដំណើរការ", pending: "កំពុងរង់ចាំ", count: "ចំនួន" }
            : { resolved: "Resolved", inProgress: "In progress", pending: "Pending", count: "Count" };

    const data = [
        { label: labels.resolved, value: 62, color: "#0F3D5E" },
        { label: labels.inProgress, value: 12, color: "#3A73A5" },
        { label: labels.pending, value: 5, color: "#F2A53A" },
    ];

    const max = 60;
    const chartH = 160;
    const chartW = 320;

    const padding = { top: 10, right: 10, bottom: 40, left: 40 };
    const innerW = chartW - padding.left - padding.right;
    const innerH = chartH - padding.top - padding.bottom;
    const gap = 20;
    const barW = (innerW - gap * (data.length - 1)) / data.length;

    const yTicks = [0, 20, 40, 60];

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-auto"
                aria-label="Issues & responses bar chart"
            >
                {yTicks.map((t) => {
                    const y = padding.top + innerH - (t / max) * innerH;
                    return (
                        <g key={t}>
                            <line x1={padding.left} x2={chartW - padding.right} y1={y} y2={y} stroke="#E7EDF3" strokeWidth="1" />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-medium">
                                {t}
                            </text>
                        </g>
                    );
                })}

                <text
                    x={12}
                    y={padding.top + innerH / 2}
                    transform={`rotate(-90 12 ${padding.top + innerH / 2})`}
                    className="fill-slate-400 text-[10px] font-bold uppercase tracking-wider"
                >
                    {labels.count}
                </text>

                {data.map((d, i) => {
                    const h = (d.value / max) * innerH;
                    const x = padding.left + i * (barW + gap);
                    const y = padding.top + innerH - h;
                    return (
                        <g key={d.label}>
                            <rect x={x} y={y} width={barW} height={h} rx="4" fill={d.color} />
                            <text
                                x={x + barW / 2}
                                y={chartH - 15}
                                textAnchor="middle"
                                className="fill-slate-500 text-[11px] font-bold"
                                transform={`rotate(-15 ${x + barW / 2} ${chartH - 15})`}
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function MandateScopePage() {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t =
        lang === "kh"
            ? {
                title1: "ភារកិច្ច និង",
                title2: "វិសាលភាព",
                what: "ក្រុមការងារនេះធ្វើអ្វី?",
                whatDesc:
                    "WG 4 ដោះស្រាយបញ្ហាច្បាប់ និងអភិបាលកិច្ចដែលពាក់ព័ន្ធជាច្រើន ដែលវិស័យឯកជនលើកឡើង។ បញ្ហានឹងត្រូវពិភាក្សានៅកិច្ចប្រជុំ Technical WG ដែលមានសហប្រធានពីរដ្ឋ និងឯកជន។ ប្រសិនបើមិនអាចដោះស្រាយបាន នឹងលើកទៅ Plenary ដើម្បីទទួលការណែនាំ។",
                pathway: "ផ្លូវនៃការចូលរួម",
                submit: "ដាក់ស្នើបញ្ហា",
                progress: "សង្ខេបវឌ្ឍនភាព",
                resolution: "អត្រាដោះស្រាយ",
                issues: "បញ្ហា និងការឆ្លើយតប",
            }
            : {
                title1: "Mandate &",
                title2: "Scope",
                what: "What this WG does",
                whatDesc:
                    "WG 4 addresses cross-cutting regulatory and governance constraints raised by the private sector. Issues are discussed in Technical WG sessions co-chaired by government and private sector leads. Unresolved items are escalated to the national Plenary for direction.",
                pathway: "Engagement pathway",
                submit: "Submit Issue",
                progress: "Progress Snapshot",
                resolution: "resolution",
                issues: "Issues & responses",
            };

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-4 lg:py-16">
                {/* Title */}
                <header className="mb-12">
                    <h1
                        className={`text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {t.title1}{" "}
                        <span className="relative inline-block">
                            {t.title2}
                            <span className="absolute -bottom-1 left-0 h-[4px] md:h-[6px] w-full rounded-full bg-orange-400" />
                        </span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
                    {/* Left big card */}
                    <section className="lg:col-span-7">
                        <div className="rounded-[40px] border border-slate-100 bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="space-y-12">
                                <div>
                                    <h2 className={`text-2xl font-bold text-slate-900 md:text-3xl ${isKh ? "khmer-font" : ""}`}>
                                        {t.what}
                                    </h2>
                                    <p className={`mt-5 text-base leading-relaxed text-slate-500 md:text-lg ${isKh ? "khmer-font" : ""}`}>
                                        {t.whatDesc}
                                    </p>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-bold text-slate-900 md:text-2xl ${isKh ? "khmer-font" : ""}`}>
                                        {t.pathway}
                                    </h3>
                                    <div className={`mt-5 flex flex-wrap items-center gap-2 text-base font-medium text-slate-500 md:text-lg ${isKh ? "khmer-font" : ""}`}>
                                        <span>BMOs/PSWGs</span>
                                        <span className="text-slate-300">→</span>
                                        <span>Technical WG</span>
                                        <span className="text-slate-300">→</span>
                                        <span>Secretariat tracking</span>
                                        <span className="text-slate-300">→</span>
                                        <span>Plenary (if needed)</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className={`h-14 rounded-2xl bg-[#0F3D5E] px-10 text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${isKh ? "khmer-font" : ""}`}>
                                        {t.submit}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right column */}
                    <aside className="lg:col-span-5 flex flex-col gap-10">
                        {/* Progress card */}
                        <div className="rounded-[40px] bg-[#F8FAFC] p-8 md:p-10">
                            <h2 className={`text-2xl font-bold text-slate-900 ${isKh ? "khmer-font" : ""}`}>{t.progress}</h2>

                            <div className="mt-8 flex items-center gap-8">
                                <Donut value={90} />
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black text-[#0F3D5E]">90%</span>
                                    <span className={`text-slate-500 font-semibold uppercase tracking-wider text-sm ${isKh ? "khmer-font normal-case" : ""}`}>
                                        {t.resolution}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Issues chart card */}
                        <div className="px-2">
                            <h2 className={`mb-6 text-2xl font-bold text-slate-900 ${isKh ? "khmer-font" : ""}`}>{t.issues}</h2>
                            <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
                                <MiniBarChart lang={lang} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
