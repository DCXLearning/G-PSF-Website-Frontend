// app/api/benefits/route.ts
import { API_URL } from "@/config/api";
import { NextResponse } from "next/server";

function cleanText(v: any): string {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || s === ".") return "";
    return s;
}

// km "." => fallback to en
function cleanI18n(obj: any) {
    const en = cleanText(obj?.en);
    const kmRaw = cleanText(obj?.km);
    return { en, km: kmRaw || en };
}

// make EN heading always "G-PSF" + "Benefits"
function makeBenefitsHeading(enTitle: string) {
    // if backend has "G-PSF Benefits ..." => force clean
    const lower = enTitle.toLowerCase();
    if (lower.includes("g-psf") && lower.includes("benefit")) {
        return { line1: "G-PSF", line2: "Benefits" };
    }
    // fallback (if backend title different)
    return { line1: "G-PSF", line2: "Benefits" };
}

// TipTap JSON -> plain text
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
            .map((block: any) => walk(block).trim())
            .filter(Boolean)
            .join("\n");
    }

    return walk(doc).trim();
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

        const benefitsBlock =
            blocks.find((b: any) => b?.enabled && b?.id === 2) ||
            blocks.find(
                (b: any) =>
                    b?.enabled === true &&
                    b?.type === "post_list" &&
                    Array.isArray(b?.settings?.categoryIds) &&
                    b.settings.categoryIds.includes(2)
            );

        if (!benefitsBlock) {
            return NextResponse.json({ error: "Benefits block not found" }, { status: 404 });
        }

        // ✅ original cleaned title/description from backend
        const title = cleanI18n(benefitsBlock?.title);
        const description = cleanI18n(benefitsBlock?.description);

        // ✅ EN heading fixed to G-PSF / Benefits
        const { line1, line2 } = makeBenefitsHeading(title.en);

        const items = (benefitsBlock?.posts ?? [])
            .filter((p: any) => p?.status === "published")
            .map((p: any) => {
                const postTitle = cleanI18n(p?.title);

                const descText = tiptapToText(p?.content);
                const postDesc = {
                    en: cleanText(descText),
                    km: cleanText(descText),
                };

                return {
                    id: p.id,
                    slug: p.slug,
                    icon: p?.images?.[0]?.url ?? "",
                    title: postTitle,
                    description: postDesc,
                };
            });

        // ✅ return headingLine1/2 for frontend
        return NextResponse.json({
            headingLine1: { en: title.en, km: "" },
            // headingLine2: { en: line2, km: "" },
            description,
            items,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch benefits" }, { status: 500 });
    }
}
