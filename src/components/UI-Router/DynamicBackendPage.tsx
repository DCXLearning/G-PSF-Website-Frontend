"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import DynamicSectionRenderer from "@/components/UI-Router/templates/DynamicSectionRenderer";
import {
    getBlockType,
    getBlocks,
    getPageDescription,
    getPageTitle,
    isBlockEnabled,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type DynamicBackendPageProps = {
    pageData: unknown;
    slug: string;
    endpoint?: string;
};

export default function DynamicBackendPage({
    pageData,
    slug,
}: DynamicBackendPageProps) {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";
    const title = getPageTitle(pageData, lang, slug);
    const description = getPageDescription(pageData, lang);
    const blocks = getBlocks(pageData).filter(isBlockEnabled);
    const hasHeroBanner = blocks.some((block) => getBlockType(block) === "hero_banner");

    return (
        <main className="min-h-screen bg-white">
            {!hasHeroBanner ? (
                <section className="bg-[#f6f8fb] py-14 md:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1D69B4]">
                            {isKh ? "ទំព័រពី Backend" : "Backend Page"}
                        </p>

                        <h1
                            className={`text-4xl font-extrabold leading-tight text-[#1a2b4b] md:text-6xl ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {title}
                        </h1>

                        {description ? (
                            <p
                                className={`mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg ${
                                    isKh ? "khmer-font" : ""
                                }`}
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>
                </section>
            ) : null}

            {blocks.length > 0 ? (
                blocks.map((block, index) => (
                    <DynamicSectionRenderer
                        key={`${String(block.id ?? index)}-${getBlockType(block) || "block"}`}
                        block={block}
                        lang={lang}
                    />
                ))
            ) : (
                <section className="bg-[#f6f8fb] py-14 md:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">
                            <p className={isKh ? "khmer-font" : ""}>
                                {isKh
                                    ? "Page នេះបានបើកដោយ Dynamic Route ប៉ុន្តែ Backend មិនទាន់មាន block data សម្រាប់បង្ហាញ។"
                                    : "This page was opened by the dynamic route, but the backend has no block data to render yet."}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
