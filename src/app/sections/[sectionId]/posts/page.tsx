import Link from "next/link";
import { API_URL } from "@/config/api";

type I18nText = {
    en?: string | null;
    km?: string | null;
};

type SectionPost = {
    id?: number;
    slug?: string | null;
    title?: I18nText;
    description?: I18nText;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    section?: {
        title?: I18nText;
    } | null;
};

type SectionPostsResponse = {
    data?: SectionPost[];
    items?: SectionPost[];
};

type PageProps = {
    params: Promise<{
        sectionId: string;
    }>;
};

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

function cleanText(value?: string | null): string {
    return value?.trim() ?? "";
}

function pickText(value?: I18nText | null): string {
    return cleanText(value?.en) || cleanText(value?.km);
}

function formatDate(dateValue?: string | null): string {
    const rawDate = cleanText(dateValue);

    if (!rawDate) {
        return "";
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
        return rawDate;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function buildDetailHref(post: SectionPost): string {
    if (!post.id) {
        return "#";
    }

    // Reuse the existing News & Updates detail page route.
    const slug = cleanText(post.slug);

    if (slug) {
        return `/new-update/view-detail?slug=${encodeURIComponent(slug)}&id=${post.id}`;
    }

    return `/new-update/view-detail?id=${post.id}`;
}

async function getSectionPosts(sectionId: string): Promise<SectionPost[]> {
    const apiBase = API_URL || FALLBACK_API_BASE;

    // Load all posts that belong to the selected section id.
    const response = await fetch(
        `${apiBase}/sections/${encodeURIComponent(sectionId)}/posts`,
        {
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        return [];
    }

    const data = (await response.json()) as SectionPostsResponse;

    if (Array.isArray(data.data)) {
        return data.data;
    }

    if (Array.isArray(data.items)) {
        return data.items;
    }

    return [];
}

export default async function Page({ params }: PageProps) {
    const { sectionId } = await params;
    const posts = await getSectionPosts(sectionId);

    // Use the first post to show the section title at the top of the page.
    const sectionTitle = pickText(posts[0]?.section?.title) || "Section Posts";

    return (
        <section className="min-h-screen bg-[#eef1f5] py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <p className="text-sm font-semibold text-[#64748b] uppercase tracking-[0.2em]">
                        Section {sectionId}
                    </p>

                    <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#0f172a]">
                        {sectionTitle}
                    </h1>

                    <div className="mt-4 w-32 h-1.5 bg-[#f39c12] rounded-full" />
                </div>

                {posts.length > 0 ? (
                    <div className="space-y-5">
                        {posts.map((post, index) => {
                            // Build simple text values for each card in the list.
                            const title = pickText(post.title) || `Post ${index + 1}`;
                            const description = pickText(post.description);
                            const dateText =
                                formatDate(post.publishedAt) ||
                                formatDate(post.createdAt) ||
                                formatDate(post.updatedAt);

                            return (
                                <div
                                    key={post.id ?? index}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                                >
                                    <h2 className="text-xl font-semibold text-[#0f172a]">
                                        {title}
                                    </h2>

                                    {dateText ? (
                                        <p className="mt-2 text-sm font-medium text-[#64748b]">
                                            {dateText}
                                        </p>
                                    ) : null}

                                    {description ? (
                                        <p className="mt-4 text-base leading-7 text-[#475569]">
                                            {description}
                                        </p>
                                    ) : null}

                                    <Link
                                        href={buildDetailHref(post)}
                                        className="inline-block mt-5 text-sm font-bold underline text-[#0f172a] hover:text-blue-700"
                                    >
                                        View Detail
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <p className="text-base text-[#64748b]">
                            No posts found for this section.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
