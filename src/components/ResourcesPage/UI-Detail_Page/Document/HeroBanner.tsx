// src/components/DocumentHero.tsx
"use client";

import React from "react";
import Image from "next/image";

export type DocumentHeroProps = {
    title?: string;
    subtitle?: string;
    backgroundImage?: string; // e.g. "/images/documents-hero.jpg"
};

export default function HeroBanner({
    title = "Documents",
    subtitle = "Using standard documents saves\ntime and makes information easy\nto share.",
    backgroundImage = "/image/resources_top.bmp",
}: DocumentHeroProps) {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[280px] sm:h-[340px] md:h-[420px] lg:h-[650px]">
                {/* Background image */}
                <Image
                    src={backgroundImage}
                    alt="Documents banner"
                    fill
                    priority
                    className="object-cover object-top"
                />

                {/* White overlay */}
                <div className="absolute inset-0 bg-white/20" />

                {/* Optional soft gradient (left) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl">
                        <h1 className="text-[#1a2b4b] text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            {title}
                        </h1>

                        <p className="mt-4 whitespace-pre-line text-[#1a2b4b] text-base font-semibold leading-relaxed sm:text-lg md:text-xl">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}