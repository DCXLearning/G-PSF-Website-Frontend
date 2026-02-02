// app/api/home-post/route.ts
import { API_URL } from "@/config/api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(`${API_URL}/pages/home/section`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch home sections" },
                { status: res.status }
            );
        }

        const json = await res.json();

        // ✅ find hero banner block
        const heroBlock = json?.data?.blocks?.find(
            (b: any) =>
                b?.enabled === true &&
                (b?.type === "hero_banner" || b?.type === "hero-banner")
        );

        if (!heroBlock) {
            return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
        }

        // ✅ choose published first, else first post
        const heroPost =
            heroBlock?.posts?.find((p: any) => p?.status === "published") ??
            heroBlock?.posts?.[0];

        if (!heroPost) {
            return NextResponse.json({ error: "Hero banner post not found" }, { status: 404 });
        }

        const content = heroPost?.content ?? {};

        const background =
            Array.isArray(content?.backgroundImages) && content.backgroundImages.length > 0
                ? content.backgroundImages[0]
                : null;

        return NextResponse.json({
            id: heroPost.id,
            slug: heroPost.slug,
            status: heroPost.status,
            createdAt: heroPost.createdAt,
            updatedAt: heroPost.updatedAt,

            // ✅ multilingual text
            title: content.title ?? heroPost.title ?? { en: "", km: "" },
            subtitle: content.subtitle ?? { en: "", km: "" },
            description: content.description ?? { en: "", km: "" },

            // ✅ normalized background (string)
            background,

            // ✅ keep CTAs as array
            ctas: content.ctas ?? [],
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch home hero banner" },
            { status: 500 }
        );
    }
}
