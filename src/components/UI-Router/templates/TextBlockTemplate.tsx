import {
    getContent,
    getPosts,
    getText,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type TextBlockTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

export default function TextBlockTemplate({ block, lang }: TextBlockTemplateProps) {
    const posts = getPosts(block);
    const firstPost = posts[0];
    const content = firstPost ? getContent(firstPost, lang) : {};
    const title = getText(block.title, lang) || getText(firstPost?.title, lang);
    const description =
        getText(block.description, lang) ||
        getText(content.description, lang) ||
        getText(firstPost?.description, lang);
    const isKh = lang === "kh";

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
                </div>
            </div>
        </section>
    );
}
