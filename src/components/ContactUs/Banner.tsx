"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BannerContactUs = () => {
    const [imageUrl, setImageUrl] = useState("/image/Banner.bmp");

    useEffect(() => {
        async function loadBanner() {
            try {
                const res = await fetch("/api/contact-banner");
                const json = await res.json();

                if (json?.banner?.imageUrl) {
                    setImageUrl(json.banner.imageUrl);
                }
            } catch {
                // fallback image already set
            }
        }

        loadBanner();
    }, []);

    return (
        <section className="bg-white py-5 md:py-13">
            <div className="w-full">
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[675px]">
                    <Image
                        src={imageUrl}
                        alt="Contact banner"
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