"use client";

import PublicationCategoryViewMore from "@/components/PublicationPage/See-More/PublicationCategoryViewMore";
import { SEMESTER_VIEW_MORE_CONFIG } from "@/components/PublicationPage/See-More/publicationViewMoreConfig";

export default function SemesterViewMore() {
    return <PublicationCategoryViewMore {...SEMESTER_VIEW_MORE_CONFIG} />;
}
