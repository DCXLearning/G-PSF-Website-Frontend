import { NextResponse } from "next/server";
import { fetchHomeSection } from "@/app/lib/homeSection";

export async function GET() {
    try {
        const json = await fetchHomeSection();

        const blocks = json?.data?.blocks ?? [];

        const heroBlock = blocks.find(
            (b: any) =>
                b?.enabled === true &&
                b?.type === "hero_banner"
        );

        if (!heroBlock) {
            return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
        }

        const heroPost =
            heroBlock.posts?.find((p: any) => p.status === "published") ??
            heroBlock.posts?.[0];

        if (!heroPost) {
            return NextResponse.json({ error: "Hero post not found" }, { status: 404 });
        }

        // ✅ CMS is multilingual inside content.en / content.km
        const content = heroPost.content ?? {};

        return NextResponse.json({
            id: heroPost.id,
            slug: heroPost.slug,

            title: content.en?.title,
            subtitle: content.en?.subtitle,
            description: content.en?.description,

            background: content.en?.backgroundImages?.[0] ?? null,

            ctas: content.en?.ctas ?? [],
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Failed to fetch home hero banner" },
            { status: 500 }
        );
    }
}
