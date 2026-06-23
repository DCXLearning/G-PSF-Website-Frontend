"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const PLENARY_STRUCTURE_POST_ID = 118;
const PLENARY_VISUAL_BLOCK_ID = 53;

type Lang = "en" | "kh";

type I18n = {
    en?: string;
    km?: string;
};

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
    title?: I18n | null;
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

type ApiImage = {
    src: string;
    alt: string;
    title: string;
};

const content = {
    en: {
        title: "G-PSF Plenary Structure",
        image: "/image/G-PSF_Issue_Resolution_Framework_EN.png",
        imageAlt: "G-PSF Plenary Structure English",
    },
    kh: {
        title: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
        image: "/image/G-PSF_Issue_Resolution_Framework_KH.png",
        imageAlt: "រចនាសម្ព័ន្ធកិច្ចប្រជុំពេញអង្គ G-PSF",
    },
};

function normalizeLang(language: unknown): Lang {
    const value = String(language || "en").toLowerCase();

    if (value === "kh" || value === "km") {
        return "kh";
    }

    return "en";
}

function pickTitle(title: I18n | null | undefined, lang: Lang) {
    if (lang === "kh") {
        return title?.km?.trim() || title?.en?.trim() || "";
    }

    return title?.en?.trim() || title?.km?.trim() || "";
}

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

async function fetchPlenaryStructureImage(lang: Lang): Promise<ApiImage | null> {
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
        (item) => item.id === PLENARY_STRUCTURE_POST_ID
    );
    const content = lang === "kh" ? post?.content?.km : post?.content?.en;
    const image = findFirstImage(content);

    if (!image) return null;

    return {
        ...image,
        title: pickTitle(post?.title, lang),
    };
}

export default function PlenaryStructure() {
    const { language } = useLanguage();

    const lang = normalizeLang(language);
    const t = content[lang];
    const [apiImage, setApiImage] = useState<ApiImage | null>(null);

    const titleFontClass =
        lang === "kh"
            ? "title-km khmer-font font-bold"
            : "title-en airbnb-font font-extrabold";

    useEffect(() => {
        let active = true;

        async function loadImage() {
            try {
                const image = await fetchPlenaryStructureImage(lang);

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

    const imageSrc = apiImage?.src || t.image;
    const imageAlt = apiImage?.alt || t.imageAlt;
    const title = apiImage?.title || t.title;

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <div className="mb-8 text-center md:mb-10">
                    <h1
                        className={`
                            text-gray-900
                            ${titleFontClass}
                        `}
                    >
                        {title}
                    </h1>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:p-4 md:p-5 lg:p-6">
                    <div className="relative h-[240px] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:h-[360px] md:h-[480px] lg:h-[720px]">
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
