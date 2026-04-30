import GenericBlockTemplate from "@/components/UI-Router/templates/GenericBlockTemplate";
import HeroBannerTemplate from "@/components/UI-Router/templates/HeroBannerTemplate";
import RouterDefaultTemplate from "@/components/UI-Router/RouterDefaultTemplate";
import TextBlockTemplate from "@/components/UI-Router/templates/TextBlockTemplate";
import {
    getBlockType,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type DynamicSectionRendererProps = {
    block: JsonObject;
    lang: Lang;
};

export default function DynamicSectionRenderer({
    block,
    lang,
}: DynamicSectionRendererProps) {
    const blockType = getBlockType(block);

    if (blockType === "hero_banner") {
        return <HeroBannerTemplate block={block} lang={lang} />;
    }

    if (blockType === "text_block") {
        return <TextBlockTemplate block={block} lang={lang} />;
    }

    if (blockType === "default_template") {
        return <RouterDefaultTemplate block={block} lang={lang} />;
    }

    return <GenericBlockTemplate block={block} lang={lang} />;
}
