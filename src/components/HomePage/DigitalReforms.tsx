"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "km";

interface ApiImage {
    id: number;
    url: string;
    sortOrder: number;
}

interface ApiPost {
    id: number;
    title: { en?: string; km?: string };
    slug: string;
    description?: { en?: string; km?: string };
    content?: any;
    status: string;
    images?: ApiImage[];
    createdAt: string;
    updatedAt: string;
}

interface PostListBlock {
    id: number;
    type: "post_list";
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
    settings?: { sort?: string; limit?: number; categoryIds?: number[] };
    posts?: ApiPost[];
}

const DARK_BLUE = "#1A1D42";

function pickLang(obj: any, lang: Lang, fallback = "") {
    if (!obj) return fallback;
    return (lang === "km" ? obj.km : obj.en) || obj.en || obj.km || fallback;
}

// optional basic ProseMirror => text
function proseMirrorToText(doc: any): string {
    try {
        if (!doc) return "";
        const texts: string[] = [];
        const walk = (n: any) => {
            if (!n) return;
            if (n.type === "text" && typeof n.text === "string") texts.push(n.text);
            if (Array.isArray(n.content)) n.content.forEach(walk);
        };
        walk(doc);
        return texts.join(" ").replace(/\s+/g, " ").trim();
    } catch {
        return "";
    }
}

const DigitalReforms: React.FC = () => {
    const { language } = useLanguage();
    const lang: Lang = language === "kh" ? "km" : "en";
    const isKhmer = lang === "km";

    const [block, setBlock] = useState<PostListBlock | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/latest-reforms", { cache: "no-store" });
                const json = await res.json();
                if (!alive) return;

                setBlock(json?.block ?? null);
            } catch (e) {
                if (!alive) return;
                setBlock(null);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const subHeading = isKhmer ? "ព័ត៌មានអំពីកំណែទម្រង់" : "Policy Update";
    const mainHeading = pickLang(block?.title, lang, isKhmer ? "កំណែទម្រង់ចុងក្រោយ" : "Latest Reforms");
    const description = pickLang(
        block?.description,
        lang,
        isKhmer ? "អត្ថបទសង្ខេបអំពីកំណែទម្រង់ចុងក្រោយ។" : "About latest reforms."
    );

    const posts = useMemo(() => {
        const arr = block?.posts ?? [];
        const limit = block?.settings?.limit ?? arr.length;
        return arr.slice(0, limit);
    }, [block]);

    return (
        <>
            {/* Header */}
            <div className="text-center mb-90 mt-20">
                <p className={`text-xl font-medium text-indigo-600 uppercase tracking-wider ${isKhmer ? "khmer-font" : ""}`}>
                    {subHeading}
                </p>

                <h1 className={`text-6xl font-extrabold text-indigo-900 mt-2 ${isKhmer ? "khmer-font" : ""}`}>
                    {mainHeading}
                </h1>

                <p className={`mt-4 text-2xl text-gray-500 max-w-4xl mx-auto ${isKhmer ? "khmer-font" : ""}`}>
                    {description}
                </p>
            </div>

            {/* Swiper Section */}
            <div className="h-[220px] flex flex-col justify-end relative" style={{ backgroundColor: DARK_BLUE }}>
                <div className="container mx-auto px-4 max-w-7xl py-8">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={1}
                        spaceBetween={20}
                        navigation={false}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="custom-swiper-pagination-white"
                    >
                        {loading && (
                            <SwiperSlide className="pb-15 pt-16 px-[10px]">
                                <div className="bg-white rounded-[25px] p-10 h-[390px] flex items-center justify-center">
                                    <p className={`text-gray-500 ${isKhmer ? "khmer-font" : ""}`}>
                                        {isKhmer ? "កំពុងផ្ទុក..." : "Loading..."}
                                    </p>
                                </div>
                            </SwiperSlide>
                        )}

                        {!loading && posts.length === 0 && (
                            <SwiperSlide className="pb-15 pt-16 px-[10px]">
                                <div className="bg-white rounded-[25px] p-10 h-[390px] flex items-center justify-center">
                                    <p className={`text-gray-500 ${isKhmer ? "khmer-font" : ""}`}>
                                        {isKhmer ? "មិនទាន់មានអត្ថបទទេ។" : "No posts found."}
                                    </p>
                                </div>
                            </SwiperSlide>
                        )}

                        {!loading &&
                            posts.map((post) => {
                                const title = pickLang(post.title, lang, "Untitled");

                                const desc =
                                    pickLang(post.description, lang, "") ||
                                    proseMirrorToText(lang === "km" ? post?.content?.km : post?.content?.en) ||
                                    "";

                                const cover = post.images?.[0]?.url;

                                return (
                                    <SwiperSlide key={post.id} className="pb-15 pt-16 px-[10px]">
                                        <div
                                            className="rounded-tl-[120px] bg-white overflow-hidden rounded-bl-[25px] rounded-br-[25px] relative pt-12 h-[390px] pb-10 flex flex-col"
                                            style={{ boxShadow: "0 7px 15px rgba(0,0,0,0.4)" }}
                                        >
                                            {/* top banner */}
                                            <div className="absolute bg-blue-950 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-70">
                                                <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                                                    {cover ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={cover}
                                                            alt={title}
                                                            className="h-[120px] w-[120px] object-cover rounded-full border-4 border-white"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* circle icon */}
                                            <div className="w-25 h-25 relative rounded-[200px] ml-10 top-8 mb-6">
                                                <div className="bg-blue-950 w-25 h-25 border-white border-3 rounded-[200px] flex items-center justify-center overflow-hidden">
                                                    {cover ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white text-3xl">📰</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* text */}
                                            <div className="p-6 pt-10">
                                                <h3 className={`text-xl font-bold text-gray-800 mb-4 ${isKhmer ? "khmer-font" : ""}`}>
                                                    {title}
                                                </h3>

                                                <p className={`text-gray-600 leading-relaxed text-base line-clamp-4 ${isKhmer ? "khmer-font" : ""}`}>
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                    </Swiper>
                </div>
            </div>
        </>
    );
};

export default DigitalReforms;