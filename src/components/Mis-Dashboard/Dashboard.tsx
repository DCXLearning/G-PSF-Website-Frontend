"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState("Hero Banner");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/mis");
                const data = await res.json();

                if (data?.success) {
                    setImage(data.image);
                    setTitle(data.title);
                }
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    return (
        <section className="relative w-full overflow-hidden py-4 rounded-2xl">
            <div className="relative h-[220px] w-full sm:h-[320px] md:h-[420px] lg:h-[820px]">
                {image && (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        priority
                        className="object-contain"
                    />
                )}
            </div>
        </section>
    );
}