import type { CSSProperties } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
    findImage,
    getContent,
    getItemHref,
    getItemDescription,
    getItemTitle,
    getPosts,
    getText,
    isObject,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type HeroBannerTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

function getCtaClassName(index: number, isKh: boolean) {
    const baseClassName = `group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:w-auto ${
        isKh ? "khmer-font" : ""
    }`;

    if (index === 0) {
        return `${baseClassName} bg-gradient-to-r from-[#f39c32] to-[#ffbf66] text-[#1a2b4b] shadow-[0_16px_35px_rgba(243,156,50,0.35)] hover:-translate-y-0.5 hover:from-[#ffad45] hover:to-[#ffd18a]`;
    }

    return `${baseClassName} border border-white/30 bg-white/12 text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] backdrop-blur hover:-translate-y-0.5 hover:bg-white/20`;
}

export default function HeroBannerTemplate({ block, lang }: HeroBannerTemplateProps) {
    const posts = getPosts(block);
    const heroPost = posts[0] ?? block;
    const content = getContent(heroPost, lang);
    const title = getItemTitle(heroPost, lang) || getText(block.title, lang);
    const subtitle = getText(content.subtitle, lang);
    const description = getItemDescription(heroPost, lang);
    const backgroundImage = findImage(heroPost, lang);
    const ctas = Array.isArray(content.ctas) ? content.ctas.filter(isObject) : [];
    const isKh = lang === "kh";

    const backgroundStyle: CSSProperties = backgroundImage
        ? { backgroundImage: `url(${backgroundImage})` }
        : {
              backgroundImage:
                  "linear-gradient(135deg, #102a4c 0%, #1f5d9b 55%, #f39c32 140%)",
          };

    return (
        <section
            className="relative flex min-h-[360px] items-center overflow-hidden bg-cover bg-center text-white md:min-h-[460px]"
            style={backgroundStyle}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/85 via-[#0f172a]/55 to-[#0f172a]/25" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <p
                        className={`mb-4 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {getText(block.title, lang) || (isKh ? "ទំព័រ" : "Page")}
                    </p>

                    <h1
                        className={`text-4xl font-extrabold leading-tight drop-shadow-sm md:text-6xl ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {title}
                    </h1>

                    {subtitle ? (
                        <p
                            className={`mt-5 max-w-2xl text-lg font-medium leading-8 text-white/90 md:text-2xl ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {subtitle}
                        </p>
                    ) : null}

                    {description && description !== subtitle ? (
                        <p
                            className={`mt-4 max-w-2xl text-base leading-8 text-white/80 ${
                                isKh ? "khmer-font" : ""
                            }`}
                        >
                            {description}
                        </p>
                    ) : null}

                    {ctas.length > 0 ? (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            {ctas.map((cta, index) => {
                                const href = getItemHref(cta) || "#";
                                const label =
                                    getText(cta.label, lang) ||
                                    getText(cta.title, lang) ||
                                    (isKh ? "មើលបន្ថែម" : "Learn more");
                                const isExternal = href.startsWith("http://") || href.startsWith("https://");
                                const Icon = isExternal ? ExternalLink : ArrowRight;

                                return (
                                    <a
                                        key={`${label}-${index}`}
                                        href={href}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        className={getCtaClassName(index, isKh)}
                                    >
                                        <span>{label}</span>
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-0.5 group-hover:bg-white/35">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
