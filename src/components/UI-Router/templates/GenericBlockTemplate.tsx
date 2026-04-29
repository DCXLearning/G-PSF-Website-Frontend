import PostListTemplate from "@/components/UI-Router/templates/PostListTemplate";
import TextBlockTemplate from "@/components/UI-Router/templates/TextBlockTemplate";
import { getPosts, type JsonObject, type Lang } from "@/components/UI-Router/templates/dynamicTemplateUtils";

type GenericBlockTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

export default function GenericBlockTemplate({ block, lang }: GenericBlockTemplateProps) {
    const posts = getPosts(block);

    if (posts.length > 0) {
        return <PostListTemplate block={block} lang={lang} />;
    }

    return <TextBlockTemplate block={block} lang={lang} />;
}
