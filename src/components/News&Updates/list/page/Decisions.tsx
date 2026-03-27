// app/featured/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";

type ViewMode = "list" | "grid";

type FeaturedItem = {
    id: number;
    type: "VIDEO" | "PUBLICATION";
    title: string;
    description: string;
    image?: string | null;
    date: string;
    href: string;
};

const featuredData: FeaturedItem[] = [
    {
        id: 1,
        type: "VIDEO",
        title:
            "ខួបលើកទី១៨ នៃ ការពិភាក្សាវេទិកាវិស័យឯកជន ដើម្បីលើកកម្ពស់សេដ្ឋកិច្ចជាតិ និងជំរុញវិនិយោគ (Video inside)",
        description:
            "សេចក្តីសង្ខេបពីកិច្ចពិភាក្សាសំខាន់ៗ និងការចូលរួមរបស់ថ្នាក់ដឹកនាំ ក្នុងបរិបទលើកកម្ពស់សេដ្ឋកិច្ចជាតិ និងវិនិយោគ (Video inside)",
        image: "/images/featured/featured-1.jpg",
        date: "03 March 2026",
        href: "/featured/1",
    },
    {
        id: 2,
        type: "PUBLICATION",
        title:
            "អភិបាលកិច្ច និង ធនធានមនុស្សក្នុងវិស័យឯកជន ដើម្បីជំរុញកំណើនសេដ្ឋកិច្ច និងសមត្ថភាពប្រកួតប្រជែង",
        description:
            "បោះពុម្ពផ្សាយថ្មី ស្តីពីការអភិវឌ្ឍវិស័យឯកជន ការពង្រឹងធនធានមនុស្ស និងការបង្កើនប្រសិទ្ធភាពស្ថាប័ន",
        image: null,
        date: "03 March 2026",
        href: "/featured/2",
    },
    {
        id: 3,
        type: "PUBLICATION",
        title: "G-PSF Brings Significant Progress to Drive Cambodia’s Economic Growth",
        description:
            "Members of the leadership team take a group photo at the G-PSF forum on November 27. CDC",
        image: "/images/featured/featured-3.jpg",
        date: "03 March 2026",
        href: "/featured/3",
    },
    {
        id: 4,
        type: "PUBLICATION",
        title: "Strengthening Public-Private Partnership for Sustainable Development",
        description:
            "A closer look at collaboration, reforms, and practical actions supporting inclusive economic growth.",
        image: "",
        date: "02 March 2026",
        href: "/featured/4",
    },
];

function NewsImage({
    src,
    alt,
    className = "",
}: {
    src?: string | null;
    alt: string;
    className?: string;
}) {
    const [error, setError] = useState(false);
    const isValid = !!src && !error;

    return (
        <div
            className={`relative overflow-hidden bg-[#ECECEC] ${className}`}
        >
            {isValid ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ECECEC]">
                    <div className="flex h-[218px] w-[156px] flex-col items-center justify-center bg-[#F6F6F6]">
                        <div className="flex h-[70px] w-[70px] items-center justify-center bg-[#D9D9D9]">
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-sm bg-[#BBBBBB]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.7"
                                    className="h-7 w-7"
                                >
                                    <circle cx="8.5" cy="8.5" r="1.8" fill="white" stroke="none" />
                                    <path d="M4 17l4.5-4.5a1 1 0 011.5.08L13 16l2.2-2.8a1 1 0 011.62.04L20 17" />
                                    <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-[12px] leading-[18px] text-[#777777]">
                            document image
                            <br />
                            or
                            <br />
                            news logo
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ type }: { type: FeaturedItem["type"] }) {
    return (
        <span className="inline-flex rounded-[3px] bg-[#3F51D7] px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white">
            {type}
        </span>
    );
}

function Header({
    view,
    setView,
}: {
    view: ViewMode;
    setView: (value: ViewMode) => void;
}) {
    return (
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="mt-1 text-[44px] font-extrabold leading-none text-[#0B2C5F]">
                    Decisions
                </h1>
                <div className="mt-4 h-[4px] w-[150px] bg-[#F59E0B]" />
            </div>

            <div className="flex items-center gap-2 self-start rounded-md border border-[#D1D5DB] bg-white p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${view === "list"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                        }`}
                >
                    <List className="h-4 w-4" />
                    List
                </button>

                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${view === "grid"
                            ? "bg-[#23395D] text-white"
                            : "text-[#475569] hover:bg-slate-100"
                        }`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                </button>
            </div>
        </div>
    );
}

function ListCard({ item }: { item: FeaturedItem }) {
    return (
        <article className="grid grid-cols-1 gap-6 border-b border-[#D9DEE7] py-7 md:grid-cols-[136px_minmax(0,1fr)]">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    className="h-[164px] w-full md:w-[136px]"
                />
            </Link>

            <div className="min-w-0">
                <Badge type={item.type} />

                <h2 className="mt-3 text-[18px] font-extrabold leading-[1.5] text-[#0B2C5F] md:text-[20px]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-[#64748B]">
                    {item.description}
                </p>

                <Link
                    href={item.href}
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    View details
                </Link>

                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date}</span>
                </div>
            </div>
        </article>
    );
}

function GridCard({ item }: { item: FeaturedItem }) {
    return (
        <article className="overflow-hidden rounded-md border border-[#D9DEE7] bg-white transition hover:shadow-md">
            <Link href={item.href} className="block">
                <NewsImage
                    src={item.image}
                    alt={item.title}
                    className="h-[240px] w-full"
                />
            </Link>

            <div className="p-5">
                <Badge type={item.type} />

                <h2 className="mt-3 line-clamp-2 text-[20px] font-extrabold leading-snug text-[#0B2C5F]">
                    <Link href={item.href} className="hover:text-[#1D4ED8]">
                        {item.title}
                    </Link>
                </h2>

                <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#64748B]">
                    {item.description}
                </p>

                <Link
                    href={item.href}
                    className="mt-5 inline-block text-[15px] font-bold text-[#0B2C5F] underline underline-offset-2 hover:text-[#1D4ED8]"
                >
                    View details
                </Link>

                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{item.date}</span>
                </div>
            </div>
        </article>
    );
}

export default function Decisions() {
    const [view, setView] = useState<ViewMode>("list");

    const items = useMemo(() => featuredData, []);

    return (
        <main className="min-h-screen">
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-4 lg:px-4">
                <Header view={view} setView={setView} />

                {view === "list" ? (
                    <div>
                        {items.map((item) => (
                            <ListCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <GridCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}