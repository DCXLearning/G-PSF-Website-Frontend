import DefaultTemplateHeroBanner from "@/components/DefaultTemplate/DefaultTemplateHeroBanner";
import DefaultTemplateImageShowcase from "@/components/DefaultTemplate/DefaultTemplateImageShowcase";
import DefaultTemplateTextBlock from "@/components/DefaultTemplate/DefaultTemplateTextBlock";
import { getDefaultTemplateSections } from "@/components/DefaultTemplate/defaultTemplateUtils";
import type { JsonObject, Lang } from "@/components/UI-Router/templates/dynamicTemplateUtils";

type RouterDefaultTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

export default function RouterDefaultTemplate({
    block,
    lang,
}: RouterDefaultTemplateProps) {
    const sections = getDefaultTemplateSections(block, lang);

    if (!sections.hasContent) {
        return <DefaultTemplateTextBlock block={block} lang={lang} />;
    }

    return (
        <>
            {sections.heroBlock ? (
                <DefaultTemplateHeroBanner block={sections.heroBlock} lang={lang} />
            ) : null}

            {sections.textBlock ? (
                <DefaultTemplateTextBlock block={sections.textBlock} lang={lang} />
            ) : null}

            {sections.imageShowcase ? (
                <DefaultTemplateImageShowcase
                    imageShowcase={sections.imageShowcase}
                    lang={lang}
                />
            ) : null}
        </>
    );
}
