export type LocalizedLabel = {
    en: string;
    kh: string;
};

export type PublicationCategoryViewMoreConfig = {
    categoryId: number;
    pageTitle: LocalizedLabel;
    badgeText: LocalizedLabel;
};

export const SEMESTER_VIEW_MORE_CONFIG: PublicationCategoryViewMoreConfig = {
    categoryId: 17,
    pageTitle: {
        en: "Semester Reports",
        kh: "របាយការណ៍ឆមាស",
    },
    badgeText: {
        en: "Semester Report",
        kh: "របាយការណ៍ឆមាស",
    },
};

export const TOOLS_VIEW_MORE_CONFIG: PublicationCategoryViewMoreConfig = {
    categoryId: 16,
    pageTitle: {
        en: "Templates & Forms",
        kh: "បែបបទ និង ទម្រង់",
    },
    badgeText: {
        en: "Templates & Forms",
        kh: "បែបបទ និង ទម្រង់",
    },
};

export function getPublicationViewMoreConfig(
    categoryId: number
): PublicationCategoryViewMoreConfig {
    if (categoryId === 16) {
        return TOOLS_VIEW_MORE_CONFIG;
    }

    if (categoryId === 17) {
        return SEMESTER_VIEW_MORE_CONFIG;
    }

    return {
        categoryId,
        pageTitle: {
            en: "Documents",
            kh: "ឯកសារ",
        },
        badgeText: {
            en: "Document",
            kh: "ឯកសារ",
        },
    };
}
