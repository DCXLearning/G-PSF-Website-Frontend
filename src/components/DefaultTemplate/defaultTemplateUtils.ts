import {
    getContent,
    getImageUrl,
    getPrimaryPost,
    getText,
    isObject,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

export type DefaultTemplateImageData = {
    description: string;
    image: string;
    title: string;
};

export type DefaultTemplateSections = {
    hasContent: boolean;
    heroBlock: JsonObject | null;
    imageShowcase: DefaultTemplateImageData | null;
    textBlock: JsonObject | null;
};

function getObject(value: unknown): JsonObject {
    return isObject(value) ? value : {};
}

function hasObjectContent(value: JsonObject) {
    return Object.keys(value).length > 0;
}

function createSectionBlock(
    block: JsonObject,
    source: JsonObject,
    content: JsonObject,
    type: string
): JsonObject {
    return {
        ...block,
        type,
        title: content.title ?? block.title,
        description: content.description ?? block.description,
        posts: [
            {
                ...source,
                content: {
                    en: content,
                    km: content,
                },
            },
        ],
    };
}

export function getDefaultTemplateSections(
    block: JsonObject,
    lang: Lang
): DefaultTemplateSections {
    const source = getPrimaryPost(block) ?? block;
    const content = getContent(source, lang);
    const heroBanner = getObject(content.heroBanner);
    const textBlock = getObject(content.textBlock);
    const imageShowcaseContent = getObject(content.imageShowcase);
    const image = getImageUrl(imageShowcaseContent.image);

    const heroBlock = hasObjectContent(heroBanner)
        ? createSectionBlock(block, source, heroBanner, "hero_banner")
        : null;
    const textSectionBlock = hasObjectContent(textBlock)
        ? createSectionBlock(block, source, textBlock, "text_block")
        : null;

    const imageShowcase = image
        ? {
              image,
              title: getText(imageShowcaseContent.title, lang),
              description: getText(imageShowcaseContent.description, lang),
          }
        : null;

    return {
        hasContent: Boolean(heroBlock || textSectionBlock || imageShowcase),
        heroBlock,
        imageShowcase,
        textBlock: textSectionBlock,
    };
}
