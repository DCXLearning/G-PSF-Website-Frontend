"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState("Hero Banner");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/mis", {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                const data = await res.json();

                if (data?.success) {
                    setImage(data.image || null);
                    setTitle(data.title || "Hero Banner");
                }
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="border border-slate-200 rounded-2xl bg-white p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                    <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[620px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                        {image ? (
                            <Image
                                src={image}
                                alt={title}
                                fill
                                priority
                                className="object-contain p-4"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm sm:text-base">
                                No image available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}