import { buildPathWithQuery } from "@/utils/socialShare";

type NewsDetailPathInput = {
    id?: number | string | null;
    slug?: string | null;
};

export function cleanNewsSlug(value?: string | null) {
    return value?.trim() ?? "";
}

export function buildNewsDetailPath({ id, slug }: NewsDetailPathInput) {
    const cleanId = String(id ?? "").trim();
    const cleanSlug = cleanNewsSlug(slug);

    if (cleanId && cleanSlug) {
        return `/new-update/${encodeURIComponent(cleanId)}/${encodeURIComponent(cleanSlug)}`;
    }

    if (cleanId) {
        return buildPathWithQuery("/new-update/view-detail", {
            id: cleanId,
        });
    }

    if (cleanSlug) {
        return buildPathWithQuery("/new-update/view-detail", {
            slug: cleanSlug,
        });
    }

    return "/new-update";
}
