import type { Lang } from "@/components/UI-Router/templates/dynamicTemplateUtils";

type ImageShowcaseTemplateProps = {
    description?: string;
    image: string;
    lang: Lang;
    title?: string;
};

export default function ImageShowcaseTemplate({
    description = "",
    image,
    lang,
    title = "",
}: ImageShowcaseTemplateProps) {
    const isKh = lang === "kh";

    if (!image) {
        return null;
    }

    return (
        <section className="bg-white py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {(title || description) ? (
                    <div className="mb-8 text-center md:mb-10">
                        {title ? (
                            <h2
                                className={`text-3xl font-bold text-gray-900 sm:text-5xl ${
                                    isKh ? "khmer-font leading-relaxed" : ""
                                }`}
                            >
                                {title}
                            </h2>
                        ) : null}

                        {description ? (
                            <p
                                className={`mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg ${
                                    isKh ? "khmer-font" : ""
                                }`}
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:p-4 md:p-5 lg:p-6">
                    <div
                        aria-label={title || "Content image"}
                        role="img"
                        className="h-[240px] w-full rounded-xl border border-slate-100 bg-slate-50 bg-contain bg-center bg-no-repeat sm:h-[360px] md:h-[480px] lg:h-[720px]"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                </div>
            </div>
        </section>
    );
}
