import { notFound } from "next/navigation";
import BackendPageClient from "@/app/[...slug]/BackendPageClient";
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
        <BackendPageClient
            pageData={page.data}
            slug={page.slug}
        />
    );
}
