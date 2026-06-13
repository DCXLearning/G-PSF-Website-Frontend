/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
    const apiBase = (API_URL ?? "").replace(/\/$/, "");

    if (!apiBase) {
        return NextResponse.json(
            { success: false, message: "NEXT_PUBLIC_API_URL is not configured" },
            { status: 500 }
        );
    }

    const url = `${apiBase}/pages/mis-dashboard/section`;

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

        const title = post?.title?.en || post?.title?.km || "MIS Dashboard";

        return NextResponse.json({
            success: true,
            image,
            title,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}