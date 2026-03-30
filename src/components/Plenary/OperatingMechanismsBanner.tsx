"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

type OperatingMechanismsBannerProps = {
    imageSrcEn?: string;
    imageSrcKh?: string;
    imageAltEn?: string;
    imageAltKh?: string;
};

export default function OperatingMechanismsBanner({
    imageSrcEn = "/image/GPSF_Plenary_EN.png",
    imageSrcKh = "/image/GPSF_Plenary_KH.png",
    imageAltEn = "Operating Mechanisms of the G-PSF Plenary",
    imageAltKh = "យន្តការប្រតិបត្តិការនៃកិច្ចប្រជុំពេញអង្គ G-PSF",
}: OperatingMechanismsBannerProps) {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">

                {/* FRAME (Same as Flow & PlenaryStructure) */}
                <div className="border border-slate-200 rounded-2xl bg-white p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">

                    {/* IMAGE CONTAINER */}
                    <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[720px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">

                        <Image
                            src={isKhmer ? imageSrcKh : imageSrcEn}
                            alt={isKhmer ? imageAltKh : imageAltEn}
                            fill
                            priority
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, 1200px"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}