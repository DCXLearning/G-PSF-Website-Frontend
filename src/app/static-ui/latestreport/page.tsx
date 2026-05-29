"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const DARK_BLUE = "#1A1D42";

const REPORTS = [
    {
        id: 1,
        image: "/image/report-1.png",
        title: "Progress Report on the Implementation of Resolute...",
        description:
            "Introduced at the 19th Government-Private Sector Forum First Semester...",
        link: "#",
    },
    {
        id: 2,
        image: "/image/report-2.png",
        title: "Progress Report on the Implementation of Resolute...",
        description:
            "Introduced at the 19th Government-Private Sector Forum Second Semeste...",
        link: "#",
    },
    {
        id: 3,
        image: "/image/report-3.png",
        title: "Progress Report on the Implementation of Resolute...",
        description:
            "Introduced at the 19th Government-Private Sector Forum First Semester...",
        link: "#",
    },
];

export default function LatestReport() {
    return (
        <section className="relative overflow-hidden bg-white pb-[72px] pt-8">
            <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <p className="mb-3 text-[24px] font-extrabold leading-[30px] text-[#7775FF]">
                    Policy Update
                </p>

                <h2 className="text-[36px] font-extrabold leading-[46px] text-[#061D4F]">
                    Latest Report
                </h2>

                <p className="mx-auto mt-6 max-w-[1050px] text-[21px] font-normal leading-[35px] text-[#5D6B82]">
                    Provides updates on recent policy reforms, regulatory
                    improvements, and initiatives aimed at strengthening
                    governance and economic development.
                </p>
            </div>

            <div
                className="absolute bottom-0 left-0 h-[280px] w-full"
                style={{ backgroundColor: DARK_BLUE }}
            />

            <div className="relative z-10 mx-auto mt-[90px] grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-4 md:grid-cols-3 lg:px-4">
                {REPORTS.map((report) => (
                    <article
                        key={report.id}
                        className="overflow-hidden rounded-tl-[120px] rounded-tr-none rounded-bl-[24px] rounded-br-[24px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
                    >
                        <div className="relative h-[155px] bg-[#192A63]">
                            <div className="absolute left-[48px] top-[88px] flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#E5E7EB]">
                                <img
                                    src={report.image}
                                    alt={report.title}
                                    className="h-[86px] w-[86px] rounded-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="px-7 pb-7 pt-[72px]">
                            <h3 className="line-clamp-2 text-[25px] font-extrabold leading-[36px] text-[#061D4F]">
                                {report.title}
                            </h3>

                            <p className="mt-5 line-clamp-2 text-[21px] font-normal leading-[34px] text-[#3F4E68]">
                                {report.description}
                            </p>

                            <Link
                                href={report.link}
                                className="mt-[54px] inline-flex items-center gap-3 text-[18px] font-extrabold leading-[24px] text-[#003C9E]"
                            >
                                Download
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}