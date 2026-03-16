import SearchAnnouncements from "@/components/Search/SearchAnnouncements";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.q ?? "";

    return <SearchAnnouncements query={query} />;
}