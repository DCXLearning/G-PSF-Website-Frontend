"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export interface BannerAboutProps {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageAlt?: string;
}

const BannerContactUs = ({
    imageUrl = "/image/Banner.bmp",
    imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
    return (
        <section className="bg-white py-5 md:py-13">
            {/* FULL-WIDTH BANNER */}
            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default BannerContactUs;
