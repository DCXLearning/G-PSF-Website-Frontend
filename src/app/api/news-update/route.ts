import { API_URL } from "@/config/api";
import { NextResponse } from "next/server";

/* ---------- helpers ---------- */
function cleanText(v: any): string {
    const s = typeof v === "string" ? v.trim() : "";
    return !s || s === "." ? "" : s;
}

function cleanI18n(obj: any) {
    const en = cleanText(obj?.en);
    const km = cleanText(obj?.km);
    return { en, km: km || en };
}

export async function GET() {
    try {
        const res = await fetch(`${API_URL}/pages/home/section`, { cache: "no-store" });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch home sections" },
                { status: res.status }
            );
        }

        const json = await res.json();
        const blocks = json?.data?.blocks ?? [];

        // ✅ block: enabled + post_list + categoryId = 1
        const newsBlock = blocks.find(
            (b: any) =>
                b?.enabled === true &&
                b?.type === "post_list" &&
                b?.settings?.categoryIds?.includes(1)
        );

        if (!newsBlock) {
            return NextResponse.json({ error: "News/Update block not found" }, { status: 404 });
        }

        const blockTitle = cleanI18n(newsBlock?.title);
        const blockDesc = cleanI18n(newsBlock?.description);

        const items = (newsBlock?.posts ?? [])
            .filter((p: any) => p?.status === "published")
            .map((p: any) => {
                const title = cleanI18n(p?.title);
                const description = cleanI18n(p?.description);
                const group = cleanI18n(p?.category?.name);

                return {
                    id: p?.id ?? 0,
                    slug: cleanText(p?.slug) || String(p?.id ?? ""),
                    // ✅ USE coverImage (your data has it)
                    icon: cleanText(p?.coverImage),
                    title,
                    description,
                    group,
                    createdAt: cleanText(p?.createdAt) || cleanText(p?.updatedAt),
                };
            });

        return NextResponse.json({
            heading: blockTitle.en || "News & Updates",
            description: blockDesc,
            items,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch news/update" }, { status: 500 });
    }
}