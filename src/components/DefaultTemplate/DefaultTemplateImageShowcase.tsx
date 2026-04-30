import ImageShowcaseTemplate from "@/components/UI-Router/templates/ImageShowcaseTemplate";
import type {
    DefaultTemplateImageData,
} from "@/components/DefaultTemplate/defaultTemplateUtils";
import type { Lang } from "@/components/UI-Router/templates/dynamicTemplateUtils";

type DefaultTemplateImageShowcaseProps = {
    imageShowcase: DefaultTemplateImageData;
    lang: Lang;
};

export default function DefaultTemplateImageShowcase({
    imageShowcase,
    lang,
}: DefaultTemplateImageShowcaseProps) {
    return (
        <ImageShowcaseTemplate
            image={imageShowcase.image}
            title={imageShowcase.title}
            description={imageShowcase.description}
            lang={lang}
        />
    );
}
