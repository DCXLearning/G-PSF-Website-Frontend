"use client";
import Image from "next/image";

export interface BannerAboutProps {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageAlt?: string;
}

const Flow = ({
    title = "The G-PSF Escalatory Model",
    subtitle = "Reform Flow",
    imageUrl = "/image/s.png",
    imageAlt = "G-PSF Meeting",
}: BannerAboutProps) => {
    return (
        <section className="bg-white py-5 md:py-7">
            {/* Title + subtitle (keep container) */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <p className="mt-3 max-w-2xl mx-auto text-xl font-bold sm:text-3xl text-gray-900">
                        {subtitle}
                    </p>
                    <h1 className="text-3xl text-shadow-lg sm:text-5xl font-bold text-gray-900">
                        {title}
                    </h1>
                </div>
            </div>

            {/* ✅ FULL-WIDTH BANNER (no padding) */}
            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
};

export default Flow;
