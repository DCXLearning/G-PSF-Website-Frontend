import SearchNewsUpdates from "@/components/Search/SearchNewsUpdates";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.q ?? "";

    return <SearchNewsUpdates query={query} />;
}