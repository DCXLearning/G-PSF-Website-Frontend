import PublicationCategoryViewMore from "@/components/PublicationPage/See-More/PublicationCategoryViewMore";
import { getPublicationViewMoreConfig } from "@/components/PublicationPage/See-More/publicationViewMoreConfig";

type DynamicSemesterViewMorePageProps = {
    params: Promise<{
        categoryId: string;
    }>;
};

export default async function DynamicSemesterViewMorePage({
    params,
}: DynamicSemesterViewMorePageProps) {
    const { categoryId } = await params;
    const parsedCategoryId = Number(categoryId);
    const viewMoreConfig = getPublicationViewMoreConfig(
        Number.isNaN(parsedCategoryId) ? 17 : parsedCategoryId
    );

    return <PublicationCategoryViewMore {...viewMoreConfig} />;
}
