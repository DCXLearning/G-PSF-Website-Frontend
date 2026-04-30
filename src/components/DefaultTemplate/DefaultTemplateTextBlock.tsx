import TextBlockTemplate from "@/components/UI-Router/templates/TextBlockTemplate";
import type {
    JsonObject,
    Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type DefaultTemplateTextBlockProps = {
    block: JsonObject;
    lang: Lang;
};

export default function DefaultTemplateTextBlock({
    block,
    lang,
}: DefaultTemplateTextBlockProps) {
    return <TextBlockTemplate block={block} lang={lang} />;
}
