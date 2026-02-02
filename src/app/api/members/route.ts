// app/api/members/route.ts
import { NextResponse } from "next/server";

const TESTIMONIALS_API = "https://api-gpsf.datacolabx.com/api/v1/testimonials";

export async function GET() {
    try {
        const res = await fetch(TESTIMONIALS_API, { cache: "no-store" });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch testimonials" },
                { status: res.status }
            );
        }

        const json = await res.json();

        // support multiple shapes: {data:[...]}, {data:{items:[...]}}, direct array
        const raw =
            json?.data?.items ??
            json?.data ??
            (Array.isArray(json) ? json : []);

        const list = Array.isArray(raw) ? raw : [];

        const items = list
            .filter((t: any) => (t?.status ?? "published") === "published")
            .sort((a: any, b: any) => (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0))
            .map((t: any) => ({
                id: t?.id,
                orderIndex: t?.orderIndex ?? 0,

                rating: Number(t?.rating ?? 5),

                // ✅ title
                title: {
                    en: t?.title?.en ?? "",
                    km: t?.title?.km ?? "",
                },

                // ✅ quote (main text)
                quote: {
                    en: t?.quote?.en ?? "",
                    km: t?.quote?.km ?? "",
                },

                // ✅ author info
                authorName: {
                    en: t?.authorName?.en ?? "",
                    km: t?.authorName?.km ?? "",
                },
                authorRole: {
                    en: t?.authorRole?.en ?? "",
                    km: t?.authorRole?.km ?? "",
                },

                company: t?.company ?? "",
                avatarUrl: t?.avatarUrl ?? "",
            }));

        return NextResponse.json({ items });
    } catch (e) {
        return NextResponse.json(
            { error: "Server error fetching testimonials" },
            { status: 500 }
        );
    }
}
