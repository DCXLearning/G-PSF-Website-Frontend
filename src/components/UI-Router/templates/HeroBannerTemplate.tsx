import { ArrowRight, ExternalLink } from "lucide-react";
import {
    findImage,
    getContent,
    getItemHref,
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

function getCtaClassName(index: number) {
    const baseClassName =
        "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f39c32]/70 sm:w-auto";

    if (index === 0) {
        return `${baseClassName} bg-[#f39c32] text-white shadow-[0_12px_28px_rgba(243,156,50,0.28)] hover:-translate-y-0.5 hover:bg-[#e98f22]`;
    }

    return `${baseClassName} border border-[#1a2b4b]/20 bg-white text-[#1a2b4b] shadow-sm hover:-translate-y-0.5 hover:bg-[#f6f8fb]`;
}

export default function HeroBannerTemplate({ block, lang }: HeroBannerTemplateProps) {
    const posts = getPosts(block);
    const heroPost = posts[0] ?? block;
    const content = getContent(heroPost, lang);
    const title = getText(content.title, lang);
    const subtitle = getText(content.subtitle, lang);
    const description = getText(content.description, lang);
    const bannerImage = findImage(heroPost, lang) || "/image/Subpages_plenary_Banner.bmp";
    const ctas = Array.isArray(content.ctas) ? content.ctas.filter(isObject) : [];
    const isKh = lang === "kh";

    return (
        <main className="bg-white">
            <section className="relative flex min-h-[680px] flex-col overflow-hidden bg-gray-100 md:min-h-[500px] lg:min-h-[650px]">
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-bottom bg-no-repeat"
                    style={{ backgroundImage: `url(${bannerImage})` }}
                >
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 to-transparent" />
                </div>

                <div
                    className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-start justify-center px-6 pb-20 pt-24 text-left sm:px-8 lg:px-12 md:pt-32"
                >
                    {title ? (
                        <h1
                            className={`mb-5 max-w-4xl whitespace-pre-line text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl ${
                                isKh ? "leading-relaxed" : ""
                            }`}
                        >
                            {title}
                        </h1>
                    ) : null}

                    {subtitle ? (
                        <p
                            className={`mb-5 max-w-4xl whitespace-pre-line text-lg font-medium leading-8 text-white drop-shadow-sm md:text-3xl md:leading-10 ${
                                isKh ? "leading-relaxed" : ""
                            }`}
                        >
                            {subtitle}
                        </p>
                    ) : null}

                    {description ? (
                        <p
                            className={`mb-8 max-w-4xl whitespace-pre-line text-base leading-7 text-white drop-shadow-sm md:text-2xl md:leading-9 ${
                                isKh ? "leading-relaxed" : ""
                            }`}
                        >
                            {description}
                        </p>
                    ) : null}

                    {ctas.length > 0 ? (
                        <div className="mt-4 flex flex-col items-start justify-start gap-3 sm:flex-row sm:flex-wrap">
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
                                        className={getCtaClassName(index)}
                                    >
                                        <span>{label}</span>
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </section>
        </main>
    );
}
