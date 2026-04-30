import HeroBannerTemplate from "@/components/UI-Router/templates/HeroBannerTemplate";
import type {
    JsonObject,
    Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type DefaultTemplateHeroBannerProps = {
    block: JsonObject;
    lang: Lang;
};

export default function DefaultTemplateHeroBanner({
    block,
    lang,
}: DefaultTemplateHeroBannerProps) {
    return <HeroBannerTemplate block={block} lang={lang} />;
}
