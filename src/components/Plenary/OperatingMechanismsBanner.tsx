"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const OPERATING_MECHANISMS_POST_ID = 131;
const PLENARY_VISUAL_BLOCK_ID = 53;

type Lang = "en" | "kh";

type TiptapNode = {
    type?: string;
    attrs?: {
        src?: string;
        alt?: string;
        images?: Array<{
            src?: string;
            alt?: string;
        }>;
    };
    content?: TiptapNode[];
};

type PlenaryPost = {
    id?: number;
    content?: {
        en?: TiptapNode | null;
        km?: TiptapNode | null;
    } | null;
};

type PlenarySectionResponse = {
    data?: {
        blocks?: Array<{
            id?: number;
            posts?: PlenaryPost[];
        }>;
    };
};

function normalizeImageUrl(value?: string): string {
    const imageUrl = value?.trim() || "";

    if (!imageUrl) return "";

    const cleanUrl =
        imageUrl.startsWith("/https://") || imageUrl.startsWith("/http://")
            ? imageUrl.slice(1)
            : imageUrl;

    try {
        const url = new URL(cleanUrl);
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        const isLocalCmsUrl =
            (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
            url.port === "3001";

        if (!apiBase || !isLocalCmsUrl) {
            return cleanUrl;
        }

        const apiUrl = new URL(apiBase);

        return `${apiUrl.origin}${url.pathname}${url.search}${url.hash}`;
    } catch {
        return cleanUrl;
    }
}

function findFirstImage(node?: TiptapNode | null): { src: string; alt: string } | null {
    if (!node) return null;

    if (node.type === "image" && node.attrs?.src) {
        return {
            src: normalizeImageUrl(node.attrs.src),
            alt: node.attrs.alt || "",
        };
    }

    if (node.type === "imageGallery" && Array.isArray(node.attrs?.images)) {
        const image = node.attrs.images.find((item) => item.src);

        if (image?.src) {
            return {
                src: normalizeImageUrl(image.src),
                alt: image.alt || "",
            };
        }
    }

    for (const child of node.content || []) {
        const image = findFirstImage(child);

        if (image) return image;
    }

    return null;
}

async function fetchOperatingMechanismsImage(lang: Lang) {
    const response = await fetch("/api/plenary/section?types=post_list", {
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as PlenarySectionResponse;
    const blocks = result.data?.blocks || [];
    const visualBlock = blocks.find((block) => block.id === PLENARY_VISUAL_BLOCK_ID);
    const post = visualBlock?.posts?.find(
        (item) => item.id === OPERATING_MECHANISMS_POST_ID
    );
    const content = lang === "kh" ? post?.content?.km : post?.content?.en;

    return findFirstImage(content);
}

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
    const lang: Lang = isKhmer ? "kh" : "en";
    const [apiImage, setApiImage] = useState<{ src: string; alt: string } | null>(
        null
    );

    useEffect(() => {
        let active = true;

        async function loadImage() {
            try {
                const image = await fetchOperatingMechanismsImage(lang);

                if (active) {
                    setApiImage(image);
                }
            } catch {
                if (active) {
                    setApiImage(null);
                }
            }
        }

        void loadImage();

        return () => {
            active = false;
        };
    }, [lang]);

    const imageSrc = apiImage?.src || (isKhmer ? imageSrcKh : imageSrcEn);
    const imageAlt = apiImage?.alt || (isKhmer ? imageAltKh : imageAltEn);

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="border border-slate-200 rounded-2xl bg-white p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                    <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] lg:h-[720px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
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
