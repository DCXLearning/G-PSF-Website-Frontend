/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type DynamicBackendPageProps = {
    pageData: any;
    slug: string;
    endpoint?: string;
};

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

function uiToApiLang(lang: Lang): ApiLang {
    return lang === "kh" ? "km" : "en";
}

function getText(value: any, lang: Lang) {
    const apiLang = uiToApiLang(lang);

    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);

    if (typeof value === "object") {
        return (
            value[apiLang] ||
            value[lang] ||
            value.km ||
            value.en ||
            value.title ||
            value.name ||
            ""
        );
    }

    return "";
}

function getRoot(data: any) {
    return data?.page ?? data?.data ?? data;
}

function getPageTitle(data: any, lang: Lang, slug: string) {
    const root = getRoot(data);

    return (
        getText(root?.title, lang) ||
        getText(root?.name, lang) ||
        getText(root?.pageTitle, lang) ||
        slug
            .split("/")
            .filter(Boolean)
            .map((item) => item.replace(/-/g, " "))
            .join(" / ")
    );
}

function getPageDescription(data: any, lang: Lang) {
    const root = getRoot(data);

    return (
        getText(root?.description, lang) ||
        getText(root?.subtitle, lang) ||
        getText(root?.shortDescription, lang)
    );
}

function getBlocks(data: any) {
    const root = getRoot(data);

    if (Array.isArray(root?.blocks)) return root.blocks;
    if (Array.isArray(root?.sections)) return root.sections;

    if (Array.isArray(root?.items)) {
        return [
            {
                type: "items",
                title: root?.title,
                posts: root.items,
            },
        ];
    }

    if (Array.isArray(root?.posts)) {
        return [
            {
                type: "posts",
                title: root?.title,
                posts: root.posts,
            },
        ];
    }

    return [];
}

function getPosts(block: any) {
    if (Array.isArray(block?.posts)) return block.posts;
    if (Array.isArray(block?.items)) return block.items;
    if (Array.isArray(block?.data?.posts)) return block.data.posts;
    if (Array.isArray(block?.data?.items)) return block.data.items;

    return [];
}

function getImageUrl(value: any) {
    if (!value || typeof value !== "string") return "";

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    const apiOrigin = (
        process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE
    ).replace(/\/api\/v1\/?$/, "");

    return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

function findImage(item: any, lang: Lang) {
    const apiLang = uiToApiLang(lang);

    const content =
        item?.content?.[apiLang] ||
        item?.content?.en ||
        item?.content?.km ||
        item?.content;

    const image =
        item?.image ||
        item?.thumbnail ||
        item?.cover ||
        item?.icon ||
        item?.featuredImage ||
        content?.image ||
        content?.thumbnail ||
        content?.cover ||
        content?.featuredImage ||
        content?.backgroundImage ||
        content?.backgroundImages?.[0] ||
        item?.backgroundImages?.[0];

    return getImageUrl(image);
}

function getItemTitle(item: any, lang: Lang) {
    const apiLang = uiToApiLang(lang);

    const content =
        item?.content?.[apiLang] ||
        item?.content?.en ||
        item?.content?.km ||
        item?.content;

    return (
        getText(item?.title, lang) ||
        getText(content?.title, lang) ||
        getText(item?.name, lang) ||
        "Untitled"
    );
}

function getItemDescription(item: any, lang: Lang) {
    const apiLang = uiToApiLang(lang);

    const content =
        item?.content?.[apiLang] ||
        item?.content?.en ||
        item?.content?.km ||
        item?.content;

    return (
        getText(item?.description, lang) ||
        getText(content?.description, lang) ||
        getText(item?.subtitle, lang) ||
        getText(content?.subtitle, lang) ||
        getText(item?.excerpt, lang)
    );
}

function getItemHref(item: any) {
    const url = item?.url || item?.href || item?.link;

    if (!url || typeof url !== "string") return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    return url.startsWith("/") ? url : `/${url}`;
}

export default function DynamicBackendPage({
    pageData,
    slug,
}: DynamicBackendPageProps) {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const title = getPageTitle(pageData, lang, slug);
    const description = getPageDescription(pageData, lang);

    const blocks = getBlocks(pageData).filter(
        (block: any) => block?.enabled !== false
    );

    return (
        <main className="min-h-screen bg-[#f6f8fb] pt-28 pb-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1D69B4]">
                        {isKh ? "ទំព័រពី Backend" : "Backend Page"}
                    </p>

                    <h1
                        className={`text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {title}
                    </h1>

                    {description ? (
                        <p
                            className={`mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {description}
                        </p>
                    ) : null}
                </section>

                {blocks.length > 0 ? (
                    <div className="mt-8 space-y-8">
                        {blocks.map((block: any, index: number) => {
                            const blockTitle =
                                getText(block?.title, lang) ||
                                getText(block?.name, lang);

                            const blockDescription =
                                getText(block?.description, lang) ||
                                getText(block?.subtitle, lang);

                            const posts = getPosts(block);

                            return (
                                <section
                                    key={`${block?.id ?? index}-${block?.type ?? "block"}`}
                                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                                >
                                    {blockTitle ? (
                                        <h2
                                            className={`text-2xl font-bold text-slate-900 ${
                                                isKh ? "khmer-font" : ""
                                            }`}
                                        >
                                            {blockTitle}
                                        </h2>
                                    ) : null}

                                    {blockDescription ? (
                                        <p
                                            className={`mt-2 text-slate-600 ${
                                                isKh ? "khmer-font" : ""
                                            }`}
                                        >
                                            {blockDescription}
                                        </p>
                                    ) : null}

                                    {posts.length > 0 ? (
                                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                            {posts.map((item: any, itemIndex: number) => {
                                                const image = findImage(item, lang);
                                                const itemTitle = getItemTitle(item, lang);
                                                const itemDescription = getItemDescription(item, lang);
                                                const href = getItemHref(item);

                                                const card = (
                                                    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                                        {image ? (
                                                            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                                                                <img
                                                                    src={image}
                                                                    alt={itemTitle}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        <div className="p-5">
                                                            <h3
                                                                className={`line-clamp-2 text-lg font-bold text-slate-900 ${
                                                                    isKh ? "khmer-font" : ""
                                                                }`}
                                                            >
                                                                {itemTitle}
                                                            </h3>

                                                            {itemDescription ? (
                                                                <p
                                                                    className={`mt-2 line-clamp-3 text-sm leading-7 text-slate-600 ${
                                                                        isKh ? "khmer-font" : ""
                                                                    }`}
                                                                >
                                                                    {itemDescription}
                                                                </p>
                                                            ) : null}

                                                            {href ? (
                                                                <p className="mt-4 text-sm font-semibold text-[#1D69B4]">
                                                                    {isKh ? "មើលបន្ថែម" : "View more"}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </article>
                                                );

                                                return href ? (
                                                    <Link
                                                        key={item?.id ?? itemIndex}
                                                        href={href}
                                                        className="block h-full"
                                                    >
                                                        {card}
                                                    </Link>
                                                ) : (
                                                    <div key={item?.id ?? itemIndex}>
                                                        {card}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div
                                            className={`mt-5 rounded-2xl bg-slate-50 p-5 text-slate-600 ${
                                                isKh ? "khmer-font" : ""
                                            }`}
                                        >
                                            {isKh
                                                ? "មិនមានមាតិកាសម្រាប់បង្ហាញទេ។"
                                                : "No content to display."}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                        <p className={isKh ? "khmer-font" : ""}>
                            {isKh
                                ? "Page នេះបានបើកដោយ Dynamic Route ប៉ុន្តែ Backend មិនទាន់មាន block data សម្រាប់បង្ហាញ។"
                                : "This page was opened by the dynamic route, but the backend has no block data to render yet."}
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}