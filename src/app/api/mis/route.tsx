/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
    const url =
        "https://api-gpsf.datacolabx.com/api/v1/pages/mis-dashboard/section";

    try {
        const res = await fetch(url, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: 502 }
            );
        }

        const data = await res.json();

        const heroBlock = data?.data?.blocks?.find(
            (b: any) => b.type === "hero_banner"
        );

        const post = heroBlock?.posts?.[0];

        const image =
            post?.content?.en?.backgroundImages?.[0] ||
            post?.content?.km?.backgroundImages?.[0] ||
            null;

        const title =
            post?.title?.en || post?.title?.km || "MIS Dashboard";

        return NextResponse.json({
            success: true,
            image,
            title,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}