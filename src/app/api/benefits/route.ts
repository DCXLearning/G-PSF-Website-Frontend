import { API_URL } from "@/config/api";
import { NextResponse } from "next/server";

/* ---------- helpers ---------- */

function cleanText(v: any): string {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || s === ".") return "";
    return s;
}

function cleanI18n(obj: any) {
    const en = cleanText(obj?.en);
    const kmRaw = cleanText(obj?.km);
    return { en, km: kmRaw || en };
}

function tiptapToText(doc: any): string {
    if (!doc || typeof doc !== "object") return "";

    const walk = (node: any): string => {
        if (!node) return "";
        if (node.type === "text") return node.text || "";
        if (Array.isArray(node.content)) return node.content.map(walk).join("");
        return "";
    };

    if (Array.isArray(doc.content)) {
        return doc.content
            .map((b: any) => walk(b).trim())
            .filter(Boolean)
            .join("\n");
    }

    return walk(doc).trim();
}

/* ---------- route ---------- */

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
        const blocks = json?.data?.blocks ?? [];

        // ✅ find benefits block safely
        const benefitsBlock = blocks.find(
            (b: any) =>
                b?.enabled === true &&
                b?.type === "post_list" &&
                b?.settings?.categoryIds?.includes(2)
        );

        if (!benefitsBlock) {
            return NextResponse.json({ error: "Benefits block not found" }, { status: 404 });
        }

        const title = cleanI18n(benefitsBlock?.title);
        const description = cleanI18n(benefitsBlock?.description);

        // ✅ fixed heading
        const headingLine1 = { en: "G-PSF", km: title.km };
        const headingLine2 = { en: "Benefits", km: "" };

        const items = (benefitsBlock.posts ?? [])
            .filter((p: any) => p?.status === "published")
            .map((p: any) => {
                const postTitle = cleanI18n(p?.title);

                const descEn = tiptapToText(p?.content?.en);
                const descKm = tiptapToText(p?.content?.km);

                const postDesc = {
                    en: cleanText(descEn),
                    km: cleanText(descKm || descEn),
                };

                return {
                    id: p.id,
                    slug: p.slug,
                    icon: p?.images?.[0]?.url ?? "",
                    title: postTitle,
                    description: postDesc,
                };
            });

        return NextResponse.json({
            headingLine1,
            headingLine2,
            description,
            items,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch benefits" }, { status: 500 });
    }
}
