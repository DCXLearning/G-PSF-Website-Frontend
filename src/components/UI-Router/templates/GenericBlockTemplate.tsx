import TextBlockTemplate from "@/components/UI-Router/templates/TextBlockTemplate";
import { getPosts, type JsonObject, type Lang } from "@/components/UI-Router/templates/dynamicTemplateUtils";

type GenericBlockTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

export default function GenericBlockTemplate({ block, lang }: GenericBlockTemplateProps) {
    const posts = getPosts(block);

    return <TextBlockTemplate block={block} lang={lang} />;
}
