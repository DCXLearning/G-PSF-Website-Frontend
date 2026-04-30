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

type BackendPageClientProps = {
    pageData: unknown;
    slug: string;
};

export default function BackendPageClient({
    pageData,
    slug,
}: BackendPageClientProps) {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const title = getPageTitle(pageData, lang, slug);
    const description = getPageDescription(pageData, lang);
    const blocks = getBlocks(pageData).filter(isBlockEnabled);
    const hasBlocks = blocks.length > 0;

    return (
        <main className="min-h-screen bg-white">
            {!hasBlocks ? (
                <BackendPageHeader
                    title={title}
                    description={description}
                    lang={lang}
                />
            ) : null}

            {hasBlocks ? (
                blocks.map((block, index) => (
                    <DynamicSectionRenderer
                        key={`${String(block.id ?? index)}-${getBlockType(block) || "block"}`}
                        block={block}
                        lang={lang}
                    />
                ))
            ) : (
                <EmptyBackendPageMessage lang={lang} />
            )}
        </main>
    );
}

function BackendPageHeader({
    description,
    lang,
    title,
}: {
    description: string;
    lang: Lang;
    title: string;
}) {
    const isKh = lang === "kh";

    return (
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
    );
}

function EmptyBackendPageMessage({ lang }: { lang: Lang }) {
    const isKh = lang === "kh";

    return (
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
    );
}
