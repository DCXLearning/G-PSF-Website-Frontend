import SearchPageClient from "@/components/Search/SearchPageClient";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.q ?? "";

    return <SearchPageClient query={query} />;
}