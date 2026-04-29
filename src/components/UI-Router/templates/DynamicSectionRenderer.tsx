import GenericBlockTemplate from "@/components/UI-Router/templates/GenericBlockTemplate";
import HeroBannerTemplate from "@/components/UI-Router/templates/HeroBannerTemplate";
import PostListTemplate from "@/components/UI-Router/templates/PostListTemplate";
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

    if (blockType === "post_list" || blockType === "posts" || blockType === "items") {
        return <PostListTemplate block={block} lang={lang} />;
    }

    return <GenericBlockTemplate block={block} lang={lang} />;
}
