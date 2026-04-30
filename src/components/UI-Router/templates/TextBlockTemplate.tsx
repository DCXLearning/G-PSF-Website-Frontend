import ImageShowcaseTemplate from "@/components/UI-Router/templates/ImageShowcaseTemplate";
import {
    findImage,
    getContent,
    getContentItems,
    getPosts,
    getText,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type TextBlockTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

const HexNode = () => (
    <div className="relative flex h-12 w-12 items-center justify-center bg-white">
        <svg width="48" height="48" viewBox="0 0 100 100" className="block">
            <polygon
                points="50,6 86,28 86,72 50,94 14,72 14,28"
                fill="white"
                stroke="#1e3a8a"
                strokeWidth="6"
            />
        </svg>
        <span className="absolute h-3.5 w-3.5 rounded-full bg-[#1e3a8a]" />
    </div>
);

export default function TextBlockTemplate({ block, lang }: TextBlockTemplateProps) {
    const posts = getPosts(block);
    const firstPost = posts[0];
    const content = firstPost ? getContent(firstPost, lang) : {};
    const title = getText(block.title, lang) || getText(firstPost?.title, lang);
    const description =
        getText(block.description, lang) ||
        getText(content.description, lang) ||
        getText(firstPost?.description, lang);
    const contentItems = firstPost
        ? getContentItems(firstPost, lang)
        : getContentItems(block, lang);
    const detailTitle =
        getText(content.title, lang) ||
        getText(firstPost?.title, lang) ||
        (lang === "kh" ? "ព័ត៌មានសំខាន់ៗ" : "Key Points");
    const showcaseImage =
        (firstPost ? findImage(firstPost, lang) : "") || findImage(block, lang);
    const showcaseTitle =
        getText(content.imageTitle, lang) ||
        getText(content.showcaseTitle, lang) ||
        "";
    const showcaseDescription =
        getText(content.imageDescription, lang) ||
        getText(content.showcaseDescription, lang) ||
        "";
    const isKh = lang === "kh";

    if (contentItems.length > 0) {
        return (
            <>
                <section className="bg-white py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
                            <div className="lg:sticky lg:top-10">
                                {title ? (
                                    <h2
                                        className={`text-4xl font-bold leading-tight text-gray-900 md:text-5xl ${
                                            isKh ? "khmer-font" : ""
                                        }`}
                                    >
                                        {title}
                                    </h2>
                                ) : null}

                                <div className="mt-5 h-1.5 w-56 bg-orange-500 sm:w-72 md:w-96 lg:w-[360px] lg:translate-x-24" />

                                {description ? (
                                    <p
                                        className={`mt-8 max-w-md whitespace-pre-line text-lg font-bold leading-relaxed text-[#1e3a8a] sm:text-xl sm:translate-x-8 md:translate-x-24 ${
                                            isKh ? "khmer-font" : ""
                                        }`}
                                    >
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="lg:pt-24 xl:pt-40">
                                {detailTitle ? (
                                    <h3
                                        className={`mb-10 text-4xl font-bold text-gray-900 md:text-5xl ${
                                            isKh ? "khmer-font" : ""
                                        }`}
                                    >
                                        {detailTitle}
                                    </h3>
                                ) : null}

                                <div className="relative">
                                    <div className="absolute bottom-0 left-[23px] top-0 w-[4px] bg-orange-500" />

                                    <div className="space-y-12">
                                        {contentItems.map((item, index) => {
                                            const itemTitle = getText(item.title, lang);
                                            const itemDescription = getText(item.description, lang);

                                            if (!itemTitle && !itemDescription) {
                                                return null;
                                            }

                                            return (
                                                <article
                                                    key={`${itemTitle}-${index}`}
                                                    className="relative flex items-start gap-6"
                                                >
                                                    <div className="relative z-10">
                                                        <HexNode />
                                                    </div>

                                                    <div className="pt-1">
                                                        {itemTitle ? (
                                                            <h4
                                                                className={`text-xl font-bold text-blue-900 ${
                                                                    isKh ? "khmer-font" : ""
                                                                }`}
                                                            >
                                                                {itemTitle}
                                                            </h4>
                                                        ) : null}

                                                        {itemDescription ? (
                                                            <p
                                                                className={`mt-2 max-w-sm whitespace-pre-line text-base leading-relaxed text-gray-600 line-clamp-3 sm:text-lg ${
                                                                    isKh ? "khmer-font" : ""
                                                                }`}
                                                            >
                                                                {itemDescription}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <ImageShowcaseTemplate
                    image={showcaseImage}
                    title={showcaseTitle}
                    description={showcaseDescription}
                    lang={lang}
                />
            </>
        );
    }

    return (
        <section className="bg-white py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                    {title ? (
                        <h2
                            className={`text-3xl font-extrabold text-[#1a2b4b] md:text-4xl ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {title}
                        </h2>
                    ) : null}

                    {description ? (
                        <p
                            className={`mt-5 whitespace-pre-line text-base leading-8 text-slate-600 md:text-lg ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {description}
                        </p>
                    ) : null}

                    {contentItems.length > 0 ? (
                        <div className="mt-8 space-y-6">
                            {contentItems.map((item, index) => {
                                const itemTitle = getText(item.title, lang);
                                const itemDescription = getText(item.description, lang);

                                if (!itemTitle && !itemDescription) {
                                    return null;
                                }

                                return (
                                    <article
                                        key={`${itemTitle}-${index}`}
                                        className="rounded-2xl bg-[#f6f8fb] p-5 ring-1 ring-slate-200"
                                    >
                                        {itemTitle ? (
                                            <h3
                                                className={`text-xl font-extrabold text-[#1a2b4b] ${
                                                    isKh ? "khmer-font" : ""
                                                }`}
                                            >
                                                {itemTitle}
                                            </h3>
                                        ) : null}

                                        {itemDescription ? (
                                            <p
                                                className={`mt-3 whitespace-pre-line text-base leading-8 text-slate-600 ${
                                                    isKh ? "khmer-font" : ""
                                                }`}
                                            >
                                                {itemDescription}
                                            </p>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
