import { notFound } from "next/navigation";
import DynamicBackendPage from "@/components/UI-Router/DynamicBackendPage";
import { fetchBackendPage } from "@/lib/fetch-backend-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
    params: Promise<{
        slug?: string[];
    }>;
};

export default async function BackendCatchAllPage({ params }: PageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug?.join("/") ?? "";

    const page = await fetchBackendPage(slug);

    if (!page.found) {
        notFound();
    }

    return (
        <DynamicBackendPage
            pageData={page.data}
            slug={page.slug}
            endpoint={page.endpoint}
        />
    );
}