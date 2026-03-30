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
        <section className="w-full bg-[#e9e9e9] py-6 md:py-10">
            <div className="mx-auto max-w-7xl px-4 md:px-4">
                <div className="overflow-hidden">
                    <div className="relative w-full aspect-[16/9] md:aspect-[14/8.5]">
                        <Image
                            src={isKhmer ? imageSrcKh : imageSrcEn}
                            alt={isKhmer ? imageAltKh : imageAltEn}
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}