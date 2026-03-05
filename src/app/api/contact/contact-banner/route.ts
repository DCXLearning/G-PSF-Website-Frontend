import { NextResponse } from "next/server";

const API_URL =
    "https://api-gpsf.datacolabx.com/api/v1/pages/contact-us/section";

function cleanText(v: any) {
    const s = typeof v === "string" ? v.trim() : "";
    return !s || s === "." ? "" : s;
}

function pickLang(obj: any) {
    return cleanText(obj?.en) || cleanText(obj?.km) || "";
}

export async function GET() {
    try {
        const res = await fetch(API_URL, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const block = json?.data?.blocks?.find(
            (b: any) =>
                b?.enabled === true &&
                b?.type === "hero_banner"
        );

        const post = block?.posts?.[0];

        const imageUrl =
            post?.content?.en?.backgroundImages?.[0] ||
            post?.content?.km?.backgroundImages?.[0] ||
            "";

        const title = pickLang(post?.title);
        const description = pickLang(post?.description);

        return NextResponse.json({
            success: true,
            banner: {
                title,
                description,
                imageUrl,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}