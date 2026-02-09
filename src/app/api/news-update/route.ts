import { NextResponse } from "next/server";
import { fetchHomeSection } from "@/app/lib/homeSection";

export async function GET() {
    try {
        const json = await fetchHomeSection();

        // 1. Find the block that contains the post list
        const newsBlock = json?.data?.blocks?.find(
            (b: any) => b?.enabled === true && b?.type === "post_list"
        );

        if (!newsBlock || !newsBlock.posts) {
            return NextResponse.json({ error: "News & Updates block not found" }, { status: 404 });
        }

        // 2. Map through ALL posts to create an array for the Swiper
        const formattedPosts = newsBlock.posts
            .filter((p: any) => p?.status === "published")
            .map((p: any) => {
                const content = p?.content ?? {};
                
                return {
                    id: p.id,
                    titleEn: content.title?.en ?? p.title?.en ?? "",
                    titleKh: content.title?.km ?? p.title?.km ?? "",
                    contentEn: content.description?.en ?? "",
                    contentKh: content.description?.km ?? "",
                    icon: Array.isArray(content?.backgroundImages) && content.backgroundImages.length > 0
                        ? content.backgroundImages[0].url // Ensure you access the .url property
                        : "/icon_home_page/News_Updates1.svg", // Fallback icon
                };
            });

        if (formattedPosts.length === 0) {
            return NextResponse.json({ error: "No published posts found" }, { status: 404 });
        }

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error("Error fetching News & Updates:", error);
        return NextResponse.json(
            { error: "Failed to fetch News & Updates" },
            { status: 500 }
        );
    }
}